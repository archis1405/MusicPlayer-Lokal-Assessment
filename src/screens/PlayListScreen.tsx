import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, Modal, TextInput, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { colors, typography, borderRadius, spacing } from '../theme';
import { usePlaylistStore } from '../store/playlistStore';
import { usePlayerStore } from '../store/playerStore';
import { getDownloadedSongs } from '../services/downloadService';
import { getBestImageUrl, getArtistNames, formatDuration } from '../services/api';
import { RootStackParamList } from '../types';
import { DownloadedSong } from '../services/downloadService';

const TABS = ['Playlists', 'Downloads'];

export const PlaylistsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Playlists');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const { playlists, createPlaylist, deletePlaylist, loadPlaylists } = usePlaylistStore();
  const { playSong } = usePlayerStore();
  const [downloads, setDownloads] = useState<DownloadedSong[]>([]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    loadPlaylists();
    setDownloads(getDownloadedSongs());
  }, []);

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return;
    createPlaylist(newPlaylistName);
    setNewPlaylistName('');
    setShowCreateModal(false);
  };

  const handleDeletePlaylist = (id: string, name: string) => {
    Alert.alert('Delete Playlist', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deletePlaylist(id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      
      <View style={styles.header}>
        <Feather name="music" size={24} color={colors.primary} />
        <Text style={styles.logo}>Music Player</Text>
        <TouchableOpacity onPress={() => setShowCreateModal(true)}>
          <Feather name="plus" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      
      <View style={styles.tabsRow}>
        {TABS.map((tab) => (
          
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => { setActiveTab(tab);
                if (tab === 'Downloads'){
                  setDownloads(getDownloadedSongs());
                } 
            }}
          >
          
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          
          </TouchableOpacity>
        ))}
      </View>

      
      {activeTab === 'Playlists' && (
        playlists.length === 0 ? (
          
          <View style={styles.empty}>
          
            <Feather name="list" size={64} color={colors.textMuted} />
          
            <Text style={styles.emptyTitle}>No Playlists Yet</Text>
          
            <Text style={styles.emptySub}>Create a playlist to organize your music</Text>
          
            <TouchableOpacity style={styles.createBtn} onPress={() => setShowCreateModal(true)}>
          
              <Feather name="plus" size={18} color="#fff" />
              <Text style={styles.createBtnText}>Create Playlist</Text>
           
            </TouchableOpacity>
          
          </View>
        ) : (
          
          <FlatList
            data={playlists}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: spacing.xxl }}
            renderItem={({ item }) => (
              
              <TouchableOpacity
                style={styles.playlistRow}
                activeOpacity={0.8}
                onPress={() => item.songs[0] && playSong(item.songs[0], item.songs)}
              >
                <View style={styles.playlistIconWrap}>
                
                  <Feather name="music" size={24} color={colors.primary} />
                
                </View>
                
                <View style={styles.playlistInfo}>
                
                  <Text style={styles.playlistName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.playlistMeta}>{item.songs.length} songs</Text>
                
                </View>
                
                <TouchableOpacity
                  style={styles.moreBtn}
                  onPress={() => handleDeletePlaylist(item.id, item.name)}
                >
                
                  <Feather name="trash-2" size={18} color={colors.textMuted} />
                
                </TouchableOpacity>
              
              </TouchableOpacity>
            )}
          />
        )
      )}

      
      {activeTab === 'Downloads' && (
        downloads.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="download" size={64} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No Downloads Yet</Text>
            <Text style={styles.emptySub}>Downloaded songs will appear here</Text>
          </View>
        ) : (
          <FlatList
            data={downloads}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: spacing.xxl }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.songRow}
                activeOpacity={0.8}
                onPress={() => { playSong(item, downloads); navigation.navigate('Player'); }}
              >
                <Image source={{ uri: getBestImageUrl(item.image) }} style={styles.songImg} />
                <View style={styles.songInfo}>
                  <Text style={styles.songName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.songMeta} numberOfLines={1}>
                    {getArtistNames(item).split(',')[0]}{'  |  '}{formatDuration(Number(item.duration))} mins
                  </Text>
                </View>
                <View style={styles.downloadedBadge}>
                  <Feather name="check-circle" size={18} color={colors.primary} />
                </View>
                <TouchableOpacity style={styles.playBtn}
                  onPress={() => { playSong(item, downloads); navigation.navigate('Player'); }}>
                  <Feather name="play" size={16} color="#fff" />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        )
      )}

      {/* Create Playlist Modal */}
      <Modal visible={showCreateModal} transparent animationType="fade" onRequestClose={() => setShowCreateModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>New Playlist</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Playlist name"
              placeholderTextColor={colors.textMuted}
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              autoFocus
              onSubmitEditing={handleCreatePlaylist}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => { setShowCreateModal(false); setNewPlaylistName(''); }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalCreate, !newPlaylistName.trim() && styles.modalCreateDisabled]}
                onPress={handleCreatePlaylist}
              >
                <Text style={styles.modalCreateText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default PlaylistsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingVertical: 14,
  },
  logo: { ...typography.h2, color: colors.text },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  tab: { marginRight: 24, paddingVertical: 12 },
  tabActive: { borderBottomWidth: 2.5, borderBottomColor: colors.primary },
  tabText: { fontSize: 15, fontWeight: '500', color: colors.textMuted },
  tabTextActive: { color: colors.primary, fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
  emptyTitle: { ...typography.h3, color: colors.text },
  emptySub: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
  createBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.primary, paddingHorizontal: 24,
    paddingVertical: 12, borderRadius: borderRadius.full, marginTop: 8,
  },
  createBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  playlistRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  playlistIconWrap: {
    width: 52, height: 52, borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  playlistInfo: { flex: 1 },
  playlistName: { ...typography.body, fontWeight: '600', color: colors.text, marginBottom: 4 },
  playlistMeta: { fontSize: 12, color: colors.textMuted },
  moreBtn: { padding: 8 },
  songRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  songImg: { width: 52, height: 52, borderRadius: borderRadius.sm, backgroundColor: colors.surfaceElevated, marginRight: 14 },
  songInfo: { flex: 1 },
  songName: { ...typography.body, fontWeight: '600', color: colors.text, marginBottom: 4 },
  songMeta: { fontSize: 12, color: colors.textMuted },
  downloadedBadge: { marginRight: 8 },
  playBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1, backgroundColor: colors.overlay,
    alignItems: 'center', justifyContent: 'center',
  },
  modalBox: {
    backgroundColor: colors.surfaceElevated, borderRadius: borderRadius.xl,
    padding: spacing.lg, width: '80%', gap: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  modalTitle: { ...typography.h3, color: colors.text },
  modalInput: {
    backgroundColor: colors.surface, borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md, paddingVertical: 12,
    color: colors.text, fontSize: 15,
    borderWidth: 1, borderColor: colors.border,
  },
  modalActions: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'flex-end' },
  modalCancel: { paddingHorizontal: 20, paddingVertical: 10 },
  modalCancelText: { color: colors.textMuted, fontSize: 15, fontWeight: '600' },
  modalCreate: {
    backgroundColor: colors.primary, paddingHorizontal: 20,
    paddingVertical: 10, borderRadius: borderRadius.full,
  },
  modalCreateDisabled: { backgroundColor: colors.textMuted },
  modalCreateText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});