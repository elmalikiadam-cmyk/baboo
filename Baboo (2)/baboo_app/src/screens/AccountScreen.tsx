import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, Pressable } from 'react-native';
import { colors, type, border, space } from '@/theme/theme';
import { BabooLogo, Button } from '@/components';

export function AccountScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.header}>
          <BabooLogo height={18} />
          <Text style={styles.settings}>⚙</Text>
        </View>

        <View style={styles.profile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AM</Text>
          </View>
          <Text style={styles.meta}>PARTICULIER · MEMBRE DEPUIS 2024</Text>
          <Text style={styles.name}>Amine{'\n'}Marrakchi</Text>
        </View>

        <View style={styles.stats}>
          {[
            { k: 'FAVORIS', v: '12' },
            { k: 'RECHERCHES', v: '3' },
            { k: 'CONTACTS', v: '7' },
          ].map((s, i) => (
            <View key={s.k} style={[styles.stat, i < 2 && styles.statBorder]}>
              <Text style={styles.statValue}>{s.v}</Text>
              <Text style={styles.statKey}>{s.k}</Text>
            </View>
          ))}
        </View>

        <View style={styles.menu}>
          {[
            'MES ANNONCES', 'RECHERCHES SAUVÉES', 'MESSAGES',
            'NOTIFICATIONS', 'PARAMÈTRES', 'AIDE', 'SE DÉCONNECTER',
          ].map((item, i) => (
            <Pressable key={item} style={styles.menuItem}>
              <Text style={styles.menuNum}>{String(i + 1).padStart(2, '0')}</Text>
              <Text style={styles.menuLabel}>{item}</Text>
              <Text style={styles.menuArrow}>→</Text>
            </Pressable>
          ))}
        </View>

        <View style={{ padding: space.l }}>
          <Button label="DEVENIR AGENT VÉRIFIÉ" variant="outline" fullWidth />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: space.l, borderBottomWidth: border.thin, borderColor: colors.ink,
  },
  settings: { fontSize: 22 },
  profile: { padding: space.l, borderBottomWidth: border.strong, borderColor: colors.ink },
  avatar: { width: 72, height: 72, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center', marginBottom: space.m },
  avatarText: { ...type.displayM, color: colors.paper },
  meta: { ...type.mono, marginBottom: 4 },
  name: { ...type.displayL },
  stats: { flexDirection: 'row', borderBottomWidth: border.strong, borderColor: colors.ink },
  stat: { flex: 1, padding: space.l },
  statBorder: { borderRightWidth: border.thin, borderColor: colors.ink },
  statValue: { ...type.displayL, marginBottom: 4 },
  statKey: { ...type.monoS },
  menu: {},
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: space.m,
    padding: space.l, borderBottomWidth: border.thin, borderColor: colors.ink,
  },
  menuNum: { ...type.mono, width: 32 },
  menuLabel: { ...type.titleM, flex: 1 },
  menuArrow: { fontSize: 18 },
});
