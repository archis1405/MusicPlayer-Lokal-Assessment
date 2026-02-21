import React from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet,} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePlayerStore } from '../store/playerStore';
import { getBestImageUrl, getArtistNames } from '../services/api';
import { colors, spacing, borderRadius, typography } from '../theme';
import { RootStackParamList } from '../types';
import { Feather, MaterialIcons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const MiniPlayer: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { currentSong, isPlaying, togglePlay, playNext, position, duration } =
    usePlayerStore();

  if (!currentSong) return null;

  const imageUrl = getBestImageUrl(currentSong.image);
  const artistName = getArtistNames(currentSong);
  const progress = duration > 0 ? position / duration : 0;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate('Player')}
      activeOpacity={0.9}
    >
      
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.content}>
        
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />

        
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {currentSong.name}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {artistName}
          </Text>
        </View>

        
        <View style={styles.controls}>
          
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            style={styles.controlBtn}
          >
            <Feather
              name={isPlaying ? 'pause' : 'play'}
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>

          
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              playNext();
            }}
            style={styles.controlBtn}
          >
            <MaterialIcons name="skip-next" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceElevated,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  progressBar: {
    height: 2,
    backgroundColor: colors.border,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  image: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
  },
  info: {
    flex: 1,
  },
  name: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  artist: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  controlBtn: {
    padding: spacing.sm,
  },
});