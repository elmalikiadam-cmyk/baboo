"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { PhoneIcon, WhatsAppIcon, ShieldIcon, CheckIcon } from "@/components/ui/icons";

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

export function ContactCard({ listingTitle, agency, phone }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    // Real lead submission will hit a server action in Phase B.
    // For now, simulate a successful send to demonstrate the UX.
    await new Promise((r) => setTimeout(r, 500));
    setIsPending(false);
    setSubmitted(true);
  }

  return (
    <aside className="sticky top-20 rounded-2xl border border-border bg-surface p-5 shadow-card">
      {agency && (
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-foreground/5 text-sm font-semibold text-foreground">
            {agency.logo ? (
              <Image src={agency.logo} alt={agency.name} width={44} height={44} className="rounded-full object-cover" />
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
              <p className="inline-flex items-center gap-1 text-xs text-success">
                <ShieldIcon className="h-3.5 w-3.5" /> Agence vérifiée
              </p>
            )}
          </div>
        </div>
      )}

      {submitted ? (
        <div className="rounded-xl border border-success/30 bg-success/5 p-5 text-center">
          <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-success/15 text-success">
            <CheckIcon className="h-5 w-5" />
          </span>
          <h3 className="mt-3 font-display text-lg font-semibold">Message envoyé</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            L'agence vous répondra rapidement. Pensez à vérifier votre boîte de réception.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="c-name">Votre nom</Label>
            <Input id="c-name" name="name" required autoComplete="name" placeholder="Sofia Bennani" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-email">Email</Label>
            <Input id="c-email" name="email" type="email" required autoComplete="email" placeholder="vous@email.ma" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-phone">Téléphone</Label>
            <Input id="c-phone" name="phone" type="tel" autoComplete="tel" placeholder="+212 6 00 00 00 00" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-message">Message</Label>
            <textarea
              id="c-message"
              name="message"
              rows={4}
              required
              defaultValue={`Bonjour, je suis intéressé(e) par "${listingTitle}". Pourriez-vous me contacter pour organiser une visite ?`}
              className="flex w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            />
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={isPending}>
            {isPending ? "Envoi…" : "Envoyer une demande"}
          </Button>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href={phone ? `tel:${phone.replace(/\s+/g, "")}` : "#"}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground hover:bg-foreground/5"
            >
              <PhoneIcon className="h-4 w-4" /> Appeler
            </a>
            <a
              href={
                phone
                  ? `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Bonjour, je suis intéressé(e) par "${listingTitle}" sur Baboo.`)}`
                  : "#"
              }
              target="_blank"
              rel="noreferrer"
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
