import type { Metadata } from "next";
import Link from "next/link";
import { PromoterContactForm } from "@/components/promoteurs/contact-form";

export const metadata: Metadata = {
  title: "Contact promoteurs — Baboo",
  description:
    "Décrivez votre projet, nous revenons vers vous sous 48 h ouvrées.",
};

export default function PromoterContactPage() {
  return (
    <div className="container py-10 md:py-16">
      <nav
        aria-label="Fil d'Ariane"
        className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
      >
        <Link href="/" className="hover:text-midnight">
          Accueil
        </Link>
        <span className="mx-2">·</span>
        <Link href="/promoteurs" className="hover:text-midnight">
          Promoteurs
        </Link>
        <span className="mx-2">·</span>
        <span>Contact</span>
      </nav>

      <header className="border-b border-midnight/10 pb-6">
        <p className="eyebrow">Prendre rendez-vous</p>
        <h1 className="display-xl mt-2 text-3xl md:text-5xl">
          Parlons de votre <span className="text-terracotta">projet</span>.
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
          Décrivez rapidement votre activité et votre pipeline commercial.
          Notre équipe commerciale vous recontacte sous 48 h ouvrées avec
          une proposition adaptée.
        </p>
      </header>

      <div className="mt-10 max-w-2xl">
        <PromoterContactForm />
      </div>
    </div>
  );
}
