# Déployer Baboo sur Vercel — guide complet

## Pré-requis

- Un compte Vercel (gratuit)
- Un compte Supabase (gratuit, pour Postgres)
- Le repo GitHub `elmalikiadam-cmyk/baboo` connecté à Vercel

## 1. Créer la base Supabase

1. https://supabase.com/dashboard → **New project**
2. Nom : `baboo`, région **eu-west-1** (Irlande, latence correcte depuis le Maroc)
3. Mot de passe DB : génère-en un fort et **note-le dans un gestionnaire**
4. Attends ~2 min que le projet soit provisionné

### Récupérer les deux connection strings

Aller dans **Project Settings → Database**, section **Connection pooling** :

- **Transaction mode** (port 6543) → c'est ton `DATABASE_URL`
- **Session mode** (port 5432) → c'est ton `DIRECT_URL`

Format général (remplacer `PASSWORD` par ton mot de passe, URL-encoder les caractères spéciaux) :

```
# DATABASE_URL (runtime, pooler)
postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

# DIRECT_URL (migrations, pooler session)
postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-eu-west-1.pooler.supabase.com:5432/postgres
```

⚠️ **URL-encoder le mot de passe** si il contient `@ # / ! $ & + ' ( ) : ; = ? espace`. Exemple : `@` → `%40`.

## 2. Configurer Vercel

### Importer le repo

1. https://vercel.com/new
2. Import `elmalikiadam-cmyk/baboo`
3. Framework preset : **Next.js** (auto-détecté)
4. Root directory : laisser vide
5. Build command : laisser vide (celui du `package.json` fait déjà `prisma generate && next build`)

### Production branch

Vercel → Settings → **Git** → Production Branch = `main`.

### Environment Variables

Settings → **Environment Variables** → ajouter :

| Key | Value | Environments |
|---|---|---|
| `DATABASE_URL` | la string pooler (port 6543) | Production, Preview, Development |
| `DIRECT_URL` | la string session (port 5432) | Production, Preview, Development |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | Production, Preview, Development |

Optionnelles :

| Key | Usage |
|---|---|
| `ADMIN_ENABLED` | `true` pour exposer `/admin` (sinon 404) |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Token Mapbox public pour la carte |
| `RESEND_API_KEY` | Envoi d'emails transactionnels (pas encore actif) |

## 3. Seeder la base

Tu n'as pas besoin de poste local — utilise le **workflow GitHub Actions**.

### Secrets GitHub

GitHub → repo → Settings → **Secrets and variables → Actions** → New repository secret :

- `DATABASE_URL` = même string que Vercel
- `DIRECT_URL` = même string que Vercel

### Lancer le workflow

GitHub → **Actions** → **Seed database** → **Run workflow**

1. Branche : `main` (ou `claude/baboo-real-estate-platform-Q4rCr` si pas encore mergée)
2. Tape **SEED** dans le champ de confirmation
3. **Run workflow**

Le workflow fait `pnpm install && pnpm db:push && pnpm db:seed`. ~2 min.

Attendu à la fin :
```
✓ 12 cities seeded
✓ 6 agencies seeded
✓ 3 developers seeded
✓ 5 projects seeded
✓ 60 listings seeded
```

### RLS (Row-Level Security)

Pour que la clé anon (mobile / requêtes côté client) puisse lire les annonces, exécuter dans Supabase **SQL Editor** :

```sql
alter table "Listing" enable row level security;
create policy "public read published listings"
  on "Listing" for select
  using (status = 'PUBLISHED');

alter table "City" enable row level security;
create policy "public read cities" on "City" for select using (true);

alter table "Neighborhood" enable row level security;
create policy "public read neighborhoods" on "Neighborhood" for select using (true);

alter table "Agency" enable row level security;
create policy "public read agencies" on "Agency" for select using (true);

alter table "Project" enable row level security;
create policy "public read projects" on "Project" for select using (true);

alter table "ProjectUnit" enable row level security;
create policy "public read project units" on "ProjectUnit" for select using (true);
```

L'app web (server-side Prisma) n'est pas affectée par RLS, elle utilise le user `postgres` avec tous les droits. Les policies ci-dessus ne concernent que la clé anon, utilisée côté client (mobile).

## 4. Vérifier le déploiement

Une fois le deploy terminé :

| URL | Attendu |
|---|---|
| `/` | Masthead « À vendre, à louer. », grille d'annonces featured, villes |
| `/recherche` | ~60 annonces avec filtres fonctionnels |
| `/recherche?city=casablanca` | Annonces de Casablanca uniquement |
| `/annonce/<n'importe-quel-slug>` | Fiche complète + formulaire de contact qui **enregistre vraiment** |
| `/projets` | 5 programmes neufs |
| `/agences` | 6 agences avec logos |
| `/ville/casablanca` | Landing ville |
| `/contact` | Form qui enregistre un Lead |
| `/favoris`, `/recherches` | Vides au premier passage (localStorage navigateur) |

Tester le flow complet :

1. Sur une annonce, remplir le formulaire de contact → message envoyé
2. Retourner dans Supabase → Table Editor → `Lead` → la ligne doit être là
3. Cliquer le cœur sur une carte → vérifier dans `/favoris` qu'elle apparaît
4. Rechercher avec filtres → cliquer « Enregistrer cette recherche » → vérifier dans `/recherches`

## 5. Checklist de production

- [ ] `DATABASE_URL` et `DIRECT_URL` configurés dans Vercel
- [ ] `NEXTAUTH_SECRET` configuré
- [ ] Workflow `Seed database` passé au vert
- [ ] Les 6 policies RLS créées dans Supabase
- [ ] `/annonce/<slug>` — test de contact qui remonte un Lead en DB
- [ ] `/favoris` — ajout/retrait d'un favori persiste au refresh
- [ ] `/recherches` — création d'une alerte persiste
- [ ] `/admin` renvoie 404 (sauf si `ADMIN_ENABLED=true` explicite)
- [ ] `sitemap.xml` accessible
- [ ] Branding final (logo, meta-description, favicon) validé

## 6. Rotation du mot de passe

⚠️ Le mot de passe DB a été partagé dans des logs / chat pendant le setup. Avant lancement public :

1. Supabase → Project Settings → Database → **Reset database password**
2. Régénérer les 2 connection strings avec le nouveau mot de passe
3. Mettre à jour **Vercel Environment Variables** ET **GitHub Secrets**
4. Redeploy Vercel
5. Re-run workflow Seed si besoin

## 7. Erreurs fréquentes

| Symptôme | Cause probable | Fix |
|---|---|---|
| `Can't reach database server` | Région pooler incorrecte | Vérifier le host dans Supabase → Connection pooling |
| `password authentication failed` | `@` ou autre caractère spécial non URL-encodé | Remplacer `@` par `%40`, etc. |
| Pages vides malgré deploy OK | DB non seedée | Lancer le workflow `Seed database` |
| « L'ancienne version s'affiche » | Cache navigateur ou branche production | Hard refresh + vérifier Production Branch = `main` dans Vercel |
| Build OK mais erreurs Prisma dans les logs | `DATABASE_URL` absent | Ajouter la variable + redeploy (cocher les 3 environnements) |
| `Module not found: @prisma/client` | `postinstall` n'a pas tourné | Vercel → Settings → forcer `npm install` ou `pnpm install` |
