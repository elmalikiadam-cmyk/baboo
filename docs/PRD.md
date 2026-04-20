# Baboo — Product Requirements Document

## Vision

Baboo is Morocco's premium real estate discovery and lead-generation platform. It pairs a high-trust, editorial UX with a fast, map-first search experience purpose-built for Moroccan buyers, renters, agencies, and developers.

## Positioning

- **Not** a generic classifieds board.
- **Is** a curated, premium proptech product with rigorous listing quality, elegant presentation, and a serious professional back-office.
- Reference benchmarks: SeLoger (search + detail UX), Idealista (map ergonomics), Properstar (editorial cards) — adapted for Morocco.

## Personas

1. **Buyer / Renter (primary)** — urban Moroccan professional, 25-55, looking for an apartment or villa in a specific neighborhood. Mobile-first, impatient, price-sensitive, needs WhatsApp contact.
2. **Expat / diaspora buyer** — MRE (Marocains Résidant à l'Étranger) buying from abroad. Needs trust signals, high-quality photos, remote visit requests.
3. **Agency / broker** — needs to publish and manage listings, receive qualified leads, track pipeline, grow visibility.
4. **Developer / promoter** — needs a project showcase page, unit inventory, premium brand presentation.
5. **Admin / moderator (Baboo team)** — moderates content, maintains taxonomy, controls homepage curation.

## Primary journeys

1. **Discover → Filter → Contact**: Homepage search → results list+map → open listing → submit lead (form / WhatsApp / call).
2. **Save & return**: Favorite listing, save search, receive alerts, return via email.
3. **Agency publish**: Sign up → create listing → moderation → live → receive leads → manage pipeline.
4. **Developer showcase**: Create project → add units → curated spotlight on homepage.
5. **Admin moderation**: Queue of pending listings → approve/reject → feature/unfeature.

## Phase prioritization

- **Phase A (foundation)**: Homepage, search results, listing detail, favorites, basic auth, Prisma schema, seeds.
- **Phase B (pro)**: Agency dashboard, listing CRUD + moderation, lead inbox.
- **Phase C (growth)**: Saved searches + alerts, map split view, compare, SEO landing pages.
- **Phase D (trust & scale)**: Admin CMS, developer projects, analytics, verified badges, monetization.

## Information architecture

```
/                              Homepage
/recherche                     Search results (filters in URL)
/annonce/[slug]                Listing detail
/projets                       Developer projects index
/projets/[slug]                Project detail
/agence/[slug]                 Agency public page
/ville/[city]                  City landing (SEO)
/ville/[city]/[type]           City + type landing (SEO)
/favoris                       User favorites
/recherches                    User saved searches
/compte                        User profile
/pro                           Agency/developer dashboard
/admin                         Admin moderation
/connexion, /inscription       Auth
```

## Data entities (overview)

- **User** (role: USER | AGENCY | DEVELOPER | ADMIN)
- **Agency**, **Developer** (professional profiles)
- **City**, **Neighborhood**
- **PropertyType** (APARTMENT | VILLA | RIAD | HOUSE | OFFICE | COMMERCIAL | LAND | INDUSTRIAL | BUILDING)
- **Listing** (status, transaction, all physical attributes, media, geo, SEO)
- **ListingMedia**
- **Favorite**, **SavedSearch**, **Alert**
- **Lead** (inquiry on a listing)
- **Project** (developer) + **ProjectUnit**

## Non-functional requirements

- LCP < 2.5s on mid-range mobile, Morocco 4G.
- CLS < 0.1 on all core pages.
- WCAG AA minimum contrast and keyboard navigation.
- SEO-ready: server-rendered detail and landing pages, JSON-LD (RealEstateListing), sitemap, canonical URLs.
- i18n-ready architecture (FR first, AR/EN later) — copy centralized.
- Observability hooks: structured logging, analytics event bus.

## UX principles

1. **Photos first** — the listing image is the hero. Never crop it awkwardly.
2. **Price is always scannable** — large, clear, MAD currency, never ambiguous.
3. **Trust in the details** — verified agency badge, photo quality indicator, listing age, moderation status.
4. **Mobile sticky CTA** — contact is always one thumb away.
5. **No fake urgency** — no "3 people viewing now" dark patterns.
6. **Local voice** — FR copy written for Moroccan market; neighborhoods named correctly (Anfa, Gauthier, Hivernage, Agdal…).

## Risks & mitigations

- **Listing quality drift** → strict moderation + photo minimums + duplicate detection.
- **Agency spam** → rate limits on creation, verified badges, reputation.
- **Map performance** → clustering + viewport-bounded queries.
- **Cold-start content** → seed with realistic curated listings for launch cities.
