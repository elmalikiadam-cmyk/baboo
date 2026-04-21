# Baboo

Plateforme d'annonces immobilières au Maroc. Particuliers et professionnels, achat et location, 12 villes. Monorepo : app web Next.js (Vercel + Supabase) et app mobile Expo partageant la même base de données.

## Structure du repo

```
baboo/
├── src/                      # Application web Next.js 15
├── prisma/                   # Schema + seed partagés (Postgres)
├── baboo_app/                # Application mobile Expo + TypeScript
├── design_handoff_baboo/     # Brief de design + mockups (référence)
├── docs/                     # PRD, architecture, UI guidelines, deploy
└── .github/workflows/        # CI : seed database manuel
```

## Stack

| Couche | Tech |
|---|---|
| Web | Next.js 15 (App Router, Server Actions, RSC) + TypeScript strict |
| Mobile | Expo SDK 52 (expo-router v4) + TypeScript strict |
| UI | Tailwind (web) / StyleSheet (mobile), tokens partagés en esprit |
| DB | Postgres (Supabase) via Prisma 5 |
| Auth (web) | Waitlist localStorage pour l'instant. NextAuth/Supabase Auth en Phase B |
| Maps | iframe OpenStreetMap (web) / @rnmapbox/maps avec fallback (mobile) |
| Fonts | Barlow Condensed (display) + Inter (body) + JetBrains Mono (méta) |

## État d'avancement

### Web — prêt pour un lancement public

| Page | État | Notes |
|---|---|---|
| `/` homepage | ✅ | Masthead brutaliste, featured card, grille d'annonces, villes, sections marketing |
| `/recherche` | ✅ | Filtres URL-driven, pagination, tri, chips, bouton « Enregistrer cette recherche » |
| `/annonce/[slug]` | ✅ | Galerie, facts, amenities, carte OSM, JSON-LD, **formulaire de contact qui persiste en DB** |
| `/agences` + `/agence/[slug]` | ✅ | Annuaire + profil public avec portefeuille d'annonces |
| `/projets` + `/projets/[slug]` | ✅ | Programmes neufs + **formulaire brochure qui persiste en DB** |
| `/ville/[slug]` + `/villes` | ✅ | Landings SEO par ville |
| `/contact` | ✅ | **Formulaire persiste en DB** avec Zod, rate limiting, confirmation |
| `/favoris` | ✅ | localStorage, pas d'auth requise |
| `/recherches` | ✅ | Alertes localStorage, pause/reprise |
| `/compte` | ✅ | Lit favoris + alertes localStorage + waitlist vers la vraie auth |
| `/connexion` + `/inscription` | ✅ | Waitlist qui enregistre un Lead |
| `/pro` | ✅ | Landing marketing |
| `/pro/publier` | ✅ | **Formulaire d'expression d'intérêt** qui enregistre un Lead |
| `/pro/dashboard` | ⚠️ | Aperçu démo explicite (bannière ink en haut), données fictives |
| `/admin` | 🔒 | Gated par `ADMIN_ENABLED=true`, sinon 404 |
| `/a-propos` | ✅ | Page éditoriale |

### Mobile — démo exploitable, architecture prête pour la prod

| Écran | État |
|---|---|
| Onboarding (3 slides) | ✅ avec persistance AsyncStorage |
| Feed V2 brutaliste (accueil) | ✅ avec vraies images |
| Fiche détail `/annonce/[ref]` | ✅ avec galerie + contact + Mapbox (fallback sans token) |
| Filtres (bottom sheet) | ✅ |
| Tabs Recherche / Publier / Favoris / Compte | ⚠️ stubs honnêtes « À venir » |
| Supabase branching | ✅ via `@supabase/supabase-js` avec fallback mock |
| Mapbox | ✅ avec fallback élégant sans token |

## Démarrage web local

```bash
pnpm install
cp .env.example .env.local   # remplir DATABASE_URL + DIRECT_URL + NEXTAUTH_SECRET
pnpm db:push                  # crée les tables
pnpm db:seed                  # 60+ annonces, 6 agences, 3 promoteurs, 5 projets
pnpm dev                      # http://localhost:3000
```

## Démarrage mobile local

```bash
cd baboo_app
npm install
npm run ios                   # ou android / web
```

L'app tourne sans backend grâce aux données mock. Pour brancher Supabase, voir `baboo_app/README.md`.

## Variables d'environnement

### Web (voir `.env.example`)

- `DATABASE_URL` — Postgres pooler (port 6543)
- `DIRECT_URL` — Postgres session pooler (port 5432, pour les migrations)
- `NEXTAUTH_SECRET` — secret pour NextAuth (réservé Phase B)
- `ADMIN_ENABLED` — `true` pour exposer `/admin`
- `NEXT_PUBLIC_MAPBOX_TOKEN` — optionnel
- `RESEND_API_KEY` — optionnel (emails transactionnels)

### Mobile (voir `baboo_app/.env.example`)

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_MAPBOX_TOKEN` — optionnel

## Déploiement

Guide complet dans **[docs/deploy-vercel.md](docs/deploy-vercel.md)**. En résumé :

1. Créer un projet Supabase (région `eu-west-1` recommandée)
2. Importer le repo dans Vercel, configurer `DATABASE_URL` + `DIRECT_URL` + `NEXTAUTH_SECRET`
3. Ajouter les mêmes secrets à GitHub Actions
4. Lancer le workflow **Seed database** (Actions → Seed database → Run workflow → taper `SEED`)
5. Créer les 6 policies RLS dans le SQL Editor Supabase (cf. guide)
6. Vérifier : homepage → recherche → contact → Supabase Table Editor → le Lead doit apparaître

## Documentation

- [`docs/PRD.md`](docs/PRD.md) — Product requirements
- [`docs/architecture.md`](docs/architecture.md) — Architecture technique
- [`docs/ui-guidelines.md`](docs/ui-guidelines.md) — Design system
- [`docs/decision-log.md`](docs/decision-log.md) — Décisions d'architecture datées
- [`docs/deploy-vercel.md`](docs/deploy-vercel.md) — Guide de déploiement pas à pas
- [`docs/front-prompt.md`](docs/front-prompt.md) — Prompt complet pour regénérer le front avec une IA

## Prochaines phases

- **Auth réelle** : NextAuth.js avec provider email (magic links) + sync des favoris/alertes localStorage vers la DB au login
- **Dashboard agence vraiment connecté** : remplacer les données mock de `/pro/dashboard` par les vraies annonces + leads de l'agence connectée
- **Upload de médias** : finir le flow de publication (upload photos via Cloudinary/Supabase Storage)
- **Emails transactionnels** : Resend sur création de Lead (confirmation utilisateur + notification agence)
- **Map Mapbox native** : remplacer l'iframe OSM sur le web + activer le dev build mobile
- **Admin réel** : ajouter le role ADMIN via NextAuth et retirer le gate `ADMIN_ENABLED`
