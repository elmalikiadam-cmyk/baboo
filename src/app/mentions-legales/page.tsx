import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales · Baboo",
  description: "Mentions légales de la plateforme Baboo.",
};

export default function MentionsLegalesPage() {
  return (
    <div className="container py-12 md:py-20">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow">Informations</p>
        <h1 className="display-xl mt-2 text-4xl md:text-5xl">Mentions légales.</h1>

        <div className="prose-baboo mt-10 space-y-8 text-foreground/85">
          <section>
            <h2 className="display-lg text-xl">Éditeur</h2>
            <p className="mt-3 text-sm leading-relaxed">
              Le site <strong>baboo.ma</strong> est édité par Baboo SARL, société de droit marocain,
              dont le siège social est situé à Casablanca, Maroc. Les informations complètes du
              registre du commerce et l'identifiant fiscal seront renseignés avant la mise en
              production publique.
            </p>
          </section>

          <section>
            <h2 className="display-lg text-xl">Directeur de la publication</h2>
            <p className="mt-3 text-sm leading-relaxed">
              Le directeur de la publication est le représentant légal de Baboo SARL.
            </p>
          </section>

          <section>
            <h2 className="display-lg text-xl">Hébergement</h2>
            <p className="mt-3 text-sm leading-relaxed">
              L'infrastructure applicative est hébergée par Vercel Inc. (340 S Lemon Ave #4133,
              Walnut, CA 91789, États-Unis) et la base de données par Supabase Inc.
            </p>
          </section>

          <section>
            <h2 className="display-lg text-xl">Propriété intellectuelle</h2>
            <p className="mt-3 text-sm leading-relaxed">
              L'ensemble des contenus présents sur Baboo (textes, visuels, logo, interface) est
              protégé par le droit d'auteur. Toute reproduction, extraction ou réutilisation sans
              autorisation écrite préalable est interdite. Les annonces publiées restent la
              propriété de leurs auteurs, qui concèdent à Baboo une licence d'affichage non
              exclusive pendant la durée de publication.
            </p>
          </section>

          <section>
            <h2 className="display-lg text-xl">Contact</h2>
            <p className="mt-3 text-sm leading-relaxed">
              Pour toute question, utilisez le formulaire de contact ou écrivez à
              <span className="mono"> contact@baboo.ma</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
