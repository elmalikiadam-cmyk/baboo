# Baboo — Instructions Claude Code

Ce fichier est lu automatiquement par Claude Code à chaque session. Il contient les règles du projet à ne jamais enfreindre.

## Contexte
Baboo est une plateforme d'annonces immobilières au Maroc. Direction visuelle : **"Maison ouverte"** — chaleureux, photo-first, marocain sans folklore.

Brief complet dans `README.md`. Maquette de référence dans `mockups/baboo-redesign.jsx`.

## Règles absolues

### Palette
- Fond principal : crème chaude `#FAF6F0` (JAMAIS blanc pur `#fff`, JAMAIS noir `#000`).
- Encre : `#1A1815` (presque noir, légèrement chaud — JAMAIS `#000` ou `#0a0a0a`).
- Accent unique : terracotta `#B8442A`, réservé aux eyebrows, liens, badges "Nouveau", underlines d'italique. **Jamais sur les CTAs principaux.**
- Semantic success : olive `#5B6B3F` (pas de vert vif, pas de bleu).
- Bordures : toujours `#E8DFC9` (sable chaud), JAMAIS `rgba(0,0,0,0.x)`.

### Typographie
- Display : **Fraunces** uniquement (400, 500, + italiques 400/500). Utiliser l'italique pour les moments émotionnels des titres ("Où cherchez-vous ?", "sans friction.").
- Body : **Inter Tight** uniquement.
- Monospace : **JetBrains Mono** uniquement, exclusivement pour les eyebrows et métadonnées techniques.
- **Interdit** : Playfair, Space Grotesk, Inter (version normale), Barlow Condensed, Poppins, Montserrat, DM Sans, Geist. Ces polices sont des signaux d'AI slop.

### Composants
- Cartes : `rounded-2xl` (20px) par défaut, bordure `border-border` (sable), hover `-translate-y-0.5` + shadow douce teintée warm.
- Boutons : `rounded-full` toujours. Primary = `bg-ink text-ink-foreground`. Jamais de bouton terracotta.
- Badges Pro/Particulier obligatoires sur toutes les cartes d'annonces.
- Photos de listings : ratio 5:4 (default) ou 4:3 (featured). Overlay dots pattern subtil (voir `.bb-dot-pattern` dans tokens-reference.css).

### Mobile-first
- Tout doit être testé et pensé en 390px de large d'abord.
- Bottom tab bar iOS à 5 onglets (Accueil, Recherche, Favoris, Messages, Profil), visible `md:hidden`.
- Sticky CTA sur fiche détail au-dessus de la bottom nav.
- Pas de hover-dependent UX. Tout doit être utilisable au tap.

### Copy
- Ton chaleureux, direct, sans superlatifs. "Bonjour" pas "Bienvenue". "Ajoutées récemment" pas "Sélection éditoriale".
- Pas de : "premium", "haut de gamme", "coup de cœur", "exclusivité", "éditorial", "luxe", "prestige".
- Tout en français, orthographe marocaine standard (pas d'anglicismes inutiles).
- Prix en MAD, surfaces en m², nombres formatés `fr-FR` avec espaces fines.

### Interdictions esthétiques
- Pas de gradients décoratifs (sauf sur les photos de villes avec overlay sombre).
- Pas d'ombres lourdes. Shadows toujours teintées warm : `rgba(26, 24, 21, 0.15)`.
- Pas de bordures colorées épaisses.
- Pas d'émojis dans l'UI.
- Pas de spring/bounce sur les animations. `ease-out` 200ms max.
- Pas d'icônes décoratives — si retirer une icône ne perd pas de sens, retire-la.

### Stack
- Next.js 15 App Router, RSC par défaut, `"use client"` uniquement si nécessaire.
- TypeScript strict. Pas de `any`, pas de `@ts-ignore`.
- Tailwind uniquement pour le styling. Pas de CSS modules, pas de styled-components.
- lucide-react pour les icônes, via `@/components/ui/icons.tsx` centralisé.
- URL-driven search : tous les filtres dans `searchParams`, jamais en state client.

### Workflow
1. Avant de coder un composant, regarde son équivalent dans `mockups/baboo-redesign.jsx`.
2. Crée les tokens et composants UI primitifs avant les composants métier.
3. Crée les composants métier avant les pages.
4. Teste chaque page en 390px avant de passer à la suivante.
5. À la fin, génère un `tree` du projet + les commandes pour lancer.

## En cas de doute
- La spec du README prime sur la maquette.
- La maquette montre le ton, la spec montre l'architecture.
- Si un détail n'est pas spécifié : fais le choix qui respecte le ton "chaleureux, photo-first". Ne réinvente pas.
- Ne jamais introduire un token ou une police qui n'est pas listé ici.
