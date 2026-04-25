# Baboo — Audit UX/UI

Audit conduit en fin de chantier Phase 1-4. Liste consolidée des
constats + statut (corrigé / TODO / arbitré). Sert de checklist avant
mise en ligne grand public.

---

## 1. Navigation & header

### ✅ Corrigés ce sprint
- **Mobile : avatar non cliquable** — l'avatar se contentait d'afficher
  les initiales, sans lien vers `/compte`. Les utilisateurs mobile ne
  pouvaient pas accéder à leur compte via le header.
  → Maintenant `<Link href="/compte">` + bell notif visible.
- **Mobile : pas de notification bell** — la cloche était desktop-only.
  → Ajoutée à droite de l'avatar mobile.
- **Liens vers `/agence/[slug]`** dans `/pro/agence` et `/pro/dashboard` :
  ces routes redirigent vers `/` en Phase 4. Liens morts qui frustrent
  les agences.
  → Supprimés.
- **Empty state `/recherche`** : pas de pont vers `/je-cherche`.
  → CTA « Créer une alerte personnalisée » ajouté.

### 🟡 TODO
- **Mobile menu** : il n'y a pas de hamburger mobile pour atteindre
  `/recherche`, `/projets`, `/conseils`. L'utilisateur mobile doit
  passer par la home pour naviguer.
- **Skip-to-content link** existant (bonne base a11y) mais pas mis en
  avant visuellement sur tab focus — vérifier qu'il apparaît bien.

---

## 2. États vides (empty states)

### Bons ✅
- `/bailleur/dashboard` — message clair + CTA publier
- `/locataire/visites` — message + lien candidater
- `/agent` (sans profil) — explique l'accès restreint, suggère ops
- `/admin/agents` (vide) — propose la création
- `/partners` quand pas connecté — copy explicative + email contact

### À renforcer 🟡
- `/agents` (page publique, base d'agents vide) — message trop court,
  pourrait orienter vers `/publier` quand même ; **fait**
- `/promoteur/rapports` (pas encore lundi) — actuellement « Premier
  rapport envoyé lundi prochain » (correct mais pourrait afficher la
  date exacte)
- `/compte/recherches` — bon empty state avec CTA `/je-cherche`

---

## 3. Mobile responsive

### Vérifié ✅
- Hero `display-hero` → réduit en `text-3xl md:text-5xl` partout
- Grid annonces `grid-cols-2 lg:grid-cols-3` (jamais 1 col mobile car
  trop d'espace perdu sur les cards 4/3 ; 2 col reste lisible)
- Cards listing : padding intérieur 5/6 selon breakpoint, OK

### Problèmes restants 🟡
- **Wizard `/je-cherche`** : sur mobile très petit (< 360px), les
  étapes 1 (transaction toggle) et le multi-select quartiers peuvent
  déborder sur 2 lignes. Acceptable mais pas parfait.
- **Calculateur de coût** : les deux cartes comparatives passent en
  colonnes empilées sur mobile (md:grid-cols-2). OK.
- **Cloche notification** dropdown : `w-[360px] max-w-[92vw]` — testé
  sur 360px, ne déborde pas.

---

## 4. Hiérarchie des CTA

### Convention respectée ✅
- **CTA principal** = `bg-terracotta text-cream` (publier, je cherche,
  acheter pack)
- **CTA secondaire** = `border-2 border-midnight text-midnight`
  (alternative, retour, fermer)
- **Lien doux** = `mono text-[10px] uppercase tracking-wide` (voir
  toutes, exporter)

### À surveiller 🟡
- **Home V5** : « Publier mon bien » (outline) et « Je cherche un bien »
  (terracotta) — choix éditorial volontaire pour highlighter
  l'entrée acheteur. À A/B-tester si possible.
- **/admin** : la dl avec « À modérer » en `tone="dark"` (midnight bg)
  attire l'œil → bon. Les autres stats sont cream, lecture facile.

---

## 5. Formulaires

### Bons patterns ✅
- Validation Zod côté serveur **et** affichage des `fieldErrors` sur
  l'input concerné (slot-create-form, listing-form, agent-create…)
- États transition (`isPending`) appliqués partout pour griser le
  submit et afficher « … »
- Confirmations destructrices via `confirm()` natif (cancel mission,
  unlock partner, expire request)

### À améliorer 🟡
- **`prompt()` natif** pour saisir une raison (cancelMission, top-up
  partner) : fonctionnel mais pas joli. À remplacer par modale custom
  V2.
- **Téléphone** : pas de masque ni de validation format MA — un input
  type=tel libre. Acceptable V1, à formaliser plus tard.
- **Zod messages d'erreur** : certains restent génériques (« Invalide. »).
  La maint. progressive consiste à les humaniser au fur et à mesure
  qu'on rencontre des cas terrain.

---

## 6. Accessibilité

### Bonnes bases ✅
- Tous les boutons ont `aria-label` quand l'icône est seule (bell,
  favori, fermer)
- `role="dialog"` + `aria-modal="true"` sur la modale OwnerService
- `role="alert"` sur les messages d'erreur de form
- `aria-pressed` sur les toggles (transaction RENT/SALE wizard)
- `:focus-visible` ring midnight + offset cream (variant `Button`)

### Failles connues 🟡
- **Contraste** `text-muted-foreground` sur `bg-cream` : ratio mesuré
  à ~4.6:1. AA OK, AAA pas atteint. Volontaire pour la
  hiérarchisation, mais à surveiller pour les blocs de texte longs.
- **Lang sur sous-éléments** : tout en français, aucune mixité —
  pas besoin de `lang="ar"` pour l'instant.
- **Tap targets mobile** : tous les boutons ≥ 40px de hauteur (sizes.md
  = `h-11 = 44px`, sizes.sm = `h-9 = 36px` un peu juste). Le `xs`
  (32px) est hors recommandation Apple/Google et n'est utilisé nulle
  part en mobile-only.

---

## 7. États de chargement

### En place ✅
- `loading.tsx` global + boundary route-level pour les routes lourdes
- `useTransition` partout pour les form server actions

### Manquant 🟡
- Skeletons pour `/recherche` (liste annonces) et `/projets` —
  actuellement un fallback texte
- Pas de loading sur les images (`<Image>` Next gère le placeholder
  mais pas de blur custom)

---

## 8. Erreurs

### En place ✅
- `error.tsx` page-level avec digest + bouton réessayer
- `global-error.tsx` filet de sécurité root layout
- `not-found.tsx` Baboo-styled

### À renforcer 🟡
- **Captureoutbound** : `captureMessage` dispatcher branché ; les
  erreurs Server Actions ne sont pas encore systématiquement
  loggées. Ajouter au fur et à mesure.
- **Sentry** : couche stub en place (`src/lib/observability.ts`),
  activable via `SENTRY_DSN`. SDK pas installé V1 (no-op fallback).

---

## 9. Performance & poids

### Build ✅
- First Load JS partagé : **102 kB** (cible Vercel = ≤ 130 kB ✅)
- Pages les plus lourdes : `/pro/listings/*/edit` à 140 kB (form
  contrôlé large), `/pro/listings` à 132 kB
- Pages publiques < 125 kB (home 105 kB, recherche 125 kB)

### À surveiller 🟡
- `@react-pdf/renderer` : lourd, charge dans le bundle des routes qui
  l'importent. Côté server seulement (cron weekly, génération bail) ;
  pas dans le bundle client.
- Photos d'annonces : `<Image>` Next gère sizes & srcset, sharp
  upload pre-compression côté server. Bon.

---

## 10. SEO & meta

### En place ✅
- `metadata` par route (titles + descriptions + OG)
- `sitemap.ts` à jour (Phase 1-4)
- `robots.ts` exclut espaces privés
- JSON-LD `RealEstateListing + Place` sur fiches

### À renforcer 🟡
- **OG images** : pas d'image Twitter/OG custom par section. Une seule
  image générique `/og-default.png` reste à fournir.
- **Canonical** sur `/recherche?...` pas défini — risque de dup
  content sur les variantes de filtres. À ajouter dans une V2.

---

## 11. Liens morts trouvés

| Source | Cible | Statut |
| --- | --- | --- |
| `/pro/agence` page | `/agence/[slug]` (redirect /) | ✅ supprimé |
| `/pro/dashboard` | `/agence/[slug]` (redirect /) | ✅ remplacé par `/pro/listings` |
| Search header bar | aucune référence cassée | ✅ |

---

## 12. Recommandations V2 (hors scope V1)

- **Hamburger menu mobile** avec liste de routes
- **Breadcrumbs** standardisés sur toutes les pages internes
- **Modale custom** pour remplacer `prompt()` / `confirm()` natifs
- **Skeletons** spécifiques par section
- **Component library** centralisée pour empty-states (actuellement
  re-codés à chaque page)
- **Dark mode** : pas vu de besoin marché Maroc, à arbitrer
- **i18n FR / AR / EN** : préparer la structure mais pas urgent
