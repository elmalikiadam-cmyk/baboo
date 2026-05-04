// Endpoint de téléchargement de documents privés (DocumentVault).
// Vérifie que l'utilisateur connecté est bien propriétaire (ou admin),
// puis renvoie une redirection vers une signed URL Supabase courte.

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { signedUrlForPrivate } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!hasDb()) {
    return NextResponse.json({ error: "no-db" }, { status: 503 });
  }
  const { id } = await ctx.params;
  const doc = await db.documentVault.findUnique({
    where: { id },
    select: { userId: true, path: true, filename: true },
  });
  if (!doc) return NextResponse.json({ error: "not-found" }, { status: 404 });

  const isOwner = doc.userId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    const url = await signedUrlForPrivate(doc.path, 60);
    return NextResponse.redirect(url);
  } catch {
    return NextResponse.json(
      { error: "storage-unavailable" },
      { status: 503 },
    );
  }
}
