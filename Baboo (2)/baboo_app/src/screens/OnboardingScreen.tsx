import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable } from 'react-native';
import { colors, type, border, space } from '@/theme/theme';
import { BabooLogo, Button } from '@/components';

export function OnboardingScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BabooLogo height={28} color={colors.paper} />
      </View>

      <View style={styles.body}>
        <Text style={styles.eyebrow}>BIENVENUE SUR BABOO</Text>
        <Text style={styles.title}>L'immobilier{'\n'}marocain.{'\n'}Sans filtre.</Text>
        <Text style={styles.meta}>1 284 annonces · 12 villes · 0 intermédiaires superflus</Text>
      </View>

      <View style={styles.cta}>
        <Button label="CRÉER UN COMPTE" variant="primary" fullWidth
          onPress={() => navigation?.navigate('Login')} />
        <Pressable onPress={() => navigation?.navigate('MainTabs')} style={{ marginTop: space.m }}>
          <Text style={styles.skip}>CONTINUER SANS COMPTE →</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ink, padding: space.l, justifyContent: 'space-between' },
  header: {},
  body: { flex: 1, justifyContent: 'center' },
  eyebrow: { ...type.mono, color: colors.paper, marginBottom: space.m },
  title: { ...type.displayXXL, color: colors.paper, marginBottom: space.xl },
  meta: { ...type.mono, color: 'rgba(242,239,232,0.6)' },
  cta: {},
  skip: { ...type.mono, color: colors.paper, textAlign: 'center' },
});
