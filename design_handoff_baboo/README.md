# Handoff : Baboo — Front-end immobilier Maroc

## Vue d'ensemble
Baboo est une plateforme d'annonces immobilières au Maroc (achat et location, particuliers + professionnels, 12 villes). Ce package contient :

1. **Le brief technique complet** (section "Spec à implémenter" ci-dessous) — à copier-coller à Claude Code
2. **Des maquettes HTML de référence** pour l'écran d'accueil (3 directions visuelles brutalistes en noir & blanc cassé)
3. **Le logo source** (`assets/baboo-logo.png`)

## À propos des fichiers de design
Les fichiers dans `mockups/` sont des **références de design créées en HTML** — des prototypes qui montrent l'intention visuelle et l'ADN typographique, pas du code de production à copier tel quel.

La tâche est de **recréer ces designs dans un vrai projet Next.js 15 + Tailwind**, selon la spec détaillée plus bas. Les maquettes HTML servent de source de vérité pour :
- le ton visuel (brutaliste, typographique, noir & blanc cassé)
- la typo (Barlow Condensed SemiBold avec Bahnschrift en premier choix)
- le traitement du logo (discret, formes rondes réservées au logo)
- l'esthétique générale des cartes et de la hiérarchie

## Fidélité
**Mi-fi → hi-fi partiel.** Les maquettes couvrent 3 directions de l'écran d'accueil mobile uniquement. Les autres pages (recherche, fiche, pro, connexion) sont décrites dans la spec mais non maquettées. Pour ces pages, Claude Code doit déduire les patterns à partir du système de tokens + des maquettes existantes.

**Direction retenue pour l'implémentation** : la V1 (Éditorial avec masthead typographique) est la plus proche du ton "généraliste confiant" visé par le brief, combinée aux cartes d'annonces de la V2 (liste dense). La V3 (hero cinématographique) est une option à conserver comme carrousel éventuel.

## Écrans maquettés
Ouvrir `mockups/Baboo - Accueil.html` pour voir les 3 directions côte à côte dans des frames iOS.

| Direction | Filename | Description |
|-----------|----------|-------------|
| V1 Éditorial | `feed-editorial.jsx` | Masthead + héro full-bleed + grille 2 col |
| V2 Liste dense | `feed-list.jsx` | Recherche brutaliste + liste typographique |
| V3 Hero | `feed-hero.jsx` | Swipe plein écran + carrousel villes |

## Tokens de design (source de vérité)
Voir `mockups/tokens.css`. Valeurs clés :

- `--bb-ink: #0a0a0a` (noir)
- `--bb-paper: #f2efe8` (blanc cassé)
- `--bb-paper-2: #e9e5db`, `--bb-paper-3: #dcd7c9` (variations)
- Typo display : Barlow Condensed 600/700/800/900, letter-spacing serré (-0.02 à -0.04em), line-height 0.9-0.95
- Typo mono : JetBrains Mono pour les métadonnées, eyebrows (uppercase 0.1em tracking)
- Placeholders photos : stripes 135° + label monospace (remplacer par next/image en prod)

⚠️ **Note importante** : la spec technique (ci-dessous) définit des tokens légèrement différents (palette HSL, accent jaune `48 96% 58%`, rayons rounded-full). **La spec prime sur les maquettes pour l'implémentation Next.js**. Les maquettes montrent juste le ton brutaliste/typographique à conserver dans l'esprit. En cas de conflit, suivre la spec.

## Logo
Voir `assets/baboo-logo.png` pour la source. Une recréation SVG est fournie dans `mockups/logo.jsx` (composant `BabooLogo`) mais le composant final `BabooLogo` à créer dans le codebase doit être un ourson stylisé minimaliste + wordmark "baboo" en Barlow Condensed 700, 75% condensed, hauteur 32, couleur `currentColor` (voir la spec).

---

# Spec à implémenter (brief technique complet)

Tu es un ingénieur front-end senior. Construis en **Next.js 15 (App Router) + TypeScript + Tailwind CSS** le front-end d'une plateforme d'annonces immobilières au Maroc appelée Baboo, selon la spec ci-dessous. Code propre, typé strict, responsive, accessible. Rends tout le code exécutable. Ne fabrique pas d'éléments hors de cette spec.

## 1. Positionnement produit
- Baboo = moteur de recherche d'annonces immobilières au Maroc.
- Deux types de publiants : Particuliers et Professionnels (agences, brokers, promoteurs).
- Deux transactions : Achat et Location.
- Villes couvertes : Casablanca, Rabat, Marrakech, Tanger, Agadir, Fès, Meknès, Tétouan, Oujda, El Jadida, Kénitra, Mohammedia. Chaque ville a des quartiers (ex. Anfa, Gauthier, Hivernage, Agdal, Palmeraie, Malabata…).
- Tonalité : généraliste, clair, confiant, minimaliste. Pas premium, pas éditorial, pas luxe.
- Devise : MAD. Surfaces en m². Copy en français.
- À proscrire : "premium", "haut de gamme", "coup de cœur", "exclusivité", "sélection", "éditorial", gradients, ombres lourdes, émojis, clichés stock photo.

## 2. Stack
- Next.js 15 App Router, React Server Components, Server Actions.
- TypeScript strict, path alias `@/*` → `src/*`.
- Tailwind CSS + CSS variables en `:root`.
- Prisma + PostgreSQL. Client singleton dans `src/lib/db.ts`.
- Images : `next/image` avec remotePatterns autorisant `images.unsplash.com`, `res.cloudinary.com`.
- Fonts : `next/font/google` pour Inter (body) et Barlow Condensed (display, poids 500/600/700). En CSS, déclarer Bahnschrift en premier choix avec Barlow Condensed en fallback libre : `font-family: "Bahnschrift", var(--font-barlow), system-ui, sans-serif`.
- URL-driven search state : tous les filtres vivent dans `searchParams`. Pas de state client pour la liste de résultats.

## 3. Design tokens (valeurs exactes)
Dans `src/app/globals.css`, sous `:root`, déclarer en HSL :

```css
--background: 0 0% 100%;
--foreground: 0 0% 6%;
--surface: 0 0% 100%;
--surface-muted: 0 0% 97%;
--border: 0 0% 90%;
--border-strong: 0 0% 78%;
--muted: 220 9% 46%;
--muted-foreground: 220 9% 40%;
--ink: 0 0% 6%;
--ink-foreground: 0 0% 98%;
--primary: 0 0% 6%;
--primary-foreground: 0 0% 100%;
--accent: 48 96% 58%;
--accent-foreground: 0 0% 6%;
--success: 155 46% 34%;
--danger: 2 72% 41%;
```

Brancher ces tokens dans `tailwind.config.ts` sous `theme.extend.colors` (background, foreground, border, border-strong, surface.DEFAULT, surface.muted, ink.DEFAULT, ink.foreground, primary, accent, muted, success, danger).

Rayons : `lg: 0.625rem`, `xl: 1rem`, `2xl: 1.5rem`, `3xl: 2rem`. Cartes par défaut `rounded-3xl`. Pills et boutons `rounded-full`. Inputs `rounded-full`.

Container centré, padding `1.25rem / 1.5rem / 2rem`, max `1280px`.

## 4. Typographie
Titres h1–h4 :
- `font-family: var(--font-display)` (Bahnschrift → Barlow Condensed)
- `font-weight: 600`
- `font-stretch: 75%` (condensed)
- `letter-spacing: -0.01em`
- `line-height: 1.08`

Classe utilitaire `.display-xl` pour les titres d'hero/section (mêmes règles + `letter-spacing -0.015em` + `line-height 1.02`).

Classe `.eyebrow` : `text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground`.

Corps : Inter, poids normal. Links soulignés au hover via `underline-offset-4`.

## 5. Composants primitifs (à créer)

### `src/components/ui/button.tsx`
Props : `variant: "primary" | "outline" | "ghost" | "soft" | "link"`, `size: "xs" | "sm" | "md" | "lg" | "icon"`.
- Tous `rounded-full` sauf link (rounded simple).
- primary = `bg-foreground text-background hover:bg-foreground/90`.
- outline = `border border-foreground/80 bg-transparent hover:bg-foreground hover:text-background`.
- soft = `bg-foreground/[0.08] hover:bg-foreground/[0.14]`.
- ghost = `hover:bg-foreground/5`.
- Focus ring visible : `focus-visible:ring-2 ring-foreground ring-offset-2 ring-offset-background`.
- Tailles : md = `h-11 px-5 text-sm`, lg = `h-12 px-6 text-base`, sm = `h-9 px-4 text-sm`, xs = `h-8 px-3 text-xs`, icon = `h-10 w-10`.

### `src/components/ui/card.tsx`
Props : `variant: "light" | "dark" | "soft"`.
- light = `bg-surface border border-foreground/15 text-foreground`.
- soft = `bg-surface-muted border border-foreground/10`.
- dark = `bg-ink text-ink-foreground`.
- Par défaut `rounded-3xl`. Exposer aussi `CardBody` avec padding `p-7 md:p-9`.

### `src/components/ui/badge.tsx`
Props : `tone: "neutral" | "dark" | "light" | "success"`.
- Tailles : `rounded-full px-2.5 py-1 text-[11px] font-medium`.
- neutral = `bg-foreground/[0.08] text-foreground`.
- dark = `bg-foreground text-background`.
- light = `border border-foreground/20 bg-background text-foreground`.
- success = `bg-success/10 text-success`.

### `src/components/ui/input.tsx`
Exporte `Input`, `Label`, `Select`.
- Input et Select : `h-12 rounded-full border border-foreground/15 bg-background px-4 text-sm`. Focus : `border-foreground ring-2 ring-foreground/10`.
- Select a une flèche SVG en background-image.
- Label : `text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground`.

### `src/components/ui/icons.tsx`
SVG minimalistes trait 1.75, stroke-linecap round. Exporter : `SearchIcon, MapPinIcon, BedIcon, BathIcon, RulerIcon, HeartIcon, PhoneIcon, WhatsAppIcon, ShareIcon, CheckIcon, PlusIcon, ChevronRightIcon, CloseIcon, UserIcon, BuildingIcon, BabooLogo`.

`BabooLogo` : ourson stylisé minimaliste (cercle avec 2 yeux + sourire) + wordmark "baboo" en Barlow Condensed 700, 75% condensed, hauteur 32, couleur currentColor.

## 6. Layout global

### `src/components/layout/site-header.tsx`
- Sticky top, fond `bg-background/95 backdrop-blur`.
- Hauteur `h-20`.
- Gauche : `<BabooLogo />` en lien vers `/`.
- Centre (md+) : nav texte `text-sm font-medium text-foreground/75 hover:text-foreground` avec liens Acheter (`/recherche?t=sale`), Louer (`/recherche?t=rent`), Déposer une annonce (`/pro/publier`), Espace Pro (`/pro`).
- Droite : bouton pill primary "Connexion" → `/connexion`.

### `src/components/layout/site-footer.tsx`
- Fond sombre `bg-ink text-ink-foreground`, padding `py-16`.
- 4 colonnes grid : logo + tagline, "Annonces" (Acheter, Louer, Déposer), "Par type" (6 types), "Baboo" (À propos, Espace Pro, Contact, Mentions légales, Confidentialité).
- Titres de colonne : `text-xs font-semibold uppercase tracking-[0.14em] text-ink-foreground/50`.
- Liens : hover underline.
- Bas : ligne de séparation `border-t border-ink-foreground/10`, copyright + mention MAD.

## 7. Data (Prisma)
Enums : `UserRole(USER|AGENCY|DEVELOPER|ADMIN)`, `Transaction(SALE|RENT)`, `PropertyType(APARTMENT|VILLA|RIAD|HOUSE|OFFICE|COMMERCIAL|LAND|INDUSTRIAL|BUILDING)`, `ListingStatus(DRAFT|PENDING|PUBLISHED|REJECTED|ARCHIVED)`, `Condition(NEW|GOOD|TO_RENOVATE|UNDER_CONSTRUCTION)`, `LeadStatus(NEW|CONTACTED|QUALIFIED|VISIT_SCHEDULED|CLOSED|LOST)`.

Modèles clés : `User, Agency, Developer, City(slug, name, region, lat, lng, cover, tagline), Neighborhood(slug, name, citySlug, lat, lng), Listing` (tous les champs physiques + 11 booléens d'aménités : `parking, elevator, furnished, terrace, balcony, garden, pool, security, seaView, airConditioning, concierge` + `coverImage, lat, lng, status, featured, publishedAt, ownerId, agencyId?` optionnel), `ListingMedia(listingId, url, alt, position), Favorite, SavedSearch, Lead, Project, ProjectUnit`.

**Important : `agencyId` est optionnel. Si null, l'annonce a été déposée par un particulier.**

Seed : ~60 annonces sur 12 villes. 1 sur 3 a `agencyId = null` (particulier).

## 8. Carte d'annonce `src/components/listing/listing-card.tsx`
- `<article>` rounded-3xl, pas de bordure, hover `-translate-y-0.5` transition 200ms.
- Image 4:3 `rounded-3xl`, `object-cover`, hover `scale-[1.03]` 500ms.
- Badge coin haut-gauche : **Pro** (tone dark) si `listing.agency`, sinon **Particulier** (tone light).
- Bouton favori circulaire coin haut-droit (HeartIcon) : `h-9 w-9 bg-background rounded-full ring-1 ring-foreground/10`.
- Sous l'image :
  - Prix en `.display-xl text-2xl leading-none`. Format : `formatPrice(price)` pour vente, `formatPricePerMonth(price)` pour location (`… /mois`).
  - Titre, `line-clamp-1 text-sm font-medium`.
  - Localisation : MapPinIcon + `neighborhood.name, city.name`, `text-sm text-muted-foreground`.
  - Row faits : surface (RulerIcon + N m²), chambres (BedIcon + N ch.), sdb (BathIcon + N sdb). `text-xs text-muted-foreground`.

## 9. Pages

### `/` — Homepage
Ordre vertical :

1. **Hero centré**, container `py-16 md:py-28`, `max-w-4xl` :
   - `<h1>` `.display-xl` : "Trouvez votre prochain logement." (taille responsive jusqu'à `4.75rem`).
   - Sous-titre `text-muted-foreground` : "Annonces de particuliers et professionnels. Achat, location, partout au Maroc."
   - Trio de pills `.pill-soft` (classe utility : `inline-flex items-center rounded-full bg-foreground/[0.08] px-4 py-2 text-sm font-medium hover:bg-foreground/[0.14]`) : "Je veux acheter" → `/recherche?t=sale`, "Je veux louer" → `/recherche?t=rent`, "Je veux publier une annonce" → `/pro/publier`.

2. **Hero search** : composant client. Au-dessus, toggle segmenté Acheter | Louer en pill sombre. Barre `rounded-full border border-foreground/15 p-2 shadow-soft` contenant 3 selects (Ville, Type, Budget max) et un bouton primary "Rechercher" avec SearchIcon.

3. **Dernières annonces** : `<h2 class="display-xl text-3xl md:text-5xl">Dernières annonces.</h2>` + lien pill "Voir tout" à droite. Grille `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`, 8 cartes max, charge les 8 plus récentes via `db.listing.findMany`.

4. **Comment ça marche** : titre display-xl, sous-titre optionnel, pill "En savoir plus" à droite. Grille 3 colonnes de `<Card variant="light">` au format aspect-ratio 7/9, padding `p-7 md:p-9`. Chaque carte :
   - Titre condensé (`display-xl text-[1.65rem] md:text-3xl`) : "Cherchez sans friction.", "Gardez le meilleur.", "Contactez directement."
   - Paragraphe court `text-sm text-muted-foreground`.
   - En bas, icône 64x64 dans un carré `rounded-2xl border border-foreground/20`.

5. **Particulier ou professionnel** : eyebrow "POUR QUI" + titre display-xl "Particulier ou professionnel." + pill "Nous contacter". Grille 2 colonnes de `<Card variant="dark">` padding `p-7 md:p-10`. Chaque carte noire :
   - Haut : pill badge du type (Particulier / Professionnel) à gauche, carré icône `rounded-2xl border border-ink-foreground/20` à droite.
   - Espace vertical généreux puis titre `display-xl text-3xl md:text-[2.5rem] text-ink-foreground`.
   - Paragraphe `text-ink-foreground/75`.
   - CTA pill blanc `bg-background text-foreground rounded-full px-5 py-2.5` avec ChevronRightIcon.

6. **Footer** (déjà défini en section 6).

### `/recherche` — Résultats de recherche
- Parse les query params via utilitaire `parseSearchParams` → objet `SearchFilters` typé.
- Supports : `t` (sale/rent), `city`, `n` (neighborhood), `type` (csv), `pmin`, `pmax`, `smin`, `smax`, `br` (bedrooms), `ba` (bathrooms), `a` (amenities csv), `q` (keyword), `featured`, `sort` (newest|price_asc|price_desc|surface_desc), `p` (page).
- Page size : 18. Pagination numérique + Précédent/Suivant en pills.
- Layout : breadcrumb texte → H1 display-xl dynamique ("Appartements à vendre à Casablanca" etc.) + sous-titre neutre. Row de chips appliqués (ville, quartier, types, budget, etc.), chacun cliquable pour retirer le filtre.
- Grille `lg:grid-cols-[320px_1fr]`. Panneau de filtres sticky à gauche, résultats à droite.
- Filtres (dans `rounded-xl border`) : toggle Acheter/Louer, Ville (select), Quartier (select, n'apparaît que si ville sélectionnée), types (pills rounded-full border), prix min/max, surface min/max, chambres (1+…5+), aménités (pills), mot-clé, bouton "Réinitialiser".
- Toolbar au-dessus des résultats : compteur "N annonces trouvées" + select de tri.
- Grille résultats `sm:grid-cols-2 xl:grid-cols-3 gap-5`. Cartes = `<ListingCard>`.
- Empty state si 0 : carte pointillée, H2 "Aucune annonce ne correspond.", lien "Réinitialiser".

### `/annonce/[slug]` — Fiche détail
Layout `grid lg:grid-cols-[1fr_380px]` :

**Colonne principale :**
- Breadcrumb → Galerie composée de 1 photo principale 16:10 + 4 vignettes 4:3. Sur la 4e vignette, overlay "+N photos" si plus de 5.
- Row de badges : À vendre/Location, type de bien, puis Pro (agency existe) ou Particulier (sinon).
- Titre H1 `display-xl text-3xl md:text-4xl`.
- Localisation + date relative ("Il y a 3 jours").
- Prix `display-xl text-4xl md:text-5xl` + boutons Sauvegarder/Partager à droite.
- Fiche technique `<dl>` en grille, bords `border-y` : Type, Surface habitable, Terrain, Chambres, Salles de bain, Étage, Année, État.
- Description en paragraphes.
- Commodités : liste des aménités actives avec puce CheckIcon dans rond `bg-success/10`.
- Localisation : titre + iframe OpenStreetMap avec bbox autour de lat/lng, `rounded-xl border`, hauteur 360px, `loading="lazy"`. Mention "adresse exacte communiquée à la visite".
- Bloc référence : ID raccourci + date publi + lien "Signaler cette annonce".
- Biens similaires : 4 cartes même ville + même type.
- Mobile sticky bar : prix + boutons Appeler / Contacter.
- JSON-LD `<script type="application/ld+json">` avec `@type: RealEstateListing, offers, address{addressCountry: "MA"}, floorSize, numberOfRooms`.

**Sidebar (droite)** : `<ContactCard>`, composant client.
- `rounded-3xl border border-foreground/15 p-6`, sticky top-24.
- Si agency : avatar initiales + nom + "Agence vérifiée" si verified.
- Formulaire : Nom, Email, Téléphone, Message (pré-rempli "Bonjour, je suis intéressé(e) par «titre»…").
- Bouton full width "Envoyer une demande".
- Row 2 boutons : Appeler (`tel:`) + WhatsApp (`wa.me/...`).
- Disclaimer RGPD en fin.
- Sur succès : carte confirmation avec CheckIcon dans rond vert.

### `/pro` — Landing Espace Pro
- Hero centré : eyebrow "BABOO PRO", H1 display-xl "L'immobilier, sans friction.", sous-titre, 2 boutons pill "Créer un compte Pro" (primary) + "Parler à notre équipe" (outline).
- Grille 3 colonnes de Cards light avec icône ronde noire `bg-foreground text-background` + ligne de bénéfice. 6 bénéfices (publication soignée, leads qualifiés, tableau de bord, mise en avant, modération, support MA).

### `/connexion` et `/inscription`
- Carte centrée `rounded-3xl border border-foreground/15 bg-surface p-8 max-w-md`.
- H1 display-xl text-3xl, sous-titre.
- Form : champs empilés avec `<Label>` en eyebrow + `<Input>`.
- Bouton full width primary size="lg".
- Lien bas de carte vers l'autre page.

### `/not-found`
- Eyebrow "ERREUR 404", H1 display-xl, texte, deux boutons (accueil + voir annonces).

## 10. Comportements
- URL-driven : chaque changement de filtre pousse sur `router.push(pathname + queryString)` avec `useTransition` pour désactiver le bouton pendant la navigation.
- Responsive : tout doit être utilisable sur mobile. Mobile sticky CTA sur fiche détail. Nav header se cache sur mobile (menu à prévoir ou omis initialement).
- Images : `next/image` avec sizes précis.
- Loading states : skeletons discrets. Pas de spinners.
- Empty states systématiques sur chaque vue qui peut être vide.
- A11y : `aria-label` sur icônes, `focus-visible` custom ring, contraste AA, clavier.
- SEO : `generateMetadata` par route, `alternates.canonical`, JSON-LD sur fiche, `sitemap.ts` dynamique (toutes les villes × types × transactions + toutes les annonces), `robots.ts` (disallow `/pro/`, `/admin/`, `/api/`).

## 11. Utils attendus
- `src/lib/cn.ts` : helper `clsx` + `tailwind-merge`.
- `src/lib/format.ts` : `formatPrice` (MAD, `Intl.NumberFormat` fr-MA), `formatPricePerMonth`, `formatSurface` (m²), `relativeDate` (Aujourd'hui, Hier, Il y a N jours/semaines/mois).
- `src/lib/search-params.ts` : `parseSearchParams`, `filtersToQueryString`, `buildSearchHref`.
- `src/lib/listings-query.ts` : `findListings(filters)` qui try/catch le Prisma (renvoie résultat vide si DB down au build).

## 12. Structure de dossiers
```
src/
  app/
    (pages)
    layout.tsx  globals.css  not-found.tsx
    robots.ts  sitemap.ts
    annonce/[slug]/page.tsx
    recherche/page.tsx
    pro/page.tsx
    connexion/page.tsx
    inscription/page.tsx
  components/
    ui/ (button, card, badge, input, icons)
    layout/ (site-header, site-footer)
    listing/ (listing-card, listing-gallery, listing-facts, amenity-list, contact-card, listing-map-preview)
    search/ (hero-search, search-filters, search-toolbar, search-pagination, applied-chips)
    marketing/ (how-it-works, for-you)
  data/ (cities.ts, taxonomy.ts)
  lib/ (cn, db, format, search-params, listings-query)
prisma/
  schema.prisma, seed.ts
```

## 13. Règles d'exécution
- Utilise les valeurs exactes des tokens ci-dessus. Ne réinvente pas une palette.
- Ne génère aucune police serif. Pas de Fraunces, pas de Playfair.
- **N'utilise pas l'accent jaune (`--accent`) sur les CTAs principaux. Réserve-le à des détails subtils** (une underline de titre, une puce de liste, pas plus).
- Pas de gradients, pas d'ombres lourdes, pas de bordures colorées.
- Toute la copy en français. Pas de lorem ipsum.
- Badges obligatoires sur les cartes d'annonces : **Pro** (fond noir) ou **Particulier** (contour).
- À la fin : rendre un arbre de fichiers + les commandes pour lancer (`pnpm install && pnpm db:push && pnpm db:seed && pnpm dev`).

---

# Comment utiliser ce package avec Claude Code

## Option A — En ligne de commande (recommandé)
1. Installe Claude Code : https://docs.claude.com/claude-code
2. Crée un dossier vide pour le projet : `mkdir baboo && cd baboo`
3. Lance Claude Code : `claude`
4. Glisse-dépose le fichier `README.md` de ce handoff dans le terminal, puis tape :
   > "Implémente entièrement ce brief. Commence par initialiser le projet Next.js 15 avec TypeScript et Tailwind, puis suis la spec section par section."
5. Claude Code va créer tous les fichiers. Laisse-le travailler, réponds aux questions s'il en pose.
6. Quand c'est fini : `pnpm install && pnpm db:push && pnpm db:seed && pnpm dev`

## Option B — Dans Claude.ai ou une autre session
1. Ouvre une nouvelle conversation avec Claude.
2. Copie-colle le contenu de ce `README.md` en entier.
3. Joins les fichiers dans `mockups/` et `assets/` si l'interface le permet.
4. Demande : "Implémente ce brief Next.js 15. Génère chaque fichier un par un."

## Fichiers inclus
```
design_handoff_baboo/
├── README.md                    ← ce fichier (brief + instructions)
├── assets/
│   └── baboo-logo.png          ← logo source
└── mockups/
    ├── Baboo - Accueil.html    ← prototype principal (ouvre ça en premier)
    ├── tokens.css              ← tokens CSS des maquettes
    ├── logo.jsx                ← logo recréé en SVG
    ├── feed-editorial.jsx      ← V1 Éditorial
    ├── feed-list.jsx           ← V2 Liste dense
    ├── feed-hero.jsx           ← V3 Hero cinématographique
    ├── bottom-bar.jsx          ← barre de nav mobile
    ├── design-canvas.jsx       ← wrapper canvas
    └── ios-frame.jsx           ← frame iOS
```
