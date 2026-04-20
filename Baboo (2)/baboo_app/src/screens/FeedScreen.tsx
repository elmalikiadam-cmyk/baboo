import React from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, SafeAreaView } from 'react-native';
import { colors, type, border, space } from '@/theme/theme';
import { BabooLogo, Chip, ListingRow } from '@/components';
import { mockListings } from '@/data/mockListings';

export function FeedScreen({ navigation }: any) {
  const [favorites, setFavorites] = React.useState<Set<string>>(new Set());
  const toggleFav = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <BabooLogo height={20} />
          <View style={styles.cityPill}>
            <View style={styles.dot} />
            <Text style={styles.cityText}>CASABLANCA</Text>
          </View>
        </View>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>Q</Text>
          <Text style={styles.searchPlaceholder}>Quartier, prix, type…</Text>
          <Text style={styles.filtersLink}>FILTRES (3)</Text>
        </View>
      </View>

      <FlatList
        data={mockListings}
        keyExtractor={(l) => l.id}
        ListHeaderComponent={
          <View>
            <View style={styles.titleBlock}>
              <Text style={styles.meta}>1 284 RÉSULTATS · CASABLANCA + 40KM</Text>
              <Text style={styles.title}>Trouve ton{'\n'}chez-toi.</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
            >
              {['VENTE', 'LOCATION', '< 3M MAD', '3+ PIÈCES', 'NEUF', 'AVEC PHOTO'].map((c, i) => (
                <Chip key={c} label={c} active={i === 0} />
              ))}
            </ScrollView>
            <View style={{ height: space.l }} />
          </View>
        }
        renderItem={({ item, index }) => (
          <ListingRow
            listing={item}
            index={index}
            isFavorite={favorites.has(item.id)}
            onFavorite={() => toggleFav(item.id)}
            onPress={() => navigation.navigate('Detail', { id: item.id })}
          />
        )}
        ListFooterComponent={<View style={{ height: space.huge }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  header: {
    borderBottomWidth: border.strong,
    borderColor: colors.ink,
    paddingHorizontal: space.l,
    paddingBottom: space.m,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: space.s,
    paddingBottom: space.m,
  },
  cityPill: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, backgroundColor: colors.ink, borderRadius: 3 },
  cityText: { ...type.mono },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: border.regular,
    borderColor: colors.ink,
    paddingHorizontal: space.m,
    paddingVertical: 10,
  },
  searchIcon: { ...type.mono, marginRight: space.s, color: colors.muted },
  searchPlaceholder: { ...type.titleM, color: colors.muted, flex: 1 },
  filtersLink: { ...type.mono },
  titleBlock: { paddingHorizontal: space.l, paddingTop: space.xl, paddingBottom: space.s },
  meta: { ...type.mono, marginBottom: space.xs },
  title: { ...type.displayXL },
  chips: { paddingHorizontal: space.l, paddingTop: space.l, gap: 0 },
});
