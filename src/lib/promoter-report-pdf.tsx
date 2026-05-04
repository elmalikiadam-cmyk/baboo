// Template PDF rapport hebdomadaire promoteur. Sobre, A4, noir/blanc,
// imprimable, lisible à l'écran. Génération via @react-pdf/renderer.

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

export type PromoterReportData = {
  developerName: string;
  weekStart: Date;
  weekEnd: Date;
  visits: number;
  leads: number;
  messages: number;
  topLeads: Array<{ name: string; email: string; message: string }>;
  generatedAt: Date;
};

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    borderBottom: "1pt solid #c0c0c0",
    paddingBottom: 12,
    marginBottom: 18,
  },
  brand: {
    fontSize: 9,
    letterSpacing: 1.5,
    color: "#777777",
  },
  title: {
    fontSize: 18,
    marginTop: 4,
    color: "#1a2540",
  },
  meta: {
    fontSize: 9,
    color: "#777777",
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  stat: {
    flex: 1,
    border: "1pt solid #e0e0e0",
    padding: 10,
    borderRadius: 4,
  },
  statLabel: {
    fontSize: 8,
    color: "#777777",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: 16,
    color: "#1a2540",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 11,
    color: "#c04e2e",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  leadRow: {
    paddingTop: 6,
    paddingBottom: 6,
    borderBottom: "0.5pt solid #ebe3d1",
  },
  leadName: {
    fontSize: 10,
    color: "#1a2540",
  },
  leadMeta: {
    fontSize: 8,
    color: "#777777",
    marginTop: 2,
  },
  leadMessage: {
    fontSize: 8,
    color: "#5a6478",
    marginTop: 2,
    fontStyle: "italic",
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#999999",
    textAlign: "center",
  },
});

export function PromoterReportPdf({ data }: { data: PromoterReportData }) {
  const fmtDate = (d: Date) =>
    d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>BABOO · RAPPORT HEBDOMADAIRE</Text>
          <Text style={styles.title}>{data.developerName}</Text>
          <Text style={styles.meta}>
            Semaine du {fmtDate(data.weekStart)} au {fmtDate(data.weekEnd)} ·
            généré le {fmtDate(data.generatedAt)}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <Stat label="Visites" value={String(data.visits)} />
          <Stat label="Leads qualifiés" value={String(data.leads)} />
          <Stat label="Messages" value={String(data.messages)} />
        </View>

        <Text style={styles.sectionTitle}>
          Top leads de la semaine
        </Text>
        {data.topLeads.length === 0 ? (
          <Text style={{ fontSize: 9, color: "#777777" }}>
            Aucun lead enregistré sur la période.
          </Text>
        ) : (
          data.topLeads.map((l, i) => (
            <View key={i} style={styles.leadRow}>
              <Text style={styles.leadName}>{l.name}</Text>
              <Text style={styles.leadMeta}>{l.email}</Text>
              {l.message && (
                <Text style={styles.leadMessage}>« {l.message.slice(0, 220)} »</Text>
              )}
            </View>
          ))
        )}

        <Text style={styles.footer}>
          Baboo SAS · rapport confidentiel · ne pas diffuser sans accord
        </Text>
      </Page>
    </Document>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}
