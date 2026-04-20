import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts, space } from "@/theme/theme";
import { CloseIcon } from "@/icons";
import { Pill } from "@/components/Pill";
import { text } from "@/theme/styles";

export interface Filters {
  transaction: "VENTE" | "LOCATION" | "TOUT";
  city: string | null;
  priceMax: number | null;
  roomsMin: number | null;
  amenities: string[];
}

export const DEFAULT_FILTERS: Filters = {
  transaction: "TOUT",
  city: null,
  priceMax: null,
  roomsMin: null,
  amenities: [],
};

const CITIES = [
  "Casablanca", "Rabat", "Marrakech", "Tanger", "Agadir", "Fès", "Tétouan",
];

const AMENITIES = [
  "PISCINE", "JARDIN", "TERRASSE", "PATIO", "VUE MER", "ASCENSEUR",
  "PARKING", "MEUBLÉ", "NEUF", "GARAGE", "CLIMATISATION",
];

const BUDGETS = [
  { label: "≤ 1 M", value: 1_000_000 },
  { label: "≤ 2 M", value: 2_000_000 },
  { label: "≤ 3,5 M", value: 3_500_000 },
  { label: "≤ 5 M", value: 5_000_000 },
  { label: "≤ 10 M", value: 10_000_000 },
];

interface Props {
  visible: boolean;
  initial: Filters;
  resultCount: number;
  onClose: () => void;
  onApply: (f: Filters) => void;
}

export function FilterSheet({ visible, initial, resultCount, onClose, onApply }: Props) {
  const [draft, setDraft] = useState<Filters>(initial);

  React.useEffect(() => {
    if (visible) setDraft(initial);
  }, [visible, initial]);

  function toggleAmenity(a: string) {
    setDraft((d) => ({
      ...d,
      amenities: d.amenities.includes(a)
        ? d.amenities.filter((x) => x !== a)
        : [...d.amenities, a],
    }));
  }

  function reset() {
    setDraft(DEFAULT_FILTERS);
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <SafeAreaView edges={["bottom"]} style={{ flex: 1 }}>
            {/* Handle + header */}
            <View style={styles.handleWrap}>
              <View style={styles.handle} />
            </View>

            <View style={styles.header}>
              <Text style={styles.title}>AFFINER</Text>
              <Pressable onPress={onClose} hitSlop={8}>
                <CloseIcon size={22} color={colors.foreground} />
              </Pressable>
            </View>

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: space.xl, paddingBottom: space["3xl"] }}
              showsVerticalScrollIndicator={false}
            >
              {/* Transaction */}
              <Section label="TRANSACTION">
                <View style={styles.segmented}>
                  {(["VENTE", "LOCATION", "TOUT"] as const).map((t, i) => {
                    const active = draft.transaction === t;
                    return (
                      <Pressable
                        key={t}
                        onPress={() => setDraft((d) => ({ ...d, transaction: t }))}
                        style={[
                          styles.segItem,
                          i < 2 && styles.segDivider,
                          active && styles.segItemActive,
                        ]}
                      >
                        <Text style={[styles.segText, active && styles.segTextActive]}>
                          {t}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </Section>

              {/* City */}
              <Section label="VILLE">
                <View style={styles.chipRow}>
                  {CITIES.map((c) => {
                    const active = draft.city === c;
                    return (
                      <Pressable
                        key={c}
                        onPress={() =>
                          setDraft((d) => ({ ...d, city: active ? null : c }))
                        }
                        style={[styles.chip, active && styles.chipActive]}
                      >
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>
                          {c}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </Section>

              {/* Budget */}
              <Section label="BUDGET MAXIMUM">
                <View style={styles.chipRow}>
                  {BUDGETS.map((b) => {
                    const active = draft.priceMax === b.value;
                    return (
                      <Pressable
                        key={b.value}
                        onPress={() =>
                          setDraft((d) => ({ ...d, priceMax: active ? null : b.value }))
                        }
                        style={[styles.chip, active && styles.chipActive]}
                      >
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>
                          {b.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </Section>

              {/* Rooms */}
              <Section label="CHAMBRES MIN.">
                <View style={styles.chipRow}>
                  {[1, 2, 3, 4, 5].map((n) => {
                    const active = draft.roomsMin === n;
                    return (
                      <Pressable
                        key={n}
                        onPress={() =>
                          setDraft((d) => ({ ...d, roomsMin: active ? null : n }))
                        }
                        style={[styles.chipSquare, active && styles.chipActive]}
                      >
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>
                          {n}+
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </Section>

              {/* Amenities */}
              <Section label="COMMODITÉS">
                <View style={styles.chipRow}>
                  {AMENITIES.map((a) => {
                    const active = draft.amenities.includes(a);
                    return (
                      <Pressable
                        key={a}
                        onPress={() => toggleAmenity(a)}
                        style={[styles.chip, active && styles.chipActive]}
                      >
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>
                          {a}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </Section>
            </ScrollView>

            {/* Footer CTA */}
            <View style={styles.footer}>
              <Pressable onPress={reset} style={styles.resetButton}>
                <Text style={styles.resetText}>RÉINITIALISER</Text>
              </Pressable>
              <Pill
                label={`Voir ${resultCount} résultat${resultCount > 1 ? "s" : ""}`}
                size="lg"
                onPress={() => onApply(draft)}
                style={{ flex: 1 }}
              />
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: space["2xl"] }}>
      <Text style={text.eyebrow}>{label}</Text>
      <View style={{ height: space.md }} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(10,10,10,0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    height: "88%",
    backgroundColor: colors.background,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderTopWidth: 2,
    borderColor: colors.foreground,
  },
  handleWrap: {
    alignItems: "center",
    paddingVertical: 10,
  },
  handle: {
    width: 48,
    height: 3,
    backgroundColor: colors.foreground,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: space.xl,
    paddingBottom: space.md,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  title: {
    fontFamily: fonts.displayHeavy,
    fontSize: 26,
    letterSpacing: -0.6,
    color: colors.foreground,
  },

  segmented: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.foreground,
  },
  segItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  segDivider: { borderRightWidth: 1, borderColor: colors.foreground },
  segItemActive: { backgroundColor: colors.foreground },
  segText: {
    fontFamily: fonts.displayBold,
    fontSize: 12,
    letterSpacing: 0.8,
    color: colors.foreground,
  },
  segTextActive: { color: colors.paper },

  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipSquare: {
    minWidth: 44,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipActive: {
    backgroundColor: colors.foreground,
    borderColor: colors.foreground,
  },
  chipText: {
    fontFamily: fonts.monoMedium,
    fontSize: 11,
    letterSpacing: 0.8,
    color: colors.foreground,
  },
  chipTextActive: { color: colors.paper },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: space.xl,
    borderTopWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.background,
  },
  resetButton: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.foreground,
  },
  resetText: {
    fontFamily: fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.foreground,
  },
});
