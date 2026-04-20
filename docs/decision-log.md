# Baboo — Decision Log

Chronological record of architectural decisions.

## 2026-04 — Next.js 15 App Router
Server Components + Server Actions fit a content-heavy, SEO-critical product. RSC keeps JS bundles small on listing and search pages.

## 2026-04 — PostgreSQL + Prisma
Geospatial-ready (PostGIS extension possible later), mature ORM, type-safe. SQLite is used as a zero-config local dev fallback; production targets Postgres.

## 2026-04 — URL-driven search state
All filters live in the URL query string. Enables shareable links, back-button correctness, SEO landings, and server-rendered results without client state duplication.

## 2026-04 — NextAuth over Clerk/Supabase
Free, self-hosted, flexible. Morocco has lower tolerance for per-MAU SaaS pricing in early stages. OAuth providers can be added incrementally.

## 2026-04 — Mapbox GL over Google Maps
Better styling control for a premium visual identity, cheaper at scale, supports custom tile styling. Google Maps remains the fallback if local regulatory concerns appear.

## 2026-04 — FR-only at launch
French is the commercial real estate lingua franca in Morocco. Architecture keeps copy centralized for later AR + EN localization. Not attempting multi-locale routing on day one — it would add complexity with little traffic payoff pre-launch.

## 2026-04 — Deep green + gold palette
Intentional departure from the blue/orange classifieds aesthetic. Positions Baboo as editorial and trustworthy. Gold is used sparingly as a trust accent, not decoration.

## 2026-04 — Server Actions for mutations
Native CSRF, co-located with UI, fewer moving parts than a separate API layer. `/api/*` reserved for webhooks, public JSON, and future mobile client prep.
