# Baboo — UI Guidelines (V2 — Éditorial chaleureux)

> **Source de vérité** pour l'identité visuelle et éditoriale de Baboo. En cas de conflit avec les maquettes anciennes (brutalistes B&W) ou avec le brief produit initial qui proscrivait le vocabulaire éditorial, **c'est ce document qui prime**.
>
> Révision majeure : 21 avril 2026 — virage vers une direction **éditoriale chaleureuse** avec palette terracotta / bleu nuit / crème / vert sapin, typographie serif. Abandon de la direction brutaliste B&W.

---

## 1. Positionnement et voix

Baboo n'est pas un moteur de recherche neutre — c'est une **plateforme d'annonces curée** avec un vrai regard sur le marché immobilier marocain. Confiance, chaleur humaine, professionnalisme.

La voix : chaleureuse, premium sans être élitiste, avec une pointe d'émotion.

### Phrase signature

> **« Le bien qui vous ressemble, plus près que vous ne croyez. »**

### Do — vocabulaire autorisé (et encouragé)

| Terme | Usage |
|---|---|
| Coup de cœur | Badge sur annonces mises en avant par l'équipe |
| À la une | Section d'annonces éditorialisées |
| Sélection de la semaine | Curation hebdomadaire |
| Exclusif | Annonces en exclusivité Baboo |
| Nouveau | Fraîcheur d'annonce (< 7 jours) |
| Trié par l'équipe Baboo | Signe de curation, transparence |

### Do — verbes et formules

- « Trouvez le bien qui vous ressemble »
- « Publiez gratuitement », « Publication accompagnée »
- « Annonces vérifiées », « Particuliers & professionnels »
- « Des milliers d'acheteurs sérieux »
- Chiffres mis en valeur : « 2 847 annonces », « 12 villes », « 420+ agences »

### Don't — à éviter

- Ton technique / froid (« Moteur de recherche », « Base de données d'annonces »)
- Superlatifs vides (« Le meilleur site », « La plateforme n°1 »)
- Jargon SEO (« Immobilier Maroc pas cher », « Bonnes affaires immo »)
- Dark patterns (« Plus que 2 en stock », « 5 personnes regardent »)
- Stock photos génériques sans lien avec le Maroc

### Casse

- Titres : casse de phrase, pas de caps (« Le bien qui vous ressemble », pas « LE BIEN QUI VOUS RESSEMBLE »)
- Eyebrows mono : caps autorisées, courtes (« IMMOBILIER · MAROC · 2 847 ANNONCES »)
- Badges : caps courtes (« COUP DE CŒUR », « NOUVEAU », « EXCLUSIF »)
- Noms de villes et quartiers : casse normale (« Marrakech · Médina », pas « MARRAKECH · MÉDINA »)

---

## 2. Palette

Tokens dans `src/app/globals.css` (web) et `baboo_app/src/theme/theme.ts` (mobile). Valeurs identiques sur les deux plateformes.

### Couleurs de marque

| Token | Hex | HSL | Usage |
|---|---|---|---|
| `--cream` | `#f3ecdd` | `42 52% 91%` | Fond de page principal — chaleur, clarté |
| `--cream-2` | `#ebe3d1` | `42 45% 87%` | Surface subtile, dividers |
| `--midnight` | `#1a2540` | `223 42% 18%` | Texte primaire, bouton primary, fond du bloc Pros |
| `--midnight-2` | `#2a3655` | `225 34% 25%` | Hover du primary |
| `--terracotta` | `#c04e2e` | `13 62% 47%` | **Accent signature** — CTAs principaux, chiffres clés, badges coup de cœur, accents de mots dans les titres |
| `--terracotta-2` | `#a33f22` | `13 67% 39%` | Hover du terracotta |
| `--forest` | `#2d4a3e` | `151 24% 23%` | Bloc Pros, badges « EXCLUSIF », trust marks |
| `--forest-2` | `#1f3a2f` | `151 31% 18%` | Hover du forest |

### Couleurs utilitaires

| Token | Hex | Usage |
|---|---|---|
| `--ink` | `#1a2540` | Alias de midnight — texte principal |
| `--muted` | `#5a6478` | Texte secondaire, métadonnées |
| `--muted-foreground` | `#4a5368` | Variante avec meilleur contraste (ratio 6.1:1 sur cream) |
| `--line` | `#1a2540 / 0.12` | Bordures hairline |
| `--line-strong` | `#1a2540 / 0.85` | Emphase |
| `--surface` | `#ffffff` | Cards élevées (bloc recherche, cards d'annonces) |
| `--surface-warm` | `#ebe3d1` | Cards chaudes, encarts marketing neutres |
| `--success` | `#2d4a3e` | Alias forest — validation |
| `--danger` | `#b3261e` | Erreurs, destructif |

### Règles d'usage

- **Cream** est le fond de page par défaut — jamais de pur blanc en fond
- **Midnight** est la couleur du texte par défaut et du bouton primary (« Voir l'annonce », « Se connecter »)
- **Terracotta** est l'accent signature — uniquement sur :
  - Bouton d'action principal (« Rechercher », « Publier une annonce »)
  - Chiffres clés (2 847, 12, 420+)
  - Mots accentués dans les gros titres (« ressemble, **plus près** »)
  - Badge « COUP DE CŒUR »
  - Bloc dual « Publiez votre annonce » (particuliers)
  - Bouton central de la bottom bar mobile
- **Forest** est utilisé pour :
  - Bloc dual « Une plateforme pro » (agences & promoteurs)
  - Badge « EXCLUSIF »
  - États success

**Interdits absolus** :
- Jaune `#fbdf3c` (ancienne spec — brûlé par Avito)
- Noir pur `#000000` — toujours utiliser midnight `#1a2540`
- Blanc pur `#ffffff` en fond de page — toujours cream
- Gradients de toute nature
- Ombres lourdes `shadow-xl` — rester sur `shadow-sm` ou `shadow-md` discret

---

## 3. Typographie

### Stack

- **Display** (titres, prix, chiffres-clés) : **Fraunces** (serif variable, Google Fonts, gratuit)
  - Poids utilisés : 500 (regular display), 600 (semi-bold), 700 (bold), 900 (black pour chiffres)
  - `font-optical-sizing: auto` pour le rendu variable
- **Sans** (body, UI, formulaires) : **Inter** (sans-serif variable)
  - Poids utilisés : 400 (regular), 500 (medium), 600 (semi-bold)
- **Mono** (eyebrows, métadonnées techniques, compteurs) : **JetBrains Mono** 500

### Échelle

| Classe | Taille | Line-height | Letter-spacing | Usage |
|---|---|---|---|---|
| `display-hero` | `clamp(3rem, 8vw, 6rem)` | `0.95` | `-0.02em` | Hero de la home UNIQUEMENT |
| `display-xl` | `clamp(2rem, 5vw, 3.5rem)` | `1.0` | `-0.015em` | H1 des pages internes |
| `display-lg` | `clamp(1.5rem, 3vw, 2rem)` | `1.1` | `-0.01em` | H2 de sections, titres de cards éditoriales |
| `display-md` | `1.25rem` (20px) | `1.2` | `-0.005em` | Titres de cards d'annonces |
| `display-sm` | `1rem` (16px) | `1.3` | `0` | Sous-titres |
| `body-lg` | `1.125rem` (18px) | `1.55` | `0` | Paragraphes introductifs |
| `body` | `0.9375rem` (15px) | `1.6` | `0` | Corps de texte |
| `body-sm` | `0.8125rem` (13px) | `1.5` | `0` | Métadonnées lisibles |
| `eyebrow` | `0.6875rem` (11px) | `1.0` | `0.12em` UPPERCASE | Label pré-titre (mono) |
| `mono-sm` | `0.6875rem` (11px) | `1.0` | `0.08em` | Références, compteurs |

### Règles letter-spacing

- Fraunces supporte des tracking plus serrés que les sans — `-0.02em` sur très gros titres OK
- **Jamais au-delà de `-0.025em`** même en énorme
- Tracking positif uniquement pour eyebrows mono uppercase

### Règle d'emphase couleur dans les titres

Les titres hero peuvent avoir **un ou deux mots en terracotta** pour créer l'accroche. Exemple :

> Le bien qui vous ressemble, **plus près** que vous ne croyez.

→ "plus près" en `text-terracotta`, le reste en `text-midnight`.

À utiliser avec parcimonie — une seule occurrence par page.

---

## 4. Rayons

Direction radicalement différente de la V1 brutaliste. On assume les rayons généreux.

| Composant | Rayon Tailwind | Pixels |
|---|---|---|
| Cards d'annonces | `rounded-2xl` | 16px |
| Cards éditoriales grand format (bloc dual particuliers/pros) | `rounded-3xl` | 24px |
| Bloc recherche hero | `rounded-2xl` | 16px |
| Inputs, selects | `rounded-xl` | 12px |
| Boutons primary/secondary (pills) | `rounded-full` | 9999px |
| Badges (COUP DE CŒUR, NOUVEAU, EXCLUSIF) | `rounded-md` | 6px |
| Bouton circulaire central mobile (Publier) | `rounded-full` | — |
| Photos d'annonces | `rounded-xl` | 12px (à l'intérieur de la card `rounded-2xl`) |
| Avatars | `rounded-full` |

**Pas de `rounded-lg`, pas de `rounded-none`, pas de `rounded-sm`.** On ne mixe pas 4 échelles de rayons, c'est le désordre garanti.

---

## 5. Composants clés

### Button

3 variants principaux :

- **Primary** : `bg-terracotta text-cream rounded-full hover:bg-terracotta-2`
- **Secondary / Outline** : `border-2 border-midnight text-midnight rounded-full hover:bg-midnight hover:text-cream`
- **Ghost** : `text-midnight hover:bg-midnight/5`

Tailles :
- `sm` : `h-9 px-4 text-sm`
- `md` : `h-11 px-6 text-base` (défaut)
- `lg` : `h-14 px-8 text-base font-semibold`

**Bouton circulaire central mobile** (« Publier ») :
- `w-14 h-14 rounded-full bg-terracotta text-cream shadow-lg`
- Icon `+` centré en 24px stroke 2

### Card d'annonce

Structure :
- Container `rounded-2xl bg-surface overflow-hidden border border-line`
- Photo 4:3 avec `rounded-xl` appliqué sur l'image en haut
- Badge « COUP DE CŒUR » / « NOUVEAU » / « EXCLUSIF » en haut à gauche de la photo, `rounded-md px-2 py-0.5`
- Bouton favori en haut à droite : cercle `w-8 h-8 rounded-full bg-cream/90 backdrop-blur`
- Prix en bas de la photo, Fraunces semi-bold : `<span class="display-lg">4 200 000</span> <span class="mono-sm">MAD</span>`
- Titre d'annonce en Fraunces 15px
- Localisation en Inter 13px muted
- Métadonnées (surface, pièces, sdb) en mono 11px séparées par `·`

### Badges

| Badge | Classes |
|---|---|
| `COUP DE CŒUR` | `bg-terracotta text-cream rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase` |
| `NOUVEAU` | `bg-midnight text-cream rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase` |
| `EXCLUSIF` | `bg-forest text-cream rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase` |
| `À LA UNE` | `bg-midnight text-cream rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase` |

### Input / Select

- `rounded-xl border border-line bg-surface h-12 px-4 text-base`
- Focus : `ring-2 ring-terracotta/30 border-terracotta`
- Label mono au-dessus : `eyebrow` class, muted

### Bloc dual particuliers / pros

- Bloc particuliers : `bg-terracotta text-cream rounded-3xl p-8`
- Bloc pros : `bg-forest text-cream rounded-3xl p-8`
- Chaque bloc : eyebrow mono clair → titre Fraunces 28-32px → paragraphe → CTA blanc `bg-cream text-midnight rounded-full`
- Petit ornement graphique (étoile/astérisque) en haut à droite

---

## 6. Ornements et détails

### L'étoile / astérisque

Motif récurrent en haut à droite des blocs éditoriaux (voir les blocs particuliers/pros dans les maquettes). SVG simple à 4 ou 8 branches, couleur adaptée au fond (cream/30 sur fond terracotta, cream/30 sur fond forest).

### La barre verticale de section

Les H2 de section (« Sélection de la semaine », « Comment ça marche ») ont une **barre verticale terracotta de 3px à gauche**, hauteur du titre.

```html
<div class="flex items-center gap-3">
  <span class="block w-[3px] h-8 bg-terracotta"></span>
  <h2 class="display-lg">Sélection de la semaine</h2>
</div>
```

### Points finaux dans les logotypes

Le logo est **`baboo.`** avec point final en terracotta — pas de panda, pas d'ornement. Wordmark Inter ou Fraunces 700, taille variable, couleur midnight avec le point en terracotta.

---

## 7. Motion

- Hover buttons : `transition-colors duration-150 ease-out`
- Hover cards d'annonces : `hover:shadow-md transition-shadow duration-200` + `hover:-translate-y-0.5`
- Apparition de contenu : skeletons de la couleur `cream-2`, pas de spinners
- Aucune animation complexe, aucun parallax, aucune bouncy spring

---

## 8. Imagerie

- Photos d'annonces : 4:3 en grille, 16:9 en hero, object-cover
- Alt text systématique : « [Type] à [Quartier], [Ville] — [surface] m² »
- **Éviter les stock photos génériques** — privilégier de vraies photos de biens marocains (même si test = Unsplash tag `morocco`, `riad`, `casablanca`, `marrakech`)
- Pas de traitement Instagram, pas de filtres sépia

---

## 9. Accessibilité

- Contraste `midnight` sur `cream` : **12.1:1** — AAA largement ✓
- Contraste `terracotta` sur `cream` : **3.9:1** — AA large text (≥ 18px), pas AA normal text. **Donc** : terracotta utilisé UNIQUEMENT sur texte ≥ 18px bold ou sur fond solide
- Contraste `cream` sur `terracotta` : **3.9:1** — OK pour texte ≥ 18px bold (CTA)
- Contraste `muted-foreground` (#4a5368) sur cream : **6.1:1** — AA confortable ✓
- Focus ring obligatoire : `ring-2 ring-terracotta/50 ring-offset-2 ring-offset-cream`
- Tap target ≥ 44×44px sur mobile
- `aria-label` sur tous les boutons icon-only
- Labels de formulaires toujours présents

---

## 10. Checklist avant merge

- [ ] Aucun `rounded-lg`, `rounded-sm`, `rounded-none` sur des surfaces
- [ ] Aucun `bg-black`, `text-black` — toujours `bg-midnight`, `text-midnight`
- [ ] Aucun `bg-white` en fond de page — toujours `bg-cream`
- [ ] `display-hero` utilisé une seule fois max dans toute l'app (home uniquement)
- [ ] Terracotta jamais utilisé sur du texte en `text-sm` ou `text-xs` (contraste)
- [ ] Tous les boutons icon-only ont un `aria-label`
- [ ] Photos d'annonces : ratio 4:3 strict en grille
- [ ] Pas plus d'UN mot en terracotta par titre hero
