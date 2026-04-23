"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma, ProjectStatus, PropertyType } from "@prisma/client";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { toSlug, uniqueSlug as uniqueSlugFactory } from "@/lib/slug";

export type ProjectResult =
  | { ok: true; id: string; slug: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

const projectSchema = z.object({
  name: z.string().trim().min(3, "Nom requis (3 caractères minimum).").max(140),
  description: z.string().trim().min(20, "Description trop courte.").max(8000),
  cover: z.string().url("URL de visuel invalide."),
  citySlug: z.string().trim().min(1, "Ville requise."),
  addressLine: z.string().trim().max(200).optional().or(z.literal("")).transform((v) => v || null),
  deliveryYear: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v === undefined || v === "" ? null : Number(v)))
    .refine((v) => v === null || (Number.isInteger(v) && v >= 2020 && v <= 2100), {
      message: "Année de livraison invalide.",
    }),
  status: z.nativeEnum(ProjectStatus).default(ProjectStatus.SELLING),
});

type ParsedProject = z.infer<typeof projectSchema>;

function flatten(err: z.ZodError): { error: string; fieldErrors: Record<string, string> } {
  const fieldErrors: Record<string, string> = {};
  for (const issue of err.issues) fieldErrors[issue.path.join(".")] = issue.message;
  return { error: "Formulaire invalide.", fieldErrors };
}

async function uniqueProjectSlug(base: string, ignoreId?: string): Promise<string> {
  return uniqueSlugFactory(base, async (candidate) => {
    const existing = await db.project.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    return !!existing && existing.id !== ignoreId;
  });
}

function parseForm(form: FormData): Record<string, unknown> {
  const o: Record<string, unknown> = {};
  for (const key of ["name", "description", "cover", "citySlug", "addressLine", "status"]) {
    const v = form.get(key);
    if (typeof v === "string" && v.length > 0) o[key] = v;
  }
  const year = form.get("deliveryYear");
  if (typeof year === "string" && year.length > 0) o.deliveryYear = year;
  return o;
}

function toData(p: ParsedProject) {
  return {
    name: p.name,
    description: p.description,
    cover: p.cover,
    citySlug: p.citySlug,
    addressLine: p.addressLine,
    deliveryYear: p.deliveryYear,
    status: p.status,
  };
}

export async function createProject(form: FormData): Promise<ProjectResult> {
  const session = await auth();
  if (!session?.user?.developerId) return { ok: false, error: "Compte promoteur requis." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const parsed = projectSchema.safeParse(parseForm(form));
  if (!parsed.success) return { ok: false, ...flatten(parsed.error) };

  const slug = await uniqueProjectSlug(toSlug(parsed.data.name));
  try {
    const p = await db.project.create({
      data: {
        ...toData(parsed.data),
        slug,
        developerId: session.user.developerId,
      },
    });
    revalidatePath("/developer/dashboard");
    revalidatePath("/developer/projets");
    revalidatePath("/projets");
    return { ok: true, id: p.id, slug: p.slug };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return { ok: false, error: `Base : ${err.code}` };
    }
    console.error("[createProject] failed:", (err as Error).message);
    return { ok: false, error: "Création impossible." };
  }
}

export async function updateProject(id: string, form: FormData): Promise<ProjectResult> {
  const session = await auth();
  if (!session?.user?.developerId) return { ok: false, error: "Compte promoteur requis." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const existing = await db.project.findUnique({
    where: { id },
    select: { id: true, developerId: true, slug: true, name: true },
  });
  if (!existing || existing.developerId !== session.user.developerId) {
    return { ok: false, error: "Accès refusé." };
  }

  const parsed = projectSchema.safeParse(parseForm(form));
  if (!parsed.success) return { ok: false, ...flatten(parsed.error) };

  // Renouvelle le slug si le nom change significativement.
  let slug = existing.slug;
  if (parsed.data.name !== existing.name) {
    slug = await uniqueProjectSlug(toSlug(parsed.data.name), existing.id);
  }

  try {
    const updated = await db.project.update({
      where: { id },
      data: { ...toData(parsed.data), slug },
    });
    revalidatePath("/developer/dashboard");
    revalidatePath("/developer/projets");
    revalidatePath(`/projets/${updated.slug}`);
    revalidatePath("/projets");
    return { ok: true, id: updated.id, slug: updated.slug };
  } catch (err) {
    console.error("[updateProject] failed:", (err as Error).message);
    return { ok: false, error: "Mise à jour impossible." };
  }
}

export async function deleteProject(id: string): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.developerId) return { ok: false, error: "Compte promoteur requis." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const existing = await db.project.findUnique({
    where: { id },
    select: { developerId: true, slug: true },
  });
  if (!existing || existing.developerId !== session.user.developerId) {
    return { ok: false, error: "Accès refusé." };
  }

  try {
    await db.projectUnit.deleteMany({ where: { projectId: id } });
    await db.project.delete({ where: { id } });
    revalidatePath("/developer/projets");
    revalidatePath("/developer/dashboard");
    revalidatePath("/projets");
    return { ok: true };
  } catch (err) {
    console.error("[deleteProject] failed:", (err as Error).message);
    return { ok: false, error: "Suppression impossible." };
  }
}

const unitSchema = z.object({
  projectId: z.string().cuid(),
  label: z.string().trim().min(1).max(80),
  propertyType: z.nativeEnum(PropertyType),
  bedrooms: z.coerce.number().int().min(0).max(30).optional().nullable(),
  surface: z.coerce.number().int().positive(),
  price: z.coerce.number().int().positive(),
  available: z.boolean().optional().default(true),
});

export async function createProjectUnit(
  input: unknown,
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.developerId) return { ok: false, error: "Compte promoteur requis." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };
  const parsed = unitSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalide." };
  }
  const project = await db.project.findUnique({
    where: { id: parsed.data.projectId },
    select: { developerId: true, slug: true },
  });
  if (!project || project.developerId !== session.user.developerId) {
    return { ok: false, error: "Accès refusé." };
  }
  try {
    await db.projectUnit.create({
      data: {
        projectId: parsed.data.projectId,
        label: parsed.data.label,
        propertyType: parsed.data.propertyType,
        bedrooms: parsed.data.bedrooms ?? null,
        surface: parsed.data.surface,
        price: parsed.data.price,
        available: parsed.data.available,
      },
    });
    revalidatePath(`/developer/projets/${parsed.data.projectId}`);
    revalidatePath(`/projets/${project.slug}`);
    return { ok: true };
  } catch (err) {
    console.error("[createProjectUnit] failed:", (err as Error).message);
    return { ok: false, error: "Création impossible." };
  }
}

export async function deleteProjectUnit(id: string): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.developerId) return { ok: false, error: "Compte promoteur requis." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };
  const unit = await db.projectUnit.findUnique({
    where: { id },
    select: { project: { select: { id: true, developerId: true, slug: true } } },
  });
  if (!unit || unit.project.developerId !== session.user.developerId) {
    return { ok: false, error: "Accès refusé." };
  }
  try {
    await db.projectUnit.delete({ where: { id } });
    revalidatePath(`/developer/projets/${unit.project.id}`);
    revalidatePath(`/projets/${unit.project.slug}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Suppression impossible." };
  }
}
