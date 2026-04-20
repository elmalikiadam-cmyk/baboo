# Baboo App

Application mobile Expo + TypeScript pour Baboo (annonces immobilières au Maroc). Expo Router 4 file-based, design system brutaliste issu de `design_handoff_baboo/`.

## Quickstart

```bash
cd baboo_app
npm install
npm run ios          # ou : android / web
```

Trois lignes pour démarrer. L'app tourne **sans aucune config** grâce à la data mock locale — tu branches Supabase et Mapbox plus tard, quand tu es prêt.

## Structure

```
baboo_app/
├── app/                          # routes (expo-router)
│   ├── _layout.tsx               # chargement fonts + SafeAreaProvider
│   ├── index.tsx                 # gate onboarding / tabs via AsyncStorage
│   ├── onboarding/               # 3 slides brutalistes
│   ├── (tabs)/                   # Feed V2 + tabs Recherche/Publier/Favoris/Compte
│   └── annonce/[ref].tsx         # Fiche détail plein écran
│
├── src/
│   ├── components/               # tout à plat, importable via @/components
│   │   ├── BabooLogo.tsx
│   │   ├── Button.tsx
│   │   ├── Chip.tsx
│   │   ├── ListingRow.tsx        # ligne dense du feed V2
│   │   ├── ListingCard.tsx       # carte verticale compacte
│   │   ├── ListingMap.tsx        # Mapbox (fallback élégant si token absent)
│   │   ├── FilterSheet.tsx
│   │   ├── OnboardingFrame.tsx
│   │   ├── PhotoPlaceholder.tsx
│   │   └── TabStub.tsx
│   ├── theme/
│   │   ├── theme.ts              # import { colors, fonts, space, radius } from "@/theme/theme"
│   │   └── styles.ts             # presets typographiques
│   ├── hooks/
│   │   └── useListings.ts        # useListings(), useListing(ref) avec fallback mock
│   ├── lib/
│   │   ├── supabase.ts           # getSupabase(), hasSupabase()
│   │   └── onboarding.ts         # AsyncStorage flag
│   ├── data/
│   │   ├── listings.ts           # mock data + type Listing + coordsFor()
│   │   └── api.ts                # fetchListings, fetchListing (mappers Supabase→Listing)
│   └── icons/
│       └── index.tsx             # SearchIcon, BellIcon, HeartIcon, etc.
├── assets/                       # icon, splash
├── app.json                      # config Expo + plugins (expo-font, @rnmapbox/maps)
├── babel.config.js
├── metro.config.js
├── package.json
└── tsconfig.json
```

Tout est **typé strict**. Composants importables via `@/components/{Name}`. Theme via `@/theme/theme`.

## Brancher les vraies données (Supabase)

L'app utilise déjà la base Postgres que tu as configurée pour le web. Deux variables suffisent :

1. Supabase dashboard → Project Settings → **API**
2. Copie **Project URL** et **anon public key**
3. Crée `baboo_app/.env.local` avec :

```bash
EXPO_PUBLIC_SUPABASE_URL=https://qgpffcyqbzsiauuifvee.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=ey...              # la clé "anon / public"
```

4. Relance : `npm run ios`

À partir de maintenant `useListings()` et `useListing(ref)` lisent directement la table `Listing` via le SDK Supabase. Si une variable manque, l'app fallback proprement sur la data mock — aucun crash.

### Row-Level Security

Par défaut Supabase bloque la lecture publique. Pour que l'app mobile puisse lire les annonces avec la clé anon, il faut autoriser un SELECT public sur les tables concernées. Dans le **SQL Editor** de Supabase, exécute :

```sql
alter table "Listing" enable row level security;
create policy "public read published listings"
  on "Listing" for select
  using (status = 'PUBLISHED');

alter table "City" enable row level security;
create policy "public read cities" on "City" for select using (true);

alter table "Neighborhood" enable row level security;
create policy "public read neighborhoods" on "Neighborhood" for select using (true);
```

## Brancher Mapbox

Par défaut, `ListingMap` affiche un bloc typographique propre avec un pin stylé — suffisant en développement. Pour passer à une vraie carte interactive :

### 1. Token Mapbox

Crée un compte gratuit sur mapbox.com puis va dans **Tokens** :

- **Access token public** (préfixe `pk.`) → pour l'app au runtime
- **Download token secret** (préfixe `sk.`, scope `DOWNLOADS:READ`) → pour build iOS

### 2. Env vars

Ajoute dans `.env.local` :

```bash
EXPO_PUBLIC_MAPBOX_TOKEN=pk.eyJ...
```

Puis édite `app.json` → plugin `@rnmapbox/maps` → remplace la valeur de `RNMapboxMapsDownloadToken` par ton token `sk.`.

### 3. Dev build (obligatoire)

Mapbox nécessite des modules natifs, **Expo Go ne suffit plus**. Génère un dev build :

```bash
npm run prebuild       # ou npx expo prebuild
npm run ios            # build natif iOS
npm run android        # build natif Android
```

Une fois le dev build installé, `ListingMap` détecte automatiquement le token et affiche la vraie Mapbox.

## Images

Les annonces embarquent déjà leurs URLs Unsplash dans `src/data/listings.ts` (mock) ou dans la colonne `coverImage` (Supabase). Le composant `Image` de React Native gère le cache. Pour aller plus loin, remplacer par `expo-image` (meilleur cache, placeholders progressifs) — c'est un simple swap d'import.

## Commandes

| Commande | Action |
|---|---|
| `npm run ios` | Build + run sur simulateur iOS |
| `npm run android` | Build + run sur émulateur / device Android |
| `npm run web` | Lance la version web (ListingMap reste en fallback) |
| `npm run prebuild` | Génère les dossiers `ios/` et `android/` (dev build natif) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | `expo lint` |

## Design system

Les tokens sont dans `src/theme/theme.ts` — palette paper `#f2efe8` / ink `#0a0a0a`, typo Barlow Condensed 700/800 avec Bahnschrift en premier choix, JetBrains Mono pour les eyebrows et métadonnées. Pour toute modification visuelle, modifie le thème, pas les composants.

## Tests manuels de smoke

1. Premier lancement → onboarding (3 slides) → dernier CTA "Ouvrir Baboo →" → tabs
2. Feed → scroll → tap sur une ligne → détail plein écran → retour
3. Feed → "AFFINER" → sheet → sélectionner une ville + un budget → Voir N résultats
4. Détail → "APPELER" (ouvre le dialer), "CONTACTER" (ouvre WhatsApp)
5. Relancer l'app → l'onboarding est passé (AsyncStorage)
