import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité · Baboo",
  description: "Comment Baboo collecte et traite vos données personnelles.",
};

export default function ConfidentialitePage() {
  return (
    <div className="container py-12 md:py-20">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow">Données personnelles</p>
        <h1 className="display-xl mt-2 text-4xl md:text-5xl">Confidentialité.</h1>
        <p className="mt-4 text-sm text-muted">
          Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}.
        </p>

        <div className="mt-10 space-y-8 text-midnight">
          <section>
            <h2 className="display-lg text-xl">Données collectées</h2>
            <p className="mt-3 text-sm leading-relaxed">
              Nous collectons uniquement les informations nécessaires au fonctionnement du service :
              nom, email, téléphone (optionnel), messages envoyés aux agences, favoris,
              recherches sauvegardées. Pour les professionnels : coordonnées de l'agence, logo,
              annonces publiées.
            </p>
          </section>

          <section>
            <h2 className="display-lg text-xl">Finalités</h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed">
              <li>• Mettre en relation acheteurs/locataires et professionnels de l'immobilier.</li>
              <li>• Vous envoyer des réponses et notifications liées à vos demandes.</li>
              <li>• Améliorer la pertinence du moteur de recherche (statistiques agrégées).</li>
              <li>• Prévenir la fraude et modérer les contenus illicites.</li>
            </ul>
          </section>

          <section>
            <h2 className="display-lg text-xl">Durée de conservation</h2>
            <p className="mt-3 text-sm leading-relaxed">
              Les annonces actives sont conservées tant que le compte professionnel reste actif.
              Les comptes inactifs plus de 24 mois sont anonymisés. Les messages échangés sont
              conservés pendant 3 ans à des fins de preuve commerciale, puis supprimés.
            </p>
          </section>

          <section>
            <h2 className="display-lg text-xl">Vos droits (loi 09-08)</h2>
            <p className="mt-3 text-sm leading-relaxed">
              Conformément à la loi marocaine 09-08 relative à la protection des personnes
              physiques à l'égard du traitement des données à caractère personnel, vous disposez
              d'un droit d'accès, de rectification, d'opposition et de suppression. Pour
              l'exercer, contactez-nous à <span className="mono">contact@baboo.ma</span>.
            </p>
          </section>

          <section>
            <h2 className="display-lg text-xl">Cookies</h2>
            <p className="mt-3 text-sm leading-relaxed">
              Baboo utilise uniquement des cookies strictement nécessaires à l'authentification et
              à la session. Aucun cookie publicitaire ou de traçage tiers n'est déposé sans
              consentement explicite.
            </p>
          </section>

          <section>
            <h2 className="display-lg text-xl">Sous-traitants</h2>
            <p className="mt-3 text-sm leading-relaxed">
              Vercel (hébergement applicatif, USA), Supabase (base de données, UE),
              Resend (emails transactionnels, si activé). Tous nos sous-traitants sont engagés
              contractuellement à respecter la confidentialité de vos données.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
