// Template PDF du bail d'habitation marocain (loi 67-12).
//
// Utilise @react-pdf/renderer. Généré côté serveur via renderToBuffer
// et uploadé dans le bucket privé Supabase (jamais d'URL publique
// persistée). Le design est volontairement sobre : A4, noir/blanc,
// typographie système, adapté à l'impression et à la signature
// physique. Pas de couleurs de marque — le document doit pouvoir
// circuler entre avocat, notaire, banque sans friction visuelle.
//
// ⚠ Les clauses reproduites ci-dessous sont un modèle standard,
// NON juridiquement certifié. Chaque bailleur doit faire valider par
// son conseil avant usage réel. La plateforme affiche un disclaimer
// dans l'UI côté bailleur.

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

export type LeasePdfData = {
  leaseId: string;
  landlord: { name: string; idNumber: string | null; address: string };
  tenant: { name: string; idNumber: string | null; address: string };
  property: { address: string; city: string; surface: number; furnishing: "FURNISHED" | "UNFURNISHED" | "SEMI_FURNISHED" };
  terms: {
    startDate: Date;
    endDate: Date | null;
    monthlyRent: number;
    monthlyCharges: number;
    depositAmount: number;
    paymentDay: number;
    noticePeriodDays: number;
  };
  specialClauses: string | null;
  generatedAt: Date;
};

const styles = StyleSheet.create({
  page: {
    paddingVertical: 48,
    paddingHorizontal: 56,
    fontSize: 10.5,
    lineHeight: 1.45,
    color: "#0f172a",
    fontFamily: "Helvetica",
  },
  header: {
    textAlign: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: 9,
    marginTop: 4,
    color: "#475569",
  },
  section: {
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
    borderBottom: "1pt solid #0f172a",
    paddingBottom: 3,
  },
  row: {
    flexDirection: "row",
    marginBottom: 3,
  },
  label: {
    width: 130,
    fontWeight: 700,
  },
  value: {
    flex: 1,
  },
  paragraph: {
    marginBottom: 8,
    textAlign: "justify",
  },
  signatures: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBlock: {
    width: "45%",
  },
  signatureLabel: {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 40,
  },
  signatureLine: {
    borderTop: "1pt solid #0f172a",
    paddingTop: 4,
    fontSize: 8,
    color: "#475569",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 56,
    right: 56,
    fontSize: 7,
    color: "#64748b",
    borderTop: "0.5pt solid #cbd5e1",
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

const FURNISHING_LABEL: Record<LeasePdfData["property"]["furnishing"], string> = {
  FURNISHED: "meublé",
  UNFURNISHED: "non meublé",
  SEMI_FURNISHED: "semi-meublé",
};

function formatDate(d: Date): string {
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatMoney(n: number): string {
  return `${n.toLocaleString("fr-FR")} MAD`;
}

export function LeasePdfDocument({ data }: { data: LeasePdfData }) {
  const { landlord, tenant, property, terms, specialClauses } = data;
  const rentTotal = terms.monthlyRent + terms.monthlyCharges;
  const durationLabel = terms.endDate
    ? `du ${formatDate(terms.startDate)} au ${formatDate(terms.endDate)}`
    : `à compter du ${formatDate(terms.startDate)}, à durée indéterminée`;

  return (
    <Document
      title={`Bail Baboo ${data.leaseId}`}
      author="Baboo"
      producer="Baboo — @react-pdf/renderer"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Contrat de bail d'habitation</Text>
          <Text style={styles.subtitle}>
            Régi par la loi n° 67-12 relative aux rapports contractuels entre
            bailleur et locataire des locaux à usage d'habitation ou à usage
            professionnel (Royaume du Maroc)
          </Text>
        </View>

        {/* Parties */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Entre les soussignés</Text>
          <Text style={styles.paragraph}>
            D'une part, <Text style={{ fontWeight: 700 }}>{landlord.name}</Text>
            {landlord.idNumber ? `, titulaire de la pièce d'identité n° ${landlord.idNumber}` : ""}
            , demeurant à {landlord.address}, ci-après désigné
            « le Bailleur »,
          </Text>
          <Text style={styles.paragraph}>
            Et d'autre part, <Text style={{ fontWeight: 700 }}>{tenant.name}</Text>
            {tenant.idNumber ? `, titulaire de la pièce d'identité n° ${tenant.idNumber}` : ""}
            , demeurant à {tenant.address}, ci-après désigné
            « le Locataire ».
          </Text>
        </View>

        {/* Objet */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article 1 — Objet du contrat</Text>
          <Text style={styles.paragraph}>
            Le Bailleur donne en location au Locataire, qui accepte, un bien
            immobilier {FURNISHING_LABEL[property.furnishing]} situé au{" "}
            <Text style={{ fontWeight: 700 }}>{property.address}</Text>, à{" "}
            {property.city}, d'une superficie d'environ {property.surface} m².
          </Text>
        </View>

        {/* Durée */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article 2 — Durée</Text>
          <Text style={styles.paragraph}>
            Le présent bail est consenti et accepté pour une durée{" "}
            {durationLabel}. Conformément à l'article 3 de la loi 67-12, le
            présent contrat sera reconduit tacitement à son terme, sauf
            dénonciation par l'une des parties moyennant un préavis écrit de{" "}
            {terms.noticePeriodDays} jours.
          </Text>
        </View>

        {/* Loyer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article 3 — Loyer et charges</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Loyer mensuel :</Text>
            <Text style={styles.value}>{formatMoney(terms.monthlyRent)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Charges mensuelles :</Text>
            <Text style={styles.value}>{formatMoney(terms.monthlyCharges)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total mensuel :</Text>
            <Text style={styles.value}>{formatMoney(rentTotal)}</Text>
          </View>
          <Text style={{ ...styles.paragraph, marginTop: 6 }}>
            Le loyer est payable d'avance, au plus tard le {terms.paymentDay} de
            chaque mois, par virement bancaire ou tout autre moyen convenu entre
            les parties. Toute quittance émise fera foi du paiement.
          </Text>
        </View>

        {/* Caution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article 4 — Dépôt de garantie</Text>
          <Text style={styles.paragraph}>
            Le Locataire verse ce jour au Bailleur la somme de{" "}
            <Text style={{ fontWeight: 700 }}>{formatMoney(terms.depositAmount)}</Text>
            {" "}à titre de dépôt de garantie, destiné à couvrir les
            éventuelles sommes dont le Locataire pourrait être débiteur en fin
            de bail. Cette somme sera restituée au plus tard dans le mois
            suivant la remise des clés, déduction faite le cas échéant des
            sommes dues au titre des loyers impayés, charges, ou remises en
            état justifiées par un état des lieux de sortie contradictoire.
          </Text>
        </View>

        {/* Jouissance paisible */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article 5 — Obligations des parties</Text>
          <Text style={styles.paragraph}>
            Le Locataire s'engage à occuper les lieux paisiblement, à les
            entretenir en bon père de famille, à souscrire une assurance
            multirisque habitation et à en justifier à chaque échéance, à ne
            pas céder ni sous-louer sans accord écrit préalable du Bailleur.
          </Text>
          <Text style={styles.paragraph}>
            Le Bailleur s'engage à délivrer les lieux en bon état, à en
            garantir la jouissance paisible, à effectuer les grosses
            réparations relevant de l'article 639 du Code des obligations et
            contrats.
          </Text>
        </View>

        {/* Résiliation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article 6 — Résiliation</Text>
          <Text style={styles.paragraph}>
            À défaut de paiement du loyer dans un délai de 30 jours suivant
            mise en demeure restée infructueuse, ou en cas de manquement grave
            du Locataire à ses obligations, le Bailleur pourra solliciter la
            résiliation du bail devant le tribunal compétent, conformément aux
            dispositions des articles 25 et suivants de la loi 67-12.
          </Text>
        </View>

        {specialClauses && specialClauses.trim().length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Article 7 — Clauses particulières</Text>
            <Text style={styles.paragraph}>{specialClauses}</Text>
          </View>
        )}

        {/* Loi applicable */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article 8 — Loi applicable — juridiction</Text>
          <Text style={styles.paragraph}>
            Le présent contrat est régi par la loi marocaine. Tout litige
            relatif à son interprétation ou à son exécution sera soumis aux
            juridictions compétentes du ressort du bien loué.
          </Text>
        </View>

        {/* Signatures */}
        <View style={styles.signatures}>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>Le Bailleur</Text>
            <Text style={styles.signatureLine}>
              Signé à ______________________ le ____ / ____ / ______
            </Text>
          </View>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>Le Locataire</Text>
            <Text style={styles.signatureLine}>
              Signé à ______________________ le ____ / ____ / ______
            </Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>Baboo — réf. {data.leaseId.slice(-8).toUpperCase()}</Text>
          <Text>
            Généré le{" "}
            {data.generatedAt.toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
