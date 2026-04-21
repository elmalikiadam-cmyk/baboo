"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { PhoneIcon, WhatsAppIcon, CheckIcon } from "@/components/ui/icons";
import { submitLead } from "@/actions/leads";

interface Props {
  listingId: string;
  listingTitle: string;
  agency?: {
    name: string;
    slug: string;
    verified: boolean;
    logo?: string | null;
  } | null;
  phone?: string | null;
}

export function ContactCard({ listingId, listingTitle, agency, phone }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError(null);
    setFieldErrors({});

    const payload = {
      listingId,
      source: "form" as const,
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      message: String(form.get("message") ?? ""),
    };

    startTransition(async () => {
      const res = await submitLead(payload);
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(res.error);
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
      }
    });
  }

  return (
    <aside id="contact-form" className="sticky top-24 rounded-md border border-foreground/15 bg-surface p-6">
      {agency && (
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-foreground/5 text-sm font-semibold text-foreground">
            {agency.logo ? (
              <Image
                src={agency.logo}
                alt={agency.name}
                width={44}
                height={44}
                className="rounded-full object-cover"
              />
            ) : (
              agency.name
                .split(" ")
                .slice(0, 2)
                .map((w) => w[0])
                .join("")
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{agency.name}</p>
            {agency.verified && (
              <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <CheckIcon className="h-3.5 w-3.5" /> Agence vérifiée
              </p>
            )}
          </div>
        </div>
      )}

      {submitted ? (
        <div className="rounded-md border border-success/30 bg-success/5 p-5 text-center">
          <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-success/15 text-success">
            <CheckIcon className="h-5 w-5" />
          </span>
          <h3 className="mt-3 font-display text-lg font-semibold">Message envoyé.</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            L'agence vous répondra rapidement. Pensez à vérifier votre boîte de réception.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3" noValidate>
          <Field id="c-name" label="Votre nom" error={fieldErrors.name}>
            <Input id="c-name" name="name" required autoComplete="name" placeholder="Sofia Bennani" />
          </Field>
          <Field id="c-email" label="Email" error={fieldErrors.email}>
            <Input
              id="c-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="vous@email.ma"
            />
          </Field>
          <Field id="c-phone" label="Téléphone" error={fieldErrors.phone}>
            <Input id="c-phone" name="phone" type="tel" autoComplete="tel" placeholder="+212 6 00 00 00 00" />
          </Field>
          <Field id="c-message" label="Message" error={fieldErrors.message}>
            <textarea
              id="c-message"
              name="message"
              rows={4}
              required
              defaultValue={`Bonjour, je suis intéressé(e) par "${listingTitle}". Pourriez-vous me contacter pour organiser une visite ?`}
              className="flex w-full rounded-md border border-foreground/15 bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/10"
            />
          </Field>

          {error && (
            <p className="rounded-full bg-danger/10 px-3 py-2 text-xs text-danger" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={isPending}>
            {isPending ? "Envoi…" : "Envoyer une demande"}
          </Button>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href={phone ? `tel:${phone.replace(/\s+/g, "")}` : "#"}
              aria-disabled={!phone}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-foreground/15 bg-surface px-4 py-2.5 text-sm font-medium text-foreground hover:bg-foreground/5"
            >
              <PhoneIcon className="h-4 w-4" /> Appeler
            </a>
            <a
              href={
                phone
                  ? `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                      `Bonjour, je suis intéressé(e) par "${listingTitle}" sur Baboo.`,
                    )}`
                  : "#"
              }
              target="_blank"
              rel="noreferrer"
              aria-disabled={!phone}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-success/10 px-4 py-2.5 text-sm font-medium text-success hover:bg-success/15"
            >
              <WhatsAppIcon className="h-4 w-4" /> WhatsApp
            </a>
          </div>

          <p className="pt-2 text-[11px] leading-relaxed text-muted-foreground">
            En envoyant ce message, vous acceptez que vos coordonnées soient transmises au professionnel en charge de l'annonce.
          </p>
        </form>
      )}
    </aside>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-[11px] text-danger">{error}</p>}
    </div>
  );
}
