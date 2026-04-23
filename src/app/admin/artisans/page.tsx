import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { relativeDate } from "@/lib/format";
import { CraftsmanVerifyButton } from "@/components/admin/craftsman-verify-button";

export const metadata: Metadata = {
  title: "Admin · Artisans — Baboo",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function AdminCraftsmenPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion?callbackUrl=/admin/artisans");
  if (session.user.role !== "ADMIN") redirect("/");
  if (!hasDb()) return null;

  const pending = await db.craftsman.findMany({
    where: { verified: false },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  const verified = await db.craftsman.findMany({
    where: { verified: true },
    orderBy: { verifiedAt: "desc" },
    take: 20,
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  return (
    <div className="container py-10 md:py-16">
      <header className="border-b border-midnight/10 pb-6">
        <p className="eyebrow">Admin · artisans</p>
        <h1 className="display-xl mt-2 text-4xl md:text-5xl">
          Vérification des profils.
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Appelez le numéro du profil, confirmez l'identité et la
          spécialité, puis cliquez « Vérifier ».
        </p>
      </header>

      <section className="mt-10">
        <h2 className="display-md text-xl">
          En attente{" "}
          <span className="text-sm font-normal text-muted-foreground">
            ({pending.length})
          </span>
        </h2>
        {pending.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-midnight/20 p-8 text-center text-sm text-muted-foreground">
            File vide.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {pending.map((c) => (
              <li
                key={c.id}
                className="rounded-xl border border-midnight/10 bg-cream p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/artisans/${c.slug}`}
                      target="_blank"
                      className="display-lg text-base hover:text-terracotta"
                    >
                      {c.displayName}
                    </Link>
                    <p className="mono mt-0.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      {c.speciality} · {c.phone}
                      {c.user.email && ` · ${c.user.email}`}
                      {" · inscrit "}
                      {relativeDate(c.createdAt)}
                    </p>
                  </div>
                  <CraftsmanVerifyButton
                    craftsmanId={c.id}
                    verified={false}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {verified.length > 0 && (
        <section className="mt-12">
          <h2 className="display-md text-xl">Dernièrement vérifiés</h2>
          <ul className="mt-4 space-y-2">
            {verified.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-midnight/5 bg-white px-4 py-2 text-xs"
              >
                <Link
                  href={`/artisans/${c.slug}`}
                  target="_blank"
                  className="min-w-0 truncate text-midnight hover:text-terracotta"
                >
                  {c.displayName} · {c.speciality}
                </Link>
                <CraftsmanVerifyButton craftsmanId={c.id} verified={true} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
