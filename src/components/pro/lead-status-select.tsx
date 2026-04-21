"use client";

import { useState, useTransition } from "react";
import { LeadStatus } from "@prisma/client";
import { updateLeadStatus } from "@/actions/pro-leads";

const OPTIONS: Array<{ value: LeadStatus; label: string }> = [
  { value: LeadStatus.NEW, label: "Nouveau" },
  { value: LeadStatus.CONTACTED, label: "Contacté" },
  { value: LeadStatus.QUALIFIED, label: "Qualifié" },
  { value: LeadStatus.VISIT_SCHEDULED, label: "Visite" },
  { value: LeadStatus.CLOSED, label: "Fermé" },
  { value: LeadStatus.LOST, label: "Perdu" },
];

const STYLE: Record<LeadStatus, string> = {
  NEW: "border-foreground bg-foreground text-background",
  CONTACTED: "border-foreground/30 text-foreground",
  QUALIFIED: "border-foreground/50 text-foreground",
  VISIT_SCHEDULED: "border-success/40 bg-success/10 text-success",
  CLOSED: "border-foreground/15 bg-foreground/5 text-muted-foreground",
  LOST: "border-danger/40 bg-danger/10 text-danger",
};

interface Props {
  leadId: string;
  status: LeadStatus;
}

export function LeadStatusSelect({ leadId, status: initial }: Props) {
  const [status, setStatus] = useState<LeadStatus>(initial);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as LeadStatus;
    const prev = status;
    setStatus(next);
    setError(null);
    startTransition(async () => {
      const res = await updateLeadStatus(leadId, next);
      if (!res.ok) {
        setStatus(prev);
        setError(res.error);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <select
        value={status}
        onChange={onChange}
        disabled={isPending}
        className={`mono appearance-none rounded-full border px-3 py-1 pr-7 text-[10px] uppercase tracking-[0.12em] ${STYLE[status]} disabled:opacity-60`}
        style={{
          backgroundImage:
            "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 12 12%22><path fill=%22none%22 stroke=%22currentColor%22 stroke-width=%221.5%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M3 4.5l3 3 3-3%22/></svg>')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 6px center",
        }}
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="text-[10px] text-danger">{error}</p>}
    </div>
  );
}
