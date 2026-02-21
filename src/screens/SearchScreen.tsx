import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator , ScrollView , Image  } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Song } from '../types';
import { searchSongs , getBestImageUrl, getArtistNames, formatDuration } from '../services/api';
import { SongCard } from '../components/SongCard';
import { usePlayerStore } from '../store/playerStore';
import { useSearchStore } from '../store/searchStore';
import { colors, spacing, borderRadius, typography } from '../theme';
import { RootStackParamList } from '../types';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const FILTER_PILLS = ['Songs', 'Artists', 'Albums', 'Folders'];

export const SearchScreen: React.FC = () => {
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const playSong = usePlayerStore((s) => s.playSong);
  const [activeFilter, setActiveFilter] = useState('Songs');

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { recentSearches, addRecentSearch, removeRecentSearch, clearRecentSearches } =
    useSearchStore();

  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const result = await searchSongs(q, 1, 30);
      setSongs(result.results);
      addRecentSearch(q);
    } catch {}
    setLoading(false);
  }, [addRecentSearch]);

  const clearSearch = () => { setQuery(''); setSongs([]); setSearched(false); };

  const handleRecentTap = (q: string) => {
    setQuery(q);
    handleSearch(q);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

  
      <View style={styles.searchRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
      <View style={styles.searchBar}>
        <Feather name="search" size={16} color={colors.primary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search songs, artists..."
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={(t) => { setQuery(t); if (!t) clearSearch(); }}
          onSubmitEditing={() => handleSearch(query)}
          returnKeyType="search"
          autoFocus
          autoCorrect={false}
        />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Feather name="x" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
      </View>
    </View>

  {searched && (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}
      style={styles.pillsScroll} contentContainerStyle={styles.pillsContent}>
      {FILTER_PILLS.map((pill) => (
        <TouchableOpacity key={pill}
          style={[styles.pill, activeFilter === pill && styles.pillActive]}
          onPress={() => setActiveFilter(pill)}>
          <Text style={[styles.pillText, activeFilter === pill && styles.pillTextActive]}>{pill}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )}

  
  {!searched && recentSearches.length > 0 && (
    <View style={styles.recentWrap}>
      <View style={styles.recentHead}>
        <Text style={styles.recentTitle}>Recent Searches</Text>
        <TouchableOpacity onPress={clearRecentSearches}>
          <Text style={styles.clearAll}>Clear All</Text>
        </TouchableOpacity>
      </View>
      {recentSearches.map((s) => (
        <TouchableOpacity key={s} style={styles.recentRow} onPress={() => handleRecentTap(s)}>
          <Feather name="clock" size={16} color={colors.textMuted} />
          <Text style={styles.recentText}>{s}</Text>
          <TouchableOpacity onPress={() => removeRecentSearch(s)}>
            <Feather name="x" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </TouchableOpacity>
      ))}
    </View>
  )}

  
  {loading && <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />}

  
  {searched && !loading && songs.length === 0 && (
    <View style={styles.emptyWrap}>
      <Feather name="frown" size={64} color={colors.textMuted} />
      <Text style={styles.emptyTitle}>Not Found</Text>
      <Text style={styles.emptySub}>
        Sorry, the keyword you entered cannot be found, please check again or search with another keyword.
      </Text>
    </View>
  )}

  {/* Results */}
  {!loading && songs.length > 0 && (
    <FlatList
      data={songs}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.songRow}
          onPress={() => { playSong(item, songs); navigation.navigate('Player'); }}
          activeOpacity={0.8}>
          <Image source={{ uri: getBestImageUrl(item.image) }} style={styles.songImg} />
          <View style={styles.songInfo}>
            <Text style={styles.songName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.songMeta} numberOfLines={1}>
              {getArtistNames(item).split(',')[0]}{'  |  '}{formatDuration(Number(item.duration))} mins
            </Text>
          </View>
          <TouchableOpacity style={styles.playBtn} onPress={() => { playSong(item, songs); navigation.navigate('Player'); }}>
            <Feather name="play" size={16} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.moreBtn}>
            <Feather name="more-vertical" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </TouchableOpacity>
      )}
      showsVerticalScrollIndicator={false}
    />
  )}
</SafeAreaView>
  );
};


const styles = StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: colors.background 
    },
    searchRow: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      paddingHorizontal: 16, 
      paddingVertical: 12, 
      gap: 12 
    },
    backBtn: { 
      padding: 4 
    },
    searchBar: {
      flex: 1, 
      flexDirection: 'row', 
      alignItems: 'center',
      backgroundColor: colors.surfaceElevated, 
      borderRadius: borderRadius.full,
      paddingHorizontal: 14, 
      gap: 8, 
      borderWidth: 1.5, 
      borderColor: colors.primary,
    },
    searchInput: { 
      flex: 1, 
      fontSize: 15, 
      color: colors.text, 
      paddingVertical: 10 
    },
    pillsScroll: { 
      maxHeight: 52 
    },
    pillsContent: { 
      paddingHorizontal: 16, 
      gap: 10, 
      paddingVertical: 8 
    },
    pill: { 
      paddingHorizontal: 18, 
      paddingVertical: 7, 
      borderRadius: borderRadius.full, 
      borderWidth: 1.5, 
      borderColor: colors.primary 
    },
    pillActive: { 
      backgroundColor: colors.primary 
    },
    pillText: { 
      fontSize: 13, 
      fontWeight: '600', 
      color: colors.primary 
    },
    pillTextActive: { 
      color: '#fff' 
    },
    recentWrap: { 
      paddingHorizontal: 20, 
      marginTop: 8 
    },
    recentHead: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: 12 
    },
    recentTitle: { 
      ...typography.h3, 
      color: colors.text 
    },
    clearAll: { 
      fontSize: 13, 
      color: colors.primary, 
      fontWeight: '600' 
    },
    recentRow: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      paddingVertical: 14, 
      borderBottomWidth: 1, 
      borderBottomColor: colors.border, 
      gap: 12 
    },
    recentText: { 
      flex: 1, 
      ...typography.body, 
      color: colors.text 
    },
    emptyWrap: { flex: 1, 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: 40 
    },
    sadFace: { 
      fontSize: 72, 
      marginBottom: 16 
    },
    emptyTitle: { 
      ...typography.h2, 
      color: colors.text, 
      marginBottom: 12 
    },
    emptySub: { 
      ...typography.body, 
      color: colors.textMuted, 
      textAlign: 'center', 
      lineHeight: 22 
    },
    songRow: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      paddingHorizontal: 20, 
      paddingVertical: 10, 
      borderBottomWidth: 1, 
      borderBottomColor: colors.border 
    },
    songImg: { 
      width: 56, 
      height: 56, 
      borderRadius: 8, 
      backgroundColor: colors.surfaceElevated, 
      marginRight: 14 
    },
    songInfo: { 
      flex: 1 
    },
    songName: { 
      ...typography.body, 
      fontWeight: '600', 
      color: colors.text, 
      marginBottom: 4 
    },
    songMeta: { 
      fontSize: 12, 
      color: colors.textMuted 
    },
    playBtn: { 
      width: 36,
      height: 36, 
      borderRadius: 18,
      backgroundColor: 
      colors.primary, 
      alignItems: 'center', 
      justifyContent: 'center', 
      marginLeft: 10 
    },
    moreBtn: { 
      padding: 8, 
      marginLeft: 4 
    },
});
