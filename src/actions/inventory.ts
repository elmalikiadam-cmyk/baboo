"use server";

// Server actions — état des lieux (EDL).
//
// L'EDL est édité en commun par le bailleur et le locataire. Chacun
// peut ajouter des pièces, annoter, uploader des photos. La validation
// est contradictoire : chaque partie coche « Je valide » indépendamment.
// Lorsque les deux ont validé, le statut passe à VALIDATED et le
// rapport devient immuable (conformité article 6 loi 67-12).
//
// Autorisation :
//   - Lecture/édition : bailleur (ownerId, agencyId) OU locataire du
//     bail associé.
//   - Chaque partie ne peut cocher que sa propre validation.
//   - Après VALIDATED, plus d'édition possible.

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  InventoryStatus,
  InventoryType,
  RoomCondition,
} from "@prisma/client";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import {
  isPrivateStorageEnabled,
  uploadToPrivateStorage,
  deleteFromPrivateStorage,
} from "@/lib/storage";

// Résultat ok/err pour les actions — deux formes : avec payload typé,
// ou sans. On évite un générique à valeur par défaut qui introduit
// des soucis d'intersection avec Record<string, never>.
type ErrResult = {
  ok: false;
  error: string;
  fieldErrors?: Record<string, string>;
};
type Result = { ok: true } | ErrResult;
type ResultWith<T> = ({ ok: true } & T) | ErrResult;

/**
 * Vérifie qu'un user est partie du bail rattaché au rapport.
 * Retourne la dénomination de son rôle dans le bail, ou null.
 */
async function resolveRole(
  reportId: string,
  userId: string,
  agencyId: string | null | undefined,
): Promise<"LANDLORD" | "TENANT" | null> {
  const report = await db.inventoryReport.findUnique({
    where: { id: reportId },
    select: {
      lease: {
        select: {
          landlordUserId: true,
          tenantUserId: true,
          listing: { select: { agencyId: true } },
        },
      },
    },
  });
  if (!report) return null;
  if (
    report.lease.landlordUserId === userId ||
    (!!agencyId && report.lease.listing?.agencyId === agencyId)
  ) {
    return "LANDLORD";
  }
  if (report.lease.tenantUserId === userId) return "TENANT";
  return null;
}

const DEFAULT_ROOMS: Array<{ name: string; order: number }> = [
  { name: "Entrée", order: 0 },
  { name: "Salon", order: 1 },
  { name: "Cuisine", order: 2 },
  { name: "Chambre 1", order: 3 },
  { name: "Salle de bain", order: 4 },
];

/**
 * Crée un rapport d'EDL pour un bail (un par type : ENTRY ou EXIT).
 * Idempotent — si un rapport du même type existe déjà, on le retourne.
 * Initialise avec 5 pièces par défaut pour que l'utilisateur voie
 * immédiatement une structure.
 */
export async function createInventoryReport(
  leaseId: string,
  type: InventoryType,
): Promise<ResultWith<{ id: string }>> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const lease = await db.lease.findUnique({
    where: { id: leaseId },
    select: {
      id: true,
      status: true,
      landlordUserId: true,
      tenantUserId: true,
      listing: { select: { agencyId: true } },
    },
  });
  if (!lease) return { ok: false, error: "Bail introuvable." };

  const isLandlord =
    lease.landlordUserId === session.user.id ||
    (!!session.user.agencyId && lease.listing?.agencyId === session.user.agencyId);
  const isTenant = lease.tenantUserId === session.user.id;
  if (!isLandlord && !isTenant) {
    return { ok: false, error: "Accès refusé." };
  }

  // L'EDL d'entrée est possible dès que le bail est SIGNED_UPLOADED
  // ou ACTIVE ; l'EDL de sortie nécessite un bail ACTIVE ou TERMINATED.
  if (type === InventoryType.ENTRY) {
    if (
      lease.status !== "SIGNED_UPLOADED" &&
      lease.status !== "ACTIVE"
    ) {
      return {
        ok: false,
        error: "L'EDL d'entrée s'ouvre une fois le bail signé.",
      };
    }
  }
  if (type === InventoryType.EXIT) {
    if (lease.status !== "ACTIVE" && lease.status !== "TERMINATED") {
      return {
        ok: false,
        error: "L'EDL de sortie n'est disponible qu'au départ du locataire.",
      };
    }
  }

  const existing = await db.inventoryReport.findUnique({
    where: { leaseId_type: { leaseId, type } },
    select: { id: true },
  });
  if (existing) return { ok: true, id: existing.id };

  const report = await db.inventoryReport.create({
    data: {
      leaseId,
      type,
      status: InventoryStatus.DRAFT,
      createdBy: session.user.id,
      rooms: {
        create: DEFAULT_ROOMS,
      },
    },
    select: { id: true },
  });

  revalidatePath(`/bailleur/baux/${leaseId}`);
  revalidatePath(`/locataire/baux/${leaseId}`);
  return { ok: true, id: report.id };
}

const updateReportSchema = z.object({
  generalNotes: z.string().trim().max(4000).optional(),
});

export async function updateInventoryReport(
  reportId: string,
  form: FormData,
): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const role = await resolveRole(reportId, session.user.id, session.user.agencyId);
  if (!role) return { ok: false, error: "Accès refusé." };

  const report = await db.inventoryReport.findUnique({
    where: { id: reportId },
    select: { status: true },
  });
  if (!report) return { ok: false, error: "Rapport introuvable." };
  if (report.status === InventoryStatus.VALIDATED) {
    return { ok: false, error: "Rapport verrouillé (déjà validé)." };
  }

  const parsed = updateReportSchema.safeParse({
    generalNotes: form.get("generalNotes") ?? "",
  });
  if (!parsed.success) return { ok: false, error: "Données invalides." };

  await db.inventoryReport.update({
    where: { id: reportId },
    data: {
      generalNotes: parsed.data.generalNotes
        ? parsed.data.generalNotes
        : null,
      // Toute édition réinitialise les validations : si l'une des
      // parties avait validé, elle doit re-valider après correction.
      landlordValidated: false,
      landlordValidatedAt: null,
      tenantValidated: false,
      tenantValidatedAt: null,
    },
  });

  revalidatePath(`/edl/${reportId}`);
  return { ok: true };
}

const addRoomSchema = z.object({
  name: z.string().trim().min(1).max(80),
});

export async function addInventoryRoom(
  reportId: string,
  form: FormData,
): Promise<ResultWith<{ id: string }>> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const role = await resolveRole(reportId, session.user.id, session.user.agencyId);
  if (!role) return { ok: false, error: "Accès refusé." };

  const report = await db.inventoryReport.findUnique({
    where: { id: reportId },
    select: { status: true, _count: { select: { rooms: true } } },
  });
  if (!report) return { ok: false, error: "Rapport introuvable." };
  if (report.status === InventoryStatus.VALIDATED) {
    return { ok: false, error: "Rapport verrouillé." };
  }

  const parsed = addRoomSchema.safeParse({ name: form.get("name") ?? "" });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Nom invalide.",
      fieldErrors: { name: "1 à 80 caractères." },
    };
  }

  const room = await db.inventoryRoom.create({
    data: {
      reportId,
      name: parsed.data.name,
      order: report._count.rooms,
    },
    select: { id: true },
  });

  // Réinitialise les validations
  await db.inventoryReport.update({
    where: { id: reportId },
    data: {
      landlordValidated: false,
      landlordValidatedAt: null,
      tenantValidated: false,
      tenantValidatedAt: null,
    },
  });

  revalidatePath(`/edl/${reportId}`);
  return { ok: true, id: room.id };
}

const updateRoomSchema = z.object({
  name: z.string().trim().min(1).max(80),
  condition: z.nativeEnum(RoomCondition),
  notes: z.string().trim().max(4000).optional(),
});

export async function updateInventoryRoom(
  roomId: string,
  form: FormData,
): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const room = await db.inventoryRoom.findUnique({
    where: { id: roomId },
    select: { reportId: true, report: { select: { status: true } } },
  });
  if (!room) return { ok: false, error: "Pièce introuvable." };

  const role = await resolveRole(
    room.reportId,
    session.user.id,
    session.user.agencyId,
  );
  if (!role) return { ok: false, error: "Accès refusé." };
  if (room.report.status === InventoryStatus.VALIDATED) {
    return { ok: false, error: "Rapport verrouillé." };
  }

  const parsed = updateRoomSchema.safeParse({
    name: form.get("name") ?? "",
    condition: form.get("condition") ?? RoomCondition.GOOD,
    notes: form.get("notes") ?? "",
  });
  if (!parsed.success) return { ok: false, error: "Données invalides." };

  await db.$transaction([
    db.inventoryRoom.update({
      where: { id: roomId },
      data: {
        name: parsed.data.name,
        condition: parsed.data.condition,
        notes: parsed.data.notes ? parsed.data.notes : null,
      },
    }),
    db.inventoryReport.update({
      where: { id: room.reportId },
      data: {
        landlordValidated: false,
        landlordValidatedAt: null,
        tenantValidated: false,
        tenantValidatedAt: null,
      },
    }),
  ]);

  revalidatePath(`/edl/${room.reportId}`);
  return { ok: true };
}

export async function deleteInventoryRoom(roomId: string): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const room = await db.inventoryRoom.findUnique({
    where: { id: roomId },
    select: { reportId: true, report: { select: { status: true } } },
  });
  if (!room) return { ok: false, error: "Pièce introuvable." };

  const role = await resolveRole(
    room.reportId,
    session.user.id,
    session.user.agencyId,
  );
  if (!role) return { ok: false, error: "Accès refusé." };
  if (room.report.status === InventoryStatus.VALIDATED) {
    return { ok: false, error: "Rapport verrouillé." };
  }

  // Supprime les photos associées dans le bucket privé avant de
  // supprimer la pièce (best-effort — si le delete storage échoue, on
  // continue, les fichiers orphelins seront nettoyés par un cron).
  const photos = await db.documentVault.findMany({
    where: { category: "INVENTORY", relatedEntityId: roomId },
    select: { id: true, path: true },
  });
  for (const p of photos) {
    await deleteFromPrivateStorage(p.path);
  }
  if (photos.length > 0) {
    await db.documentVault.deleteMany({
      where: { id: { in: photos.map((p) => p.id) } },
    });
  }

  await db.$transaction([
    db.inventoryRoom.delete({ where: { id: roomId } }),
    db.inventoryReport.update({
      where: { id: room.reportId },
      data: {
        landlordValidated: false,
        landlordValidatedAt: null,
        tenantValidated: false,
        tenantValidatedAt: null,
      },
    }),
  ]);

  revalidatePath(`/edl/${room.reportId}`);
  return { ok: true };
}

const MAX_PHOTO_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_PHOTO_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic", // iOS
]);

function randomId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

/**
 * Upload d'une photo pour une pièce. Stockée dans le bucket privé
 * (path : inventory/<reportId>/<roomId>/…), référencée dans
 * DocumentVault (category=INVENTORY, relatedEntityId=roomId).
 * Re-set les validations à false.
 */
export async function addInventoryPhoto(
  roomId: string,
  form: FormData,
): Promise<ResultWith<{ id: string }>> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };
  if (!isPrivateStorageEnabled()) {
    return { ok: false, error: "Espace documents privé indisponible." };
  }

  const rl = await rateLimit({
    key: `inventory-photo:${session.user.id}`,
    limit: 200,
    windowSec: 3600,
  });
  if (!rl.success) {
    return { ok: false, error: "Trop d'uploads récents." };
  }

  const room = await db.inventoryRoom.findUnique({
    where: { id: roomId },
    select: { reportId: true, report: { select: { status: true } } },
  });
  if (!room) return { ok: false, error: "Pièce introuvable." };

  const role = await resolveRole(
    room.reportId,
    session.user.id,
    session.user.agencyId,
  );
  if (!role) return { ok: false, error: "Accès refusé." };
  if (room.report.status === InventoryStatus.VALIDATED) {
    return { ok: false, error: "Rapport verrouillé." };
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Photo manquante." };
  }
  if (!ALLOWED_PHOTO_TYPES.has(file.type)) {
    return { ok: false, error: "Format non supporté (JPEG/PNG/WebP/HEIC)." };
  }
  if (file.size > MAX_PHOTO_SIZE) {
    return { ok: false, error: "Photo trop volumineuse (max 10 Mo)." };
  }

  const ext = file.type === "image/heic" ? "heic" : file.type.split("/")[1] ?? "bin";
  const path = `inventory/${room.reportId}/${roomId}/${Date.now()}-${randomId()}.${ext}`;
  try {
    const buf = await file.arrayBuffer();
    await uploadToPrivateStorage({
      objectPath: path,
      body: buf,
      contentType: file.type,
    });
  } catch (err) {
    console.error("[inventory/photo] upload failed:", (err as Error).message);
    return { ok: false, error: "Upload échoué." };
  }

  const doc = await db.documentVault.create({
    data: {
      userId: session.user.id,
      category: "INVENTORY",
      path,
      filename: file.name.slice(0, 200) || `photo-${Date.now()}.${ext}`,
      mimeType: file.type,
      size: file.size,
      relatedEntityId: roomId,
    },
    select: { id: true },
  });

  await db.inventoryReport.update({
    where: { id: room.reportId },
    data: {
      landlordValidated: false,
      landlordValidatedAt: null,
      tenantValidated: false,
      tenantValidatedAt: null,
    },
  });

  revalidatePath(`/edl/${room.reportId}`);
  return { ok: true, id: doc.id };
}

export async function deleteInventoryPhoto(photoId: string): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const doc = await db.documentVault.findUnique({
    where: { id: photoId },
    select: { path: true, category: true, relatedEntityId: true },
  });
  if (!doc || doc.category !== "INVENTORY" || !doc.relatedEntityId) {
    return { ok: false, error: "Photo introuvable." };
  }

  const room = await db.inventoryRoom.findUnique({
    where: { id: doc.relatedEntityId },
    select: { reportId: true, report: { select: { status: true } } },
  });
  if (!room) return { ok: false, error: "Pièce introuvable." };

  const role = await resolveRole(
    room.reportId,
    session.user.id,
    session.user.agencyId,
  );
  if (!role) return { ok: false, error: "Accès refusé." };
  if (room.report.status === InventoryStatus.VALIDATED) {
    return { ok: false, error: "Rapport verrouillé." };
  }

  await deleteFromPrivateStorage(doc.path);
  await db.documentVault.delete({ where: { id: photoId } });
  await db.inventoryReport.update({
    where: { id: room.reportId },
    data: {
      landlordValidated: false,
      landlordValidatedAt: null,
      tenantValidated: false,
      tenantValidatedAt: null,
    },
  });

  revalidatePath(`/edl/${room.reportId}`);
  return { ok: true };
}

/**
 * Coche la validation de la partie qui appelle. Si les deux sont
 * cochées, le rapport passe à VALIDATED (figé). La validation est
 * strictement individuelle : le bailleur ne peut pas cocher pour le
 * locataire et inversement.
 */
export async function validateInventoryReport(
  reportId: string,
): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const role = await resolveRole(reportId, session.user.id, session.user.agencyId);
  if (!role) return { ok: false, error: "Accès refusé." };

  const report = await db.inventoryReport.findUnique({
    where: { id: reportId },
    select: {
      status: true,
      landlordValidated: true,
      tenantValidated: true,
    },
  });
  if (!report) return { ok: false, error: "Rapport introuvable." };
  if (report.status === InventoryStatus.VALIDATED) return { ok: true };

  const now = new Date();
  const landlord = role === "LANDLORD" ? true : report.landlordValidated;
  const tenant = role === "TENANT" ? true : report.tenantValidated;
  const bothValidated = landlord && tenant;

  await db.inventoryReport.update({
    where: { id: reportId },
    data: {
      landlordValidated: landlord,
      landlordValidatedAt:
        role === "LANDLORD" ? now : undefined,
      tenantValidated: tenant,
      tenantValidatedAt: role === "TENANT" ? now : undefined,
      status: bothValidated ? InventoryStatus.VALIDATED : InventoryStatus.DRAFT,
    },
  });

  revalidatePath(`/edl/${reportId}`);
  return { ok: true };
}

/**
 * Retire la validation de la partie qui appelle. Utile pour corriger
 * après un clic prématuré, ou si la partie veut bloquer la finalisation.
 */
export async function unvalidateInventoryReport(
  reportId: string,
): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const role = await resolveRole(reportId, session.user.id, session.user.agencyId);
  if (!role) return { ok: false, error: "Accès refusé." };

  const report = await db.inventoryReport.findUnique({
    where: { id: reportId },
    select: { status: true },
  });
  if (!report) return { ok: false, error: "Rapport introuvable." };
  if (report.status === InventoryStatus.VALIDATED) {
    return { ok: false, error: "Rapport déjà finalisé par les deux parties." };
  }

  await db.inventoryReport.update({
    where: { id: reportId },
    data: {
      landlordValidated:
        role === "LANDLORD" ? false : undefined,
      landlordValidatedAt: role === "LANDLORD" ? null : undefined,
      tenantValidated: role === "TENANT" ? false : undefined,
      tenantValidatedAt: role === "TENANT" ? null : undefined,
    },
  });

  revalidatePath(`/edl/${reportId}`);
  return { ok: true };
}
