import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isStorageEnabled, uploadToStorage } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_SIZE = 8 * 1024 * 1024; // 8 MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

function randomId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export async function POST(req: Request): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non connecté." }, { status: 401 });
  }
  if (!isStorageEnabled()) {
    return NextResponse.json(
      { error: "Upload non configuré côté serveur." },
      { status: 503 },
    );
  }

  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Fichier manquant." }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "Format non supporté (JPEG/PNG/WebP/AVIF)." },
      { status: 400 },
    );
  }
  if (file.size === 0 || file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Fichier trop volumineux (max 8 Mo)." },
      { status: 400 },
    );
  }

  const ext = file.type.split("/")[1]?.replace("jpeg", "jpg") ?? "bin";
  const objectPath = `listings/${session.user.id}/${Date.now()}-${randomId()}.${ext}`;
  try {
    const buf = await file.arrayBuffer();
    const url = await uploadToStorage({
      objectPath,
      body: buf,
      contentType: file.type,
    });
    return NextResponse.json({ ok: true, url });
  } catch (err) {
    console.error("[/api/upload] failed:", (err as Error).message);
    return NextResponse.json({ error: "Upload impossible." }, { status: 500 });
  }
}
