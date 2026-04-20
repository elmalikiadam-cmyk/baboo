# Baboo — Architecture

## Stack

- **Framework**: Next.js 15 (App Router, React Server Components, Server Actions)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS v3 with CSS variables for theme tokens
- **Database**: PostgreSQL (production) / SQLite (local dev bootstrap)
- **ORM**: Prisma
- **Auth**: NextAuth.js (Credentials + OAuth-ready) — scaffolded, full wiring in Phase B
- **Forms**: React Hook Form + Zod
- **Maps**: Mapbox GL JS (lazy-loaded client component) — scaffolded, provider-swappable
- **Media**: Next/Image with remote loader (Cloudinary-ready)
- **Email**: Resend (transactional) — interface stubbed
- **Testing**: Vitest (unit), Playwright (E2E) — configured, sample tests
- **Tooling**: ESLint, Prettier, TypeScript strict, Husky-ready

## Folder structure

```
baboo/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── (marketing)/          # Public pages: homepage, SEO landings
│   │   ├── (app)/                # Authenticated user pages
│   │   ├── (pro)/                # Agency/developer dashboard
│   │   ├── admin/                # Admin moderation
│   │   ├── api/                  # Route handlers (leads, favorites, etc.)
│   │   ├── annonce/[slug]/       # Listing detail
│   │   ├── recherche/            # Search results
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                   # Design system primitives
│   │   ├── listing/              # Listing cards, gallery, facts
│   │   ├── search/               # Search bar, filters, sort
│   │   ├── layout/               # Header, footer, nav
│   │   └── marketing/            # Homepage sections
│   ├── lib/
│   │   ├── db.ts                 # Prisma client singleton
│   │   ├── auth.ts               # NextAuth config
│   │   ├── format.ts             # MAD, m², date formatters
│   │   ├── search-params.ts      # URL <-> filter state
│   │   └── validation.ts         # Zod schemas
│   ├── data/
│   │   ├── cities.ts             # Moroccan cities + neighborhoods
│   │   └── amenities.ts          # Amenity taxonomy
│   ├── types/
│   └── styles/
├── docs/
│   ├── PRD.md
│   ├── architecture.md
│   ├── ui-guidelines.md
│   └── decision-log.md
├── public/
├── tailwind.config.ts
├── next.config.mjs
├── tsconfig.json
└── package.json
```

## Rendering strategy

| Page | Rendering | Reason |
|------|-----------|--------|
| Homepage | Static with ISR (revalidate 1h) | SEO + fresh featured listings |
| Search results | Server-rendered on each request | URL-driven filters, fresh inventory |
| Listing detail | Server-rendered + JSON-LD | SEO critical, shareable |
| City / type SEO landing | SSG with ISR (revalidate 6h) | Traffic scale |
| Dashboard (pro, admin) | Dynamic (auth) | Authenticated data |
| Favorites / alerts | Dynamic (auth) | User state |

## Data flow

- **Read**: Server Components call Prisma directly via `src/lib/db.ts`.
- **Mutate**: Server Actions (`"use server"`) for forms; route handlers under `/api/*` only where a JSON HTTP endpoint is needed (webhooks, mobile client prep).
- **Filters**: Canonical URL search params → parsed by `parseSearchParams` → typed filter object → Prisma `where`. Shareable + SEO-safe.

## Caching

- Next.js `revalidate` on static pages.
- `unstable_cache` for expensive aggregations (e.g. featured listings).
- Image optimization via Next/Image.
- Map tiles and static assets via CDN.

## Security

- All mutations guarded by server-side role checks (`requireRole`).
- Zod validation on every input.
- Rate-limited lead submissions (token bucket, per IP + per listing).
- CSRF implicit via Server Actions.
- Content Security Policy headers in `next.config.mjs`.

## SEO

- Per-route `generateMetadata`.
- `<script type="application/ld+json">` for `RealEstateListing` on detail pages.
- Dynamic `sitemap.ts` and `robots.ts`.
- Canonical URLs, hreflang-ready.

## Environment

See `.env.example`. Key vars: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_MAPBOX_TOKEN`, `RESEND_API_KEY`, `CLOUDINARY_URL`.
