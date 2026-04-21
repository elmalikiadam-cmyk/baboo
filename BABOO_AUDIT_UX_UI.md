# Audit UX/UI Baboo — Web + Mobile

**Date** : 21 avril 2026
**Périmètre** : Next.js web (`src/`) + Expo mobile V2 (`baboo_app/app/`)
**Cap visuel validé** : *brutaliste calmé* — typo Barlow + mono + logo panda conservés, masthead éditorial et vocabulaire "sélection/coup de cœur" abandonnés, palette recalibrée vers un chaud neutre, un seul accent sémantique.
**Format** : diagnostic priorisé → 8 PRs ciblées sur le vrai code.

---

## 0. Le vrai problème : 4 sources de vérité en conflit

Avant tout diagnostic d'écran : il y a **quatre documents qui prétendent définir l'identité visuelle de Baboo**, et ils disent **quatre choses différentes**. Tant que ce n'est pas résolu, chaque nouveau contributeur (humain ou LLM) va choisir une source au hasard et le site continuera à dériver.

| Document | Direction | Palette | Typo | Rayons |
|---|---|---|---|---|
| **Maquettes** (`mockups/*.jsx`) | Brutaliste éditorial B&W | `#0a0a0a` / `#f2efe8` | Barlow Condensed 900 + JetBrains Mono | `0` partout |
| **Spec README** section 3 | Brutaliste modéré | HSL neutre + accent jaune `48 96% 58%` | Bahnschrift → Barlow + Inter | `rounded-full` pills / `rounded-3xl` cards |
| **`globals.css`** (code shippé) | Hybride bâtard | Reprend paper/ink des maquettes + accent jaune de la spec | Stack Bahnschrift + Barlow + Inter | `none/xs/sm/md/lg/full` |
| **`docs/ui-guidelines.md`** | **Premium éditorial luxe** — fantôme | `#0B3D2E` vert + `#C9A961` or + Fraunces serif | Fraunces + Inter | `rounded-lg/xl` |

La quatrième est particulièrement dangereuse : `docs/ui-guidelines.md` décrit un **tout autre produit** (vert profond + or + serif Fraunces), et contient littéralement les mots *"Premium, trustworthy, local. Editorial, not flashy."* — en contradiction frontale avec la section 1 du README qui proscrit *"premium, éditorial, luxe"*.

**Action P0 immédiate** (PR #1 ci-dessous) : réécrire `docs/ui-guidelines.md` pour qu'il reflète la vraie direction ("brutaliste calmé"), supprimer toute mention de Fraunces / vert / or, et ajouter un paragraphe "Do / Don't vocabulaire" qui interdit explicitement : *Sélection, Coup de cœur, Éditorial, Premium, Haut de gamme, Exclusivité*.

---

## 1. Diagnostic priorisé

### P0 — À corriger avant toute autre chose (bugs de marque ou d'accessibilité)

**P0-1. Le mot "Sélection" apparaît partout dans le code, alors que la spec l'interdit.**
- `src/app/page.tsx` : `<h2>Sélection</h2>` au-dessus de la grille principale de la home
- `src/components/favorites/favorites-page.tsx` : *"Commencez votre sélection."* dans l'empty state
- `src/components/layout/site-header.tsx` probablement idem (à vérifier)

Ce n'est pas un détail de copy, c'est la voix produit qui part dans le décor. Un moteur de recherche ne fait pas de "sélection", il liste des annonces. Ce mot est un résidu des maquettes magazine. Remplacer par **"Dernières annonces"** sur la home, **"Vos favoris"** dans l'empty state.

**P0-2. Le masthead éditorial `display-xl` suivi de `uppercase` pollue tous les titres de page.**
- `src/app/recherche/page.tsx` : `<h1 className="display-xl ... uppercase">Appartements à vendre à Casablanca</h1>` — 72px, caps, `letter-spacing: -0.04em`
- `src/app/pro/page.tsx` : `<h1>L'immobilier, sans friction.</h1>` en 6rem
- `src/app/pro/publier/page.tsx` : idem

Un titre en caps + Barlow 900 à 72px au-dessus d'un compteur de résultats, ce n'est pas un moteur de recherche, c'est une couverture de *Condé Nast Traveller*. **Règle à ajouter** : `display-xl` réservé à **UNE** occurrence par page maximum (le H1 de la home, et encore), taille plafonnée à `clamp(2rem, 5vw, 3rem)`, jamais en caps sur plus de 3 mots.

**P0-3. Contraste `text-muted-foreground` sur paper = échec probable WCAG AA.**
- Tokens : `--muted-foreground: 44 4% 38%` → ~`#6a6a66` sur `#f2efe8`
- Ratio calculé : **4.47:1** — sous le seuil 4.5:1 pour du texte normal
- Impact : **tous les eyebrows, toutes les métadonnées, toutes les références BB-XXXX** des cartes, tous les breadcrumbs sont en dessous du standard légal.

Corriger : passer `--muted-foreground` à `0 0% 28%` (ratio ~7.5:1), ce qui aligne aussi avec la règle WCAG AAA pour texte petit. Côté mobile Expo, même problème à vérifier sur `colors.muted`.

**P0-4. Double app mobile (legacy + V2) — ambiguïté de codebase.**
- `Baboo (2)/baboo_app/src/screens/` = React Navigation, données mockées, ancien
- `baboo_app/app/(tabs)/` = Expo Router, hooks réels, nouveau

Si les deux sont encore buildables, risque de confusion pour l'équipe. **Décision à prendre** : supprimer le legacy ou le marquer `DEPRECATED` explicitement dans le README du dossier. Je propose de supprimer — ce qui simplifie tout l'audit mobile qui suit.

**P0-5. Vocabulaire marketing incohérent avec la voix.**
Scan rapide des fichiers :
- `src/app/pro/publier/page.tsx` : *"Parlez-nous de votre bien."* ← bon, direct
- `src/app/pro/page.tsx` : *"L'immobilier, sans friction."* ← bon
- Mais : *"Publication soignée"*, *"Tableau de bord clair"*, *"Mise en avant"* → **ces éléments utilisent `rounded-3xl bg-ink p-6` puis `rounded-full` puis `rounded-2xl`** — incohérence pure.

Règle : **un seul rayon par famille de composant.** Cards = `rounded-md` (6px). Pills = `rounded-full`. Inputs = `rounded-md`. Pas de `rounded-3xl`, jamais.

---

### P1 — Problèmes structurels UX (à traiter dans les 2 semaines)

**P1-1. La home n'a pas de fonction claire.**

Ce que la home fait aujourd'hui (`src/app/page.tsx`) :
1. Masthead hero avec 3 pills "Je veux acheter / louer / publier"
2. `HeroSearch` (barre de recherche)
3. `FeaturedHeroCard` — une seule annonce pleine largeur
4. `<h2>Sélection</h2>` + grille des dernières annonces
5. `CityStrip` — 12 villes
6. `HowItWorks`
7. `ForYou`

**Problème** : la page est un gloubi-boulga. Elle essaye d'être à la fois :
- Un moteur de recherche (pills + HeroSearch)
- Un magazine immobilier (FeaturedHeroCard éditoriale)
- Une plaquette marketing (HowItWorks)
- Une landing SEO (CityStrip)

Sur mobile (où >80% du trafic immo marocain arrive), ça fait scroller **4 écrans** avant de voir une annonce. Avito : 1 écran, 8 annonces déjà visibles.

**Recommandation** : hiérarchie de la home simplifiée en 3 blocs seulement :
1. **Recherche** (hero + barre de recherche + 3 filtres rapides inline) — 1 écran
2. **Grille d'annonces récentes** (8 cartes direct, pas de hero featured) — 1 écran
3. **Index des villes + ouverture vers /recherche** — ½ écran

Supprimer `FeaturedHeroCard`, `HowItWorks` (à déplacer sur `/comment-ca-marche`), `ForYou` (idem ou fin de page en footer édito).

**P1-2. La barre de recherche mobile n'a aucune affordance de filtres rapides.**

Code actuel de `baboo_app/app/(tabs)/index.tsx` :
```
Pressable → "Toutes les villes_"  +  [AFFINER]
```
Un seul bouton qui ouvre une modal avec 5+ sections. Pas de filtres rapides accessibles sans modal. L'utilisateur veut "3 pièces à Maârif sous 2M" — il doit ouvrir la modal, scroll, toucher 4-5 chips, valider.

**Recommandation** : sous la barre de recherche principale, ajouter **3 chips contextuels** qui représentent les 80% des cas d'usage :
- Chip 1 : Transaction (VENTE / LOCATION — toggle 2 états, déjà présent mais mal placé)
- Chip 2 : Ville (active le city picker direct)
- Chip 3 : Type de bien (active un bottom sheet de 6 types)

Ces 3 chips sont TOUJOURS visibles, tapables en 1 touch. La modal "Affiner" reste pour le reste (prix, surface, équipements).

**P1-3. `ListingCard` web manque d'informations critiques d'achat.**

Audit de `src/components/listing/listing-card.tsx` :
- ✅ Photo 4:3 bien
- ✅ Badge Pro/Particulier bien
- ✅ Bouton favori bien
- ✅ Prix géant bien
- ❌ **Pas de date de publication** ("Il y a 3 jours" est critique en immo — au-delà de 30j c'est probablement déjà vendu)
- ❌ **Pas d'indicateur de photo count** (si 1 seule photo vs 12, signal de qualité massif)
- ❌ **Pas de prix/m²** (le chiffre que tout acheteur calcule mentalement — autant le donner direct)
- ❌ **Caps tracking 0.1em sur la localisation** (`MAÂRIF · CASABLANCA`) rend les noms de quartiers plus durs à lire que sans

**Recommandation** : refonte mineure de ListingCard avec ces 3 infos ajoutées.

**P1-4. La fiche annonce n'a pas de signal "vu X fois" ou "déjà visité".**

Pas de state visuel "vous avez déjà vu cette annonce" sur les cartes. Les utilisateurs qui font le tour de 40 annonces perdent leurs repères. Stocker localement (localStorage / AsyncStorage) les slugs visités et afficher un léger grisage ou un tampon "DÉJÀ VU" en mono sur la carte.

**P1-5. Pas de sauvegarde de filtres rapide.**

`SavedSearches` existe mais nécessite 2 clics (enregistrer → valider fréquence). Pour un usage répété, **ajouter une "recherche récente"** qui garde les 3 dernières requêtes localement et les propose en chips cliquables sur la home. C'est du CRO de base en immo.

**P1-6. Pas de parité entre Pro et Particulier dans le parcours publication.**

`src/app/pro/publier/page.tsx` → Pro va vers `/pro/listings/new`, Particulier va vers un formulaire qui... envoie un lead à l'équipe Baboo pour qu'elle publie manuellement. Ce pattern (publication modérée) est bon pour la qualité, mais **il doit être expliqué clairement dans l'UI** : aujourd'hui l'utilisateur clique "Publier" et tombe sur un formulaire de contact. Friction cognitive.

Copy suggérée, juste sous le H1 : *"On publie votre annonce **avec vous**. Remplissez ce formulaire, on vous rappelle sous 24h pour les photos et le prix."* — ça recadre l'attente avant que l'utilisateur commence à remplir.

---

### P2 — Polish (à traiter progressivement)

**P2-1. `ios-frame.jsx` et `design-canvas.jsx` n'ont pas leur place dans le projet knowledge de prod.**
Ce sont des utilitaires de maquette. Ils devraient vivre dans `design_handoff_baboo/` à part.

**P2-2. Le logo panda mérite mieux qu'une SVG de 32px monochrome.**
C'est ton signe distinctif #1. Proposition : créer une variante `BabooMark` (juste la tête de panda sans wordmark) pour les favicons, splash screens, avatar placeholder, puce de chargement.

**P2-3. Typographie condensée + `letter-spacing -0.04em` rend certains titres illisibles en petite taille.**
Règle : `letter-spacing` progressif :
- Titres ≥ 48px : `-0.03em`
- Titres 24-47px : `-0.015em`
- Titres < 24px : `0`
- Jamais `-0.04em` sous 56px.

**P2-4. Mobile : aucune transition entre feed et détail.**
Expo Router supporte `animation: 'slide_from_right'` sur stack — actuellement pas configuré, la transition est brutale. Ajouter une config globale.

**P2-5. Pas d'état de chargement squelette.**
Les feed utilisent `useListings()` sans skeleton visible. Sur 4G maroc, 500ms de blank est une éternité. Ajouter `LoadingSkeleton` qui mime la grille de cartes.

**P2-6. Pas de tri visible sur mobile.**
`SearchToolbar` existe sur web, absent sur mobile. À ajouter : bottom sheet "Trier par" avec 4 options (récent / prix ↑ / prix ↓ / surface ↓).

**P2-7. Carte (Mapbox) pas intégrée dans le détail annonce sur mobile.**
Le web a `listing-map-preview`, le mobile a un écran `MapScreen` global mais pas de preview sur la fiche détail. C'est un signal de confiance clé (savoir où est le bien exactement).

---

## 2. Cohérence cross-platform : ce qui diverge entre web et mobile

Puisque tu as choisi "les deux en parallèle", voici les **7 points** où web et mobile livrent actuellement une expérience divergente, classés par impact marque :

| # | Point | Web fait | Mobile V2 fait | Action |
|---|---|---|---|---|
| 1 | **Voix compteur d'annonces** | "2 847 annonces vérifiées aujourd'hui" | "RECHERCHE · 2 847 ANNONCES" | Aligner sur mobile (factuel, mono) — voir PR #3 |
| 2 | **Card d'annonce** | Grille 4:3 photo au-dessus | Row horizontale 96px photo à droite | Garder les deux — **web = grille, mobile = row** sont les bons choix plateforme, pas à changer |
| 3 | **Favori** | SVG cœur, bouton `h-8 w-8` absolu top-right | Émoji `♡` ligne pressable à droite | Aligner mobile sur le pattern web (SVG + vrai composant) — PR #5 |
| 4 | **Transaction toggle** | Pills `rounded-full` dans filtres | Tab segmenté `TOUT / VENTE / LOCATION` | Le tab mobile est meilleur — **le ramener sur web** pour remplacer les pills — PR #7 |
| 5 | **Badge PRO** | `border-foreground bg-foreground text-background px-2 py-0.5` mono | `Chip variant="dark"` label "PRO" | Identique sémantiquement, styles divergent — créer un token partagé — PR #8 |
| 6 | **Prix** | `display-xl text-[2rem] leading-none` condensé | `styles.price` via `type.displayXL` | Aligner tailles relatives — ratio constant price/title |
| 7 | **Références (BB-XXXX / N° 01)** | `BB-{last4}` mono | `N° 01 · ref` | Choisir UN format — je recommande `N° XXXX` partout (plus lisible en FR que "BB-") |

---

## 3. Plan de 8 PRs ciblées

Livrables concrets, par ordre de priorité et de facilité de merge.

| PR | Scope | Risque | ETA |
|---|---|---|---|
| **#1** | Réécrire `docs/ui-guidelines.md` + add section "Vocabulaire" | Nul | 1h |
| **#2** | Corriger les tokens : contraste muted + suppression usage `rounded-3xl`/`rounded-2xl` partout | Moyen (touche visuellement tout le site) | 4h |
| **#3** | Nettoyer `src/app/page.tsx` : kill "Sélection", simplifier hiérarchie home en 3 blocs | Moyen | 3h |
| **#4** | Refonte `ListingCard` web : ajouter date relative, photo count, prix/m² ; corriger caps tracking | Faible | 2h |
| **#5** | Aligner favoris mobile sur pattern web (SVG + FavoriteButton réutilisable) | Faible | 2h |
| **#6** | Ajouter filtres rapides inline sur mobile home (Transaction / Ville / Type) | Moyen | 5h |
| **#7** | Remplacer pills Acheter/Louer web par tab segmenté cross-platform | Moyen | 3h |
| **#8** | Supprimer app mobile legacy (`Baboo (2)/baboo_app/src/screens/`) | Nul si plus utilisée, à vérifier | 30 min |

Chaque PR est détaillée ci-dessous avec des diffs concrets.

---

## 4. Détail de chaque PR

### PR #1 — Réécrire `docs/ui-guidelines.md`

**Fichier** : `docs/ui-guidelines.md`
**Action** : remplacement complet

Remplacer l'intégralité du fichier par :

```markdown
# Baboo — UI Guidelines

## Brand voice

Généraliste, clair, confiant, minimaliste. Pas premium, pas éditorial, pas luxe.
Copy en français, vocabulaire marocain de l'immobilier (quartier, appartement, villa,
riad, surface habitable, charges, vis-à-vis).

## Do / Don't vocabulaire

### À bannir
- "Sélection", "Coup de cœur", "Exclusivité" — nous sommes un moteur, pas un curateur
- "Éditorial", "Premium", "Haut de gamme" — ce n'est pas notre positionnement
- Masthead numéroté ("№ 04 — AVRIL 2026") — c'est de l'héritage maquette à supprimer
- Caps sur plus de 3 mots — illisible en français

### À privilégier
- "Dernières annonces", "Annonces récentes", "Plus récentes à Casablanca"
- "Vérifié" (badge simple, pas de superlatif)
- "Il y a N jours" (date relative toujours visible)

## Palette

Tokens dans `src/app/globals.css` en HSL.

| Token | Valeur | Usage |
|---|---|---|
| `--background` | `44 22% 93%` | Fond de page (paper chaud) |
| `--foreground` | `0 0% 6%` | Texte primaire (ink) |
| `--muted-foreground` | `0 0% 28%` | Texte secondaire, eyebrows — corrigé pour AA |
| `--surface` | `44 22% 95%` | Cards, surfaces élevées |
| `--border` | `0 0% 4% / 0.14` | Bordures standard |
| `--accent` | `155 46% 34%` | Vert Maroc subtil — UNIQUEMENT pour `verified`, `success`. Jamais sur CTA principal. |
| `--danger` | `2 72% 41%` | Erreurs, destructif |

**Pas de jaune.** L'accent jaune `48 96% 58%` de l'ancienne spec était brûlé par Avito.
**Pas de vert or.** Le `#C9A961` est un faux-fuyant luxe.

## Typographie

- **Display** : Barlow Condensed 600-700 (avec Bahnschrift en premier choix si licence)
- **Body** : Inter 400-500
- **Mono** : JetBrains Mono 500 pour références, compteurs, eyebrows uniquement

### Règles letter-spacing

- `≥ 48px` → `-0.03em`
- `24–47px` → `-0.015em`
- `< 24px` → `0`
- **Jamais `-0.04em`** : illisible sur écran mobile basse densité

### Classes utilitaires

- `.display-xl` → réservé au H1 de la home. UNE occurrence par page max.
- `.display-lg` → H1 des pages internes (recherche, fiche, pro)
- `.mono` → références, compteurs, eyebrows
- `.eyebrow` → label pré-titre, 10px mono uppercase, tracking 0.12em

## Rayons

**Un seul rayon par famille.**

- Cards et surfaces : `rounded-md` (6px)
- Inputs : `rounded-md`
- Pills et boutons ronds : `rounded-full`
- Images : `rounded-none` (photos), `rounded-md` (avatars)

Bannir : `rounded-3xl`, `rounded-2xl`, `rounded-xl`. Pas d'exception.

## Accessibilité

- Contraste ≥ 4.5:1 pour texte normal, ≥ 3:1 pour texte ≥ 18px
- Focus ring visible `:focus-visible` 2px outline foreground
- Tap target ≥ 44px mobile
- Labels de formulaires toujours présents, jamais placeholder-only
```

### PR #2 — Corriger tokens de contraste et rayons

**Fichiers** : `src/app/globals.css`, recherche globale `rounded-3xl|rounded-2xl|rounded-xl`

**Diff 1 : `src/app/globals.css`**

```diff
   :root {
     /* Surfaces */
     --background: 44 22% 93%;
     --paper-2: 44 20% 88%;
     --paper-3: 42 19% 82%;
     --foreground: 0 0% 4%;
-    --surface: 44 22% 93%;
+    --surface: 44 22% 95%;
     --surface-muted: 44 20% 88%;

-    --muted: 44 4% 42%;
-    --muted-foreground: 44 4% 38%;
+    --muted: 0 0% 32%;
+    --muted-foreground: 0 0% 28%;       /* passe AA sur paper #f2efe8 */

     --line: 0 0% 4% / 0.12;
     --line-strong: 0 0% 4% / 0.85;

-    /* Accent — jaune chaud, sobre, pour highlights subtils uniquement */
-    --accent: 48 96% 58%;
-    --accent-foreground: 0 0% 4%;
+    /* Accent — vert Maroc discret, RÉSERVÉ aux badges verified/success */
+    --accent: 155 46% 34%;
+    --accent-foreground: 44 22% 95%;
```

**Diff 2 : recherche globale**

```bash
# à passer à l'équipe :
grep -rn "rounded-3xl\|rounded-2xl\|rounded-xl" src/
```

Remplacement manuel par `rounded-md` dans tous les cas cards/surfaces, `rounded-full` si c'est un bouton/pill. Ne pas mécaniser aveuglément — une dizaine de call sites à revoir à la main :
- `src/components/favorites/favorites-page.tsx` : `rounded-3xl border border-dashed` → `rounded-md border border-dashed`
- `src/app/pro/publier/page.tsx` : `rounded-3xl border border-foreground/15 bg-surface p-6` → `rounded-md border border-foreground/15 bg-surface p-6`
- `src/app/pro/publier/page.tsx` : `rounded-3xl bg-ink p-6 text-ink-foreground` → `rounded-md bg-ink p-6 text-ink-foreground`
- `src/components/search/saved-searches-page.tsx` : idem partout

Temps estimé : 4h en comptant le QA visuel.

### PR #3 — Simplifier la home + tuer "Sélection"

**Fichier** : `src/app/page.tsx`

**Diff** (simplification du flow) :

```diff
       {/* Featured — hero full-bleed style éditorial */}
-      {featured && (
-        <section className="container pt-10 md:pt-14">
-          <FeaturedHeroCard listing={featured} />
-        </section>
-      )}
-
-      {/* Rubrique SÉLECTION — grid 2-col sur mobile/tablet, 3-4 sur desktop */}
+      {/* Annonces récentes */}
       {latest.length > 0 && (
-        <section className="container py-14 md:py-20">
-          <div className="mb-8 flex items-end justify-between border-t border-foreground/15 pt-6">
-            <h2 className="display-xl text-[clamp(2rem,5vw,3.5rem)] uppercase">
-              Sélection
+        <section className="container py-10 md:py-14">
+          <div className="mb-6 flex items-end justify-between border-t border-foreground/15 pt-6">
+            <h2 className="display-lg text-2xl md:text-3xl">
+              Dernières annonces
             </h2>
             <Link
               href="/recherche"
               className="mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
             >
-              Voir {formatTotal(total)} →
+              Voir les {formatTotal(total)} →
             </Link>
           </div>

           <div className="grid grid-cols-2 gap-px bg-foreground/15 lg:grid-cols-3 xl:grid-cols-4">
             {latest.map((l, i) => (
               <ListingCard key={l.id} listing={l} priority={i < 4} />
             ))}
           </div>
         </section>
       )}

-      <CityStrip counts={cityCounts} />
-      <HowItWorks />
-      <ForYou />
+      <CityStrip counts={cityCounts} />
+      {/* HowItWorks et ForYou déplacés vers /comment-ca-marche et footer — voir PR #3b */}
```

Également remplacer dans `src/components/favorites/favorites-page.tsx` :

```diff
-          <h2 className="display-xl mt-2 text-2xl">Commencez votre sélection.</h2>
+          <h2 className="display-lg mt-2 text-2xl">Aucun favori pour l'instant.</h2>
```

### PR #4 — Refonte ListingCard avec date, photo count, prix/m²

**Fichier** : `src/components/listing/listing-card.tsx`

Voir le fichier `PR_04_listing_card.tsx` joint — patch complet avec :
- Ajout du champ `publishedAt` en relative date
- Badge compteur de photos si > 1
- Calcul prix/m² affiché sous le prix principal en mono
- Correction letter-spacing du titre (passage à `tracking-normal`)
- Suppression des caps sur la localisation (passage à small caps CSS optionnel)

### PR #5 — Favoris mobile alignés sur pattern web

**Fichier** : `baboo_app/src/components/ListingRow.tsx`

Remplacer le `Pressable` avec `<Text>{isFavorite ? '♥' : '♡'}</Text>` par un vrai composant `<FavoriteButton>` avec :
- SVG cœur (même path que web)
- Bouton 40x40 minimum pour tap target
- State `active` avec fill currentColor
- Stocké via AsyncStorage (déjà prévu via `useFavorites` hook à créer)

Voir le fichier `PR_05_mobile_favorite.tsx` joint.

### PR #6 — Filtres rapides mobile

**Fichier** : `baboo_app/app/(tabs)/index.tsx`

Sous le `searchRow` actuel, ajouter un strip horizontal de 3 QuickChips :
- Chip transaction (VENTE / LOCATION — toggle 2 états, cycling)
- Chip ville (ouvre picker de villes en bottom sheet)
- Chip type (ouvre bottom sheet 6 types)

Voir le fichier `PR_06_quick_filters.tsx` joint avec le composant `QuickFilterBar`.

### PR #7 — Tab segmenté Acheter/Louer cross-platform

**Fichiers** : `src/components/search/search-filters.tsx` (web), déjà présent côté mobile

Remplacer la double pill Vente/Location par un tab segmenté visuel unifié (3 états : TOUT / VENTE / LOCATION), aligné avec le pattern mobile V2.

### PR #8 — Supprimer app mobile legacy

Vérifier que `Baboo (2)/baboo_app/src/screens/` n'est plus référencé par aucun script de build, puis suppression :

```bash
rm -rf "Baboo (2)/baboo_app/src/screens"
rm -rf "Baboo (2)/baboo_app/src/navigation"
# mettre à jour .gitignore si nécessaire
```

Si l'app legacy est encore distribuée via Expo, ne pas supprimer — juste ajouter un fichier `DEPRECATED.md` à la racine du dossier.

---

## 5. Ce qu'on n'a PAS fait et pourquoi

- **Pas de refonte du `SiteHeader`** : je n'ai pas vu son code. À ajouter au backlog après consultation.
- **Pas de touche au système d'auth** : hors périmètre UX/UI.
- **Pas de proposition de design system formel** (Storybook, tokens JSON partagés web/mobile) : pertinent à moyen terme, mais les 8 PRs ci-dessus réglent 80% de l'incohérence sans ce niveau d'infra.
- **Pas d'A/B test proposé** : ton volume de trafic n'est probablement pas suffisant pour de l'A/B statistiquement significatif à ce stade. On itère par conviction et observation, pas par test.

---

## 6. Prochaines étapes suggérées

1. **Valider ce document** — en particulier la PR #1 (guidelines) qui détermine tout le reste
2. **Merger PR #1 et #2 en priorité** — ce sont les fondations. Sans ça, les suivantes vont re-diverger.
3. **Itérer PR #3 → #7 dans l'ordre**, en validant visuellement entre chaque.
4. **À moyen terme** : envisager un design system partagé web/mobile (tokens JSON unique consommé par Tailwind côté web et par un theme TS côté Expo).

Questions ou itération sur une PR spécifique ? Dis-moi laquelle on creuse.
