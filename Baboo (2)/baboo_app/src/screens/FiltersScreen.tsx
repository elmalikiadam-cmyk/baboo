import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, Pressable, TextInput } from 'react-native';
import { colors, type, border, space } from '@/theme/theme';
import { Button, Chip } from '@/components';

const CITIES = ['Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Fès', 'Agadir', 'Essaouira', 'Oujda'];
const EQUIPMENTS = ['PATIO', 'TERRASSE', 'PISCINE', 'JARDIN', 'GARAGE', 'ASCENSEUR', 'CLIMATISATION', 'MEUBLÉ'];
const PROPERTY_TYPES = ['APPARTEMENT', 'VILLA', 'RIAD', 'STUDIO', 'MAISON', 'TERRAIN'];

export function FiltersScreen({ navigation }: any) {
  const [transaction, setTransaction] = React.useState<'VENTE' | 'LOCATION'>('VENTE');
  const [cities, setCities] = React.useState<Set<string>>(new Set(['Casablanca']));
  const [types, setTypes] = React.useState<Set<string>>(new Set());
  const [equipments, setEquipments] = React.useState<Set<string>>(new Set());
  const [priceMin, setPriceMin] = React.useState('0');
  const [priceMax, setPriceMax] = React.useState('5 000 000');
  const [roomsMin, setRoomsMin] = React.useState(0);

  const toggle = (set: Set<string>, setter: (s: Set<string>) => void, v: string) => {
    const next = new Set(set);
    next.has(v) ? next.delete(v) : next.add(v);
    setter(next);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()}><Text style={styles.close}>✕</Text></Pressable>
        <Text style={styles.topTitle}>FILTRES</Text>
        <Pressable><Text style={styles.reset}>RESET</Text></Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <Section title="Transaction">
          <View style={styles.segmented}>
            {(['VENTE', 'LOCATION'] as const).map((t) => (
              <Pressable key={t} onPress={() => setTransaction(t)}
                style={[styles.segment, transaction === t && styles.segmentActive]}>
                <Text style={[styles.segmentLabel, transaction === t && styles.segmentLabelActive]}>{t}</Text>
              </Pressable>
            ))}
          </View>
        </Section>

        <Section title="Villes" counter={cities.size}>
          <View style={styles.chipsWrap}>
            {CITIES.map((c) => (
              <Chip key={c} label={c.toUpperCase()} active={cities.has(c)}
                onPress={() => toggle(cities, setCities, c)} />
            ))}
          </View>
        </Section>

        <Section title="Budget (MAD)">
          <View style={styles.priceRow}>
            <View style={styles.priceField}>
              <Text style={styles.priceFieldLabel}>MIN</Text>
              <TextInput value={priceMin} onChangeText={setPriceMin} style={styles.priceInput} keyboardType="numeric" />
            </View>
            <View style={styles.priceDash} />
            <View style={styles.priceField}>
              <Text style={styles.priceFieldLabel}>MAX</Text>
              <TextInput value={priceMax} onChangeText={setPriceMax} style={styles.priceInput} keyboardType="numeric" />
            </View>
          </View>
        </Section>

        <Section title="Pièces minimum">
          <View style={styles.roomRow}>
            {[0, 1, 2, 3, 4, 5].map((r) => (
              <Pressable key={r} onPress={() => setRoomsMin(r)}
                style={[styles.roomBtn, roomsMin === r && styles.roomBtnActive]}>
                <Text style={[styles.roomLabel, roomsMin === r && styles.roomLabelActive]}>
                  {r === 0 ? 'TOUS' : `${r}+`}
                </Text>
              </Pressable>
            ))}
          </View>
        </Section>

        <Section title="Type de bien" counter={types.size}>
          <View style={styles.chipsWrap}>
            {PROPERTY_TYPES.map((t) => (
              <Chip key={t} label={t} active={types.has(t)} onPress={() => toggle(types, setTypes, t)} />
            ))}
          </View>
        </Section>

        <Section title="Équipements" counter={equipments.size}>
          <View style={styles.chipsWrap}>
            {EQUIPMENTS.map((e) => (
              <Chip key={e} label={e} active={equipments.has(e)} onPress={() => toggle(equipments, setEquipments, e)} />
            ))}
          </View>
        </Section>
      </ScrollView>

      <View style={styles.cta}>
        <Button label="VOIR 847 RÉSULTATS" fullWidth onPress={() => navigation.goBack()} />
      </View>
    </SafeAreaView>
  );
}

function Section({ title, counter, children }: { title: string; counter?: number; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {counter != null && counter > 0 && <Text style={styles.sectionCounter}>{counter} SÉLECTIONNÉ·S</Text>}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: space.l, paddingVertical: space.m,
    borderBottomWidth: border.strong, borderColor: colors.ink,
  },
  close: { fontSize: 22, color: colors.ink },
  topTitle: { ...type.titleL, letterSpacing: 1.5 },
  reset: { ...type.mono },
  section: { padding: space.l, borderBottomWidth: border.thin, borderColor: colors.ink },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: space.m },
  sectionTitle: { ...type.displayM },
  sectionCounter: { ...type.monoS, alignSelf: 'flex-end' },
  segmented: { flexDirection: 'row', borderWidth: border.regular, borderColor: colors.ink },
  segment: { flex: 1, padding: space.m, alignItems: 'center' },
  segmentActive: { backgroundColor: colors.ink },
  segmentLabel: { ...type.titleM, letterSpacing: 1.2 },
  segmentLabelActive: { color: colors.paper },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: space.s },
  priceField: { flex: 1, borderWidth: border.regular, borderColor: colors.ink, padding: space.s },
  priceFieldLabel: { ...type.monoS, marginBottom: 4 },
  priceInput: { ...type.priceM, color: colors.ink, padding: 0 },
  priceDash: { width: 16, height: 2, backgroundColor: colors.ink },
  roomRow: { flexDirection: 'row', borderWidth: border.regular, borderColor: colors.ink },
  roomBtn: { flex: 1, padding: space.s, alignItems: 'center', borderRightWidth: border.thin, borderColor: colors.ink },
  roomBtnActive: { backgroundColor: colors.ink },
  roomLabel: { ...type.bodyS, fontFamily: 'BarlowCondensed_700Bold' },
  roomLabelActive: { color: colors.paper },
  cta: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: space.l, backgroundColor: colors.paper,
    borderTopWidth: border.regular, borderColor: colors.ink,
  },
});
