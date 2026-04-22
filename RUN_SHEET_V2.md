# RUN SHEET V2 — Refonte Baboo « Éditorial chaleureux »

Fiche opérationnelle pour Claude Code, adaptée à la nouvelle direction artistique : palette crème + bleu nuit + terracotta + vert sapin, typographie Fraunces serif, logo `baboo.` sans panda.

---

## ⚠️ Avant tout — jeter l'ancien pack

Si tu as téléchargé les 10 fichiers précédents de l'audit V1 (brutaliste calmé), **ne les utilise pas**. Ils sont incompatibles avec cette nouvelle direction. Seul compte le pack V2 (fichiers nommés `PR_XX_..._v2.*` et ce `RUN_SHEET_V2.md`).

---

## Pack V2 — 8 fichiers à récupérer

1. `RUN_SHEET_V2.md` (ce fichier — ton pilote)
2. `PR_01_ui_guidelines_v2.md` (nouvelle voix + palette + typo)
3. `PR_02_tokens_v2.css` (patch globals.css + tailwind config + layout.tsx)
4. `PR_03_logo_v2.tsx` (nouveau BabooLogo sans panda)
5. `PR_04_home_page_v2.tsx` (nouvelle home avec hero éditorial + bloc dual)
6. `PR_05_listing_card_v2.tsx` (cards rondes avec badges éditoriaux)
7. `PR_06_navigation_v2.tsx` (site-header + bottom bar mobile avec CTA central)
8. `PR_07_mobile_home_v2.tsx` (écran home Expo)

---

## Prérequis avant de lancer Claude Code

```bash
cd ~/ton-chemin/baboo
git checkout main
git pull
git status           # doit être clean
pnpm install         # s'assurer que tout est à jour
pnpm typecheck       # baseline avant changements
```

Avoir les 8 fichiers du pack V2 dans un dossier accessible (ex. `~/Downloads/baboo-v2/`).

---

## Session 1 — Fondations (PR #1 + #2 + #3)

**Objectif** : installer les nouveaux tokens, les fonts Fraunces/Inter, le nouveau logo. C'est la session la plus structurante.

**Durée estimée** : 1h30 + 30 min review visuelle

### Commandes de démarrage

```bash
git checkout -b refonte/editorial-fondations
claude
```

### Prompt à coller dans Claude Code

```
J'ai une refonte UX/UI complète de mon projet Baboo à intégrer. On passe
d'une direction brutaliste B&W à une direction éditoriale chaleureuse
(palette crème + bleu nuit + terracotta + vert sapin, serif Fraunces).

Session 1 : fondations. Je te joins 3 fichiers :
- PR_01_ui_guidelines_v2.md → à copier dans docs/ui-guidelines.md (remplacement total)
- PR_02_tokens_v2.css → patchs pour src/app/globals.css + tailwind.config.ts + src/app/layout.tsx
- PR_03_logo_v2.tsx → nouveau composant BabooLogo + BabooMark

ÉTAPE 1 : Guidelines
Remplace intégralement docs/ui-guidelines.md par le contenu de PR_01_ui_guidelines_v2.md.

ÉTAPE 2 : Fonts
Dans src/app/layout.tsx, remplace les imports de fonts par Fraunces + Inter
+ JetBrains Mono comme décrit en bas de PR_02_tokens_v2.css. Supprime tout
import de Barlow Condensed.

ÉTAPE 3 : globals.css
Dans src/app/globals.css, remplace le bloc :root ET les classes display-*
de @layer components par les versions de PR_02_tokens_v2.css. Garde les
@tailwind du haut et les utilities non-modifiées.

ÉTAPE 4 : tailwind.config.ts
Adapte selon les extraits commentés en bas de PR_02_tokens_v2.css :
- Nouvelles couleurs : cream, midnight, terracotta, forest (et variants)
- Nouvelles fonts : display = Fraunces, sans = Inter
- Nouveaux borderRadius : md, xl, 2xl, 3xl, full (suppression de lg, sm)

ÉTAPE 5 : Logo
Crée src/components/ui/baboo-logo.tsx avec le contenu de PR_03_logo_v2.tsx
(composants BabooLogo + BabooMark). Si un composant Logo existait ailleurs
(src/components/ui/logo.tsx ou src/components/baboo-logo.tsx), supprime-le.

Cherche tous les imports du logo dans le code :
  grep -rn "BabooLogo\|import.*logo" src/ --include="*.tsx"
Et met-les à jour pour pointer vers le nouveau chemin.

ÉTAPE 6 : Migration rayons
L'ancienne config avait lg/sm, la nouvelle non. Grep les utilisations :
  grep -rn "rounded-lg\|rounded-sm" src/
Remplace rounded-lg par rounded-xl, rounded-sm par rounded-md.

ÉTAPE 7 : Migration couleurs
Cherche les anciennes utilisations de couleurs qui n'existent plus :
  grep -rn "bg-ink\|text-ink\|paper-2\|paper-3\|accent-foreground" src/

Remplace :
  bg-ink → bg-midnight
  text-ink → text-midnight
  bg-paper-2 → bg-cream-2
  bg-background → bg-cream (ou laisse, c'est aliasé)
  text-foreground → text-midnight (ou laisse)
  text-accent → text-terracotta
  bg-accent → bg-terracotta

Sois conservateur : si un mapping est ambigu, montre-moi le diff avant de committer.

ÉTAPE 8 : Validation
pnpm typecheck && pnpm build.
Si ça casse, corrige avant de poursuivre. Puis pnpm dev.

Commits séparés :
1. "docs: replace ui-guidelines with editorial warm direction"
2. "feat(design-tokens): migrate to cream/midnight/terracotta/forest palette"
3. "feat(ui): new baboo. wordmark logo (remove panda)"
4. "refactor: migrate color and radius tokens across codebase"

NE PUSH PAS encore. On review localement avant.
```

### Checklist de validation

- [ ] `pnpm typecheck` passe
- [ ] `pnpm build` passe
- [ ] `pnpm dev` démarre
- [ ] La page d'accueil s'affiche — elle sera encore moche (la vraie refonte home vient en Session 2) mais les fonts, couleurs, logo doivent déjà refléter la nouvelle direction
- [ ] Le logo `baboo.` (sans panda) apparaît dans le header
- [ ] Le fond de page est crème, pas blanc
- [ ] Le texte est bleu nuit, pas noir pur
- [ ] `grep -rn "bg-ink\|paper-2\|Barlow" src/` renvoie zéro résultat applicatif

Si tout est bon → `git push -u origin refonte/editorial-fondations` et PR sur GitHub.

---

## Session 2 — Home et cards (PR #4 + #5)

**Objectif** : refonte complète de la home desktop et des cards d'annonces.

**Durée estimée** : 2h30 + 45 min review

**Prérequis** : Session 1 mergée sur main (ou au moins la branche fondations est complète).

### Commandes de démarrage

```bash
git checkout main && git pull
git checkout -b refonte/editorial-home
claude
```

### Prompt à coller dans Claude Code

```
On enchaîne sur le visible : home page éditoriale + cards d'annonces.

Session 2 : je te joins 2 fichiers :
- PR_04_home_page_v2.tsx → nouvelle src/app/page.tsx + composants à créer
- PR_05_listing_card_v2.tsx → nouveau ListingCard avec badges éditoriaux

ÉTAPE 1 : Prisma schema — ajouter les flags éditoriaux
Dans prisma/schema.prisma, ajouter au modèle Listing ces champs si pas déjà présents :

  coupDeCoeur Boolean   @default(false)
  exclusive   Boolean   @default(false)
  featured    Boolean   @default(false)
  publishedAt DateTime?

Puis :
  pnpm prisma migrate dev --name add_editorial_flags
  pnpm prisma generate

ÉTAPE 2 : Seed
Dans prisma/seed.ts, après la création des listings, marquer :
- ~15% des listings comme coupDeCoeur = true (les plus beaux mentalement)
- ~5% comme exclusive = true
- ~10% comme featured = true
Leur publishedAt = createdAt pour les existants.

pnpm db:seed pour re-seed.

ÉTAPE 3 : ListingCard
Remplace src/components/listing/listing-card.tsx par le contenu de
PR_05_listing_card_v2.tsx. Adapte le composant FavoriteButton pour accepter
le nouveau variant="floating" décrit en bas de ce même fichier.

ÉTAPE 4 : Composants home à créer
Crée chacun de ces fichiers (stubs dans PR_04_home_page_v2.tsx) :
- src/components/search/hero-search-block.tsx
- src/components/marketing/stats-strip.tsx
- src/components/marketing/dual-block.tsx
- src/components/listing/featured-hero-card.tsx (refonte)

Utilise les stubs fournis comme base, complète les imports et les types manquants
en cohérence avec le reste du codebase.

ÉTAPE 5 : Page d'accueil
Remplace src/app/page.tsx par la version de PR_04_home_page_v2.tsx.
Assure-toi que les fonctions lib (findListings, getFeaturedListing, getPlatformStats)
existent — si getPlatformStats n'existe pas, crée-la dans src/lib/listings-query.ts
pour renvoyer { total, agencies, cities } basés sur Prisma count.

ÉTAPE 6 : Validation
pnpm typecheck && pnpm build. Puis pnpm dev.
Regarde à deux résolutions :
- Mobile (375px largeur) — le hero devrait être compact, la card COUP DE CŒUR
  en-dessous du texte, les blocs dual empilés
- Desktop (≥ 1024px) — hero titre à gauche, card COUP DE CŒUR à droite, stats
  en bas à gauche

Commits :
1. "feat(schema): add editorial flags (coupDeCoeur, exclusive, featured)"
2. "feat(listing-card): new editorial card with badges and rounded-2xl"
3. "feat(home): new editorial hero page with dual block and featured card"

NE PUSH PAS, on review.
```

### Checklist de validation Session 2

- [ ] La home affiche le hero avec « plus près » en terracotta
- [ ] Le bloc recherche blanc rounded-2xl fonctionne
- [ ] Les 3 stats (2 847 / 12 / 420+) apparaissent en terracotta
- [ ] La card COUP DE CŒUR flotte à droite (desktop) ou en-dessous (mobile)
- [ ] Les 4 cards de la sélection ont chacune un badge (au moins certaines)
- [ ] Les blocs dual terracotta + forest apparaissent après la sélection
- [ ] Aucune mention restante de « Barlow Condensed », aucune ombre lourde
- [ ] `pnpm typecheck` passe

---

## Session 3 — Mobile Expo (PR #6 + #7)

**Objectif** : aligner l'app mobile Expo sur la même direction.

**Durée estimée** : 2h

**Prérequis** : Sessions 1 et 2 mergées. L'app Expo est buildable localement.

### Commandes de démarrage

```bash
git checkout main && git pull
git checkout -b refonte/editorial-mobile
claude
```

### Prompt à coller dans Claude Code

```
Session 3 : refonte de l'app mobile Expo pour aligner avec la nouvelle
direction éditoriale. Je te joins 2 fichiers :
- PR_06_navigation_v2.tsx → site-header web ET BabooBottomBar mobile
- PR_07_mobile_home_v2.tsx → écran home Expo (app/(tabs)/index.tsx)

ÉTAPE 1 : Fonts mobile
Ajoute les dépendances :
  pnpm --filter baboo_app add @expo-google-fonts/fraunces @expo-google-fonts/inter @expo-google-fonts/jetbrains-mono

Dans baboo_app/app/_layout.tsx, charge les fonts via useFonts et ne rends
rien tant que pas loaded. Voir la section en bas de PR_07_mobile_home_v2.tsx.

ÉTAPE 2 : Theme mobile
Dans baboo_app/src/theme/theme.ts, remplace le `colors` object par la
nouvelle palette éditoriale (cream, midnight, terracotta, forest + variants).
Voir la section en bas de PR_06_navigation_v2.tsx.

Les valeurs hex doivent matcher exactement celles du web :
  cream: "#f3ecdd"
  midnight: "#1a2540"
  terracotta: "#c04e2e"
  forest: "#2d4a3e"

ÉTAPE 3 : Logo mobile
Dans baboo_app/src/components/BabooLogo.tsx, remplace l'ancienne SVG par
la version décrite en bas de PR_03_logo_v2.tsx (version React Native).
Expose aussi BabooMark.

ÉTAPE 4 : Site header web
Remplace src/components/layout/site-header.tsx par la version de
PR_06_navigation_v2.tsx (section 1).

ÉTAPE 5 : Bottom bar mobile
Remplace baboo_app/src/components/BabooBottomBar.tsx (ou équivalent) par
la version de PR_06_navigation_v2.tsx (section 2). Le bouton central
PUBLIER circulaire terracotta est la nouveauté clé.

Dans baboo_app/app/_layout.tsx ou le navigator, intègre la nouvelle bottom
bar. Si Expo Router gère déjà le tab layout, adapte-le pour qu'il utilise
BabooBottomBar via `tabBar={(props) => <BabooBottomBar ... />}`.

ÉTAPE 6 : Home mobile
Remplace baboo_app/app/(tabs)/index.tsx par le contenu de PR_07_mobile_home_v2.tsx.
Crée les composants manquants :
- baboo_app/src/components/HeroSearchBlock.tsx
- baboo_app/src/components/FeaturedHeroCard.tsx
Ceux-ci doivent être des adaptations RN des équivalents web (même structure,
mêmes tokens, adaptés pour react-native).

ÉTAPE 7 : Validation
pnpm --filter baboo_app start
Teste sur simulateur iOS ET Android.

Checklist :
- Logo baboo. avec point terracotta s'affiche
- Fonds crème partout
- Bouton PUBLIER central circulaire terracotta visible dans la bottom bar
- Hero avec "ressemble" en terracotta
- Cards rounded-2xl avec badges

Commits :
1. "feat(mobile): add editorial fonts (Fraunces, Inter, JetBrains Mono)"
2. "feat(mobile): migrate theme to cream/midnight/terracotta/forest"
3. "feat(web-mobile): new navigation with central floating publish button"
4. "feat(mobile): new home screen aligned with editorial direction"

NE PUSH PAS.
```

### Checklist de validation Session 3

- [ ] L'app se lance sans crash sur iOS
- [ ] L'app se lance sans crash sur Android
- [ ] Fonts Fraunces chargent correctement (pas de fallback système visible)
- [ ] Bouton PUBLIER circulaire terracotta dans la bottom bar, surélevé
- [ ] Home mobile reproduit fidèlement la capture 3
- [ ] Transition entre home et fiche annonce fluide

---

## En cas de pépin — FAQ rapide

| Problème | Réaction |
|---|---|
| Fraunces ne charge pas sur web | Vérifier next/font/google, vérifier que la variable CSS est bien passée sur `<html>` ou `<body>`, purger `.next/` cache |
| Fonts mobile ne chargent pas | useFonts doit bloquer le render jusqu'à loaded, `return null` tant que `!fontsLoaded` |
| Prisma migrate échoue | Vérifier DATABASE_URL local, au besoin `pnpm prisma migrate reset` en dev |
| Tailwind ne connaît pas `bg-terracotta` | Vérifier que la config a bien été rechargée — redémarrer `pnpm dev` |
| Contraste terracotta sur cream signalé bas | C'est normal sur texte small. Ne jamais utiliser terracotta sur text-sm / text-xs. Si le warning apparaît dans une PR, c'est un vrai bug à fixer |
| Badge "Coup de cœur" apparaît sur TOUTES les annonces | Vérifier le seed — seul 15% devrait avoir `coupDeCoeur = true` |

---

## Récap

| Session | PRs | Durée | Risque | À merger indépendamment ? |
|---|---|---|---|---|
| 1 | #1, #2, #3 | 2h | Fort (refonte fonts + couleurs partout) | Oui mais moche sans Session 2 |
| 2 | #4, #5 | 3h | Moyen | Oui |
| 3 | #6, #7 | 2h | Faible | Oui |

**Total** : ~7h de travail actif sur 1-2 semaines.

**Ne pas enchaîner les 3 sessions dans la même journée.** Laisse 24-48h entre chaque pour :
- Voir les changements vivre en preview Vercel
- Récupérer un œil frais sur les problèmes visuels
- Adapter le plan si tu changes d'avis (mais essaie de ne pas changer d'avis)

---

## Ma recommandation pour maintenant

Commence **Session 1 ce soir ou demain matin**. C'est la plus risquée (touche aux tokens partout) mais c'est la fondation obligatoire. Entre Session 1 et Session 2, prends **au moins 24h** pour voir si les couleurs tiennent la route sur ton propre écran en conditions normales.

Si au bout de Session 1 tu te rends compte que la palette ne te plaît plus en vrai — on reprend. Mais **ne lance pas Session 2** tant que Session 1 n'est pas solide en visuel, sinon tu construis sur du sable.
