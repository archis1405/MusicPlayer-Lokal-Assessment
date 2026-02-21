import React, { useState } from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet, TouchableOpacityProps, Modal, Pressable,} from 'react-native';
import { Song } from '../types';
import { getBestImageUrl, getArtistNames, formatDuration } from '../services/api';
import { colors, spacing, borderRadius, typography } from '../theme';
import { usePlayerStore } from '../store/playerStore';
import { Feather, MaterialIcons } from '@expo/vector-icons';

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
  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const isActive = currentSong?.id === song.id;
  const imageUrl = getBestImageUrl(song.image);
  const artistName = getArtistNames(song);

  const [menuVisible, setMenuVisible] = useState(false);
  const [toast, setToast] = useState(false);

  const handleAddToQueue = () => {
    addToQueue(song);
    setMenuVisible(false);
    setToast(true);
    setTimeout(() => setToast(false), 2000);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.container, compact && styles.compact, isActive && styles.active]}
        activeOpacity={0.7}
        {...props}
      >
        {showIndex !== undefined && (
          <Text style={styles.index}>{showIndex + 1}</Text>
        )}
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        <View style={styles.info}>
          <Text style={[styles.name, isActive && styles.activeName]} numberOfLines={1}>
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
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() => setMenuVisible(true)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.menuIcon}>⋮</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>

          <View style={styles.menu}>
            
            <Text style={styles.menuTitle} numberOfLines={1}>{song.name}</Text>
            
            <View style={styles.menuDivider} />
            
            <TouchableOpacity style={styles.menuItem} onPress={handleAddToQueue}>
              <Feather name="plus" size={20} color={colors.text} style={{ marginRight: spacing.sm }} />
              <Text style={styles.menuItemText}>Add to Queue</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={() => setMenuVisible(false)}>
              <Feather name="x" size={20} color={colors.textMuted} style={{ marginRight: spacing.sm }} />
              <Text style={[styles.menuItemText, { color: colors.textMuted }]}>Cancel</Text>
            </TouchableOpacity>
          
          </View>
        
        </Pressable>
      </Modal>

      
      {toast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>✓ Added to queue</Text>
        </View>
      )}
    </>
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
  compact: { paddingVertical: spacing.xs },
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
  info: { flex: 1, gap: 2 },
  name: { ...typography.body, color: colors.text, fontWeight: '500' },
  activeName: { color: colors.primary },
  artist: { ...typography.bodySmall, color: colors.textSecondary },
  duration: { ...typography.caption, color: colors.textMuted },

  // ⋮ button
  menuBtn: { paddingHorizontal: 6, paddingVertical: 4 },
  menuIcon: { fontSize: 20, color: colors.textMuted },

  // Modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  menu: {
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: 36,
    paddingHorizontal: spacing.md,
  },
  menuTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 8,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: spacing.md,
  },
  menuItemIcon: { fontSize: 18 },
  menuItemText: { ...typography.body, color: colors.text },

  
  toast: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: borderRadius.full,
  },
  toastText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});