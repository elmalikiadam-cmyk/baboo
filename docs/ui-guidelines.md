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
