# Handoff : Baboo — Interface mobile d'annonces immobilières (Maroc)

## Vue d'ensemble

Baboo est une application d'annonces immobilières pour le marché marocain (vente + location, particuliers + agents). Ce handoff contient les maquettes HTML de l'interface mobile (iOS + Android responsive), en direction **brutaliste typographique, noir & blanc cassé**.

## À propos des fichiers de design

Les fichiers dans `mockups/` sont des **références de design créées en HTML** — des prototypes montrant l'aspect visuel et le comportement attendus. **Ce ne sont pas du code de production à copier tel quel.**

Ta tâche : **recréer ces maquettes dans l'environnement cible** (React Native, Expo, Flutter, SwiftUI, Next.js, etc.) en suivant les patterns établis du codebase existant. Si aucun codebase n'existe encore, propose la stack la plus adaptée — pour une app Baboo mobile-first + responsive web, je recommande :

- **Mobile** : React Native + Expo (un seul codebase iOS/Android, FR/AR facile)
- **Web** : Next.js 14 (App Router) + Tailwind CSS
- **Backend** : Supabase ou Node + Postgres + PostGIS pour les requêtes géo

## Fidélité

**Hi-fi.** Couleurs, typographie, espacements et interactions sont finaux. Les seuls placeholders à remplacer :
- Les photos d'annonces (motif strié avec label → remplacer par vraies photos)
- La carte (grille simulée → remplacer par Mapbox / MapLibre / Google Maps)

---

## Design tokens

```css
/* Couleurs */
--bb-ink:       #0a0a0a;   /* noir principal */
--bb-ink-2:     #1a1a1a;   /* noir +1 */
--bb-ink-3:     #2a2a2a;   /* noir +2 (stripes dark) */
--bb-paper:     #f2efe8;   /* blanc cassé principal (fond) */
--bb-paper-2:   #e9e5db;   /* blanc cassé +1 */
--bb-paper-3:   #dcd7c9;   /* blanc cassé +2 (stripes) */
--bb-muted:     #6a6a66;   /* gris texte secondaire */
--bb-line:      rgba(10,10,10,0.12);
--bb-line-strong: rgba(10,10,10,0.85);

/* Typographie */
/* Bahnschrift SemiBold Condensed (cible), fallback Barlow Condensed 600/800/900 */
--bb-font-display: 'Barlow Condensed', 'Bahnschrift SemiBold Condensed', 'Arial Narrow', sans-serif;
--bb-font-mono:    'JetBrains Mono', ui-monospace, 'SF Mono', monospace;

/* Rayons — brutaliste = quasi tous 0 */
--bb-r-0: 0;
--bb-r-1: 2px;
--bb-r-2: 4px;

/* Bordures typiques */
1px  solid var(--bb-ink)   /* divider standard */
1.5px solid var(--bb-ink)  /* champs & chips */
2px solid var(--bb-ink)    /* séparation de sections majeures */
```

### Échelle typographique

| Usage | Taille | Poids | Letter-spacing | Line-height |
|-------|--------|-------|----------------|-------------|
| Display XXL (hero) | 88px | 900 | -0.045em | 0.85 |
| Display XL (prix hero) | 64-72px | 900 | -0.04em | 0.9 |
| Display L (titre écran) | 44-56px | 900 | -0.04em | 0.9 |
| Prix card | 32-42px | 900 | -0.03em | 0.9 |
| Title | 18-26px | 800 | -0.01em | 1.0 |
| Body | 15-17px | 500-700 | -0.005em | 1.35 |
| Mono/Eyebrow | 9-11px | 500 | 0.08-0.14em | 1.0 |

### Mentions typo importantes
- **Barlow Condensed** est sur Google Fonts (gratuit). C'est le fallback de **Bahnschrift SemiBold Condensed** demandée par le client (Bahnschrift = Microsoft, pas libre). Utilise Barlow en prod sauf si licence Bahnschrift acquise.
- Jamais de border-radius > 4px sauf exception (cercles d'avatars, dots).
- Jamais de gradient, jamais d'ombre douce. L'esthétique est plate et bordée.
- Les prix sont **énormes** : c'est le centre visuel de chaque card.

---

## Écrans livrés

Tous les écrans sont mobile (402×874, base iPhone 14 Pro). Chaque écran a son fichier JSX dans `mockups/`.

### 1. Onboarding & Auth
- `ScreenOnboarding` (`screen-account.jsx`) — Splash avec slogan « L'immobilier marocain. Sans filtre. »
- `ScreenLogin` (`screen-account.jsx`) — Connexion email/password + Google/Apple

### 2. Accueil (3 directions explorées)
Le client doit choisir **une direction** à implémenter :
- **V1 Éditorial magazine** (`feed-editorial.jsx`) — Masthead, hero full-bleed, grid 2-col numérotée comme un sommaire
- **V2 Liste dense typo** ★ (`feed-list.jsx`) — Prix géants, chips méta, pas d'images en haut. **Direction recommandée** — la plus fidèle au brief brutaliste.
- **V3 Hero cinématographique** (`feed-hero.jsx`) — Swipe immersif + carrousel villes + cards pleine largeur

### 3. Parcours de recherche
- `ScreenFilters` (`screen-filters.jsx`) — Filtres multi-étapes : transaction, villes (chips toggle), prix (slider), pièces, surface, équipements
- `ScreenMap` (`screen-map.jsx`) — Carte avec pins prix custom + bottom sheet carousel horizontal
- `DetailAnnonce` (`screen-detail.jsx`) — Galerie, prix XXL, grille méta, équipements, agent, CTA sticky

### 4. Compte utilisateur
- `ScreenProfile` (`screen-account.jsx`) — Avatar, stats (favoris/recherches/contacts), menu numéroté
- `ScreenFavorites` (`screen-favorites.jsx`) — Liste avec badges (DISPO/BAISSE) + bloc comparateur
- `ScreenMessages` (`screen-messages.jsx`) — Chat avec agent, contexte annonce en header, réponses rapides
- `ScreenMyListings` (`screen-extras.jsx`) — Mes annonces avec stats (vues/contacts/fav) et actions

### 5. Publier
- `ScreenPublish` (`screen-publish.jsx`) — Formulaire 5 étapes avec progress bar : Type → Adresse → Détails → Photos → Prix

### 6. Écrans complémentaires
- `ScreenNotifications` (`screen-extras.jsx`) — Types BAISSE/NEW/MSG/VISIT, dot unread
- `ScreenAgent` (`screen-extras.jsx`) — Profil agent public avec ses annonces

---

## Composants transversaux

### BabooBottomBar (`bottom-bar.jsx`)
Barre de nav bottom, 5 items : ACCUEIL / RECHERCHE / PUBLIER / FAVORIS / COMPTE. Indicateur actif = trait de 24×2px au-dessus + opacité 1 (inactifs à 0.5).

### BabooLogo (`logo.jsx`)
Logo SVG recréé à partir du brief. Deux variantes :
- `<BabooLogo>` — logo complet "Baboo" avec les deux "oo" oreilles de panda
- `<BabooMark>` — juste les "oo" (app icon)

Couleur via `currentColor` — le logo hérite de la couleur de texte. À remplacer par l'SVG officiel du client quand dispo.

### Photo placeholders
Motif strié 45° (`.bb-photo-placeholder` dans `tokens.css`) avec un label mono en bas-gauche. **À remplacer par les vraies photos d'annonces** en prod — garder le ratio et le même espace réservé.

---

## Interactions & comportements

### Navigation
- **Tap back** (← en haut à gauche) : retour écran précédent
- **Tap bottom bar** : navigation principale, persiste l'état
- **Swipe carte** : le bottom sheet carousel scrolle horizontalement sur tap pin

### Cartes d'annonces
- **Tap** → navigation vers DetailAnnonce
- **Long press** → ajout/retrait favoris (confirmation haptique)
- **Icon cœur** tap → toggle favoris
- **Icon flèche dans card agent** → profil agent

### Filtres
- Villes/équipements : chips toggle (multi-sélection)
- Transaction/pièces : segmented (single)
- Prix/surface : double slider avec champs min/max éditables
- CTA footer affiche count live « VOIR N RÉSULTATS »

### Carte
- Pins : tap → focus + centrage carte, card correspondante scrollée dans le sheet
- Pin sélectionné : inversé (noir → blanc / blanc → noir), shadow forte
- Zoom +/−, recentrage sur position utilisateur

### États
- **Loading** : skeleton = même layout avec le motif strié et 0 texte
- **Empty** : type XXL « 0 ANNONCES » + sous-texte mono
- **Error** : pareil, prefix « N° 00 · ERREUR » en mono

---

## Modèle de données (proposé)

```ts
type Listing = {
  id: string;              // "BB-4201"
  type: 'VENTE' | 'LOCATION';
  title: string;           // "Riad rénové médina"
  description: string;
  price: number;           // en MAD
  pricePerM2?: number;
  currency: 'MAD';
  rental?: { period: 'month' | 'day' };
  location: {
    city: string;          // "Marrakech"
    neighborhood: string;  // "Médina"
    address?: string;
    lat: number;
    lng: number;
  };
  surface: number;         // m²
  landSurface?: number;
  rooms: number;
  bathrooms: number;
  floors?: string;         // "R+2"
  yearBuilt?: number;
  condition: 'EXCELLENT' | 'BON' | 'À RÉNOVER';
  equipments: string[];    // ['PATIO','TERRASSE','ZELLIGE',...]
  photos: string[];        // URLs
  verified: boolean;
  premium?: boolean;
  status: 'EN LIGNE' | 'EN ATTENTE' | 'VENDU' | 'LOUÉ';
  createdAt: string;
  agent: Agent;
};

type Agent = {
  id: string;
  firstName: string;
  lastName: string;
  initials: string;        // "KB"
  agency?: string;         // "Cabinet Atlas"
  city: string;
  verified: boolean;
  listingsCount: number;
  rating: number;          // 4.9
  yearsOfExperience: number;
};

type User = {
  id: string;
  firstName: string;
  lastName: string;
  initials: string;
  type: 'PARTICULIER' | 'AGENT';
  favorites: string[];
  savedSearches: SavedSearch[];
};
```

---

## Internationalisation

- **Par défaut FR**. Le client a mentionné que bilingue FR/AR peut venir plus tard.
- Tous les strings sont en FR dans les mockups — extraire dans un fichier `fr.json` dès le début.
- Prévoir **RTL** dans les composants (flex-direction, text-align) — la typo Barlow Condensed fonctionne bien en LTR, prévoir une font arabe condensée (ex: **IBM Plex Arabic** ou **Noto Kufi Arabic**) pour l'AR.
- Devise : MAD systématiquement affichée.
- Formatage nombre : espace fin comme séparateur de milliers (« 4 200 000 »), pas de virgule.

---

## Accessibilité

- Tous les `<div>` interactifs → transformer en `<button>` ou `<Pressable>` avec `accessibilityLabel`.
- Hit target minimum **44×44px** (respecté dans les mockups).
- Contraste AA+ partout (noir/blanc cassé = 16:1).
- Barlow Condensed 900 à très grosse taille reste lisible — garder le `letter-spacing: -0.03em` pour l'équilibre optique.

---

## Checklist d'implémentation

```
[ ] Setup projet (RN Expo / Next.js / ta stack)
[ ] Intégrer Barlow Condensed (Google Fonts 400/500/600/700/800/900)
[ ] Intégrer JetBrains Mono (Google Fonts 400/500)
[ ] Créer les design tokens (CSS vars ou theme object)
[ ] Composant BabooLogo (SVG)
[ ] Composant PhotoPlaceholder (motif strié + label)
[ ] Onboarding + Auth
[ ] Feed V2 (direction recommandée)
[ ] Détail annonce
[ ] Filtres
[ ] Carte (intégrer Mapbox ou MapLibre)
[ ] Favoris + comparateur
[ ] Messagerie temps réel (WebSocket)
[ ] Publier (5 étapes, upload photos)
[ ] Profil utilisateur + Profil agent
[ ] Mes annonces (dashboard propriétaire)
[ ] Notifications push
[ ] i18n FR (AR plus tard)
[ ] Tests A11y
```

---

## Fichiers livrés

```
design_handoff_baboo/
├── README.md                      ← ce fichier
├── assets/
│   └── baboo-logo.png             ← logo fourni par le client
└── mockups/
    ├── Baboo - Accueil.html       ← ouvrir ce fichier pour voir tous les écrans
    ├── tokens.css                 ← design tokens (copier dans ton projet)
    ├── logo.jsx                   ← composant logo SVG
    ├── bottom-bar.jsx             ← barre de nav bottom
    ├── feed-editorial.jsx         ← V1 accueil
    ├── feed-list.jsx              ← V2 accueil (recommandé)
    ├── feed-hero.jsx              ← V3 accueil
    ├── screen-detail.jsx          ← détail annonce
    ├── screen-filters.jsx         ← filtres de recherche
    ├── screen-map.jsx             ← carte + pins prix
    ├── screen-publish.jsx         ← formulaire publier
    ├── screen-favorites.jsx       ← favoris + comparateur
    ├── screen-messages.jsx        ← messagerie agent
    ├── screen-account.jsx         ← profil, onboarding, login
    ├── screen-extras.jsx          ← notifications, agent, mes annonces
    ├── design-canvas.jsx          ← wrapper canvas (outil de présentation)
    └── ios-frame.jsx              ← frame iPhone (outil de présentation)
```

> Note : `design-canvas.jsx` et `ios-frame.jsx` sont les outils d'assemblage de la présentation HTML — **à ne pas réimplémenter** dans l'app réelle.

---

## Comment utiliser ce handoff avec Claude Code

1. **Télécharge ce dossier** (zip fourni par le designer)
2. **Ouvre-le dans ton projet** ou un nouveau dossier
3. Lance Claude Code dans ce dossier :
   ```bash
   claude
   ```
4. Demande :
   > « Lis `design_handoff_baboo/README.md` puis commence par setup un projet Expo + TypeScript + React Navigation. Intègre les design tokens dans un fichier `theme.ts`. Commence par l'onboarding et la V2 du feed. »

5. Claude Code lira les fichiers `.jsx` des mockups comme références visuelles et génèrera l'équivalent dans ton environnement cible.

> Les `.jsx` ne sont **pas** à utiliser en prod — ce sont des maquettes. Le style vient des tokens et la structure vient de ce que tu liras dans chaque fichier.
