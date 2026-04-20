import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, Pressable, TextInput } from 'react-native';
import { colors, type, border, space } from '@/theme/theme';
import { Button } from '@/components';

const MESSAGES = [
  { id: 'm1', me: false, text: "Bonjour, le riad est toujours disponible ?" },
  { id: 'm2', me: true, text: "Bonjour Khalid, oui il est disponible. Vous souhaitez une visite ?" },
  { id: 'm3', me: false, text: "Oui, samedi après-midi serait parfait." },
  { id: 'm4', me: true, text: "Très bien, je vous envoie l'adresse. 14h ça vous va ?" },
];

export function MessagesScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation?.goBack()}><Text style={styles.back}>←</Text></Pressable>
        <View style={styles.titleBlock}>
          <Text style={styles.titleMeta}>AGENT · MARRAKECH</Text>
          <Text style={styles.titleName}>Khalid Bennani</Text>
        </View>
      </View>

      <View style={styles.contextBar}>
        <View style={styles.contextThumb} />
        <View style={{ flex: 1 }}>
          <Text style={styles.contextRef}>BB-4201 · RIAD</Text>
          <Text style={styles.contextTitle} numberOfLines={1}>Riad rénové 4 suites</Text>
        </View>
        <Text style={styles.contextPrice}>4,2M MAD</Text>
      </View>

      <ScrollView contentContainerStyle={styles.thread}>
        {MESSAGES.map((m) => (
          <View key={m.id} style={[styles.bubble, m.me ? styles.bubbleMe : styles.bubbleThem]}>
            <Text style={[styles.bubbleText, m.me && styles.bubbleTextMe]}>{m.text}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.quickReplies}>
        {['VISITE ?', 'PRIX NÉGOCIABLE ?', 'DISPONIBILITÉ'].map((q) => (
          <View key={q} style={styles.quickReply}><Text style={styles.quickReplyText}>{q}</Text></View>
        ))}
      </View>

      <View style={styles.composer}>
        <TextInput placeholder="Message…" placeholderTextColor={colors.muted} style={styles.input} />
        <Button label="ENVOYER" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  topBar: {
    flexDirection: 'row', alignItems: 'center', gap: space.m,
    padding: space.l, borderBottomWidth: border.thin, borderColor: colors.ink,
  },
  back: { fontSize: 22 },
  titleBlock: {},
  titleMeta: { ...type.monoS, marginBottom: 2 },
  titleName: { ...type.titleL },
  contextBar: {
    flexDirection: 'row', alignItems: 'center', gap: space.m,
    padding: space.m, backgroundColor: colors.paper2,
    borderBottomWidth: border.thin, borderColor: colors.ink,
  },
  contextThumb: { width: 44, height: 44, backgroundColor: colors.paper3 },
  contextRef: { ...type.monoS, marginBottom: 2 },
  contextTitle: { ...type.titleM },
  contextPrice: { ...type.priceM },
  thread: { padding: space.l, gap: space.m },
  bubble: { maxWidth: '78%', padding: space.m, borderWidth: border.regular, borderColor: colors.ink },
  bubbleMe: { alignSelf: 'flex-end', backgroundColor: colors.ink },
  bubbleThem: { alignSelf: 'flex-start', backgroundColor: colors.paper },
  bubbleText: { ...type.body, color: colors.ink },
  bubbleTextMe: { color: colors.paper },
  quickReplies: {
    flexDirection: 'row', gap: 6, padding: space.m,
    borderTopWidth: border.thin, borderColor: colors.ink,
  },
  quickReply: { borderWidth: border.regular, borderColor: colors.ink, paddingHorizontal: space.m, paddingVertical: 6 },
  quickReplyText: { ...type.bodyS, fontFamily: 'BarlowCondensed_700Bold', letterSpacing: 0.8 },
  composer: {
    flexDirection: 'row', gap: space.s, padding: space.m,
    borderTopWidth: border.regular, borderColor: colors.ink,
  },
  input: {
    flex: 1, borderWidth: border.regular, borderColor: colors.ink,
    paddingHorizontal: space.m, ...type.body, color: colors.ink,
  },
});
