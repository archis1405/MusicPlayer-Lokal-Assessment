import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLibraryStore } from '../store/libraryStore';
import { usePlayerStore } from '../store/playerStore';
import { getBestImageUrl, getArtistNames, formatDuration } from '../services/api';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';
import { RootStackParamList } from '../types';

export const FavouritesScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { likedSongs } = useLibraryStore();
  const playSong = usePlayerStore((s) => s.playSong);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Feather name="music" size={24} color={colors.primary} />
        <Text style={styles.logo}>Music Player</Text>
        <Feather name="search" size={24} color={colors.text} />
      </View>

      {likedSongs.length > 0 && (
        <View style={styles.countRow}>
          <Text style={styles.count}>{likedSongs.length} songs</Text>
        </View>
      )}

      <FlatList
        data={likedSongs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => { playSong(item, likedSongs); navigation.navigate('Player'); }}
            activeOpacity={0.8}
          >
            <Image source={{ uri: getBestImageUrl(item.image) }} style={styles.img} />
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.meta} numberOfLines={1}>
                {getArtistNames(item).split(',')[0]}{'  |  '}{formatDuration(Number(item.duration))} mins
              </Text>
            </View>
            <TouchableOpacity
              style={styles.playBtn}
              onPress={() => { playSong(item, likedSongs); navigation.navigate('Player'); }}
            >
              <Feather name="play" size={16} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.moreBtn}>
              <Feather name="more-vertical" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="heart" size={64} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No Favourites Yet</Text>
            <Text style={styles.emptySub}>Tap ♡ on any song to add it here</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default FavouritesScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  logo: { fontSize: 26, fontWeight: '700', color: colors.text },
  countRow: {
    paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  count: { fontSize: 15, fontWeight: '700', color: colors.text },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  img: { width: 56, height: 56, borderRadius: 10, backgroundColor: colors.surfaceElevated, marginRight: 14 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 4 },
  meta: { fontSize: 12, color: colors.textMuted },
  playBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginLeft: 10,
  },
  moreBtn: { padding: 8, marginLeft: 4 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 60, gap: 12, marginTop: 80 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  emptySub: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
});