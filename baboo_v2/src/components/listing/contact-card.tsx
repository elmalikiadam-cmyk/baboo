"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, MessageCircle, Check, ShieldCheck } from "@/components/ui/icons";

interface Props {
  listingTitle: string;
  publisherName: string;
  publisherVerified: boolean;
  publisherType: "PRO" | "PARTICULIER";
  phone?: string | null;
}

/**
 * Sidebar contact sur fiche détail. Sticky sur desktop, visible dans le flux
 * sur mobile (le sticky-CTA flottant gère l'appel à l'action principal mobile).
 * TODO : brancher l'envoi réel côté serveur (pas d'auth ni DB pour le lead
 * dans cette V2 front — à compléter en back-end).
 */
export function ContactCard({
  listingTitle,
  publisherName,
  publisherVerified,
  publisherType,
  phone,
}: Props) {
  const [submitted, setSubmitted] = useState(false);
  const initials = publisherName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO : submit vers /api (non implémenté dans cette V2 front-only).
    setSubmitted(true);
  }

  return (
    <aside className="sticky top-24 rounded-3xl border border-border bg-surface p-5 md:p-6">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-accent text-ink-foreground font-display text-[17px] font-medium tracking-tight">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="display-md text-[15px] leading-tight">{publisherName}</p>
            {publisherVerified && (
              <ShieldCheck size={14} className="shrink-0 text-success" aria-hidden />
            )}
          </div>
          <p className="mt-0.5 text-[11px] text-ink-muted">
            {publisherType === "PRO"
              ? publisherVerified
                ? "Agence vérifiée"
                : "Professionnel"
              : "Particulier"}
          </p>
        </div>
      </div>

      {submitted ? (
        <div className="mt-5 rounded-2xl border border-success/30 bg-success-soft p-5 text-center">
          <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-success text-ink-foreground">
            <Check size={18} strokeWidth={2.2} aria-hidden />
          </span>
          <p className="display-md mt-3 text-[17px]">Message envoyé.</p>
          <p className="mt-1 text-sm text-ink-soft">
            {publisherName} vous répondra rapidement.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-5 space-y-3" noValidate>
          <Field id="c-name" label="Nom">
            <Input id="c-name" name="name" required autoComplete="name" placeholder="Salma A." />
          </Field>
          <Field id="c-email" label="Email">
            <Input
              id="c-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="vous@email.ma"
            />
          </Field>
          <Field id="c-phone" label="Téléphone">
            <Input
              id="c-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+212 6 00 00 00 00"
            />
          </Field>
          <Field id="c-message" label="Message">
            <Textarea
              id="c-message"
              name="message"
              rows={4}
              defaultValue={`Bonjour, je suis intéressé(e) par « ${listingTitle} ». Pourriez-vous me contacter pour organiser une visite ?`}
              required
            />
          </Field>

          <Button type="submit" size="lg" className="w-full">
            Envoyer une demande
          </Button>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href={phone ? `tel:${phone.replace(/\s+/g, "")}` : undefined}
              aria-disabled={!phone}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-surface-warm text-sm font-medium text-ink hover:bg-surface-cool aria-disabled:opacity-50 aria-disabled:pointer-events-none"
            >
              <Phone size={15} strokeWidth={1.8} aria-hidden />
              Appeler
            </a>
            <a
              href={
                phone
                  ? `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                      `Bonjour, je suis intéressé(e) par « ${listingTitle} » sur Baboo.`,
                    )}`
                  : undefined
              }
              target="_blank"
              rel="noreferrer"
              aria-disabled={!phone}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-surface-warm text-sm font-medium text-ink hover:bg-surface-cool aria-disabled:opacity-50 aria-disabled:pointer-events-none"
            >
              <MessageCircle size={15} strokeWidth={1.8} aria-hidden />
              WhatsApp
            </a>
          </div>

          <p className="pt-2 text-[11px] leading-relaxed text-ink-muted">
            En envoyant ce message, vous acceptez que vos coordonnées soient transmises au
            publiant. Vos données sont traitées conformément à la loi 09-08.
          </p>
        </form>
      )}
    </aside>
  );
}

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}
