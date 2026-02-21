import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacityProps,
} from 'react-native';
import { Song } from '../types';
import { getBestImageUrl, getArtistNames, formatDuration } from '../services/api';
import { colors, spacing, borderRadius, typography } from '../theme';
import { usePlayerStore } from '../store/playerStore';

interface SongCardProps extends TouchableOpacityProps {
  song: Song;
  queue?: Song[];
  showIndex?: number;
  compact?: boolean;
}

export const SongCard: React.FC<SongCardProps> = ({
  song,
  queue,
  showIndex,
  compact,
  ...props
}) => {
  const currentSong = usePlayerStore((s) => s.currentSong);
  const isActive = currentSong?.id === song.id;
  const imageUrl = getBestImageUrl(song.image);
  const artistName = getArtistNames(song);

  return (
    <TouchableOpacity
      style={[styles.container, compact && styles.compact, isActive && styles.active]}
      activeOpacity={0.7}
      {...props}
    >
      {showIndex !== undefined && (
        <Text style={styles.index}>{showIndex + 1}</Text>
      )}
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text
          style={[styles.name, isActive && styles.activeName]}
          numberOfLines={1}
        >
          {song.name}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {artistName}
        </Text>
      </View>
      {!compact && (
        <Text style={styles.duration}>
          {formatDuration(Number(song.duration))}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  compact: {
    paddingVertical: spacing.xs,
  },
  active: {
    backgroundColor: 'rgba(29, 185, 84, 0.1)',
    borderRadius: borderRadius.md,
  },
  index: {
    ...typography.bodySmall,
    color: colors.textMuted,
    width: 20,
    textAlign: 'center',
  },
  image: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceElevated,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  activeName: {
    color: colors.primary,
  },
  artist: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  duration: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
