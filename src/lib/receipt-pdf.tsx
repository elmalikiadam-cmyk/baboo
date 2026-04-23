// Template PDF de la quittance de loyer.
// Conforme pratique marocaine : identification parties, période,
// montant, mention « vaut quittance pour la période indiquée »,
// signature bailleur. Pas de TVA (pas applicable aux loyers
// d'habitation conformément au Code Général des Impôts).
//
// Même style que le bail (sobre, noir/blanc, A4) pour circulation
// banque / impôts / dossier locataire.

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

export type ReceiptPdfData = {
  receiptNumber: string;
  landlord: { name: string };
  tenant: { name: string };
  property: { address: string; city: string };
  period: {
    start: Date;
    end: Date;
  };
  amounts: {
    rent: number;
    charges: number;
    total: number;
  };
  paidOn: Date; // date du paiement effectif (ou date d'émission si multiple)
  issuedAt: Date;
};

const styles = StyleSheet.create({
  page: {
    paddingVertical: 56,
    paddingHorizontal: 64,
    fontSize: 11,
    lineHeight: 1.5,
    color: "#0f172a",
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "1pt solid #0f172a",
    paddingBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  meta: {
    fontSize: 9,
    color: "#475569",
    textAlign: "right",
  },
  section: {
    marginTop: 24,
  },
  row: {
    flexDirection: "row",
    marginBottom: 4,
  },
  label: {
    width: 150,
    fontWeight: 700,
  },
  value: {
    flex: 1,
  },
  amountTable: {
    marginTop: 14,
    border: "1pt solid #0f172a",
  },
  amountRow: {
    flexDirection: "row",
    borderBottom: "0.5pt solid #94a3b8",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  amountRowLast: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#f1f5f9",
    borderTop: "1pt solid #0f172a",
  },
  amountLabel: {
    flex: 1,
  },
  amountValue: {
    width: 160,
    textAlign: "right",
    fontWeight: 700,
  },
  paragraph: {
    marginTop: 18,
    textAlign: "justify",
  },
  bold: {
    fontWeight: 700,
  },
  signature: {
    marginTop: 56,
    width: 240,
  },
  signatureLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 44,
  },
  signatureLine: {
    borderTop: "1pt solid #0f172a",
    paddingTop: 4,
    fontSize: 8,
    color: "#475569",
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 64,
    right: 64,
    fontSize: 7.5,
    color: "#64748b",
    borderTop: "0.5pt solid #cbd5e1",
    paddingTop: 6,
    textAlign: "center",
  },
});

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

export function ReceiptPdfDocument({ data }: { data: ReceiptPdfData }) {
  const { landlord, tenant, property, period, amounts, paidOn } = data;

  return (
    <Document
      title={`Quittance ${data.receiptNumber}`}
      author="Baboo"
      producer="Baboo — @react-pdf/renderer"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Quittance de loyer</Text>
            <Text style={{ fontSize: 10, marginTop: 4, color: "#475569" }}>
              Période du {formatDate(period.start)} au {formatDate(period.end)}
            </Text>
          </View>
          <View style={styles.meta}>
            <Text>N° {data.receiptNumber}</Text>
            <Text>Émise le {formatDate(data.issuedAt)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Bailleur :</Text>
            <Text style={styles.value}>{landlord.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Locataire :</Text>
            <Text style={styles.value}>{tenant.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Bien loué :</Text>
            <Text style={styles.value}>
              {property.address}, {property.city}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Paiement reçu le :</Text>
            <Text style={styles.value}>{formatDate(paidOn)}</Text>
          </View>
        </View>

        <View style={styles.amountTable}>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Loyer hors charges</Text>
            <Text style={styles.amountValue}>{formatMoney(amounts.rent)}</Text>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Charges</Text>
            <Text style={styles.amountValue}>
              {formatMoney(amounts.charges)}
            </Text>
          </View>
          <View style={styles.amountRowLast}>
            <Text style={[styles.amountLabel, styles.bold]}>
              Total versé
            </Text>
            <Text style={styles.amountValue}>{formatMoney(amounts.total)}</Text>
          </View>
        </View>

        <Text style={styles.paragraph}>
          Je soussigné(e), <Text style={styles.bold}>{landlord.name}</Text>,
          reconnais avoir reçu de <Text style={styles.bold}>{tenant.name}</Text>
          {" "}la somme de <Text style={styles.bold}>{formatMoney(amounts.total)}</Text>
          {" "}au titre du loyer et des charges pour la période allant du{" "}
          <Text style={styles.bold}>{formatDate(period.start)}</Text> au{" "}
          <Text style={styles.bold}>{formatDate(period.end)}</Text>, relative
          à la location du bien situé au{" "}
          <Text style={styles.bold}>{property.address}, {property.city}</Text>.
        </Text>

        <Text style={[styles.paragraph, styles.bold]}>
          La présente quittance vaut quittance pour la période indiquée, sous
          réserve de l'encaissement effectif des sommes reçues.
        </Text>

        <View style={styles.signature}>
          <Text style={styles.signatureLabel}>
            Fait à _________________, le {formatDate(data.issuedAt)}
          </Text>
          <Text style={styles.signatureLine}>Signature du bailleur</Text>
        </View>

        <Text style={styles.footer} fixed>
          Baboo — quittance {data.receiptNumber} · Document émis sans rature ni
          surcharge. À conserver précieusement.
        </Text>
      </Page>
    </Document>
  );
}
