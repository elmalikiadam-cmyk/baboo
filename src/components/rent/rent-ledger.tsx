"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import {
  recordPayment,
  deletePayment,
  generateReceipt,
  waiveRentPeriod,
} from "@/actions/rent";

type PaymentLite = {
  id: string;
  amount: number;
  method: string;
  reference: string | null;
  paidAt: string;
  declaredByRole: string;
  declaredByName: string | null;
};

type Period = {
  id: string;
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  amountRent: number;
  amountCharges: number;
  amountTotal: number;
  status: "DUE" | "PARTIALLY_PAID" | "PAID" | "LATE" | "WAIVED";
  payments: PaymentLite[];
  receiptUrl: string | null;
  receiptFilename: string | null;
};

const STATUS_TONE: Record<Period["status"], string> = {
  DUE: "bg-midnight/10 text-midnight",
  PARTIALLY_PAID: "bg-terracotta/15 text-terracotta",
  PAID: "bg-forest/15 text-forest",
  LATE: "bg-danger/15 text-danger",
  WAIVED: "bg-muted/20 text-muted-foreground",
};

const STATUS_LABEL: Record<Period["status"], string> = {
  DUE: "À payer",
  PARTIALLY_PAID: "Partiel",
  PAID: "Payé",
  LATE: "En retard",
  WAIVED: "Offert",
};

const METHOD_LABEL: Record<string, string> = {
  BANK_TRANSFER: "Virement",
  CASH: "Espèces",
  CHECK: "Chèque",
  STANDING_ORDER: "Virement permanent",
  OTHER: "Autre",
};

export function RentLedger({
  role,
  periods,
}: {
  role: "LANDLORD" | "TENANT";
  periods: Period[];
}) {
  if (periods.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-midnight/20 p-6 text-center text-sm text-muted-foreground">
        Aucune période de loyer pour le moment. Les périodes sont
        générées automatiquement une fois le bail actif.
      </div>
    );
  }

  // Affichage inverse chrono : la période courante en haut.
  const ordered = [...periods].sort(
    (a, b) => new Date(b.periodStart).getTime() - new Date(a.periodStart).getTime(),
  );

  return (
    <ul className="space-y-3">
      {ordered.map((p) => (
        <PeriodRow key={p.id} period={p} role={role} />
      ))}
    </ul>
  );
}

function PeriodRow({
  period,
  role,
}: {
  period: Period;
  role: "LANDLORD" | "TENANT";
}) {
  const [expanded, setExpanded] = useState(false);
  const totalPaid = period.payments.reduce((s, p) => s + p.amount, 0);
  const remaining = Math.max(0, period.amountTotal - totalPaid);

  const periodStart = new Date(period.periodStart);
  const periodLabel = periodStart.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  return (
    <li className="rounded-xl border border-midnight/10 bg-cream p-4">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full flex-wrap items-start justify-between gap-3 text-left"
      >
        <div className="min-w-0">
          <p className="display-lg text-base capitalize">{periodLabel}</p>
          <p className="mono mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Échéance{" "}
            {new Date(period.dueDate).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
            })}
            {" · "}
            {period.amountTotal.toLocaleString("fr-FR")} MAD
            {period.amountCharges > 0 && (
              <>
                {" ("}
                {period.amountRent.toLocaleString("fr-FR")} loyer +{" "}
                {period.amountCharges.toLocaleString("fr-FR")} charges)
              </>
            )}
          </p>
          {totalPaid > 0 && period.status !== "PAID" && (
            <p className="mt-1 text-xs text-midnight">
              Reçu {totalPaid.toLocaleString("fr-FR")} MAD — reste{" "}
              {remaining.toLocaleString("fr-FR")} MAD
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 mono text-[10px] uppercase tracking-[0.12em] ${STATUS_TONE[period.status]}`}
          >
            {STATUS_LABEL[period.status]}
          </span>
          {period.receiptUrl && (
            <a
              href={period.receiptUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="rounded-full border border-midnight/20 px-3 py-1 text-[11px] text-midnight hover:border-midnight"
            >
              Quittance
            </a>
          )}
          <span className="mono text-[14px] text-midnight">
            {expanded ? "−" : "+"}
          </span>
        </div>
      </button>

      {expanded && (
        <div className="mt-4 space-y-4 border-t border-midnight/10 pt-4">
          {period.payments.length > 0 && (
            <section>
              <p className="eyebrow">Paiements enregistrés</p>
              <ul className="mt-2 space-y-2">
                {period.payments.map((p) => (
                  <PaymentItem key={p.id} payment={p} role={role} />
                ))}
              </ul>
            </section>
          )}

          {period.status !== "PAID" &&
            period.status !== "WAIVED" &&
            remaining > 0 && (
              <NewPaymentForm
                rentPeriodId={period.id}
                suggestedAmount={remaining}
              />
            )}

          {role === "LANDLORD" && (
            <LandlordActions
              rentPeriodId={period.id}
              status={period.status}
              hasReceipt={!!period.receiptUrl}
            />
          )}
        </div>
      )}
    </li>
  );
}

function PaymentItem({
  payment,
  role,
}: {
  payment: PaymentLite;
  role: "LANDLORD" | "TENANT";
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onDelete() {
    if (!confirm("Supprimer ce paiement ?")) return;
    startTransition(async () => {
      await deletePayment(payment.id);
      router.refresh();
    });
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-midnight/5 bg-white px-3 py-2 text-xs">
      <div className="min-w-0 flex-1">
        <p className="text-midnight">
          <strong>{payment.amount.toLocaleString("fr-FR")} MAD</strong>
          {" · "}
          {METHOD_LABEL[payment.method] ?? payment.method}
          {payment.reference && ` · réf. ${payment.reference}`}
        </p>
        <p className="mt-0.5 mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
          Payé le{" "}
          {new Date(payment.paidAt).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
          {" · déclaré par "}
          {payment.declaredByRole === "LANDLORD" ? "bailleur" : "locataire"}
          {payment.declaredByName && ` (${payment.declaredByName})`}
        </p>
      </div>
      {role === "LANDLORD" && (
        <button
          type="button"
          onClick={onDelete}
          disabled={isPending}
          className="rounded-full border border-midnight/20 px-2 py-0.5 text-[10px] text-midnight hover:border-danger hover:text-danger"
        >
          {isPending ? "…" : "Retirer"}
        </button>
      )}
    </li>
  );
}

function NewPaymentForm({
  rentPeriodId,
  suggestedAmount,
}: {
  rentPeriodId: string;
  suggestedAmount: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await recordPayment(rentPeriodId, form);
      if (res.ok) {
        setOpen(false);
        router.refresh();
      } else {
        setError(res.error);
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-terracotta px-4 py-2 text-xs font-semibold text-cream hover:bg-terracotta-2"
      >
        + Enregistrer un paiement
      </button>
    );
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-3 rounded-xl border border-midnight/10 bg-white p-4"
      noValidate
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="rp-amount">Montant (MAD)</Label>
          <Input
            id="rp-amount"
            name="amount"
            type="number"
            min={1}
            defaultValue={suggestedAmount}
            required
          />
          {fieldErrors.amount && (
            <p className="text-[11px] text-danger">{fieldErrors.amount}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="rp-method">Méthode</Label>
          <Select id="rp-method" name="method" defaultValue="BANK_TRANSFER">
            <option value="BANK_TRANSFER">Virement</option>
            <option value="CASH">Espèces</option>
            <option value="CHECK">Chèque</option>
            <option value="STANDING_ORDER">Virement permanent</option>
            <option value="OTHER">Autre</option>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="rp-paidAt">Date du paiement</Label>
          <Input
            id="rp-paidAt"
            name="paidAt"
            type="date"
            defaultValue={today}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="rp-reference">Référence (optionnel)</Label>
          <Input
            id="rp-reference"
            name="reference"
            placeholder="N° virement, N° chèque…"
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="rp-notes">Notes (optionnel)</Label>
          <Textarea id="rp-notes" name="notes" rows={2} maxLength={2000} />
        </div>
      </div>
      {error && (
        <p className="rounded-full bg-danger/10 px-3 py-1.5 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "…" : "Enregistrer"}
        </Button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={isPending}
          className="rounded-full border border-midnight/20 px-4 py-2 text-xs font-medium text-midnight"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}

function LandlordActions({
  rentPeriodId,
  status,
  hasReceipt,
}: {
  rentPeriodId: string;
  status: Period["status"];
  hasReceipt: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (res.ok) router.refresh();
      else if (res.error) setError(res.error);
    });
  }

  return (
    <div className="flex flex-wrap gap-2 border-t border-midnight/5 pt-3">
      {status === "PAID" && (
        <button
          type="button"
          onClick={() => run(() => generateReceipt(rentPeriodId))}
          disabled={isPending}
          className="rounded-full bg-forest px-3 py-1.5 text-[11px] font-semibold text-cream disabled:opacity-50"
        >
          {isPending ? "…" : hasReceipt ? "Régénérer la quittance" : "Générer la quittance"}
        </button>
      )}
      {(status === "DUE" || status === "LATE") && (
        <button
          type="button"
          onClick={() => {
            if (!confirm("Abandonner le loyer de cette période ?")) return;
            run(() => waiveRentPeriod(rentPeriodId));
          }}
          disabled={isPending}
          className="rounded-full border border-midnight/20 px-3 py-1.5 text-[11px] font-medium text-midnight hover:border-midnight"
        >
          Offrir ce mois
        </button>
      )}
      {error && (
        <p className="w-full text-[11px] text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
