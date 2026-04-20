# Déployer Baboo sur Vercel — étape par étape

## 1. Créer la base de données (avant tout)

Sans base, le build passe mais les pages `/recherche` et `/annonce/...` renvoient des listes vides.

Option la plus simple : **Neon** (gratuit, serverless Postgres).

1. Va sur https://neon.tech → sign up (gratuit)
2. Crée un projet `baboo-prod`
3. Copie la **connection string** (elle commence par `postgresql://user:password@ep-...neon.tech/neondb?sslmode=require`)
4. Garde-la ouverte dans un onglet pour l'étape 3

Alternatives : **Vercel Postgres** (Vercel → Storage → Create → Postgres), **Supabase**, **Railway**.

## 2. Importer le repo dans Vercel

1. https://vercel.com/new
2. **Import Git Repository** → choisis `elmalikiadam-cmyk/baboo`
3. **Framework Preset** : Next.js (détecté auto)
4. **Root Directory** : laisse vide (racine du repo)
5. **Build Command** : laisse vide (le `build` script du `package.json` est déjà `prisma generate && next build`)
6. **Install Command** : laisse vide
7. **Output Directory** : laisse vide

## 3. Configurer les variables d'environnement

Avant de cliquer "Deploy", déroule **Environment Variables** et ajoute :

| Key | Value | Environments |
|-----|-------|--------------|
| `DATABASE_URL` | la connection string Neon | Production, Preview, Development |
| `NEXTAUTH_SECRET` | génère avec `openssl rand -base64 32` | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://baboo.vercel.app` (ou ton domaine) | Production |

Les autres (Mapbox, Resend, Cloudinary) sont optionnelles à ce stade.

## 4. Déployer

Clique **Deploy**. Le build va :

1. `pnpm install` (ou npm) → déclenche `postinstall` → `prisma generate`
2. `pnpm build` → `prisma generate && next build`
3. Déployer les fonctions Edge/Server

Ça prend ~2 min.

## 5. Initialiser la base (une seule fois)

Après le premier déploiement, ta base est vide. Depuis ton poste local :

```bash
# pointer sur la prod (temporairement)
export DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require"

# créer les tables
pnpm db:push

# seeder 60+ annonces
pnpm db:seed

# revenir à ta base locale si besoin
unset DATABASE_URL
```

Ou, mieux, depuis l'UI Neon : va dans SQL Editor et lance le seed via un script.

Rafraîchis ton site Vercel → les annonces apparaissent.

## 6. Déploiements suivants

Chaque push sur `main` déclenche un deploy prod. Chaque push sur une autre branche (ex: `claude/baboo-real-estate-platform-Q4rCr`) déclenche un **Preview deploy** avec une URL temporaire.

## Erreurs fréquentes et solutions

### "PrismaClient is unable to be run in the browser"
→ tu fais un `import { db }` dans un composant client. Garde les appels Prisma dans Server Components / Server Actions / Route Handlers.

### "Can't reach database server"
→ `DATABASE_URL` n'est pas set, mal écrit, ou Neon est en pause (plan gratuit). Redémarre Neon et re-deploy.

### "Module not found: @prisma/client"
→ `postinstall` n'a pas tourné. Dans Vercel → Settings → Build & Development Settings, force **Install Command** à `pnpm install --frozen-lockfile=false` ou `npm install`.

### "React RC version conflict"
→ déjà corrigé : on est sur React 19 stable + Next 15.1.6.

### "X-Frame-Options bloque l'iframe OSM"
→ l'iframe embed OSM dans nos pages (pas l'inverse), pas de conflit.

### Le site charge mais la recherche est vide
→ c'est normal si la base n'a pas été seedée. Voir étape 5.
