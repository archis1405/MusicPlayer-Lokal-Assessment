import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl, StatusBar, ScrollView , Modal , Pressable , Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Song } from '../types';
import { searchSongs, getTrendingSongs , getBestImageUrl , getArtistNames , formatDuration} from '../services/api';
import { SongCard } from '../components/SongCard';
import { usePlayerStore } from '../store/playerStore';
import { useSearchStore } from '../store/searchStore';
import { colors, spacing, borderRadius, typography } from '../theme';
import { RootStackParamList } from '../types';
import { AlbumCard } from '../components/AlbumCard';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLibraryStore } from '../store/libraryStore';

import { Feather } from '@expo/vector-icons';

const TABS = ['Suggested', 'Songs', 'Artists', 'Albums', 'Favourites'];
const SORT_OPTIONS = ['Ascending', 'Descending', 'Artist', 'Album', 'Year', 'Date Added', 'Date Modified', 'Composer'];

const SectionHeader = ({ title }: { title: string }) => (
  <View style={secStyles.row}>
    <Text style={secStyles.title}>{title}</Text>
    <TouchableOpacity><Text style={secStyles.seeAll}>See All</Text></TouchableOpacity>
  </View>
);
const secStyles = StyleSheet.create({
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginTop: 24, marginBottom: 12,
  },
  title: { ...typography.h3, color: colors.text },
  seeAll: { fontSize: 14, fontWeight: '600', color: colors.primary },
});

const SortModal = ({ visible, selected, options, onSelect, onClose }: {
  visible: boolean; selected: string; options: string[];
  onSelect: (o: string) => void; onClose: () => void;
}) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <Pressable style={sortStyles.overlay} onPress={onClose}>
      <View style={sortStyles.menu}>
        {options.map((opt) => (
          <TouchableOpacity key={opt} style={sortStyles.row} onPress={() => { onSelect(opt); onClose(); }}>
            <Text style={[sortStyles.optText, selected === opt && sortStyles.optActive]}>{opt}</Text>
            <View style={[sortStyles.radio, selected === opt && sortStyles.radioActive]}>
              {selected === opt && <View style={sortStyles.radioDot} />}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </Pressable>
  </Modal>
);
const sortStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', alignItems: 'flex-end', paddingRight: 20 },
  menu: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12, paddingVertical: 8, minWidth: 210,
    borderWidth: 1, borderColor: colors.border,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  optText: { fontSize: 14, color: colors.textSecondary },
  optActive: { color: colors.primary, fontWeight: '700' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
});

const SongRow = ({ song, onPress }: { song: Song; onPress: () => void }) => (
  <TouchableOpacity style={rowStyles.wrap} onPress={onPress} activeOpacity={0.8}>
    <Image source={{ uri: getBestImageUrl(song.image) }} style={rowStyles.img} />
    <View style={rowStyles.info}>
      <Text style={rowStyles.name} numberOfLines={1}>{song.name}</Text>
      <Text style={rowStyles.meta} numberOfLines={1}>
        {getArtistNames(song).split(',')[0]}{'  |  '}{formatDuration(Number(song.duration))} mins
      </Text>
    </View>
    <TouchableOpacity style={rowStyles.playBtn} onPress={onPress}>
      <Feather name="play" size={16} color="#fff" />
    </TouchableOpacity>
    <TouchableOpacity style={rowStyles.moreBtn}>
      <Feather name="more-vertical" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  </TouchableOpacity>
);
const rowStyles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  img: { width: 56, height: 56, borderRadius: 8, backgroundColor: colors.surfaceElevated, marginRight: 14 },
  info: { flex: 1 },
  name: { ...typography.body, color: colors.text, fontWeight: '600', marginBottom: 4 },
  meta: { fontSize: 12, color: colors.textMuted },
  playBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  moreBtn: { padding: 8, marginLeft: 4 },
});

const SuggestedTab = () => {
  const [trending, setTrending] = useState<Song[]>([]);
  const [mostPlayed, setMostPlayed] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const playSong = usePlayerStore((s) => s.playSong);

  const loadData = async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true); else setLoading(true);
      const [t, m] = await Promise.all([
        searchSongs('arijit singh', 1, 10),
        searchSongs('bollywood 2024', 1, 10),
      ]);
      setTrending(t.results);
      setMostPlayed(m.results);
    } catch {}
    setLoading(false); setRefreshing(false);
  };

  useEffect(() => { loadData(); }, []);
  if (loading) return <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />;

  return (
    <ScrollView showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} tintColor={colors.primary} />}>
      <SectionHeader title="Recently Played" />
      <FlatList data={trending.slice(0, 6)} keyExtractor={(i) => `r-${i.id}`} horizontal
        showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}
        renderItem={({ item }) => <AlbumCard song={item} onPress={() => playSong(item, trending)} />} />
      <SectionHeader title="Artists" />
      <FlatList data={mostPlayed.slice(0, 6)} keyExtractor={(i) => `a-${i.id}`} horizontal
        showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={artistCardStyle.wrap} onPress={() => playSong(item, mostPlayed)}>
            <Image source={{ uri: getBestImageUrl(item.image) }} style={artistCardStyle.img} />
            <Text style={artistCardStyle.name} numberOfLines={1}>{getArtistNames(item).split(',')[0]}</Text>
          </TouchableOpacity>
        )} />
      <SectionHeader title="Most Played" />
      <FlatList data={trending.slice(4, 10)} keyExtractor={(i) => `m-${i.id}`} horizontal
        showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}
        renderItem={({ item }) => <AlbumCard song={item} onPress={() => playSong(item, trending)} />} />
      <View style={{ height: 120 }} />
    </ScrollView>
  );
};
const artistCardStyle = StyleSheet.create({
  wrap: { width: 100, marginRight: 16, alignItems: 'center' },
  img: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.surfaceElevated, marginBottom: 8 },
  name: { fontSize: 13, fontWeight: '500', color: colors.text, textAlign: 'center' },
});

const SongsTab = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState('Ascending');
  const [showSort, setShowSort] = useState(false);
  const playSong = usePlayerStore((s) => s.playSong);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    searchSongs('top hits', 1, 30).then((r) => { setSongs(r.results); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const sorted = [...songs].sort((a, b) => {
    if (sortOption === 'Ascending') return a.name.localeCompare(b.name);
    if (sortOption === 'Descending') return b.name.localeCompare(a.name);
    if (sortOption === 'Artist') return getArtistNames(a).localeCompare(getArtistNames(b));
    return 0;
  });

  if (loading) return <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />;

  return (
    <View style={{ flex: 1 }}>
      <View style={tabHeaderStyles.row}>
        <Text style={tabHeaderStyles.count}>{songs.length} songs</Text>
        <TouchableOpacity style={tabHeaderStyles.sortBtn} onPress={() => setShowSort(true)}>
          <Text style={tabHeaderStyles.sortText}>{sortOption}</Text>
          <Feather name="arrow-up" size={12} color={colors.primary} />
          <Feather name="arrow-down" size={12} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <FlatList data={sorted} keyExtractor={(i) => i.id}
        renderItem={({ item }) => <SongRow song={item} onPress={() => { playSong(item, sorted); navigation.navigate('Player'); }} />}
        showsVerticalScrollIndicator={false} />
      <SortModal visible={showSort} selected={sortOption} options={SORT_OPTIONS} onSelect={setSortOption} onClose={() => setShowSort(false)} />
    </View>
  );
};

const ArtistsTab = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState('Date Added');
  const [showSort, setShowSort] = useState(false);
  const playSong = usePlayerStore((s) => s.playSong);

  useEffect(() => {
    searchSongs('top artists', 1, 30).then((r) => { setSongs(r.results); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const artistMap: Record<string, { songs: Song[]; image: string }> = {};
  songs.forEach((song) => {
    const artist = getArtistNames(song).split(',')[0].trim();
    if (!artistMap[artist]) artistMap[artist] = { songs: [], image: getBestImageUrl(song.image) };
    artistMap[artist].songs.push(song);
  });
  const artists = Object.entries(artistMap).map(([name, data]) => ({ name, ...data }));

  if (loading) return <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />;

  return (
    <View style={{ flex: 1 }}>
      <View style={tabHeaderStyles.row}>
        <Text style={tabHeaderStyles.count}>{artists.length} artists</Text>
        <TouchableOpacity style={tabHeaderStyles.sortBtn} onPress={() => setShowSort(true)}>
          <Text style={tabHeaderStyles.sortText}>{sortOption}</Text>
          <Feather name="arrow-up" size={12} color={colors.primary} />
          <Feather name="arrow-down" size={12} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <FlatList data={artists} keyExtractor={(i) => i.name}
        renderItem={({ item }) => (
          <TouchableOpacity style={artistTabStyles.row} onPress={() => item.songs[0] && playSong(item.songs[0], item.songs)} activeOpacity={0.8}>
            <Image source={{ uri: item.image }} style={artistTabStyles.img} />
            <View style={artistTabStyles.info}>
              <Text style={artistTabStyles.name} numberOfLines={1}>{item.name}</Text>
              <Text style={artistTabStyles.meta}>1 Album  |  {item.songs.length} Songs</Text>
            </View>
            <TouchableOpacity style={{ padding: 8 }}>
              <Feather name="more-vertical" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false} />
      <SortModal visible={showSort} selected={sortOption} options={['Date Added', 'Ascending', 'Descending']} onSelect={setSortOption} onClose={() => setShowSort(false)} />
    </View>
  );
};
const artistTabStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  img: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.surfaceElevated, marginRight: 14 },
  info: { flex: 1 },
  name: { ...typography.body, fontWeight: '600', color: colors.text, marginBottom: 4 },
  meta: { fontSize: 12, color: colors.textMuted },
});

const AlbumsTab = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const playSong = usePlayerStore((s) => s.playSong);

  useEffect(() => {
    searchSongs('best albums', 1, 20).then((r) => { setSongs(r.results); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />;

  return (
    <FlatList data={songs} keyExtractor={(i) => i.id} numColumns={2}
      contentContainerStyle={{ padding: 16, gap: 16 }}
      columnWrapperStyle={{ gap: 16 }}
      renderItem={({ item }) => (
        <TouchableOpacity style={albumTabStyles.card} onPress={() => playSong(item, songs)} activeOpacity={0.8}>
          <Image source={{ uri: getBestImageUrl(item.image) }} style={albumTabStyles.img} />
          <Text style={albumTabStyles.name} numberOfLines={2}>{item.album?.name || item.name}</Text>
          <Text style={albumTabStyles.artist} numberOfLines={1}>{getArtistNames(item).split(',')[0]}</Text>
        </TouchableOpacity>
      )}
      showsVerticalScrollIndicator={false} />
  );
};
const albumTabStyles = StyleSheet.create({
  card: { flex: 1, backgroundColor: colors.surface, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  img: { width: '100%', aspectRatio: 1 },
  name: { fontSize: 13, fontWeight: '600', color: colors.text, padding: 8, paddingBottom: 2 },
  artist: { fontSize: 11, color: colors.textMuted, paddingHorizontal: 8, paddingBottom: 10 },
});

const FavouritesTab = () => {
  const { likedSongs } = useLibraryStore();
  const playSong = usePlayerStore((s) => s.playSong);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  if (likedSongs.length === 0) {
    return (
      <View style={favStyles.empty}>
        <Feather name="heart" size={48} color={colors.textMuted} />
        <Text style={favStyles.emptyTitle}>No Favourites Yet</Text>
        <Text style={favStyles.emptySub}>Tap ♡ on any song to add it here</Text>
      </View>
    );
  }
  return (
    <FlatList data={likedSongs} keyExtractor={(i) => i.id}
      renderItem={({ item }) => <SongRow song={item} onPress={() => { playSong(item, likedSongs); navigation.navigate('Player'); }} />}
      showsVerticalScrollIndicator={false} />
  );
};
const favStyles = StyleSheet.create({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
  emptyTitle: { ...typography.h3, color: colors.text },
  emptySub: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
});

const tabHeaderStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  count: { ...typography.body, fontWeight: '700', color: colors.text },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sortText: { fontSize: 13, color: colors.primary, fontWeight: '600' },
});


export const HomeScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Suggested');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const renderTab = () => {
    switch (activeTab) {
      case 'Songs': return <SongsTab />;
      case 'Artists': return <ArtistsTab />;
      case 'Albums': return <AlbumsTab />;
      case 'Favourites': return <FavouritesTab />;
      default: return <SuggestedTab />;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Feather name="music" size={24} color={colors.primary} />
          <Text style={styles.logoText}>Music Player</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Search' as any)}>
          <Feather name="search" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      
      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}>
          {TABS.map((tab) => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={styles.tab}>
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
              {activeTab === tab && <View style={styles.tabLine} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.tabBorder} />
      </View>

      <View style={styles.content}>
        {renderTab()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: colors.background 
    },
    header: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      paddingHorizontal: 20, 
      paddingVertical: 14 
    },
    logoRow: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      gap: 8 
    },
    logoText: { 
      ...typography.h2, 
      color: colors.text 
    },
    tabsScroll: { 
      borderBottomWidth: 1, 
      borderBottomColor: colors.border,
      alignSelf: 'stretch'
    },
    tabsContent: { 
      paddingHorizontal: 20 
    },
    tab: { 
      marginRight: 24, 
      paddingVertical: 8, 
      alignItems: 'center' 
    },
    tabText: { 
      fontSize: 15, 
      color: colors.textMuted, 
      fontWeight: '500' 
    },
    tabTextActive: { 
      color: colors.primary, 
      fontWeight: '700' 
    },
    tabLine: { 
      position: 'absolute', 
      bottom: 0, 
      left: 0, 
      right: 0, 
      height: 2.5, 
      backgroundColor: colors.primary, 
      borderRadius: 2 
    },
    tabsWrapper: {
      height: 44,
    },
    content: { 
      flex: 1 
    },
    tabBorder: {         
      height: 1,
      backgroundColor: colors.border,
    },
});
