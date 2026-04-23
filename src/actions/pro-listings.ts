"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Transaction, PropertyType, ListingStatus, Condition, Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { toSlug, uniqueSlug as uniqueSlugFactory } from "@/lib/slug";

const ListingInput = z.object({
  title: z.string().min(5, "Titre trop court (min. 5 caractères).").max(140),
  description: z.string().min(20, "Description trop courte (min. 20 caractères).").max(8000),
  transaction: z.nativeEnum(Transaction),
  propertyType: z.nativeEnum(PropertyType),
  price: z.coerce.number().int().positive("Prix invalide."),
  surface: z.coerce.number().int().positive("Surface invalide."),
  bedrooms: z.coerce.number().int().min(0).max(30).optional().nullable(),
  bathrooms: z.coerce.number().int().min(0).max(30).optional().nullable(),
  citySlug: z.string().min(1, "Ville requise."),
  neighborhoodSlug: z.string().optional().nullable(),
  coverImage: z.string().url("URL de photo invalide."),
  additionalImages: z.string().optional().nullable(),
  condition: z.nativeEnum(Condition).optional().nullable(),
  // amenities
  parking: z.boolean().default(false),
  elevator: z.boolean().default(false),
  furnished: z.boolean().default(false),
  terrace: z.boolean().default(false),
  balcony: z.boolean().default(false),
  garden: z.boolean().default(false),
  pool: z.boolean().default(false),
  seaView: z.boolean().default(false),
  airConditioning: z.boolean().default(false),
});

export type ListingInput = z.infer<typeof ListingInput>;

export type CrudResult =
  | { ok: true; id: string; slug: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

async function uniqueListingSlug(base: string): Promise<string> {
  return uniqueSlugFactory(base, async (candidate) => {
    const hit = await db.listing.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    return !!hit;
  });
}

function parseFormData(form: FormData): Record<string, unknown> {
  const o: Record<string, unknown> = {};
  const stringKeys = [
    "title", "description", "transaction", "propertyType", "citySlug",
    "neighborhoodSlug", "coverImage", "additionalImages", "condition",
  ];
  for (const k of stringKeys) {
    const v = form.get(k);
    if (typeof v === "string" && v.length > 0) o[k] = v;
  }
  const numKeys = ["price", "surface", "bedrooms", "bathrooms"];
  for (const k of numKeys) {
    const v = form.get(k);
    if (typeof v === "string" && v.length > 0) o[k] = Number(v);
  }
  const boolKeys = [
    "parking", "elevator", "furnished", "terrace", "balcony",
    "garden", "pool", "seaView", "airConditioning",
  ];
  for (const k of boolKeys) o[k] = form.get(k) === "on";
  return o;
}

function flatten(err: z.ZodError): { error: string; fieldErrors: Record<string, string> } {
  const fieldErrors: Record<string, string> = {};
  for (const issue of err.issues) fieldErrors[issue.path.join(".")] = issue.message;
  return { error: "Formulaire invalide.", fieldErrors };
}

/** Parse un bloc texte où chaque ligne est une URL d'image. Ignore les lignes
 *  vides et filtre les URLs syntaxiquement invalides. Max 12 images. */
function parseAdditionalImages(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => {
      try {
        new URL(s);
        return true;
      } catch {
        return false;
      }
    })
    .slice(0, 12);
}

export async function createListing(form: FormData): Promise<CrudResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Non authentifié." };
  const agencyId = session.user.agencyId ?? null;
  const roles = session.user.roles ?? [session.user.role];
  const isAgency = roles.includes("AGENCY") && !!agencyId;
  const isLandlord = roles.includes("BAILLEUR");
  if (!isAgency && !isLandlord) {
    return {
      ok: false,
      error:
        "Vous devez être vérifié comme bailleur ou agence pour publier.",
    };
  }
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const raw = parseFormData(form);
  const parsed = ListingInput.safeParse(raw);
  if (!parsed.success) {
    const { error, fieldErrors } = flatten(parsed.error);
    return { ok: false, error, fieldErrors };
  }
  const data = parsed.data;

  let neighborhoodId: string | null = null;
  if (data.neighborhoodSlug) {
    const n = await db.neighborhood.findFirst({
      where: { citySlug: data.citySlug, slug: data.neighborhoodSlug },
      select: { id: true },
    });
    neighborhoodId = n?.id ?? null;
  }

  const city = await db.city.findUnique({ where: { slug: data.citySlug } });
  if (!city) return { ok: false, error: "Ville inconnue." };

  const slug = await uniqueListingSlug(toSlug(data.title));

  try {
    const additionalImages = parseAdditionalImages(data.additionalImages);
    const listing = await db.listing.create({
      data: {
        slug,
        title: data.title,
        description: data.description,
        transaction: data.transaction,
        propertyType: data.propertyType,
        status: ListingStatus.PENDING,
        price: data.price,
        surface: data.surface,
        bedrooms: data.bedrooms ?? null,
        bathrooms: data.bathrooms ?? null,
        condition: data.condition ?? null,
        coverImage: data.coverImage,
        lat: city.lat,
        lng: city.lng,
        citySlug: data.citySlug,
        neighborhoodId,
        ownerId: session.user.id,
        // Les annonces particulières (BAILLEUR sans agence) n'ont pas
        // d'agencyId — elles restent affichées sans le bandeau agence.
        agencyId: isAgency ? agencyId : null,
        parking: data.parking,
        elevator: data.elevator,
        furnished: data.furnished,
        terrace: data.terrace,
        balcony: data.balcony,
        garden: data.garden,
        pool: data.pool,
        seaView: data.seaView,
        airConditioning: data.airConditioning,
        images: additionalImages.length
          ? { create: additionalImages.map((url, i) => ({ url, position: i })) }
          : undefined,
      },
    });
    revalidatePath("/pro/listings");
    revalidatePath("/pro/dashboard");
    revalidatePath("/admin");
    return { ok: true, id: listing.id, slug: listing.slug };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return { ok: false, error: `Base : ${err.code}` };
    }
    console.error("[createListing] failed:", (err as Error).message);
    return { ok: false, error: "Création impossible." };
  }
}

export async function updateListing(id: string, form: FormData): Promise<CrudResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non authentifié." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const existing = await db.listing.findUnique({
    where: { id },
    select: { id: true, agencyId: true, ownerId: true, slug: true },
  });
  // Autorisé si l'utilisateur est l'agence propriétaire OU le owner
  // direct (cas BAILLEUR particulier).
  const canEdit =
    !!existing &&
    ((session.user.agencyId && existing.agencyId === session.user.agencyId) ||
      existing.ownerId === session.user.id);
  if (!canEdit) {
    return { ok: false, error: "Accès refusé." };
  }

  const raw = parseFormData(form);
  const parsed = ListingInput.safeParse(raw);
  if (!parsed.success) {
    const { error, fieldErrors } = flatten(parsed.error);
    return { ok: false, error, fieldErrors };
  }
  const data = parsed.data;

  let neighborhoodId: string | null = null;
  if (data.neighborhoodSlug) {
    const n = await db.neighborhood.findFirst({
      where: { citySlug: data.citySlug, slug: data.neighborhoodSlug },
      select: { id: true },
    });
    neighborhoodId = n?.id ?? null;
  }

  try {
    const additionalImages = parseAdditionalImages(data.additionalImages);
    const updated = await db.$transaction(async (tx) => {
      const u = await tx.listing.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          transaction: data.transaction,
          propertyType: data.propertyType,
          price: data.price,
          surface: data.surface,
          bedrooms: data.bedrooms ?? null,
          bathrooms: data.bathrooms ?? null,
          condition: data.condition ?? null,
          coverImage: data.coverImage,
          citySlug: data.citySlug,
          neighborhoodId,
          parking: data.parking,
          elevator: data.elevator,
          furnished: data.furnished,
          terrace: data.terrace,
          balcony: data.balcony,
          garden: data.garden,
          pool: data.pool,
          seaView: data.seaView,
          airConditioning: data.airConditioning,
        },
      });
      // On remplace les images additionnelles en bloc.
      await tx.listingMedia.deleteMany({ where: { listingId: id } });
      if (additionalImages.length) {
        await tx.listingMedia.createMany({
          data: additionalImages.map((url, i) => ({ listingId: id, url, position: i })),
        });
      }
      return u;
    });
    revalidatePath("/pro/listings");
    revalidatePath("/pro/dashboard");
    revalidatePath(`/annonce/${existing.slug}`);
    return { ok: true, id: updated.id, slug: updated.slug };
  } catch (err) {
    console.error("[updateListing] failed:", (err as Error).message);
    return { ok: false, error: "Mise à jour impossible." };
  }
}

export async function toggleListingStatus(id: string): Promise<{ ok: boolean; status?: ListingStatus; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non authentifié." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const listing = await db.listing.findUnique({
    where: { id },
    select: { agencyId: true, ownerId: true, status: true },
  });
  const canToggle =
    !!listing &&
    ((session.user.agencyId && listing.agencyId === session.user.agencyId) ||
      listing.ownerId === session.user.id);
  if (!canToggle) {
    return { ok: false, error: "Accès refusé." };
  }

  const next =
    listing.status === ListingStatus.PUBLISHED
      ? ListingStatus.ARCHIVED
      : ListingStatus.PUBLISHED;

  await db.listing.update({
    where: { id },
    data: {
      status: next,
      publishedAt: next === ListingStatus.PUBLISHED ? new Date() : undefined,
    },
  });
  revalidatePath("/pro/listings");
  revalidatePath("/pro/dashboard");
  return { ok: true, status: next };
}

export async function deleteListing(id: string): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non authentifié." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const listing = await db.listing.findUnique({
    where: { id },
    select: { agencyId: true, ownerId: true },
  });
  const canDelete =
    !!listing &&
    ((session.user.agencyId && listing.agencyId === session.user.agencyId) ||
      listing.ownerId === session.user.id);
  if (!canDelete) {
    return { ok: false, error: "Accès refusé." };
  }

  // Les leads rattachés gardent leur trace grâce à onDelete: SetNull.
  await db.listingMedia.deleteMany({ where: { listingId: id } });
  await db.favorite.deleteMany({ where: { listingId: id } });
  await db.listing.delete({ where: { id } });
  revalidatePath("/pro/listings");
  revalidatePath("/pro/dashboard");
  return { ok: true };
}

export async function createListingAndRedirect(form: FormData): Promise<never> {
  const res = await createListing(form);
  if (res.ok) redirect(`/pro/listings?created=${res.slug}`);
  throw new Error(res.error);
}
