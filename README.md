# Baboo

Morocco's premium real estate discovery platform.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + custom design tokens
- Prisma + PostgreSQL
- Server Components, URL-driven filters, JSON-LD SEO

## Getting started

```bash
pnpm install
cp .env.example .env    # set DATABASE_URL, NEXTAUTH_SECRET
pnpm db:push            # creates tables on the configured DB
pnpm db:seed            # seeds 60+ listings across 12 Moroccan cities
pnpm dev                # http://localhost:3000
```

Seed data includes real neighborhoods (Anfa, Gauthier, Hivernage, Agdal, Palmeraie, Malabata, Founty…) and a varied mix of apartments, villas, riads and offices with realistic MAD pricing.

## Structure

```
src/
├── app/                   # routes (App Router)
│   ├── page.tsx           # homepage
│   ├── recherche/         # search results
│   ├── annonce/[slug]/    # listing detail (SSR + JSON-LD)
│   ├── pro/               # pro landing
│   ├── connexion, inscription/
│   ├── sitemap.ts, robots.ts
│   └── layout.tsx, globals.css
├── components/            # ui / listing / search / marketing / layout
├── data/                  # cities + taxonomy
├── lib/                   # db, format, search-params, listings-query, cn
└── types/
prisma/
├── schema.prisma
└── seed.ts
docs/                      # PRD, architecture, UI guidelines, decisions
```

## Build phases

Current scope covers Phases 0–3 + core of 5–7 from the prompt pack:

- ✅ Product vision + architecture docs
- ✅ Design system foundations (tokens, Button, Input, Card, Badge, icon set)
- ✅ Prisma schema with full listing model, agencies, leads, saved searches, projects
- ✅ Premium homepage (hero, featured, cities, types, trust, pro CTA)
- ✅ Search results with filters, chips, sort, pagination, SEO metadata
- ✅ Listing detail with gallery, facts, amenities, map, contact, similar, JSON-LD, mobile sticky CTA
- ✅ Auth stubs, robots/sitemap, not-found

Next phases (not yet built, planned in docs):
- Full NextAuth wiring, favorites + saved-search persistence
- Agency dashboard with lead inbox
- Admin moderation queue
- Map split-view with Mapbox clustering
- City / type SEO landing pages with editorial content
- Analytics event bus, rate limiting, Playwright E2E
