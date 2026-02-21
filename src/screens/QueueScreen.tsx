import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { usePlayerStore } from '../store/playerStore';
import { SongCard } from '../components/SongCard';
import { colors, spacing, borderRadius, typography } from '../theme';

export const QueueScreen: React.FC = () => {
  const navigation = useNavigation();
  const { queue, currentIndex, removeFromQueue, playAtIndex, clearQueue } =
    usePlayerStore();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Queue</Text>
        <TouchableOpacity onPress={clearQueue} style={styles.clearBtn}>
          <Text style={styles.clearBtnText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <Text style={styles.statsText}>
          {queue.length} songs • Playing {currentIndex + 1} of {queue.length}
        </Text>
      </View>

      {/* Queue List */}
      <FlatList
        data={queue}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item, index }) => (
          <View style={styles.itemRow}>
            <View style={[styles.activeIndicator, index === currentIndex && styles.activeIndicatorOn]} />
            <View style={styles.cardWrapper}>
              <SongCard
                song={item}
                showIndex={index}
                onPress={() => playAtIndex(index)}
              />
            </View>
            <TouchableOpacity
              onPress={() => removeFromQueue(index)}
              style={styles.removeBtn}
            >
              <Text style={styles.removeIcon}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Queue is empty</Text>
            <Text style={styles.emptySubtext}>
              Play a song and it will appear here
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backBtn: {
    padding: spacing.sm,
  },
  backBtnText: {
    ...typography.body,
    color: colors.primary,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  clearBtn: {
    padding: spacing.sm,
  },
  clearBtnText: {
    ...typography.body,
    color: colors.error,
  },
  stats: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  statsText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeIndicator: {
    width: 3,
    height: 52,
    marginLeft: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: 'transparent',
  },
  activeIndicatorOn: {
    backgroundColor: colors.primary,
  },
  cardWrapper: {
    flex: 1,
  },
  removeBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  removeIcon: {
    color: colors.textMuted,
    fontSize: 16,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
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
