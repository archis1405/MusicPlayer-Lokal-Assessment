import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Song } from '../types';
import { getBestImageUrl, getArtistNames } from '../services/api';
import { colors, typography } from '../theme';

interface Props {
  song: Song;
  onPress: () => void;
}

export function AlbumCard({ song, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.wrap} onPress={onPress} activeOpacity={0.8}>
      <Image
        source={{ uri: getBestImageUrl(song.image) }}
        style={styles.img}
      />
      <Text style={styles.name} numberOfLines={2}>{song.name}</Text>
      <Text style={styles.artist} numberOfLines={1}>
        {getArtistNames(song)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 130,
    marginRight: 14,
  },
  img: {
    width: 130,
    height: 130,
    borderRadius: 12,
    backgroundColor: colors.surfaceElevated,
    marginBottom: 8,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 18,
  },
  artist: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
});