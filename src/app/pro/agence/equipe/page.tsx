import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { relativeDate } from "@/lib/format";
import { TeamInviteForm } from "@/components/agency/team-invite-form";
import { TeamMemberRow } from "@/components/agency/team-member-row";

export const metadata: Metadata = {
  title: "Équipe — Baboo Pro",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function AgencyTeamPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/pro/agence/equipe");
  if (!session.user.agencyId) redirect("/pro");
  if (!hasDb()) return null;

  const agencyId = session.user.agencyId;
  const myMembership = await db.agencyMember.findFirst({
    where: { agencyId, userId: session.user.id },
    select: { role: true },
  });

  // Bootstrap : si le user est l'owner historique (Agency.userId) mais
  // n'a pas encore de ligne AgencyMember, on la crée automatiquement.
  if (!myMembership) {
    const agency = await db.agency.findUnique({
      where: { id: agencyId },
      select: { userId: true },
    });
    if (agency?.userId === session.user.id) {
      await db.agencyMember.create({
        data: {
          agencyId,
          userId: session.user.id,
          role: "OWNER",
          joinedAt: new Date(),
        },
      });
    }
  }

  const members = await db.agencyMember.findMany({
    where: { agencyId },
    orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
    include: {
      user: { select: { name: true, email: true, image: true } },
    },
  });

  const myRole =
    members.find((m) => m.userId === session.user.id)?.role ?? null;
  const canManage = myRole === "OWNER" || myRole === "MANAGER";

  return (
    <div className="container py-10 md:py-16">
      <nav aria-label="Fil d'Ariane" className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        <Link href="/pro/dashboard" className="hover:text-midnight">Tableau de bord</Link>
        <span className="mx-2">·</span>
        <span>Équipe</span>
      </nav>

      <header className="flex flex-col gap-4 border-b border-midnight/10 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Agence · équipe</p>
          <h1 className="display-xl mt-2 text-3xl md:text-5xl">
            Vos collaborateurs.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            OWNER peut tout faire · MANAGER gère les annonces et peut
            ajouter des AGENT · AGENT peut publier/modifier les annonces
            et voir les leads.
          </p>
        </div>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.3fr]">
        <section>
          <h2 className="display-md text-xl">Ajouter un collaborateur</h2>
          {canManage ? (
            <TeamInviteForm
              agencyId={agencyId}
              canPromoteManager={myRole === "OWNER"}
            />
          ) : (
            <p className="mt-4 rounded-2xl border border-dashed border-midnight/20 p-4 text-xs text-muted-foreground">
              Seul un OWNER ou un MANAGER peut ajouter de nouveaux
              collaborateurs.
            </p>
          )}
        </section>

        <section>
          <h2 className="display-md text-xl">
            Membres{" "}
            <span className="text-sm font-normal text-muted-foreground">
              ({members.length})
            </span>
          </h2>
          <ul className="mt-4 space-y-3">
            {members.map((m) => (
              <TeamMemberRow
                key={m.id}
                member={{
                  id: m.id,
                  role: m.role,
                  joinedAt: m.joinedAt.toISOString(),
                  user: {
                    name: m.user.name,
                    email: m.user.email,
                    image: m.user.image,
                  },
                }}
                isSelf={m.userId === session.user.id}
                myRole={myRole}
                joinedRelative={relativeDate(m.joinedAt)}
              />
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
