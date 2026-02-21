import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Song } from '../types';
import { searchSongs, getTrendingSongs } from '../services/api';
import { SongCard } from '../components/SongCard';
import { usePlayerStore } from '../store/playerStore';
import { useSearchStore } from '../store/searchStore';
import { colors, spacing, borderRadius, typography } from '../theme';

export const HomeScreen: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [mode, setMode] = useState<'trending' | 'search'>('trending');

  const playSong = usePlayerStore((s) => s.playSong);
  const { addRecentSearch } = useSearchStore();

  const loadTrending = async (refresh = false) => {
    try {
      setLoading(true);
      const results = await getTrendingSongs();
      setSongs(results);
      setMode('trending');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTrending();
  }, []);

  const handleSearch = useCallback(async (searchQuery: string, pageNum = 1) => {
    if (!searchQuery.trim()) {
      setMode('trending');
      loadTrending();
      return;
    }

    setIsSearching(true);
    setLoading(pageNum === 1);
    try {
      const result = await searchSongs(searchQuery, pageNum);
      if (pageNum === 1) {
        setSongs(result.results);
      } else {
        setSongs((prev) => [...prev, ...result.results]);
      }
      setTotal(result.total);
      setHasMore(result.results.length > 0 && songs.length < result.total);
      setMode('search');
      addRecentSearch(searchQuery);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, [songs.length, addRecentSearch]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query) {
        setPage(1);
        handleSearch(query, 1);
      } else {
        setSongs([]);
        setMode('trending');
        loadTrending();
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [query]);

  const loadMore = () => {
    if (!isSearching && hasMore && query) {
      const nextPage = page + 1;
      setPage(nextPage);
      handleSearch(query, nextPage);
    }
  };

  const handleSongPress = (song: Song) => {
    playSong(song, songs);
  };

  const renderFooter = () => {
    if (!isSearching) return null;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      
      <View style={styles.header}>
        <Text style={styles.title}>
          {mode === 'trending' ? '🎵 Discover' : '🔍 Results'}
        </Text>
        {mode === 'search' && total > 0 && (
          <Text style={styles.resultCount}>{total.toLocaleString()} songs</Text>
        )}
      </View>

      
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search songs, artists, albums..."
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          onSubmitEditing={() => handleSearch(query)}
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Song List */}
      {loading && songs.length === 0 ? (
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
              onPress={() => handleSongPress(item)}
            />
          )}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                if (query) handleSearch(query, 1);
                else loadTrending(true);
              }}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.centered}>
                <Text style={styles.emptyText}>
                  {query ? 'No songs found' : 'Pull to refresh'}
                </Text>
              </View>
            ) : null
          }
          contentContainerStyle={songs.length === 0 ? styles.emptyContainer : undefined}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  resultCount: {
    ...typography.caption,
    color: colors.textMuted,
  },
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
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    paddingVertical: spacing.md - 2,
  },
  clearBtn: {
    color: colors.textMuted,
    fontSize: 16,
    padding: spacing.xs,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  loadingMore: {
    padding: spacing.md,
    alignItems: 'center',
  },
});
