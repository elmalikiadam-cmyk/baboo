import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation · Baboo",
  description: "Conditions générales d'utilisation de la plateforme Baboo.",
};

export default function CGUPage() {
  return (
    <div className="container py-12 md:py-20">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow">CGU</p>
        <h1 className="display-xl mt-2 text-4xl md:text-5xl">Conditions d'utilisation.</h1>

        <div className="mt-10 space-y-8 text-ink">
          <section>
            <h2 className="display-lg text-xl">1. Objet</h2>
            <p className="mt-3 text-sm leading-relaxed">
              Les présentes conditions régissent l'utilisation de la plateforme Baboo, accessible
              à l'adresse <span className="mono">baboo.ma</span>. En créant un compte ou en
              publiant une annonce, vous acceptez sans réserve les présentes conditions.
            </p>
          </section>

          <section>
            <h2 className="display-lg text-xl">2. Accès au service</h2>
            <p className="mt-3 text-sm leading-relaxed">
              La consultation des annonces est gratuite et ouverte à tous. La publication
              d'annonces, l'utilisation de la messagerie et la sauvegarde de recherches
              nécessitent la création d'un compte.
            </p>
          </section>

          <section>
            <h2 className="display-lg text-xl">3. Publication d'annonces</h2>
            <p className="mt-3 text-sm leading-relaxed">
              Les annonces doivent être exactes, sincères et respecter la législation en vigueur.
              Baboo se réserve le droit de modérer, suspendre ou supprimer toute annonce qui
              contrevient à ces règles ou aux bonnes mœurs, notamment :
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed">
              <li>• informations fausses, trompeuses ou incomplètes ;</li>
              <li>• photos non représentatives du bien ou volées à un tiers ;</li>
              <li>• discriminations, incitations à la haine ou propos illégaux ;</li>
              <li>• doublons ou spam.</li>
            </ul>
          </section>

          <section>
            <h2 className="display-lg text-xl">4. Messagerie</h2>
            <p className="mt-3 text-sm leading-relaxed">
              Les échanges par messagerie sont privés entre les utilisateurs concernés. Baboo
              peut y accéder exclusivement pour prévenir la fraude, modérer un signalement ou
              répondre à une réquisition judiciaire. Le partage de coordonnées bancaires, de
              demandes d'arnhes hors plateforme ou de contenus illicites est interdit.
            </p>
          </section>

          <section>
            <h2 className="display-lg text-xl">5. Responsabilité</h2>
            <p className="mt-3 text-sm leading-relaxed">
              Baboo est un intermédiaire technique mettant en relation des acheteurs, locataires
              et professionnels. Nous ne sommes pas partie aux transactions et ne pouvons être
              tenus responsables des engagements pris entre utilisateurs. La vérification de
              l'identité des agences est en cours de déploiement — un badge «&nbsp;Agence
              vérifiée&nbsp;» signale celles qui ont fourni leurs justificatifs.
            </p>
          </section>

          <section>
            <h2 className="display-lg text-xl">6. Résiliation</h2>
            <p className="mt-3 text-sm leading-relaxed">
              Vous pouvez supprimer votre compte à tout moment depuis votre espace personnel.
              Baboo peut suspendre ou clôturer un compte en cas de manquement aux présentes
              conditions.
            </p>
          </section>

          <section>
            <h2 className="display-lg text-xl">7. Droit applicable</h2>
            <p className="mt-3 text-sm leading-relaxed">
              Les présentes conditions sont régies par le droit marocain. Tout litige relève de la
              compétence exclusive des tribunaux de Casablanca.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
