import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLibraryStore } from '../store/libraryStore';
import { usePlayerStore } from '../store/playerStore';
import { SongCard } from '../components/SongCard';
import { getDownloadedSongs } from '../services/downloadService';
import { colors, spacing, borderRadius, typography } from '../theme';

type Tab = 'liked' | 'downloads';

export const LibraryScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('liked');
  const { likedSongs } = useLibraryStore();
  const playSong = usePlayerStore((s) => s.playSong);
  const downloadedSongs = getDownloadedSongs();

  const data = activeTab === 'liked' ? likedSongs : downloadedSongs;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Library</Text>
      </View>

      
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'liked' && styles.activeTab]}
          onPress={() => setActiveTab('liked')}
        >
          <Text style={[styles.tabText, activeTab === 'liked' && styles.activeTabText]}>
            ♥ Liked ({likedSongs.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'downloads' && styles.activeTab]}
          onPress={() => setActiveTab('downloads')}
        >
          <Text
            style={[styles.tabText, activeTab === 'downloads' && styles.activeTabText]}
          >
            ⬇ Downloads ({downloadedSongs.length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SongCard
            song={item}
            queue={data}
            onPress={() => playSong(item, data)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {activeTab === 'liked'
                ? 'No liked songs yet'
                : 'No downloaded songs yet'}
            </Text>
            <Text style={styles.emptySubtext}>
              {activeTab === 'liked'
                ? 'Tap ♡ on any song to add it here'
                : 'Download songs to listen offline'}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceElevated,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: colors.background,
  },
  empty: {
    alignItems: 'center',
    padding: spacing.xxl,
    gap: spacing.sm,
  },
  emptyText: {
    ...typography.h3,
    color: colors.text,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
