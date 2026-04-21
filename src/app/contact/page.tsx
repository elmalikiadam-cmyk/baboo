import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/contact-form";
import { WhatsAppIcon, MapPinIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="container py-14 md:py-20">
      <div className="border-b border-foreground/15 pb-6">
        <p className="eyebrow">Contact</p>
        <h1 className="display-xl mt-2 text-5xl md:text-[clamp(3rem,7vw,5.5rem)]">Parlons.</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Une question sur une annonce, un souci avec votre compte, une idée pour Baboo ? Écrivez-nous, on répond dans la journée.
        </p>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <ContactForm />

        <aside className="space-y-4">
          <div className="rounded-md border border-foreground/15 bg-surface p-6">
            <p className="eyebrow">Téléphone</p>
            <a href="tel:+212500000000" className="display-xl mt-2 block text-2xl hover:underline">
              +212 5 22 00 00 00
            </a>
            <p className="mono mt-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Lun-ven · 9h-18h
            </p>
          </div>

          <a
            href="https://wa.me/212600000000"
            target="_blank"
            rel="noreferrer"
            className="block rounded-md border border-foreground/15 bg-surface p-6 transition-colors hover:border-foreground/40"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-success/10 text-success">
                <WhatsAppIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="eyebrow">WhatsApp</p>
                <p className="display-lg text-lg">+212 6 00 00 00 00</p>
              </div>
            </div>
          </a>

          <div className="rounded-md border border-foreground/15 bg-surface p-6">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-foreground/20">
                <MapPinIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="eyebrow">Bureau</p>
                <p className="display-lg mt-1 text-lg leading-tight">
                  12, rue du Beauséjour<br />
                  Casablanca — Anfa
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-md bg-ink p-6 text-ink-foreground">
            <p className="eyebrow text-ink-foreground/60">Agences & promoteurs</p>
            <h3 className="display-lg mt-2 text-xl">Partenariats Pro.</h3>
            <p className="mt-2 text-sm text-ink-foreground/75">
              Pour rejoindre Baboo Pro, écrivez directement à :
            </p>
            <a
              href="mailto:pro@baboo.ma"
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-ink-foreground px-4 py-2 mono text-[11px] uppercase tracking-[0.12em] text-ink"
            >
              pro@baboo.ma
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
