import { create } from 'zustand';
import { Song } from '../types';
import { storage } from '../services/storage';

const PLAYLISTS_KEY = 'playlists';

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  createdAt: number;
}

interface PlaylistStore {
  playlists: Playlist[];
  createPlaylist: (name: string) => Playlist;
  deletePlaylist: (id: string) => void;
  addSongToPlaylist: (playlistId: string, song: Song) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;
  loadPlaylists: () => void;
}

export const usePlaylistStore = create<PlaylistStore>((set, get) => ({
  playlists: [],

  createPlaylist: (name) => {
    const playlist: Playlist = {
      id: Date.now().toString(),
      name: name.trim(),
      songs: [],
      createdAt: Date.now(),
    };
    const next = [...get().playlists, playlist];
    set({ playlists: next });
    storage.set(PLAYLISTS_KEY, JSON.stringify(next));
    return playlist;
  },

  deletePlaylist: (id) => {
    const next = get().playlists.filter((p) => p.id !== id);
    set({ playlists: next });
    storage.set(PLAYLISTS_KEY, JSON.stringify(next));
  },

  addSongToPlaylist: (playlistId, song) => {
    const next = get().playlists.map((p) => {
      if (p.id !== playlistId) return p;
      if (p.songs.find((s) => s.id === song.id)) return p;
      return { ...p, songs: [...p.songs, song] };
    });
    set({ playlists: next });
    storage.set(PLAYLISTS_KEY, JSON.stringify(next));
  },

  removeSongFromPlaylist: (playlistId, songId) => {
    const next = get().playlists.map((p) =>
      p.id === playlistId ? { ...p, songs: p.songs.filter((s) => s.id !== songId) } : p
    );
    set({ playlists: next });
    storage.set(PLAYLISTS_KEY, JSON.stringify(next));
  },

  loadPlaylists: () => {
    try {
      const raw = storage.getString(PLAYLISTS_KEY);
      if (raw) set({ playlists: JSON.parse(raw) });
    } catch {}
  },
}));