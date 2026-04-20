import React from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { colors, type, border, space } from '@/theme/theme';
import { ListingRow } from '@/components';
import { mockListings } from '@/data/mockListings';

export function FavoritesScreen({ navigation }: any) {
  const favorites = mockListings.slice(0, 3);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.meta}>{favorites.length} ANNONCES</Text>
        <Text style={styles.title}>Favoris</Text>
      </View>
      <FlatList
        data={favorites}
        keyExtractor={(l) => l.id}
        renderItem={({ item, index }) => (
          <ListingRow listing={item} index={index}
            isFavorite
            onPress={() => navigation.navigate('Detail', { id: item.id })} />
        )}
        ListFooterComponent={
          <View style={styles.compareBox}>
            <Text style={styles.compareTitle}>COMPARER</Text>
            <Text style={styles.compareBody}>
              Sélectionne 2 à 4 annonces pour voir un tableau comparatif côte à côte.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  header: {
    padding: space.l,
    borderBottomWidth: border.strong, borderColor: colors.ink,
  },
  meta: { ...type.mono, marginBottom: 4 },
  title: { ...type.displayL },
  compareBox: {
    margin: space.l, padding: space.l,
    borderWidth: border.regular, borderColor: colors.ink, borderStyle: 'dashed',
  },
  compareTitle: { ...type.displayM, marginBottom: space.s },
  compareBody: { ...type.body, color: colors.muted },
});
