"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import {
  PhoneIcon,
  WhatsAppIcon,
  CheckIcon,
  ShieldCheckIcon,
} from "@/components/ui/icons";
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

/**
 * V2 "Maison ouverte" : carte sticky rounded-3xl, avatar terracotta avec
 * initiales en Fraunces 500, check olive si vérifié, formulaire rounded-full
 * + textarea rounded-2xl, CTA primary ink full-width, rangée Appeler/WhatsApp
 * en variant soft.
 */
export function ContactCard({ listingId, listingTitle, agency, phone }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
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
        if (res.conversationId) setConversationId(res.conversationId);
      } else {
        setError(res.error);
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
      }
    });
  }

  const displayName = agency?.name ?? "Annonceur";
  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();

  return (
    <aside
      id="contact-form"
      className="sticky top-24 rounded-3xl border border-border bg-cream p-5 md:p-6"
    >
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-terracotta text-cream font-display text-[17px] font-medium">
          {agency?.logo ? (
            <Image
              src={agency.logo}
              alt={agency.name}
              width={48}
              height={48}
              className="h-12 w-12 object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="display-md truncate text-[15px] leading-tight">{displayName}</p>
            {agency?.verified && (
              <ShieldCheckIcon
                className="h-3.5 w-3.5 shrink-0 text-forest"
                aria-label="Agence vérifiée"
              />
            )}
          </div>
          <p className="mt-0.5 text-[11px] text-muted">
            {agency
              ? agency.verified
                ? "Agence vérifiée"
                : "Professionnel"
              : "Particulier"}
          </p>
        </div>
      </div>

      {submitted ? (
        <div className="mt-5 rounded-2xl border border-forest/30 bg-forest-soft p-5 text-center">
          <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-forest text-cream">
            <CheckIcon className="h-4 w-4" />
          </span>
          <p className="display-md mt-3 text-[17px]">Message envoyé.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {conversationId
              ? "Une conversation a été ouverte. Suivez la réponse dans votre messagerie."
              : `${displayName} vous répondra rapidement.`}
          </p>
          {conversationId && (
            <Link
              href={`/messages/${conversationId}`}
              className="mt-4 inline-flex h-10 items-center rounded-full bg-midnight px-4 text-sm font-medium text-cream hover:bg-midnight/90"
            >
              Ouvrir la conversation
            </Link>
          )}
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-5 space-y-3" noValidate>
          <Field id="c-name" label="Votre nom" error={fieldErrors.name}>
            <Input id="c-name" name="name" required autoComplete="name" placeholder="Salma A." />
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
            <Input
              id="c-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+212 6 00 00 00 00"
            />
          </Field>
          <Field id="c-message" label="Message" error={fieldErrors.message}>
            <Textarea
              id="c-message"
              name="message"
              rows={4}
              required
              defaultValue={`Bonjour, je suis intéressé(e) par « ${listingTitle} ». Pourriez-vous me contacter pour organiser une visite ?`}
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
              href={phone ? `tel:${phone.replace(/\s+/g, "")}` : undefined}
              aria-disabled={!phone}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-cream-2 text-sm font-medium text-midnight hover:bg-cream-3 aria-disabled:pointer-events-none aria-disabled:opacity-50"
            >
              <PhoneIcon className="h-4 w-4" aria-hidden /> Appeler
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
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-cream-2 text-sm font-medium text-midnight hover:bg-cream-3 aria-disabled:pointer-events-none aria-disabled:opacity-50"
            >
              <WhatsAppIcon className="h-4 w-4" aria-hidden /> WhatsApp
            </a>
          </div>

          <p className="pt-2 text-[11px] leading-relaxed text-muted">
            En envoyant ce message, vous acceptez que vos coordonnées soient transmises au
            professionnel en charge de l'annonce. Vos données sont traitées conformément à la loi
            09-08.
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
