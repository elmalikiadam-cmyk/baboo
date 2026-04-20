# Baboo — Application mobile (React Native + Expo + TypeScript)

Codebase prêt à l'emploi pour l'app d'annonces immobilières Baboo (Maroc).
Direction visuelle : **brutaliste typographique, noir & blanc cassé**, Bahnschrift SemiBold Condensed (fallback Barlow Condensed).

## Stack

- **Expo SDK 51** + React Native 0.74
- **TypeScript** strict
- **React Navigation** (Stack + Bottom Tabs)
- **Expo Google Fonts** (Barlow Condensed + JetBrains Mono)
- **react-native-svg** pour le logo

## Démarrage

```bash
cd baboo_app
npm install
npm run ios       # ou: npm run android / npm run web
```

## Structure

```
baboo_app/
├── App.tsx                          # Entry — chargement polices + navigation
├── app.json                         # Config Expo
├── package.json
├── tsconfig.json                    # alias @/* → src/*
├── babel.config.js                  # module-resolver pour @/*
└── src/
    ├── theme/
    │   ├── theme.ts                 # Tokens (couleurs, typo, espacements, bordures)
    │   └── format.ts                # formatPrice() / formatPriceFull()
    ├── types/
    │   └── index.ts                 # Listing, Agent, User, Filters, etc.
    ├── components/
    │   ├── BabooLogo.tsx            # Logo SVG (BabooLogo + BabooMark)
    │   ├── PhotoPlaceholder.tsx     # Placeholder strié — remplacer par <Image> en prod
    │   ├── Button.tsx               # Bouton carré brutaliste
    │   ├── Chip.tsx                 # Chip toggle
    │   ├── BabooBottomBar.tsx       # Nav bottom custom (si pas React Nav)
    │   ├── ListingRow.tsx           # Row dense pour feed
    │   ├── ListingCard.tsx          # Card large pour carrousels/favoris
    │   └── index.ts
    ├── data/
    │   ├── mockListings.ts          # 6 listings + 3 agents mockés
    │   └── service.ts               # fetchListings / fetchListing / fetchAgent
    ├── screens/
    │   ├── OnboardingScreen.tsx
    │   ├── LoginScreen.tsx
    │   ├── FeedScreen.tsx           # V2 — liste dense (direction recommandée)
    │   ├── DetailScreen.tsx
    │   ├── FiltersScreen.tsx        # Modal — transaction/villes/prix/pièces/types/équipements
    │   ├── MapScreen.tsx            # Carte (PhotoPlaceholder) + pins prix + bottom sheet
    │   ├── FavoritesScreen.tsx
    │   ├── PublishScreen.tsx        # 5 étapes avec progress bar
    │   ├── MessagesScreen.tsx
    │   ├── AccountScreen.tsx
    │   └── index.ts
    └── navigation/
        └── AppNavigator.tsx         # Stack (Onboarding/Login/Main) + Tabs (5)
```

## Design tokens

Tout passe par `src/theme/theme.ts`. Les valeurs clés :

```ts
colors.ink       = '#0a0a0a'  // noir principal
colors.paper     = '#f2efe8'  // blanc cassé principal
fonts.display    = Barlow Condensed 500/600/700/800/900
fonts.mono       = JetBrains Mono 400/500
border.thin      = 1
border.regular   = 1.5
border.strong    = 2
radius.none      = 0           // brutaliste = 0 radius partout
```

## Ce qu'il reste à brancher

- [ ] **Images réelles** — remplacer `<PhotoPlaceholder />` par `<Image source={...} />`
- [ ] **Carte réelle** — intégrer Mapbox ou MapLibre dans `MapScreen.tsx`
- [ ] **API backend** — remplacer `src/data/service.ts` par de vrais appels (Supabase, REST, tRPC…)
- [ ] **Auth** — brancher les boutons Google/Apple dans `LoginScreen.tsx`
- [ ] **Photos upload** — étape 4 de `PublishScreen.tsx` (expo-image-picker)
- [ ] **Push notifications** — expo-notifications
- [ ] **i18n** — extraire les strings FR vers un fichier `fr.json` (prévoir AR avec RTL)
- [ ] **Logo officiel** — remplacer `BabooLogo.tsx` par le SVG fourni par le client

## Utilisation avec Claude Code

Ouvre ce dossier dans Claude Code et lance :

> « Lis la structure complète puis commence par :
> 1. Remplacer les PhotoPlaceholder par des vraies Image avec les URLs de l'API
> 2. Intégrer Mapbox dans MapScreen
> 3. Brancher Supabase dans src/data/service.ts »

Tout est typé strict : TypeScript catchera les régressions si la shape des données change.

## Notes techniques

- **Barlow Condensed** remplace **Bahnschrift SemiBold Condensed** (Microsoft, pas libre). Si licence acquise plus tard, changer uniquement dans `theme.ts > fonts`.
- **RTL** : prévoir pour l'arabe. Les icônes fléchées (`←`, `→`) doivent être inversées. Utiliser `I18nManager.isRTL`.
- **Hit targets** ≥ 44px respectés partout.
- **Contraste** noir/blanc cassé = 16:1 (AAA).
- Pas de radius, pas de gradient, pas d'ombre douce — c'est volontaire, c'est l'identité brutaliste.
