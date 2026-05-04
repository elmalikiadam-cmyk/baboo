import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/contact-form";
import { WhatsAppIcon, MapPinIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  // Coordonnées affichées seulement si fournies en env. Évite les
  // numéros placeholder qui créent des liens morts (« +212 5 22 00 00 00 »).
  const phone = process.env.NEXT_PUBLIC_CONTACT_PHONE;
  const phoneTel = phone ? phone.replace(/[^+0-9]/g, "") : null;
  const whatsapp = process.env.NEXT_PUBLIC_CONTACT_WHATSAPP;
  const whatsappLink = whatsapp
    ? `https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`
    : null;
  const officeAddress = process.env.NEXT_PUBLIC_OFFICE_ADDRESS;

  return (
    <div className="container py-14 md:py-20">
      <div className="border-b border-border pb-6">
        <p className="eyebrow">Contact</p>
        <h1 className="display-xl mt-2 text-5xl md:text-[clamp(3rem,7vw,5.5rem)]">
          Parlons.
        </h1>
        <p className="mt-4 max-w-xl text-muted">
          Une question sur une annonce, un souci avec votre compte, une
          idée pour Baboo ? Écrivez-nous, on répond dans la journée.
        </p>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <ContactForm />

        <aside className="space-y-4">
          {phoneTel && (
            <div className="rounded-md border border-border bg-cream p-6">
              <p className="eyebrow">Téléphone</p>
              <a
                href={`tel:${phoneTel}`}
                className="display-xl mt-2 block text-2xl hover:underline"
              >
                {phone}
              </a>
              <p className="mono mt-2 text-[10px] uppercase tracking-[0.12em] text-muted">
                Lun-ven · 9h-18h
              </p>
            </div>
          )}

          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="block rounded-md border border-border bg-cream p-6 transition-colors hover:border-midnight"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-forest/10 text-forest">
                  <WhatsAppIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="eyebrow">WhatsApp</p>
                  <p className="display-lg text-lg">{whatsapp}</p>
                </div>
              </div>
            </a>
          )}

          {officeAddress && (
            <div className="rounded-md border border-border bg-cream p-6">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-border">
                  <MapPinIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="eyebrow">Bureau</p>
                  <p className="display-lg mt-1 text-lg leading-tight whitespace-pre-line">
                    {officeAddress}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-md bg-midnight p-6 text-cream">
            <p className="eyebrow text-cream/60">Promoteurs</p>
            <h3 className="display-lg mt-2 text-xl">Partenariats B2B.</h3>
            <p className="mt-2 text-sm text-cream/75">
              Pour discuter d'un projet, écrivez à :
            </p>
            <a
              href="mailto:pro@baboo.ma"
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-cream px-4 py-2 mono text-[11px] uppercase tracking-[0.12em] text-midnight"
            >
              pro@baboo.ma
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
