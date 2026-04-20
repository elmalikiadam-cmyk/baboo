import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, Pressable } from 'react-native';
import { colors, type, border, space } from '@/theme/theme';
import { Button, PhotoPlaceholder } from '@/components';
import { formatPriceFull, formatPrice } from '@/theme/format';
import { mockListings } from '@/data/mockListings';

export function DetailScreen({ route, navigation }: any) {
  const listing = mockListings.find((l) => l.id === route?.params?.id) ?? mockListings[0];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.ref}>{listing.reference}</Text>
        <Pressable style={styles.backBtn}><Text style={styles.backText}>♡</Text></Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        <PhotoPlaceholder label="01/12" height={320} />

        <View style={styles.section}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{listing.type}</Text>
          </View>
          <Text style={styles.location}>
            {listing.location.city.toUpperCase()} · {listing.location.neighborhood}
          </Text>
          <Text style={styles.title}>{listing.title}</Text>

          <View style={styles.priceBlock}>
            <Text style={styles.price}>{formatPrice(listing.price)}</Text>
            <Text style={styles.priceCurrency}>
              MAD{listing.rental ? `/${listing.rental.period.toUpperCase()}` : ''}
            </Text>
            {listing.pricePerM2 && (
              <Text style={styles.pricePerM2}>{formatPrice(listing.pricePerM2)} MAD/m²</Text>
            )}
          </View>
        </View>

        <View style={styles.metaGrid}>
          {[
            { k: 'SURFACE', v: `${listing.surface} m²` },
            { k: 'PIÈCES', v: `${listing.rooms}` },
            { k: 'SDB', v: `${listing.bathrooms}` },
            { k: 'ÉTAT', v: listing.condition },
          ].map((c) => (
            <View key={c.k} style={styles.metaCell}>
              <Text style={styles.metaKey}>{c.k}</Text>
              <Text style={styles.metaVal}>{c.v}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Description</Text>
          <Text style={styles.body}>{listing.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Équipements</Text>
          <View style={styles.eqGrid}>
            {listing.equipments.map((e) => (
              <View key={e} style={styles.eqPill}><Text style={styles.eqText}>{e}</Text></View>
            ))}
          </View>
        </View>

        <View style={styles.agentBox}>
          <View style={styles.agentAvatar}>
            <Text style={styles.agentInitials}>{listing.agent.initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.agentMeta}>
              {listing.agent.verified ? 'AGENT VÉRIFIÉ' : 'PARTICULIER'}
            </Text>
            <Text style={styles.agentName}>
              {listing.agent.firstName} {listing.agent.lastName}
            </Text>
            {listing.agent.agency && (
              <Text style={styles.agentAgency}>{listing.agent.agency}</Text>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.cta}>
        <Button label="APPELER" variant="outline" style={{ flex: 1 }} />
        <Button label="ENVOYER MESSAGE" variant="primary" style={{ flex: 2 }}
          onPress={() => navigation.navigate('Messages')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: space.l, paddingVertical: space.m,
    borderBottomWidth: border.thin, borderColor: colors.ink,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 22, color: colors.ink },
  ref: { ...type.mono },
  section: { paddingHorizontal: space.l, paddingVertical: space.l },
  typeBadge: { alignSelf: 'flex-start', backgroundColor: colors.ink, paddingHorizontal: 10, paddingVertical: 5, marginBottom: space.s },
  typeBadgeText: { ...type.mono, color: colors.paper },
  location: { ...type.mono, marginBottom: 6 },
  title: { ...type.displayL },
  priceBlock: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', marginTop: space.l, paddingTop: space.l, borderTopWidth: border.thin, borderColor: colors.ink },
  price: { ...type.priceXL },
  priceCurrency: { ...type.priceM, marginLeft: 6 },
  pricePerM2: { ...type.mono, marginLeft: 'auto' },
  metaGrid: { flexDirection: 'row', borderTopWidth: border.thin, borderBottomWidth: border.thin, borderColor: colors.ink },
  metaCell: { flex: 1, padding: space.m, borderRightWidth: border.thin, borderColor: colors.ink },
  metaKey: { ...type.monoS, marginBottom: 4 },
  metaVal: { ...type.priceM },
  h2: { ...type.displayM, marginBottom: space.m },
  body: { ...type.body, color: colors.ink2, lineHeight: 22 },
  eqGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  eqPill: { borderWidth: border.thin, borderColor: colors.ink, paddingHorizontal: 10, paddingVertical: 5 },
  eqText: { ...type.mono, fontSize: 10 },
  agentBox: {
    flexDirection: 'row', alignItems: 'center', gap: space.m,
    margin: space.l, padding: space.l,
    borderWidth: border.regular, borderColor: colors.ink,
  },
  agentAvatar: { width: 52, height: 52, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  agentInitials: { ...type.priceM, color: colors.paper },
  agentMeta: { ...type.monoS },
  agentName: { ...type.titleL, marginTop: 2 },
  agentAgency: { ...type.bodyS, color: colors.muted },
  cta: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: space.s, padding: space.l,
    backgroundColor: colors.paper,
    borderTopWidth: border.regular, borderColor: colors.ink,
  },
});
