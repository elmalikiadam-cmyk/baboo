import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, Pressable } from 'react-native';
import { colors, type, border, space } from '@/theme/theme';
import { Button } from '@/components';

export function LoginScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation?.goBack()}><Text style={styles.back}>←</Text></Pressable>
      </View>

      <View style={styles.body}>
        <Text style={styles.eyebrow}>CONNEXION</Text>
        <Text style={styles.title}>Bienvenue.</Text>

        <View style={styles.field}>
          <Text style={styles.label}>EMAIL</Text>
          <TextInput style={styles.input} placeholder="amine@exemple.ma" placeholderTextColor={colors.muted} autoCapitalize="none" />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>MOT DE PASSE</Text>
          <TextInput style={styles.input} placeholder="••••••••" placeholderTextColor={colors.muted} secureTextEntry />
        </View>

        <Button label="SE CONNECTER" fullWidth onPress={() => navigation?.replace('MainTabs')} />

        <Text style={styles.or}>— OU —</Text>

        <Button label="CONTINUER AVEC GOOGLE" variant="outline" fullWidth style={{ marginBottom: space.s }} />
        <Button label="CONTINUER AVEC APPLE" variant="outline" fullWidth />

        <Pressable style={{ marginTop: space.xl }}>
          <Text style={styles.signup}>PAS DE COMPTE ?  S'INSCRIRE →</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  topBar: { padding: space.l },
  back: { fontSize: 22 },
  body: { flex: 1, padding: space.l },
  eyebrow: { ...type.mono, marginBottom: 4 },
  title: { ...type.displayXL, marginBottom: space.xxxl },
  field: { marginBottom: space.l },
  label: { ...type.monoS, marginBottom: 6 },
  input: {
    borderWidth: border.regular, borderColor: colors.ink,
    paddingHorizontal: space.m, paddingVertical: 12,
    ...type.body, color: colors.ink,
  },
  or: { ...type.mono, textAlign: 'center', marginVertical: space.l },
  signup: { ...type.mono, textAlign: 'center' },
});
