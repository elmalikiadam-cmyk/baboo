# Baboo Mobile

Application Expo + TypeScript pour Baboo. Architecture alignée sur le handoff (`design_handoff_baboo/`) : tokens brutalistes, typographie Barlow Condensed condensée, blanc cassé (#f2efe8) / ink (#0a0a0a), JetBrains Mono pour les eyebrows.

## Stack

- **Expo SDK 52** (New Architecture activée)
- **expo-router 4** (file-based routing typé)
- **TypeScript strict**
- **react-native-svg** pour icônes et logo
- **expo-google-fonts** : Barlow Condensed, Inter, JetBrains Mono

## Structure

```
mobile/
├── app/                        # routes (expo-router)
│   ├── _layout.tsx             # root layout + chargement fonts
│   ├── index.tsx               # entry → redirect /onboarding
│   ├── onboarding/
│   │   ├── _layout.tsx
│   │   ├── index.tsx           # slide 1 — "Trouvez votre prochain logement"
│   │   ├── step-2.tsx          # slide 2 — stats Maroc
│   │   └── step-3.tsx          # slide 3 — "Sans intermédiaire" (dark)
│   └── (tabs)/
│       ├── _layout.tsx         # bottom tabs custom
│       ├── index.tsx           # Feed V2 (brutalist list)
│       ├── search.tsx          # stub
│       ├── publish.tsx         # stub
│       ├── favorites.tsx       # stub
│       └── account.tsx         # stub
├── src/
│   ├── theme/
│   │   ├── theme.ts            # tokens (colors, fonts, fontSize, radius…)
│   │   └── styles.ts           # presets typographiques
│   ├── components/
│   │   ├── OnboardingFrame.tsx # frame partagé des slides (progress + footer)
│   │   ├── PhotoPlaceholder.tsx# motif strié 135° du handoff
│   │   ├── Chip.tsx            # chip mono brutaliste
│   │   ├── Pill.tsx            # bouton pill (primary/outline/soft)
│   │   └── TabStub.tsx         # stub pour tabs non implémentées
│   ├── data/
│   │   └── listings.ts         # ~8 annonces mock alignées sur le seed web
│   └── icons/
│       └── index.tsx           # SVG icons + BabooLogo géométrique
├── app.json
├── package.json
├── tsconfig.json
├── babel.config.js
└── metro.config.js
```

## Démarrage local

```bash
cd mobile
npm install           # ou pnpm install
npx expo start        # puis touche i (iOS) ou a (Android) ou w (Web)
```

Pour tester sur un vrai téléphone : installe Expo Go puis scanne le QR code.

## Design tokens

Les valeurs exactes sont dans `src/theme/theme.ts`. En résumé :

| Token | Valeur | Usage |
|-------|--------|-------|
| `colors.background` | `#f2efe8` | Paper — canevas principal |
| `colors.foreground` | `#0a0a0a` | Ink — texte et CTA |
| `colors.paper2/paper3` | `#e9e5db` / `#dcd7c9` | Variantes (stripes, dividers) |
| `colors.muted` | `#6a6a66` | Texte secondaire |
| `colors.accent` | `#fad22d` | Jaune chaud, sobre |
| `fonts.displayHeavy` | Barlow Condensed 800 | Titres masthead |
| `fonts.mono` | JetBrains Mono 500 | Eyebrows, refs, méta |
| `letterSpacing.displayTight` | `-2.2` | ~-0.04em sur 56px |

## Prochaines étapes

- Filtres réels sur le feed (bouton "AFFINER" ouvrant une sheet)
- Détail d'une annonce avec galerie + carte + contact
- Persistance "onboarding vu" via `expo-secure-store`
- Connexion à l'API Baboo web (même Prisma DB)
