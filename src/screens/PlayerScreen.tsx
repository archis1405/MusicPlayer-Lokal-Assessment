import React, { useState } from 'react';
import {View,Text,Image,StyleSheet,TouchableOpacity,Dimensions,StatusBar,Alert,PanResponder,ActivityIndicator,} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import {getBestImageUrl,getArtistNames,formatDuration,} from '../services/api';
import { downloadSong, isDownloaded, deleteSong } from '../services/downloadService';
import { colors, spacing, borderRadius, typography } from '../theme';
import { RootStackParamList } from '../types';

import { Feather } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ARTWORK_SIZE = SCREEN_WIDTH - spacing.xl * 2;
const SEEK_BAR_WIDTH = SCREEN_WIDTH - spacing.xl * 2;

interface SeekBarProps {
  position: number;
  duration: number;
  onSeek: (value: number) => void;
}

const SeekBar: React.FC<SeekBarProps> = ({ position, duration, onSeek }) => {
  const [barWidth, setBarWidth] = React.useState(SEEK_BAR_WIDTH);
  const progress = duration > 0 ? Math.min(position / duration, 1) : 0;
  const thumbLeft = progress * barWidth;

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const x = evt.nativeEvent.locationX;
        const ratio = Math.max(0, Math.min(1, x / barWidth));
        onSeek(ratio * duration);
      },
      onPanResponderMove: (evt) => {
        const x = evt.nativeEvent.locationX;
        const ratio = Math.max(0, Math.min(1, x / barWidth));
        onSeek(ratio * duration);
      },
    })
  ).current;

  return (
    <View style={seekStyles.container} {...panResponder.panHandlers}>
      <View
        style={seekStyles.track}
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
      >
        <View style={[seekStyles.fill, { width: progress * barWidth }]} />
        <View style={[seekStyles.thumb, { left: thumbLeft - 7 }]} />
      </View>
    </View>
  );
};

const seekStyles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  track: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    position: 'relative',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primary,
    top: -5,
  },
});

export const PlayerScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    currentSong,
    isPlaying,
    isLoading,
    position,
    duration,
    repeatMode,
    isShuffle,
    togglePlay,
    playNext,
    playPrevious,
    seekTo,
    setRepeatMode,
    toggleShuffle,
  } = usePlayerStore();

  const { toggleLike, isLiked } = useLibraryStore();
  const [downloading, setDownloading] = useState(false);

  if (!currentSong) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.noSongText}>No song playing</Text>
        </View>
      </SafeAreaView>
    );
  }

  const imageUrl = getBestImageUrl(currentSong.image);
  const artistName = getArtistNames(currentSong);
  const liked = isLiked(currentSong.id);
  const downloaded = isDownloaded(currentSong.id);

  const cycleRepeat = () => {
    const modes = ['none', 'all', 'one'] as const;
    const current = modes.indexOf(repeatMode);
    setRepeatMode(modes[(current + 1) % modes.length]);
  };

  const repeatIcon = {
    none: 'repeat', 
    all: 'repeat',
    one: 'repeat-1',
  }[repeatMode];

  const repeatOpacity = repeatMode === 'none' ? 0.4 : 1;

  const handleDownload = async () => {
    if (downloaded) {
      Alert.alert('Remove Download', 'Delete this song from offline storage?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteSong(currentSong.id);
          },
        },
      ]);
      return;
    }

    setDownloading(true);
    try {
      await downloadSong(currentSong, (p) => {});
      Alert.alert('Downloaded!', `${currentSong.name} saved for offline listening.`);
    } catch {
      Alert.alert('Error', 'Failed to download song.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBtn}
        >
          <Feather name="chevron-down" size={26} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerLabel}>NOW PLAYING</Text>
          <Text style={styles.headerAlbum} numberOfLines={1}>
            {currentSong.album?.name || ''}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Queue')}
          style={styles.headerBtn}
        >
          <Feather name="menu" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Artwork */}
      <View style={styles.artworkContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.artwork}
          resizeMode="cover"
        />
      </View>

      {/* Song Info */}
      <View style={styles.songInfo}>
        <View style={styles.songInfoText}>
          <Text style={styles.songName} numberOfLines={1}>
            {currentSong.name}
          </Text>
          <Text style={styles.artistName} numberOfLines={1}>
            {artistName}
          </Text>
        </View>
        <TouchableOpacity onPress={() => toggleLike(currentSong)}>
          <Feather
            name={liked ? 'heart' : 'heart'}
            size={26}
            color={liked ? colors.primary : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Seek Bar */}
      <View style={styles.seekContainer}>
        <SeekBar
          position={position}
          duration={duration || 1}
          onSeek={(val) => seekTo(val)}
        />
        <View style={styles.timeRow}>
          <Text style={styles.time}>{formatDuration(position / 1000)}</Text>
          <Text style={styles.time}>{formatDuration((duration || 0) / 1000)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={toggleShuffle} style={styles.sideControl}>
          <Feather
            name="shuffle"
            size={22}
            color={isShuffle ? colors.text : colors.textMuted}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={playPrevious} style={styles.control}>
          <Feather name="skip-back" size={34} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity onPress={togglePlay} style={styles.playButton}>
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.background} />
          ) : (
            <Feather
              name={isPlaying ? 'pause' : 'play'}
              size={28}
              color={colors.background}
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={playNext} style={styles.control}>
          <Feather name="skip-forward" size={34} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity onPress={cycleRepeat} style={styles.sideControl}>
          <Text style={{ fontSize: 20, opacity: repeatOpacity }}>
            {repeatMode === 'one' ? '🔂' : '🔁'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Extra Actions */}
      <View style={styles.extraActions}>
        <TouchableOpacity onPress={handleDownload} style={styles.extraBtn}>
          <Feather
            name={downloaded ? 'check' : 'download'}
            size={18}
            color={downloaded ? colors.primary : colors.textSecondary}
          />
          <Text style={styles.extraIcon}>
            {downloaded ? ' Downloaded' : ' Download'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noSongText: {
    ...typography.body,
    color: colors.textMuted,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerLabel: {
    ...typography.caption,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  headerAlbum: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  artworkContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  artwork: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceElevated,
  },
  songInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  songInfoText: {
    flex: 1,
  },
  songName: {
    ...typography.h3,
    color: colors.text,
  },
  artistName: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 4,
  },
  seekContainer: {
    paddingHorizontal: 0,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    marginTop: -spacing.sm,
  },
  time: {
    ...typography.caption,
    color: colors.textMuted,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  sideControl: {
    padding: spacing.sm,
  },
  control: {
    padding: spacing.sm,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  extraActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: spacing.lg,
    gap: spacing.md,
    alignItems: 'center',
  },
  extraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  extraIcon: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
}); 
