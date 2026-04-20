import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, Pressable } from 'react-native';
import { colors, type, border, space } from '@/theme/theme';
import { ListingCard, PhotoPlaceholder } from '@/components';
import { mockListings } from '@/data/mockListings';
import { formatPrice } from '@/theme/format';

export function MapScreen({ navigation }: any) {
  const [selectedId, setSelectedId] = React.useState(mockListings[0].id);
  const selected = mockListings.find((l) => l.id === selectedId)!;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapArea}>
        <PhotoPlaceholder height={500} label="CARTE · MAPBOX" dark />
        {mockListings.slice(0, 4).map((l, i) => (
          <Pressable key={l.id} onPress={() => setSelectedId(l.id)}
            style={[
              styles.pin,
              { top: 80 + i * 90, left: 40 + (i % 2) * 180 },
              selectedId === l.id && styles.pinActive,
            ]}>
            <Text style={[styles.pinText, selectedId === l.id && styles.pinTextActive]}>
              {Math.round(l.price / (l.rental ? 1000 : 100000))}
              {l.rental ? 'K' : 'M'}
            </Text>
          </Pressable>
        ))}

        <View style={styles.searchOverlay}>
          <Text style={styles.searchIcon}>←</Text>
          <Text style={styles.searchText}>CASABLANCA · 847 ANNONCES</Text>
          <Text style={styles.searchFilters}>FILTRES</Text>
        </View>

        <View style={styles.zoomCtrls}>
          <View style={styles.zoomBtn}><Text style={styles.zoomText}>+</Text></View>
          <View style={[styles.zoomBtn, { borderTopWidth: border.thin, borderColor: colors.ink }]}>
            <Text style={styles.zoomText}>−</Text>
          </View>
        </View>
      </View>

      <View style={styles.sheet}>
        <View style={styles.handle} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
          {mockListings.map((l) => (
            <View key={l.id} style={{ width: 300 }}>
              <ListingCard listing={l} onPress={() => navigation.navigate('Detail', { id: l.id })} />
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  mapArea: { flex: 1, position: 'relative' },
  pin: {
    position: 'absolute',
    backgroundColor: colors.paper,
    borderWidth: border.regular,
    borderColor: colors.ink,
    paddingHorizontal: space.s,
    paddingVertical: 4,
  },
  pinActive: { backgroundColor: colors.ink },
  pinText: { ...type.priceM, color: colors.ink },
  pinTextActive: { color: colors.paper },
  searchOverlay: {
    position: 'absolute', top: space.l, left: space.l, right: space.l,
    backgroundColor: colors.paper,
    borderWidth: border.regular, borderColor: colors.ink,
    flexDirection: 'row', alignItems: 'center', gap: space.m,
    paddingHorizontal: space.m, paddingVertical: 12,
  },
  searchIcon: { fontSize: 18 },
  searchText: { ...type.titleM, flex: 1 },
  searchFilters: { ...type.mono },
  zoomCtrls: {
    position: 'absolute', top: 100, right: space.l,
    borderWidth: border.regular, borderColor: colors.ink,
    backgroundColor: colors.paper,
  },
  zoomBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  zoomText: { ...type.displayM, fontSize: 24 },
  sheet: {
    backgroundColor: colors.paper,
    borderTopWidth: border.strong, borderColor: colors.ink,
    paddingTop: space.s,
  },
  handle: {
    width: 48, height: 3, backgroundColor: colors.ink,
    alignSelf: 'center', marginBottom: space.m,
  },
  carousel: { gap: space.m, paddingHorizontal: space.l, paddingBottom: space.l },
});
