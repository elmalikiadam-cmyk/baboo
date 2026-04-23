"use server";

// Server actions — demandes d'intervention (service requests).
//
// Flow V1 simple :
//   1. Demandeur crée une ServiceRequest (OPEN), optionnellement
//      rattachée à un bail.
//   2. Demandeur assigne un artisan via le directory → ASSIGNED.
//   3. Artisan ouvre la demande et accepte → ACCEPTED puis
//      IN_PROGRESS (marque « en cours ») puis COMPLETED.
//   4. Une partie peut annuler à tout moment avant COMPLETED.
//
// Les échanges directs (tel/WhatsApp) se font hors plateforme en V1.
// Le flow multi-devis (plusieurs artisans, propose, retenu) est
// reporté à une V2.

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { CraftsmanSpeciality, ServiceRequestStatus } from "@prisma/client";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

type ErrResult = {
  ok: false;
  error: string;
  fieldErrors?: Record<string, string>;
};
type Result = { ok: true } | ErrResult;
type ResultWith<T> = ({ ok: true } & T) | ErrResult;

function flattenZod(err: z.ZodError): {
  error: string;
  fieldErrors: Record<string, string>;
} {
  const fieldErrors: Record<string, string> = {};
  for (const i of err.issues) fieldErrors[i.path.join(".")] = i.message;
  return { error: "Données invalides.", fieldErrors };
}

const createSchema = z
  .object({
    speciality: z.nativeEnum(CraftsmanSpeciality),
    title: z.string().trim().min(3).max(140),
    description: z.string().trim().min(10).max(4000),
    budgetMin: z.coerce.number().int().min(0).max(10_000_000).optional(),
    budgetMax: z.coerce.number().int().min(0).max(10_000_000).optional(),
    urgency: z.string().trim().max(120).optional().or(z.literal("")),
    leaseId: z.string().trim().optional().or(z.literal("")),
  })
  .refine(
    (v) =>
      v.budgetMin === undefined ||
      v.budgetMax === undefined ||
      v.budgetMin <= v.budgetMax,
    { message: "Budget min > max", path: ["budgetMax"] },
  );

/**
 * Crée une demande d'intervention. Si `leaseId` est fourni, on vérifie
 * que le user est bien partie du bail (bailleur OU locataire).
 */
export async function createServiceRequest(
  form: FormData,
): Promise<ResultWith<{ id: string }>> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const rl = await rateLimit({
    key: `service-request:${session.user.id}`,
    limit: 20,
    windowSec: 3600,
  });
  if (!rl.success) return { ok: false, error: "Trop de demandes récentes." };

  const parsed = createSchema.safeParse({
    speciality: form.get("speciality") ?? CraftsmanSpeciality.AUTRE,
    title: form.get("title") ?? "",
    description: form.get("description") ?? "",
    budgetMin: form.get("budgetMin") ?? undefined,
    budgetMax: form.get("budgetMax") ?? undefined,
    urgency: form.get("urgency") ?? "",
    leaseId: form.get("leaseId") ?? "",
  });
  if (!parsed.success) return { ok: false, ...flattenZod(parsed.error) };
  const d = parsed.data;

  let propertyId: string | null = null;
  let leaseId: string | null = null;
  if (d.leaseId) {
    const lease = await db.lease.findUnique({
      where: { id: d.leaseId },
      select: {
        id: true,
        propertyId: true,
        landlordUserId: true,
        tenantUserId: true,
        listing: { select: { agencyId: true } },
      },
    });
    if (!lease) return { ok: false, error: "Bail introuvable." };

    const canUse =
      lease.landlordUserId === session.user.id ||
      lease.tenantUserId === session.user.id ||
      (!!session.user.agencyId && lease.listing?.agencyId === session.user.agencyId);
    if (!canUse) return { ok: false, error: "Bail inaccessible." };

    leaseId = lease.id;
    propertyId = lease.propertyId;
  }

  const request = await db.serviceRequest.create({
    data: {
      leaseId,
      propertyId,
      requesterUserId: session.user.id,
      speciality: d.speciality,
      title: d.title,
      description: d.description,
      budgetMin: d.budgetMin ?? null,
      budgetMax: d.budgetMax ?? null,
      urgency: d.urgency ? d.urgency : null,
      status: ServiceRequestStatus.OPEN,
    },
    select: { id: true },
  });

  revalidatePath("/bailleur/interventions");
  revalidatePath("/locataire/interventions");
  return { ok: true, id: request.id };
}

/**
 * Attribue une demande OPEN à un artisan. Le demandeur seul peut
 * assigner. Passe le statut à ASSIGNED — l'artisan devra accepter.
 */
export async function assignCraftsman(
  requestId: string,
  craftsmanId: string,
): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const req = await db.serviceRequest.findUnique({
    where: { id: requestId },
    select: { requesterUserId: true, status: true },
  });
  if (!req) return { ok: false, error: "Demande introuvable." };
  if (req.requesterUserId !== session.user.id) {
    return { ok: false, error: "Accès refusé." };
  }
  if (
    req.status !== ServiceRequestStatus.OPEN &&
    req.status !== ServiceRequestStatus.ASSIGNED
  ) {
    return { ok: false, error: "Demande déjà engagée ou clôturée." };
  }

  const craftsman = await db.craftsman.findUnique({
    where: { id: craftsmanId },
    select: { id: true },
  });
  if (!craftsman) return { ok: false, error: "Artisan introuvable." };

  await db.serviceRequest.update({
    where: { id: requestId },
    data: {
      assignedCraftsmanId: craftsmanId,
      status: ServiceRequestStatus.ASSIGNED,
      assignedAt: new Date(),
      acceptedAt: null,
    },
  });

  revalidatePath("/bailleur/interventions");
  revalidatePath("/locataire/interventions");
  revalidatePath("/pro/artisan");
  return { ok: true };
}

/**
 * Transition de statut côté artisan. Valide qu'il s'agit bien de
 * l'artisan assigné. Passages supportés : ASSIGNED → ACCEPTED →
 * IN_PROGRESS → COMPLETED. L'artisan peut aussi refuser (→ OPEN
 * re-libère la demande avec un message de refus).
 */
export async function craftsmanUpdateRequestStatus(
  requestId: string,
  next: ServiceRequestStatus,
  reason?: string,
): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const myCraftsman = await db.craftsman.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!myCraftsman) return { ok: false, error: "Profil artisan requis." };

  const req = await db.serviceRequest.findUnique({
    where: { id: requestId },
    select: { assignedCraftsmanId: true, status: true, requesterUserId: true },
  });
  if (!req) return { ok: false, error: "Demande introuvable." };
  if (req.assignedCraftsmanId !== myCraftsman.id) {
    return { ok: false, error: "Demande non attribuée à vous." };
  }

  const allowed: Record<ServiceRequestStatus, ServiceRequestStatus[]> = {
    OPEN: [],
    ASSIGNED: [
      ServiceRequestStatus.ACCEPTED,
      ServiceRequestStatus.OPEN, // refus → re-libère
    ],
    ACCEPTED: [ServiceRequestStatus.IN_PROGRESS, ServiceRequestStatus.CANCELLED],
    IN_PROGRESS: [
      ServiceRequestStatus.COMPLETED,
      ServiceRequestStatus.CANCELLED,
    ],
    COMPLETED: [],
    CANCELLED: [],
  };
  if (!allowed[req.status].includes(next)) {
    return { ok: false, error: "Transition de statut invalide." };
  }

  const now = new Date();
  await db.serviceRequest.update({
    where: { id: requestId },
    data: {
      status: next,
      acceptedAt: next === ServiceRequestStatus.ACCEPTED ? now : undefined,
      completedAt: next === ServiceRequestStatus.COMPLETED ? now : undefined,
      cancelledAt: next === ServiceRequestStatus.CANCELLED ? now : undefined,
      cancellationReason:
        next === ServiceRequestStatus.CANCELLED
          ? reason?.trim().slice(0, 500) ?? null
          : undefined,
      // Si l'artisan refuse (retour OPEN), on le désattribue.
      assignedCraftsmanId:
        next === ServiceRequestStatus.OPEN ? null : undefined,
      assignedAt: next === ServiceRequestStatus.OPEN ? null : undefined,
    },
  });

  revalidatePath("/bailleur/interventions");
  revalidatePath("/locataire/interventions");
  revalidatePath("/pro/artisan");
  return { ok: true };
}

/**
 * Annulation côté demandeur (avant complétion).
 */
export async function cancelServiceRequest(
  requestId: string,
  reason?: string,
): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const req = await db.serviceRequest.findUnique({
    where: { id: requestId },
    select: { requesterUserId: true, status: true },
  });
  if (!req) return { ok: false, error: "Demande introuvable." };
  if (req.requesterUserId !== session.user.id) {
    return { ok: false, error: "Accès refusé." };
  }
  if (
    req.status === ServiceRequestStatus.COMPLETED ||
    req.status === ServiceRequestStatus.CANCELLED
  ) {
    return { ok: false, error: "Demande déjà clôturée." };
  }

  await db.serviceRequest.update({
    where: { id: requestId },
    data: {
      status: ServiceRequestStatus.CANCELLED,
      cancelledAt: new Date(),
      cancellationReason: reason?.trim().slice(0, 500) ?? null,
    },
  });

  revalidatePath("/bailleur/interventions");
  revalidatePath("/locataire/interventions");
  revalidatePath("/pro/artisan");
  return { ok: true };
}
