# Prompt de démarrage — Baboo

Copie-colle ce prompt dans Claude Code après avoir lancé `claude` dans un dossier vide contenant ce package de handoff.

---

## Prompt à copier

```
Bonjour. Je veux que tu implémentes entièrement le front-end de Baboo, une plateforme d'annonces immobilières au Maroc.

Tout le contexte est dans les fichiers de ce dossier :
- README.md contient le brief technique complet (spec section par section)
- CLAUDE.md contient les règles absolues du projet (à ne jamais enfreindre)
- mockups/baboo-redesign.jsx est la maquette React de référence visuelle (3 écrans mobiles : accueil, recherche, fiche détail)
- mockups/tokens-reference.css montre la palette et la typographie
- assets/baboo-logo.png est le logo source

Étapes à suivre dans l'ordre :

1. Lis d'abord CLAUDE.md en entier. Confirme que tu as compris les règles absolues (palette, typo, interdictions).

2. Lis ensuite README.md en entier. Pose-moi des questions si une section te semble ambigüe.

3. Ouvre mockups/baboo-redesign.jsx et étudie-le. Repère précisément comment sont construits :
   - Le ListingCard (la photo, les badges, le prix, les facts)
   - Le hero d'accueil (greeting avec italique, search bar, toggle Acheter/Louer)
   - Le carrousel de villes
   - La fiche détail (hero photo, card qui remonte, bloc prix, grid de facts)
   - La bottom nav iOS

4. Initialise le projet Next.js 15 avec :
   - `pnpm create next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"`
   - Installe : prisma, @prisma/client, lucide-react, clsx, tailwind-merge
   - Configure next/font pour Fraunces, Inter Tight, JetBrains Mono

5. Implémente dans cet ordre :
   a. src/app/globals.css avec tous les tokens HSL (section 3 du README)
   b. tailwind.config.ts avec les tokens branchés
   c. src/lib/cn.ts, src/lib/format.ts, src/lib/search-params.ts
   d. src/components/ui/ (button, card, badge, input, label, icon-button, pill-toggle, icons)
   e. src/components/layout/baboo-logo.tsx (l'ourson + wordmark en Fraunces italique)
   f. src/components/layout/ (site-header, mobile-bottom-nav, site-footer)
   g. src/components/listing/ (listing-card, city-card, listing-gallery, listing-facts, amenity-list, contact-card, listing-map-preview, mobile-sticky-cta)
   h. src/components/search/ (hero-search, search-filters, search-toolbar, search-pagination, applied-chips, mobile-search-header)
   i. src/data/ (cities.ts avec les 12 villes et leurs quartiers, taxonomy.ts avec types de biens et aménités)
   j. prisma/schema.prisma + prisma/seed.ts avec ~30 annonces réalistes au Maroc
   k. src/lib/listings-query.ts (avec try/catch sur Prisma)
   l. Les pages dans l'ordre : /, /recherche, /annonce/[slug], /pro, /connexion, /inscription, /not-found
   m. robots.ts et sitemap.ts dynamiques

6. Après chaque section, teste en faisant `pnpm dev` et vérifie visuellement en 390px (mobile) puis en 1280px (desktop).

7. À la fin, donne-moi :
   - Un arbre de fichiers complet
   - Les commandes pour lancer : pnpm install && pnpm db:push && pnpm db:seed && pnpm dev
   - Une liste des éventuelles limitations (ex. photos placeholder, pas d'auth, etc.)

Règles de travail :
- Respecte strictement les tokens, polices et règles de CLAUDE.md
- La maquette montre le ton, la spec montre l'architecture — les deux priment
- Pas d'improvisation de palette, pas d'ajout de polices
- Mobile-first, tout doit être testable en 390px
- Pas d'émojis dans l'UI, pas de superlatifs dans la copy
- Pose des questions si tu as un doute, ne devine pas

Commence par l'étape 1 : lis CLAUDE.md et confirme que les règles sont claires.
```

---

## Astuce

Si Claude Code part dans une direction qui ne correspond pas au ton visé, rappelle-lui explicitement :

> "Ça part trop [brutaliste / startup / premium]. Relis CLAUDE.md et regarde la maquette baboo-redesign.jsx. Le ton est chaleureux et photo-first, pas [X]."

Si Claude Code veut introduire une police ou une couleur qui n'est pas dans la liste :

> "Non, on reste strictement sur Fraunces + Inter Tight + JetBrains Mono. Pas d'autre police. Palette crème/terracotta/olive uniquement."

## Ordre recommandé de validation

Après chaque étape, ouvre le navigateur et vérifie :

1. **Tokens** : `pnpm dev` → ouvre `localhost:3000` → inspecte `:root` dans le devtools → vérifie que les variables CSS sont là.
2. **Composants UI** : crée une page de test `/playground` avec tous les composants pour voir l'ensemble.
3. **ListingCard** : compare côte à côte avec la maquette. La photo prend-elle bien 60%+ de la carte ? Le prix est-il en Fraunces ?
4. **Page d'accueil** : teste en 390px. Le greeting a-t-il l'italique ? La bottom nav est-elle là ?
5. **Fiche détail** : la card remonte-t-elle bien de -20px sur la photo ? Le sticky CTA est-il au-dessus de la bottom nav ?

## Si quelque chose manque

Le brief ne couvre pas tout. Si Claude Code te demande des choses non spécifiées (ex. système d'auth, upload de photos, dashboard pro détaillé) :

- Pour les fonctionnalités non spécifiées : demande-lui de créer des placeholders avec des commentaires TODO.
- Pour les textes de copy manquants : laisse-le les rédiger dans le ton chaleureux + valide avant de passer à la suite.
- Pour les photos : il doit utiliser `images.unsplash.com` avec des URLs précises vers des photos d'architecture marocaine ou d'intérieurs épurés. Pas de photos de personnes.
