import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, Pressable } from 'react-native';
import { colors, type, border, space } from '@/theme/theme';
import { Button } from '@/components';

const STEPS = ['Type', 'Adresse', 'Détails', 'Photos', 'Prix'];

export function PublishScreen() {
  const [step, setStep] = React.useState(0);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.meta}>ÉTAPE {step + 1} / {STEPS.length}</Text>
        <Text style={styles.title}>Publier{'\n'}une annonce</Text>
        <View style={styles.progress}>
          {STEPS.map((_, i) => (
            <View key={i} style={[styles.progressBar, i <= step && styles.progressBarDone]} />
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: space.l, paddingBottom: 140 }}>
        <Text style={styles.sectionTitle}>Type de transaction</Text>
        <View style={styles.options}>
          {['VENTE', 'LOCATION LONGUE DURÉE', 'LOCATION COURTE DURÉE'].map((o, i) => (
            <Pressable key={o} style={[styles.option, i === 0 && styles.optionSelected]}>
              <Text style={styles.optionNum}>0{i + 1}</Text>
              <Text style={styles.optionLabel}>{o}</Text>
              <View style={[styles.radio, i === 0 && styles.radioSelected]} />
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { marginTop: space.xxl }]}>Type de bien</Text>
        <View style={styles.grid}>
          {['APPARTEMENT', 'VILLA', 'RIAD', 'STUDIO', 'MAISON', 'TERRAIN'].map((t, i) => (
            <View key={t} style={[styles.gridCell, i === 0 && styles.gridCellSelected]}>
              <Text style={[styles.gridLabel, i === 0 && styles.gridLabelSelected]}>{t}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.cta}>
        <Button label="RETOUR" variant="outline" style={{ flex: 1 }}
          onPress={() => setStep(Math.max(0, step - 1))} />
        <Button label="SUIVANT" style={{ flex: 2 }}
          onPress={() => setStep(Math.min(STEPS.length - 1, step + 1))} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  header: {
    padding: space.l, borderBottomWidth: border.strong, borderColor: colors.ink,
  },
  meta: { ...type.mono, marginBottom: 4 },
  title: { ...type.displayL, marginBottom: space.m },
  progress: { flexDirection: 'row', gap: 4 },
  progressBar: { flex: 1, height: 4, backgroundColor: colors.paper3 },
  progressBarDone: { backgroundColor: colors.ink },
  sectionTitle: { ...type.displayM, marginBottom: space.m },
  options: { gap: space.s },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: space.m,
    padding: space.l, borderWidth: border.regular, borderColor: colors.ink,
  },
  optionSelected: { backgroundColor: colors.ink },
  optionNum: { ...type.mono, width: 24 },
  optionLabel: { ...type.titleM, flex: 1 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.ink },
  radioSelected: { backgroundColor: colors.paper, borderColor: colors.paper },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginLeft: -border.thin, marginTop: -border.thin },
  gridCell: {
    width: '33.333%',
    aspectRatio: 1,
    borderWidth: border.thin, borderColor: colors.ink,
    alignItems: 'center', justifyContent: 'center',
    marginLeft: -border.thin, marginTop: -border.thin,
  },
  gridCellSelected: { backgroundColor: colors.ink },
  gridLabel: { ...type.titleM, letterSpacing: 1 },
  gridLabelSelected: { color: colors.paper },
  cta: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: space.s, padding: space.l,
    backgroundColor: colors.paper,
    borderTopWidth: border.regular, borderColor: colors.ink,
  },
});
