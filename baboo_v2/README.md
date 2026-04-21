# Handoff : Baboo — Front-end immobilier Maroc

**Direction retenue : "Maison ouverte"** — chaleureux, photo-first, marocain sans folklore.

## Vue d'ensemble
Baboo est une plateforme d'annonces immobilières au Maroc (achat et location, particuliers + professionnels, 12 villes). Ce package contient :

1. **Le brief technique complet** (section "Spec à implémenter" ci-dessous) — à copier-coller à Claude Code
2. **Une maquette React de référence** (`mockups/baboo-redesign.jsx`) qui montre 3 écrans mobiles côte à côte (accueil, recherche, fiche détail) dans la direction retenue
3. **Le logo source** (`assets/baboo-logo.png`)

## À propos des fichiers de design
`mockups/baboo-redesign.jsx` est une **référence de design créée en React** — un prototype fonctionnel qui montre l'intention visuelle, la palette, la typographie, et la composition des composants clés. **Ce n'est pas du code de production à copier tel quel.** La tâche est de **recréer ce design dans un vrai projet Next.js 15 + Tailwind**, selon la spec détaillée plus bas.

La maquette sert de source de vérité pour :
- le ton visuel (chaleureux, photo-first, terre/crème)
- la typo (Fraunces serif chaleureux + Inter Tight pour l'UI)
- le traitement du logo (ourson minimal + wordmark en italique)
- l'esthétique des cartes d'annonces (photo dominante, prix en serif, badges doux)
- la navigation mobile (bottom tab bar iOS à 5 onglets)

## Fidélité
**Mi-fi → hi-fi partiel.** La maquette couvre 3 écrans mobiles (accueil, liste recherche, fiche détail). Les autres pages (pro, connexion, inscription, 404) sont décrites dans la spec mais non maquettées. Claude Code doit déduire les patterns à partir du système de tokens + des maquettes existantes.

## Philosophie du design
**Ce que Baboo N'EST PAS :**
- Pas un magazine brutaliste noir & blanc
- Pas du "premium", "luxe", "haut de gamme", "éditorial", "coup de cœur", "exclusivité"
- Pas de gradients voyants, pas d'ombres lourdes, pas d'émojis
- Pas de serif "classique" genre Playfair (trop mariage), pas de sans-serif froid genre Inter de base (trop startup SF)
- Pas de jaune criard style station-service

**Ce que Baboo EST :**
- Un moteur de recherche chaleureux, confiant, utile
- Photo-first : le bien immobilier est le héros, pas la typo
- Typographie qui a de la personnalité (Fraunces italique pour les moments émotionnels — titres, prix) sans crier
- Palette terre et crème, ancrée dans le monde physique marocain (tuiles, lumière dorée, terres ocre) sans tomber dans le pastiche "orientaliste"
- Un seul accent : terracotta discret, réservé aux détails qui doivent attirer l'œil (nouveautés, liens actifs, notifications)
- Convention mobile respectée (bottom nav iOS 5 onglets), on ne réinvente pas ce qui marche

## Logo
Voir `assets/baboo-logo.png` pour la source. Le composant `BabooLogo` à créer dans le codebase doit être un **ourson stylisé minimaliste** (3 cercles : 2 oreilles + 1 tête, avec museau et yeux simples) + **wordmark "baboo" en Fraunces italique 500**, couleur `currentColor`, hauteur par défaut 24px. Voir l'implémentation dans `mockups/baboo-redesign.jsx` pour la référence exacte.

---

# Spec à implémenter (brief technique complet)

Tu es un ingénieur front-end senior. Construis en **Next.js 15 (App Router) + TypeScript + Tailwind CSS** le front-end d'une plateforme d'annonces immobilières au Maroc appelée Baboo, selon la spec ci-dessous. Code propre, typé strict, responsive, accessible, mobile-first. Rends tout le code exécutable. Ne fabrique pas d'éléments hors de cette spec.

## 1. Positionnement produit
- Baboo = moteur de recherche d'annonces immobilières au Maroc.
- Deux types de publiants : Particuliers et Professionnels (agences, brokers, promoteurs).
- Deux transactions : Achat et Location.
- Villes couvertes : Casablanca, Rabat, Marrakech, Tanger, Agadir, Fès, Meknès, Tétouan, Oujda, El Jadida, Kénitra, Mohammedia. Chaque ville a des quartiers (ex. Anfa, Gauthier, Hivernage, Agdal, Palmeraie, Malabata…).
- Tonalité : **chaleureux, confiant, utile, photo-first**. Pas premium, pas éditorial, pas luxe, pas brutaliste.
- Devise : MAD. Surfaces en m². Copy en français.
- À proscrire : "premium", "haut de gamme", "coup de cœur", "exclusivité", "sélection", "éditorial", gradients voyants, ombres lourdes, émojis, clichés stock photo, bordures épaisses noires décoratives.

## 2. Stack
- Next.js 15 App Router, React Server Components, Server Actions.
- TypeScript strict, path alias `@/*` → `src/*`.
- Tailwind CSS + CSS variables en `:root`.
- Prisma + PostgreSQL. Client singleton dans `src/lib/db.ts`.
- Images : `next/image` avec remotePatterns autorisant `images.unsplash.com`, `res.cloudinary.com`.
- Fonts : `next/font/google` pour **Fraunces** (display, poids 400/500/600 + italiques 400/500) et **Inter Tight** (body, poids 400/500/600/700). Importer aussi **JetBrains Mono** (poids 400/500) pour les eyebrows et métadonnées.
- Icônes : **lucide-react**.
- URL-driven search state : tous les filtres vivent dans `searchParams`. Pas de state client pour la liste de résultats.

## 3. Design tokens (valeurs exactes)
Dans `src/app/globals.css`, sous `:root`, déclarer en HSL :

```css
:root {
  /* Surfaces — crème chaude */
  --background: 37 43% 96%;          /* #FAF6F0 — crème fond principal */
  --surface: 37 43% 96%;             /* idem background */
  --surface-warm: 38 40% 91%;        /* #F4EDE1 — carte soft, separators */
  --surface-cool: 37 35% 89%;        /* #EFE9DC — surface +2 */

  /* Encres — presque noir légèrement chaud */
  --foreground: 30 11% 10%;          /* #1A1815 — texte principal */
  --ink: 30 11% 10%;                 /* alias foreground */
  --ink-soft: 28 7% 27%;             /* #4A4641 — texte secondaire */
  --ink-muted: 30 7% 51%;            /* #8A837A — métadonnées */
  --ink-foreground: 37 43% 96%;      /* texte sur fond sombre */

  /* Bordures — tons sable chauds */
  --border: 38 30% 85%;              /* #E8DFC9 — bordure standard */
  --border-soft: 38 35% 88%;         /* — bordure très discrète */
  --border-strong: 30 11% 10%;       /* ink pour emphasis */

  /* Primary — on utilise l'encre comme primary (pas de bleu) */
  --primary: 30 11% 10%;
  --primary-foreground: 37 43% 96%;

  /* Accent — terracotta discret, réservé aux détails */
  --accent: 11 63% 44%;              /* #B8442A — terracotta */
  --accent-soft: 17 60% 89%;         /* #F3DCD1 — fond accent doux */
  --accent-foreground: 37 43% 96%;

  /* Semantic */
  --success: 76 26% 33%;             /* #5B6B3F — olive */
  --success-soft: 71 25% 87%;        /* #E4E7D5 */
  --danger: 2 72% 41%;
}
```

Brancher ces tokens dans `tailwind.config.ts` sous `theme.extend.colors` (background, foreground, surface.DEFAULT, surface.warm, surface.cool, ink.DEFAULT, ink.soft, ink.muted, ink.foreground, border.DEFAULT, border.soft, border.strong, primary, primary.foreground, accent.DEFAULT, accent.soft, accent.foreground, success.DEFAULT, success.soft, danger).

**Rayons** : `sm: 0.5rem`, `md: 0.75rem`, `lg: 1rem`, `xl: 1.25rem`, `2xl: 1.25rem`, `3xl: 1.75rem`. Cartes par défaut `rounded-2xl` (20px). Pills et boutons `rounded-full`. Inputs `rounded-full`.

**Container** : centré, padding `1.25rem / 1.5rem / 2rem`, max `1280px`.

## 4. Typographie

### Familles
- `--font-display` : `"Fraunces", Georgia, serif` (variable via next/font)
- `--font-body` : `"Inter Tight", system-ui, sans-serif`
- `--font-mono` : `"JetBrains Mono", ui-monospace, monospace`

### Règles globales
- Body par défaut : `font-body`, taille 15px, line-height 1.5, couleur `ink-soft`.
- Tous les titres h1–h4 : `font-display`, `font-weight: 500`, `letter-spacing: -0.02em`, `line-height: 1.08`.
- Italique Fraunces **autorisée et encouragée** pour les titres à caractère émotionnel ("Où cherchez-vous ?", "Bonjour Salma.", sous-titres de landing). Utiliser `italic` Tailwind.

### Classes utilitaires (globals.css)
- `.display-xl` : `font-family: var(--font-display); font-weight: 500; font-size: clamp(2rem, 5vw, 2.75rem); letter-spacing: -0.025em; line-height: 1.02;`
- `.display-lg` : `font-family: var(--font-display); font-weight: 500; font-size: clamp(1.5rem, 3.5vw, 2rem); letter-spacing: -0.02em; line-height: 1.08;`
- `.display-md` : `font-family: var(--font-display); font-weight: 500; font-size: 1.375rem; letter-spacing: -0.015em; line-height: 1.1;`
- `.price-display` : `font-family: var(--font-display); font-weight: 400; font-size: clamp(1.5rem, 3vw, 2.125rem); letter-spacing: -0.025em; line-height: 1;` — pour les prix sur les cartes et fiches.
- `.eyebrow` : `font-family: var(--font-mono); font-size: 0.625rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.14em; color: hsl(var(--accent));` — par défaut en terracotta, peut être surchargé en `text-ink-muted`.

### Corps
- Liens : `underline underline-offset-4 decoration-accent hover:text-accent`.
- Labels / metadata : `font-body` poids 500, taille 12-13px, `text-ink-muted`.

## 5. Composants primitifs (à créer)

### `src/components/ui/button.tsx`
Props : `variant: "primary" | "outline" | "ghost" | "soft" | "accent" | "link"`, `size: "xs" | "sm" | "md" | "lg" | "icon"`.
- Tous `rounded-full` sauf link (rounded simple).
- `primary` = `bg-ink text-ink-foreground hover:bg-ink/90`
- `outline` = `border border-ink/80 bg-transparent text-ink hover:bg-ink hover:text-ink-foreground`
- `soft` = `bg-surface-warm text-ink border border-border hover:bg-surface-cool`
- `ghost` = `text-ink hover:bg-surface-warm`
- `accent` = `bg-accent text-accent-foreground hover:bg-accent/90` (très rare, réservé aux petites zones)
- `link` = `text-accent underline underline-offset-4 hover:text-accent/80`
- Focus ring : `focus-visible:ring-2 ring-ink ring-offset-2 ring-offset-background`
- Tailles : `xs = h-8 px-3 text-xs`, `sm = h-9 px-4 text-sm`, `md = h-11 px-5 text-sm font-medium`, `lg = h-12 px-6 text-base font-medium`, `icon = h-10 w-10`

### `src/components/ui/card.tsx`
Props : `variant: "light" | "warm" | "dark" | "outlined"`.
- `light` = `bg-surface border border-border text-ink`
- `warm` = `bg-surface-warm border border-border-soft text-ink`
- `dark` = `bg-ink text-ink-foreground border-0`
- `outlined` = `bg-transparent border border-border text-ink`
- Par défaut `rounded-2xl` (20px).
- Exposer `CardBody` (padding `p-5 md:p-6`), `CardHeader`, `CardFooter`.

### `src/components/ui/badge.tsx`
Props : `tone: "neutral" | "dark" | "light" | "accent" | "success"`, `size: "sm" | "md"`.
- `neutral` = `bg-surface-warm text-ink border border-border`
- `dark` = `bg-ink text-ink-foreground`
- `light` = `bg-white/95 text-ink backdrop-blur-sm` (pour overlay sur photo)
- `accent` = `bg-accent-soft text-accent`
- `success` = `bg-success-soft text-success`
- Tailles : `sm = h-6 px-2.5 text-[10px] font-medium tracking-wide`, `md = h-7 px-3 text-xs font-medium`
- Rayon : `rounded-full` par défaut. Variante `rounded-sm` pour les badges "À vendre / À louer" posés sur photo (effet étiquette cousue).

### `src/components/ui/input.tsx`
- `rounded-full`, `h-12`, `bg-surface border border-border focus:border-ink`.
- Padding `px-5`.
- Label externe en `.eyebrow` ou en `font-body text-xs font-medium text-ink-muted`.

### `src/components/ui/icon-button.tsx`
- Rond, `rounded-full h-10 w-10` (ou `h-9 w-9` pour `sm`).
- Variantes : `soft` (bg-surface-warm), `floating` (bg-white/95 backdrop-blur pour les boutons sur photo), `dark` (bg-ink).

### `src/components/ui/pill-toggle.tsx`
Toggle horizontal type "Acheter / Louer".
- Container `bg-surface-warm rounded-full p-1 flex gap-1`.
- Chaque option `flex-1 h-10 rounded-full text-sm font-medium`. Active = `bg-ink text-ink-foreground`, inactive = `text-ink-soft`.

### `src/components/ui/icons.tsx`
Re-exporter les icônes lucide-react utilisées (Search, Heart, Home, User, MapPin, Bed, Bath, Maximize2, Phone, MessageCircle, Share2, ChevronLeft, ChevronRight, SlidersHorizontal, Bookmark, Calendar, Check). **Ne jamais importer directement depuis lucide-react dans les pages** — toujours passer par ce fichier.

## 6. Layout global

### `src/components/layout/site-header.tsx`
- Desktop : logo à gauche, nav simple (Acheter, Louer, Espace Pro, Connexion) en centre, CTA "Publier une annonce" à droite.
- Mobile : logo à gauche, avatar/connexion à droite. La nav principale est gérée par la bottom tab bar.
- `border-b border-border`, `h-16`, `px-5 md:px-8`, `bg-background/80 backdrop-blur-md`.

### `src/components/layout/mobile-bottom-nav.tsx` (**nouveau**)
- Barre de nav mobile, fixe en bas.
- `fixed bottom-0 inset-x-0 h-[84px] bg-background/85 backdrop-blur-xl border-t border-border z-50`.
- 5 onglets : Accueil (Home), Rechercher (Search), Favoris (Bookmark), Messages (MessageCircle), Profil (User).
- Icônes 22px, label 10px font-medium en-dessous.
- Actif : icône en `text-ink` strokeWidth 2 avec léger fill `fill-ink/[0.08]`. Inactif : `text-ink-muted` strokeWidth 1.6.
- **Visible uniquement `md:hidden`**. Sur desktop, la nav se fait via le header.

### `src/components/layout/site-footer.tsx`
- Fond `bg-surface-warm`, padding généreux, colonnes : À propos, Villes, Ressources, Légal.
- Sobre, pas décoratif.

## 7. Composants listing

### `src/components/listing/listing-card.tsx`
Composant pivot. Props : `listing: Listing`, `variant: "default" | "featured" | "compact"`, `className?: string`.

**Structure** :
```
<article className="group rounded-2xl overflow-hidden bg-surface border border-border hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-10px_rgba(26,24,21,0.15)] transition-all duration-200">
  <div className="relative aspect-[5/4]"> {/* ou 4/3 si featured */}
    <Image src={photo} fill className="object-cover" />
    {/* overlay dots pattern subtil */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:16px_16px]" />
    {/* Badge Pro/Particulier top-left */}
    <Badge tone={isPro ? "dark" : "light"} size="sm" className="absolute top-3 left-3">
      {isPro && verified && <CheckIcon />} {isPro ? "Pro" : "Particulier"}
    </Badge>
    {/* Heart button top-right */}
    <IconButton variant="floating" size="sm" className="absolute top-3 right-3" aria-label="Sauvegarder">
      <Heart size={16} />
    </IconButton>
    {/* Transaction badge bottom-left (étiquette cousue) */}
    <Badge tone="light" size="sm" className="absolute bottom-3 left-3 rounded-sm">
      {transaction === "vente" ? "À vendre" : "À louer"}
    </Badge>
  </div>
  <div className="p-4">
    <div className="price-display flex items-baseline gap-1.5">
      <span>{formatPrice(price)}</span>
      <span className="text-xs font-medium text-ink-muted tracking-wide font-body">{unit}</span>
    </div>
    <div className="mt-2 flex items-center gap-1 text-[13px] text-ink-soft">
      <MapPin size={12} strokeWidth={1.8} />
      <span className="font-medium">{district}</span>
      <span className="text-ink-muted">·</span>
      <span>{city}</span>
    </div>
    <div className="mt-3 pt-3 border-t border-border-soft flex gap-4 text-xs text-ink-soft">
      <Fact icon={Bed} value={rooms} unit="ch." />
      <Fact icon={Bath} value={baths} unit="sdb" />
      <Fact icon={Maximize2} value={surface} unit="m²" />
    </div>
  </div>
</article>
```

- `featured` = ratio 4:3 au lieu de 5:4, prix 2xl au lieu de xl.
- `compact` = pas de border-t, facts sur une seule ligne avec la location.

### `src/components/listing/city-card.tsx`
Carte ville pour le carrousel "Explorer par ville".
- `flex-shrink-0 w-[140px] h-[170px] rounded-2xl overflow-hidden relative`.
- Fond : photo de la ville (`next/image` fill object-cover) avec dégradé sombre de bas en haut `bg-gradient-to-t from-ink/70 to-transparent`.
- Texte en bas à gauche : `display-md` blanc + count en `text-[11px] opacity-85`.
- Overlay dots pattern pareil que les cards.

### `src/components/listing/listing-gallery.tsx`
Fiche détail. Photo hero pleine largeur, ratio 4:3 sur mobile / 16:10 desktop.
- Overlay : bouton retour (floating) top-left, boutons Share + Heart top-right, compteur "1 / N" bottom-right en pill `bg-ink/70 text-ink-foreground backdrop-blur rounded-full px-3 py-1.5 text-xs font-medium`.
- Badge transaction bottom-left en `tone="light" rounded-sm`.
- Sur desktop : tap la hero ouvre un lightbox avec carrousel.

### `src/components/listing/listing-facts.tsx`
Grille 2x2 des caractéristiques sur la fiche détail. `grid grid-cols-2 border border-border rounded-2xl overflow-hidden`. Chaque cellule : icône dans un carré `h-9 w-9 rounded-lg bg-surface-warm flex items-center justify-center`, puis eyebrow (label) + display-md (valeur). Border-r sur les cellules de gauche, border-b sur les cellules du haut.

### `src/components/listing/contact-card.tsx` (client component)
Sidebar desktop + sticky mobile sur fiche détail.
- `rounded-3xl border border-border bg-surface p-5 md:p-6 sticky top-24` (desktop).
- Header : avatar 48x48 rounded-full `bg-accent text-accent-foreground` avec initiales en `font-display font-medium`, nom + "Agence vérifiée" avec check olive (si applicable).
- Formulaire : Nom, Email, Téléphone, Message (pré-rempli "Bonjour, je suis intéressé(e) par «titre»…"). Labels en `.eyebrow` avec `text-ink-muted`.
- Bouton full width `variant="primary" size="lg"` "Envoyer une demande".
- Row de 2 boutons icon+label : Appeler (`tel:`) en `variant="soft"` + WhatsApp en `variant="soft"`.
- Disclaimer RGPD en `text-[11px] text-ink-muted` en bas.
- Sur succès : carte confirmation avec Check dans rond `bg-success-soft`.

### `src/components/listing/mobile-sticky-cta.tsx` (fiche détail uniquement)
- `fixed bottom-[84px] inset-x-0 px-4 py-3 bg-background/95 backdrop-blur-xl border-t border-border md:hidden`.
- Row : IconButton variant="soft" (Phone) + Button variant="primary" size="lg" full width "Contacter l'agence" avec icône MessageCircle.

### `src/components/listing/amenity-list.tsx`
Liste des commodités actives avec puce Check dans rond `bg-success-soft text-success h-6 w-6 rounded-full flex items-center justify-center`. Grid `grid-cols-2 md:grid-cols-3 gap-3`.

### `src/components/listing/listing-map-preview.tsx`
iframe OpenStreetMap avec bbox autour de lat/lng. `rounded-2xl border border-border overflow-hidden`, hauteur 320px mobile / 400px desktop, `loading="lazy"`. Mention "Adresse exacte communiquée à la visite" en-dessous en `text-xs text-ink-muted`.

## 8. Composants recherche

### `src/components/search/hero-search.tsx`
Utilisé sur l'accueil. Structure :
- `display-xl` avec italique sur une partie ("Bonjour {prénom}. *Où cherchez-vous ?*")
- Input de recherche full-width `rounded-full h-[52px] border-[1.5px] border-ink px-5` avec icône Search à gauche et bouton icon-filter terminal à droite (ink fond, rond).
- Toggle Acheter/Louer (`PillToggle`) en dessous.

### `src/components/search/search-filters.tsx`
Sticky à gauche sur desktop, bottom sheet sur mobile.
- Card `rounded-2xl border border-border p-5`.
- Toggle Acheter/Louer en haut.
- Ville (select custom), Quartier (conditionnel), types (pills rounded-full border), prix min/max (inputs), surface min/max, chambres (1+…5+), aménités (pills), mot-clé, bouton "Réinitialiser" en `variant="ghost"`.

### `src/components/search/search-toolbar.tsx`
Au-dessus des résultats : `"N annonces trouvées"` (text-sm text-ink-soft avec chiffre en text-ink font-semibold) + select de tri à droite. Sur mobile, le tri est en bouton "Trier : Plus récent" avec underline accent sur la valeur active.

### `src/components/search/search-pagination.tsx`
Row centrée. Précédent/Suivant en `variant="soft"` ou `variant="primary"` selon l'état. Numéros de page en icon-button ronds 38px ; page active en `bg-ink text-ink-foreground`, autres en `border border-border text-ink`.

### `src/components/search/applied-chips.tsx`
Row scroll-x horizontale des filtres appliqués. Chaque chip : `bg-surface-warm border border-border rounded-full h-[30px] px-3 pr-2.5 flex items-center gap-1.5 text-xs font-medium` + bouton X à droite.

### `src/components/search/mobile-search-header.tsx`
Header de la page `/recherche` sur mobile :
- IconButton Back + "Recherche\n{Résumé des filtres}" (2 lignes) + Button primary avec icône SlidersHorizontal et compteur de filtres actifs dans un pastille `bg-accent`.

## 9. Pages

### `/` — Accueil
Mobile-first. Structure :
1. Header site (logo + avatar)
2. Greeting + question ("Bonjour {prénom}. *Où cherchez-vous ?*") en `display-xl`
3. Search bar (hero-search)
4. Toggle Acheter/Louer
5. Section "Explorer par ville" : titre `display-md` + lien "Voir tout" en accent. Carrousel horizontal de 12 `CityCard`.
6. Section "Ajoutées récemment" : eyebrow terracotta "NOUVEAU CETTE SEMAINE" + titre `display-md`. 1 `ListingCard` featured en haut, puis grille `grid-cols-2 gap-2.5` de cartes compactes.
7. Banner "Vous avez un bien ?" sur fond `bg-success-soft border border-success/30 rounded-2xl p-5`, icône maison dans carré olive, texte + IconButton flèche.
8. Section "Comment ça marche" : 3 colonnes simples (Recherchez, Visitez, Emménagez).
9. Footer.

Desktop : le greeting devient hero centré, le carrousel ville devient grille 6 colonnes, les listings en grille 4 colonnes.

### `/recherche` — Résultats de recherche
- Page size : 18. Pagination numérique + Précédent/Suivant.
- Mobile : Header de recherche compact + chips appliqués scrollables + toolbar (count + tri) + liste 1 colonne de `ListingCard`.
- Desktop : Grille `lg:grid-cols-[320px_1fr]`. Panneau de filtres sticky à gauche, résultats à droite. Grille `sm:grid-cols-2 xl:grid-cols-3 gap-5`.
- H1 dynamique `.display-lg` ("Appartements à louer à Casablanca") + sous-titre neutre.
- Empty state si 0 : carte pointillée `border-dashed`, H2 "Aucune annonce ne correspond.", lien "Réinitialiser les filtres".

### `/annonce/[slug]` — Fiche détail

**Mobile** :
1. Galerie hero pleine largeur (420px height).
2. Card contenu qui "remonte" de -20px (`rounded-t-[28px] bg-background`).
3. Row locationn + date relative.
4. Titre `display-lg`.
5. Bloc prix : card `bg-surface-warm rounded-2xl p-4 border border-border`, eyebrow "PRIX" à gauche + prix `price-display 2xl` + unit ; à droite prix/m² en `text-xs text-ink-muted`.
6. `ListingFacts` 2x2.
7. Description (tronquée avec "Lire plus" en link accent).
8. Commodités (`AmenityList`).
9. Localisation (`ListingMapPreview`).
10. Publisher card (avatar + nom + vérifié + bouton "Profil" outline).
11. Listings similaires : 4 cartes horizontal scroll.
12. Bloc référence : ID + date + "Signaler".
13. Mobile sticky CTA (au-dessus de la bottom nav).

**Desktop** : Layout `grid lg:grid-cols-[1fr_380px] gap-8`. Colonne principale = tout ce qui est ci-dessus sauf sticky CTA. Sidebar droite = `ContactCard` sticky.

JSON-LD `<script type="application/ld+json">` avec `@type: RealEstateListing, offers, address{addressCountry: "MA"}, floorSize, numberOfRooms`.

### `/pro` — Landing Espace Pro
- Hero centré : eyebrow "BABOO PRO" en terracotta, H1 `display-xl` "L'immobilier, *sans friction.*" (italique sur la fin), sous-titre, 2 boutons : "Créer un compte Pro" (primary) + "Parler à notre équipe" (outline).
- Grille 3 colonnes de cartes `warm` avec icône ronde olive `bg-success text-ink-foreground h-10 w-10 rounded-xl` + titre + ligne de bénéfice. 6 bénéfices (publication soignée, leads qualifiés, tableau de bord, mise en avant, modération, support MA).
- Section témoignages simple (3 quotes avec nom/agence).

### `/connexion` et `/inscription`
- Carte centrée `rounded-2xl border border-border bg-surface p-6 md:p-8 max-w-md mx-auto`.
- H1 `display-lg`, sous-titre avec italique sur l'accroche.
- Form : champs empilés avec `<Label>` en `text-xs font-medium text-ink-muted` + `<Input>`.
- Bouton full width primary size="lg".
- Lien bas de carte vers l'autre page en `variant="link"`.

### `/not-found`
- Eyebrow "ERREUR 404" en terracotta, H1 `display-xl` ("Cette page s'est *échappée.*"), texte chaleureux, deux boutons (Retour accueil primary + Voir annonces outline).

## 10. Comportements
- URL-driven : chaque changement de filtre pousse sur `router.push(pathname + queryString)` avec `useTransition` pour désactiver le bouton pendant la navigation.
- Responsive : tout doit être utilisable sur mobile. **Bottom nav mobile présente sur toutes les pages sauf connexion/inscription.** Mobile sticky CTA sur fiche détail au-dessus de la bottom nav.
- Images : `next/image` avec `sizes` précis. Placeholder blur. Aspect ratio toujours défini en CSS pour éviter le CLS.
- Loading states : skeletons discrets (rectangles `bg-surface-warm animate-pulse rounded-2xl`). Pas de spinners.
- Empty states systématiques sur chaque vue qui peut être vide.
- A11y : `aria-label` sur icônes, `focus-visible` custom ring (voir Button), contraste AA, clavier.
- SEO : `generateMetadata` par route, `alternates.canonical`, JSON-LD sur fiche, `sitemap.ts` dynamique (toutes les villes × types × transactions + toutes les annonces), `robots.ts` (disallow `/pro/admin/`, `/api/`).
- Transitions : `transition-all duration-200 ease-out`. Hover card = légère élévation `hover:-translate-y-0.5` + shadow douce. **Pas de spring/bounce.**

## 11. Utils attendus
- `src/lib/cn.ts` : helper `clsx` + `tailwind-merge`.
- `src/lib/format.ts` :
  - `formatPrice(n)` : `Intl.NumberFormat('fr-FR').format(n)` avec espaces fines, puis `" MAD"` ajouté.
  - `formatPricePerMonth(n)` : pareil + `"/mois"`.
  - `formatPricePerSqm(price, surface)` : `Math.round(price / surface)` formaté.
  - `formatSurface(n)` : `n + " m²"`.
  - `relativeDate(date)` : "Aujourd'hui" / "Hier" / "Il y a N jours" / "Il y a N semaines" / "Il y a N mois".
- `src/lib/search-params.ts` : `parseSearchParams(sp)`, `filtersToQueryString(f)`, `buildSearchHref(f)`.
- `src/lib/listings-query.ts` : `findListings(filters)` qui try/catch le Prisma (renvoie résultat vide si DB down au build).

## 12. Structure de dossiers
```
src/
  app/
    layout.tsx
    page.tsx               # accueil
    globals.css
    not-found.tsx
    robots.ts
    sitemap.ts
    annonce/[slug]/page.tsx
    recherche/page.tsx
    pro/page.tsx
    connexion/page.tsx
    inscription/page.tsx
  components/
    ui/
      button.tsx
      card.tsx
      badge.tsx
      input.tsx
      label.tsx
      icon-button.tsx
      pill-toggle.tsx
      icons.tsx
    layout/
      site-header.tsx
      mobile-bottom-nav.tsx
      site-footer.tsx
      baboo-logo.tsx
    listing/
      listing-card.tsx
      city-card.tsx
      listing-gallery.tsx
      listing-facts.tsx
      amenity-list.tsx
      contact-card.tsx
      listing-map-preview.tsx
      mobile-sticky-cta.tsx
    search/
      hero-search.tsx
      search-filters.tsx
      search-toolbar.tsx
      search-pagination.tsx
      applied-chips.tsx
      mobile-search-header.tsx
    marketing/
      how-it-works.tsx
      publish-banner.tsx
  data/
    cities.ts
    taxonomy.ts
  lib/
    cn.ts
    db.ts
    format.ts
    search-params.ts
    listings-query.ts
prisma/
  schema.prisma
  seed.ts
```

## 13. Règles d'exécution
- **Utilise les valeurs exactes des tokens ci-dessus. Ne réinvente pas une palette.**
- Fonts : **Fraunces** (display) + **Inter Tight** (body) + **JetBrains Mono** (eyebrows uniquement). Pas d'autres polices. Pas de Playfair, pas de Space Grotesk, pas d'Inter de base.
- **N'utilise pas l'accent terracotta (`--accent`) sur les CTAs principaux.** Réserve-le à : eyebrows, liens actifs, badges "Nouveau", soulignements de texte italique sous les titres. Les CTAs principaux sont toujours en `bg-ink text-ink-foreground`.
- Pas de gradients voyants (les gradients sur les `CityCard` sont OK car ce sont des photos de villes avec overlay sombre). Pas d'ombres lourdes. Pas de bordures colorées épaisses.
- Toute la copy en français. Pas de lorem ipsum. Utilise un ton chaleureux, direct, sans superlatifs. Ex : "Bonjour" pas "Bienvenue dans votre espace", "Ajoutées récemment" pas "Notre sélection éditoriale".
- Badges obligatoires sur les cartes d'annonces : **Pro** (fond ink, check olive si vérifié) ou **Particulier** (fond blanc translucide, contour border).
- **La photo est le héros.** Sur les cartes, ne jamais cacher plus de 30% de la photo avec des overlays. Badges discrets, pas criards.
- À la fin : rendre un arbre de fichiers + les commandes pour lancer (`pnpm install && pnpm db:push && pnpm db:seed && pnpm dev`).

---

# Comment utiliser ce package avec Claude Code

## Option A — En ligne de commande (recommandé)
1. Installe Claude Code : https://docs.claude.com/claude-code
2. Crée un dossier vide pour le projet : `mkdir baboo && cd baboo`
3. Lance Claude Code : `claude`
4. Glisse-dépose le fichier `README.md` de ce handoff dans le terminal, puis tape :
   > "Implémente entièrement ce brief. Commence par initialiser le projet Next.js 15 avec TypeScript et Tailwind, puis suis la spec section par section. La maquette de référence visuelle est dans mockups/baboo-redesign.jsx — étudie-la attentivement avant de coder les composants."
5. Claude Code va créer tous les fichiers. Laisse-le travailler, réponds aux questions s'il en pose.
6. Quand c'est fini : `pnpm install && pnpm db:push && pnpm db:seed && pnpm dev`

## Option B — Dans Claude.ai ou une autre session
1. Ouvre une nouvelle conversation avec Claude.
2. Copie-colle le contenu de ce `README.md` en entier.
3. Joins les fichiers dans `mockups/` et `assets/` si l'interface le permet.
4. Demande : "Implémente ce brief Next.js 15. Génère chaque fichier un par un. Commence par le setup (package.json, tsconfig, tailwind.config, globals.css), puis les tokens, puis les composants UI primitifs, puis les composants listing, puis les pages."

## Fichiers inclus
```
baboo-handoff/
├── README.md                      ← ce fichier (brief + instructions)
├── assets/
│   └── baboo-logo.png             ← logo source
└── mockups/
    ├── baboo-redesign.jsx         ← maquette React : 3 écrans mobiles côte à côte
    └── tokens-reference.css       ← tokens CSS de la maquette (référence visuelle)
```
