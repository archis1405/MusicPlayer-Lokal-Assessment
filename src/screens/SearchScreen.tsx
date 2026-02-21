import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Song } from '../types';
import { searchSongs } from '../services/api';
import { SongCard } from '../components/SongCard';
import { usePlayerStore } from '../store/playerStore';
import { useSearchStore } from '../store/searchStore';
import { colors, spacing, borderRadius, typography } from '../theme';

export const SearchScreen: React.FC = () => {
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const playSong = usePlayerStore((s) => s.playSong);
  const { recentSearches, addRecentSearch, removeRecentSearch, clearRecentSearches } =
    useSearchStore();

  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const result = await searchSongs(q, 1, 30);
      setSongs(result.results);
      addRecentSearch(q);
    } catch {}
    setLoading(false);
  }, [addRecentSearch]);

  const handleRecentTap = (q: string) => {
    setQuery(q);
    handleSearch(q);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder="Artists, songs, albums..."
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={(t) => {
            setQuery(t);
            if (!t) { setSongs([]); setSearched(false); }
          }}
          onSubmitEditing={() => handleSearch(query)}
          returnKeyType="search"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); setSongs([]); setSearched(false); }}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {!searched && recentSearches.length > 0 && (
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            <TouchableOpacity onPress={clearRecentSearches}>
              <Text style={styles.clearAll}>Clear</Text>
            </TouchableOpacity>
          </View>
          {recentSearches.map((s) => (
            <TouchableOpacity
              key={s}
              style={styles.recentItem}
              onPress={() => handleRecentTap(s)}
            >
              <Text style={styles.recentIcon}>🕐</Text>
              <Text style={styles.recentText}>{s}</Text>
              <TouchableOpacity onPress={() => removeRecentSearch(s)}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={songs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SongCard
              song={item}
              queue={songs}
              onPress={() => playSong(item, songs)}
            />
          )}
          ListEmptyComponent={
            searched ? (
              <View style={styles.centered}>
                <Text style={styles.emptyText}>No results for "{query}"</Text>
              </View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  title: { ...typography.h2, color: colors.text },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  searchIcon: { fontSize: 16 },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    paddingVertical: spacing.md - 2,
  },
  clearIcon: { color: colors.textMuted, fontSize: 14, padding: spacing.xs },
  recentSection: { paddingHorizontal: spacing.md },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: { ...typography.h3, color: colors.text },
  clearAll: { ...typography.bodySmall, color: colors.primary },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  recentIcon: { fontSize: 16 },
  recentText: { flex: 1, ...typography.body, color: colors.text },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyText: { ...typography.body, color: colors.textMuted },
});
