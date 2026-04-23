"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  removeAgencyMember,
  updateAgencyMemberRole,
} from "@/actions/agency-team";
import type { AgencyMemberRole } from "@prisma/client";

const ROLE_LABEL: Record<AgencyMemberRole, string> = {
  OWNER: "Owner",
  MANAGER: "Manager",
  AGENT: "Agent",
};
const ROLE_TONE: Record<AgencyMemberRole, string> = {
  OWNER: "bg-terracotta/15 text-terracotta",
  MANAGER: "bg-forest/15 text-forest",
  AGENT: "bg-midnight/10 text-midnight",
};

type Member = {
  id: string;
  role: AgencyMemberRole;
  joinedAt: string;
  user: { name: string | null; email: string; image: string | null };
};

export function TeamMemberRow({
  member,
  isSelf,
  myRole,
  joinedRelative,
}: {
  member: Member;
  isSelf: boolean;
  myRole: AgencyMemberRole | null;
  joinedRelative: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingRole, setEditingRole] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canEdit =
    myRole === "OWNER" || (myRole === "MANAGER" && member.role === "AGENT");
  const canChangeRole = myRole === "OWNER";

  function onRemove() {
    if (!confirm(`Retirer ${member.user.name ?? member.user.email} de l'équipe ?`)) return;
    setError(null);
    startTransition(async () => {
      const res = await removeAgencyMember(member.id);
      if (res.ok) router.refresh();
      else setError(res.error);
    });
  }

  function onChangeRole(role: AgencyMemberRole) {
    setError(null);
    startTransition(async () => {
      const res = await updateAgencyMemberRole(member.id, role);
      if (res.ok) {
        setEditingRole(false);
        router.refresh();
      } else setError(res.error);
    });
  }

  const initials = (member.user.name ?? member.user.email)
    .split(/[\s@]/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <li className="rounded-xl border border-midnight/10 bg-cream p-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-midnight font-display text-sm text-cream">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="display-lg truncate text-base">
            {member.user.name ?? member.user.email}
            {isSelf && <span className="ml-2 text-xs text-muted-foreground">(vous)</span>}
          </p>
          <p className="mono mt-0.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {member.user.email} · a rejoint {joinedRelative}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {editingRole && canChangeRole ? (
            <>
              {(["OWNER", "MANAGER", "AGENT"] as AgencyMemberRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => onChangeRole(r)}
                  disabled={isPending || r === member.role}
                  className="rounded-full border border-midnight/20 px-3 py-1 text-[11px] font-medium text-midnight hover:border-midnight disabled:opacity-40"
                >
                  {ROLE_LABEL[r]}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setEditingRole(false)}
                disabled={isPending}
                className="text-[11px] text-muted-foreground"
              >
                Annuler
              </button>
            </>
          ) : (
            <>
              <span className={`rounded-full px-3 py-1 mono text-[10px] uppercase tracking-[0.12em] ${ROLE_TONE[member.role]}`}>
                {ROLE_LABEL[member.role]}
              </span>
              {canChangeRole && !isSelf && (
                <button
                  type="button"
                  onClick={() => setEditingRole(true)}
                  className="rounded-full border border-midnight/20 px-3 py-1 text-[11px] text-midnight hover:border-midnight"
                >
                  Modifier
                </button>
              )}
              {canEdit && (
                <button
                  type="button"
                  onClick={onRemove}
                  disabled={isPending}
                  className="rounded-full border border-midnight/20 px-3 py-1 text-[11px] text-midnight hover:border-danger hover:text-danger"
                >
                  {isPending ? "…" : "Retirer"}
                </button>
              )}
            </>
          )}
        </div>
      </div>
      {error && (
        <p className="mt-2 rounded-full bg-danger/10 px-3 py-1.5 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </li>
  );
}
