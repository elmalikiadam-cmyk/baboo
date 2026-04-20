# Baboo — UI Guidelines

## Brand voice

Premium, trustworthy, local. Editorial, not flashy. French-first copy with Moroccan real estate vocabulary (quartier, appartement, villa, riad, surface habitable, charges, vis-à-vis).

## Color palette

Tokens live in `globals.css` as CSS variables and are exposed to Tailwind via `tailwind.config.ts`.

| Token | Light | Usage |
|-------|-------|-------|
| `--background` | `#FAFAF7` | Page bg, warm off-white |
| `--foreground` | `#0F1419` | Primary text |
| `--muted` | `#6B7280` | Secondary text |
| `--border` | `#E5E5E0` | Hairlines |
| `--surface` | `#FFFFFF` | Cards |
| `--primary` | `#0B3D2E` | Baboo deep green — CTAs, links |
| `--primary-foreground` | `#FAFAF7` | Text on primary |
| `--accent` | `#C9A961` | Baboo gold — trust marks, highlights |
| `--success` | `#2F7D5B` | Verified, success states |
| `--danger` | `#B3261E` | Destructive |

Rationale: deep green + warm off-white + editorial gold = premium, timeless, differentiated from the generic blue/orange of classifieds.

## Typography

- **Display**: Fraunces (variable, serif) — headings on marketing pages, listing titles.
- **Body / UI**: Inter (variable, sans) — body, UI, forms.

Scale (Tailwind):
- `text-xs` 12 / `text-sm` 14 / `text-base` 16 / `text-lg` 18 / `text-xl` 20 / `text-2xl` 24 / `text-3xl` 30 / `text-4xl` 36 / `text-5xl` 48 / `text-6xl` 60

Line-height: 1.5 body, 1.15 display.

## Spacing

4px base grid. Section vertical rhythm: `py-16 md:py-24` marketing, `py-8` app.

## Radius

`rounded-lg` (10px) default cards, `rounded-xl` (14px) hero & featured cards, `rounded-full` pills/chips.

## Shadows

Subtle only. `shadow-sm` for cards at rest, `shadow-lg` on hover for listing cards. Never heavy drop shadows.

## Components

- **Button**: solid (primary), outline, ghost, link. Minimum tap target 44px on mobile.
- **Card**: surface bg, 1px border, subtle hover elevation, rounded.
- **Input**: 44px tall, clear focus ring (`ring-2 ring-primary/30`), error state red border + message.
- **ListingCard**: photo 4:3, price bold above title, neighborhood/city below, key facts row, favorite button top-right.
- **Chip / FilterPill**: rounded-full, removable.
- **Badge**: "Vérifié", "Nouveau", "Exclusivité" — small, accent color.

## Motion

- Hover: 150ms ease-out.
- Page transitions: none (Next.js default). Skeletons during data fetch.
- No bouncy springs. No confetti.

## Imagery

- Never stretch. Use `object-cover`. 4:3 for cards, 16:9 for hero, full aspect on detail gallery.
- Always include alt text derived from listing title + neighborhood.
- Lazy-load below the fold.

## Accessibility

- All interactive elements reachable by keyboard.
- Focus ring always visible (`focus-visible:ring-2`).
- Color contrast ≥ 4.5:1 for body, 3:1 for large text.
- Form labels always present (not placeholder-only).

## Do / Don't

- ✅ Use whitespace generously.
- ✅ Use the gold accent sparingly (trust marks, featured badges).
- ✅ Use serif for display only.
- ❌ No gradients in brand UI. No emoji. No stock-photo clichés.
- ❌ No "4.9★★★★★ based on 12,483 reviews" vanity widgets.
