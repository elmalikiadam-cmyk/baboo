# Baboo — Runbook de lancement

Checklist opérationnelle pour passer Baboo en production. Ton Strate 2 :
factuel, concret, pas de claim, pas de ROI imaginé.

---

## 1. Pré-requis infra (J-7)

### Base de données
- [ ] Supabase project provisionné, `DATABASE_URL` + `DIRECT_URL` dans Vercel
- [ ] `pnpm prisma migrate deploy` exécuté sur la prod
- [ ] `pnpm db:seed` puis `pnpm db:seed:demo` exécutés (ou imports réels)
- [ ] Sauvegardes automatiques Supabase activées (point-in-time)

### Auth
- [ ] `NEXTAUTH_SECRET` généré (`openssl rand -base64 32`) et en Vercel
- [ ] `NEXTAUTH_URL` = URL canonique prod (pas d'alias)
- [ ] Comptes admin créés avec mot de passe fort

### Stockage
- [ ] Bucket Supabase `baboo-public` (photos d'annonces) + `baboo-private`
  (KYC, baux, rapports) créés
- [ ] Policies RLS ajustées : public lecture photos, accès signé sur privé

### Paiements (optionnel V1 — mode manuel fonctionne)
- [ ] CMI ou Youcan : clé marchand + clé de signature côté Vercel
- [ ] Webhook `/api/webhooks/payment` exposé en HTTPS
- [ ] Test d'un achat bout-en-bout (sandbox → prod basse valeur)

### Emails (Resend)
- [ ] Domaine `baboo.ma` vérifié chez Resend (SPF, DKIM, DMARC)
- [ ] `RESEND_API_KEY` + `RESEND_FROM="Baboo <no-reply@baboo.ma>"`

### WhatsApp Cloud API (optionnel)
- [ ] Numéro business vérifié Meta
- [ ] Templates `visit_booked`, `visit_reminder`, `visit_mission_assigned`
  soumis et approuvés
- [ ] `WHATSAPP_*` env vars en Vercel

### QStash (rappels + cron)
- [ ] Token QStash + signing keys (current + next)
- [ ] Schedule Upstash créé :
  - `/api/webhooks/qstash/promoter-weekly-reports` tous les lundis 08:00 UTC
  - `/api/webhooks/qstash/saved-searches` tous les matins (si actif)
  - `/api/webhooks/qstash/rent-reminders` quotidien 06:00 UTC

### Signatures électroniques (optionnel)
- [ ] Yousign sandbox → prod, `YOUSIGN_*` en Vercel
- [ ] Webhook `/api/webhooks/yousign` exposé

---

## 2. Checks applicatifs (J-3)

### Tests manuels critiques
- [ ] Créer un compte particulier → publier une annonce → voir sur la home
- [ ] Chercher via /recherche, filtre par ville, par budget, par type
- [ ] Utiliser `/je-cherche` → email reçu avec matchs immédiats ou
  « pas encore de match »
- [ ] Acheter un pack visites (mode manuel si pas de gateway) → apparaît
  dans `/bailleur/dashboard` en PENDING_PAYMENT
- [ ] Admin active le pack → status ACTIVE, créneau managé devient
  possible
- [ ] Créer un créneau « Agent Baboo » → un visiteur réserve → dispatcher
  assigne → l'agent reçoit notif
- [ ] Agent remplit le rapport → bailleur voit le rapport dans
  `/bailleur/visites-managees/[id]`
- [ ] Partenaire (via lien admin) → débloque un lead → solde décrémenté
- [ ] Page admin `/admin/metriques` charge sans erreur

### Performance
- [ ] Lighthouse ≥ 85 sur home, fiche annonce, recherche
- [ ] Core Web Vitals verts sur mobile (LCP < 2.5s, CLS < 0.1)
- [ ] Images sous Next/Image + Sharp (pas d'original > 500 Ko en prod)

### SEO
- [ ] `robots.ts` autorise crawl sauf espaces privés (`/admin`, `/bailleur`,
  `/agent`, `/partners`)
- [ ] `sitemap.ts` inclut villes + annonces publiées + projets
- [ ] JSON-LD valide sur fiches annonces (RealEstateListing + Place)

---

## 3. Jour J — séquence de mise en ligne

1. Merge de la branche release sur `main`
2. Vercel déploie automatiquement
3. Monitoring actif 2 h : logs Vercel + Sentry + Supabase
4. Vérifier que les schedules QStash tournent bien (premier run)
5. Annonce équipe interne (Slack #ops)
6. Annonce externe seulement après 24 h stables

---

## 4. Playbook — incidents fréquents

### « Utilisateur ne peut pas se connecter »
1. Vérifier `NEXTAUTH_SECRET` présent en env prod
2. Vérifier `NEXTAUTH_URL` exact (pas d'alias Vercel)
3. Logs Vercel `auth` — erreur CSRF ? cookie ? base ?

### « Mes tables sont vides »
1. Dashboard Supabase → SQL Editor : `SELECT count(*) FROM "User";`
2. Si 0 : `pnpm db:seed` sur la prod via un runner ponctuel
3. Vérifier que `DIRECT_URL` n'est pas pointé sur un autre projet

### « Les agents ne reçoivent pas de mission »
1. Est-ce qu'il y a un `VisitAgentProfile` status=ACTIVE sur la ville ?
2. La spécialité matche-t-elle (LOCATION vs VENTE) ?
3. Dispatcher : `src/lib/visit-dispatcher.ts` — logs console
4. Fallback : Slack `SLACK_OPS_WEBHOOK_URL` doit alerter si aucun agent

### « Pack acheté mais pas ACTIVE »
1. Vérifier webhook paiement reçu : logs `/api/webhooks/payment`
2. Si mode manuel : `/admin/visit-packs` → activer
3. Vérifier `expiresAt` (12 mois par défaut)

### « Cron hebdo n'a pas tourné »
1. Dashboard Upstash QStash → logs du schedule
2. Vérifier `QSTASH_CURRENT_SIGNING_KEY` en prod
3. Appel manuel : POST avec signature valide sur
   `/api/webhooks/qstash/promoter-weekly-reports`

### « Visite managée créée mais pas d'agent assigné »
1. `ManagedVisit.agentUserId = null` et status = REQUESTED → normal si
   pas d'agent actif pour cette ville/spécialité
2. Une alerte Slack a dû partir ; sinon vérifier `SLACK_OPS_WEBHOOK_URL`

---

## 5. KPIs à suivre (semaine 1)

- Annonces publiées / jour
- Taux de complétion publication (nb users arrivés sur /publier vs
  nb d'annonces effectivement créées)
- Taux de conversion recherche → `/je-cherche` → match reçu
- Nombre de packs visites vendus
- Taux de rapports retournés dans l'heure (objectif 100 %)
- Revenu pack bailleurs + revenu partners leads (dashboard
  `/admin/metriques`)

Si un chiffre dégringole, regarder d'abord les logs Vercel, puis la
santé du dispatcher, puis les emails Resend.

---

## 6. Hygiène continue

- Review hebdomadaire du funnel publication
- Relecture mensuelle des tickets `SLACK_OPS_WEBHOOK_URL`
- Backup Supabase testé en restauration trimestrielle
- Rotation clés : signing keys QStash tous les 6 mois
- Audit Prisma : migrations pending bloquent les deploys

---

## 7. Comptes de démo (seed)

Mot de passe commun : `baboo-demo-2026` (À changer en prod.)

| Rôle | Email |
| --- | --- |
| Admin | admin@baboo.ma |
| Particulier | demo@baboo.ma |
| Agent Baboo | agent.casa@baboo.ma (+ 4 autres villes) |
| Partner agency | partner.casa@example.com (email-based) |

Pour les agences et promoteurs : voir `prisma/seed.ts`.
