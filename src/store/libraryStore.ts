import { create } from 'zustand';
import { Song } from '../types';
import { storage, StorageKeys } from '../services/storage';

interface LibraryStore {
  likedSongs: Song[];
  toggleLike: (song: Song) => void;
  isLiked: (songId: string) => boolean;
}

const loadLikedSongs = (): Song[] => {
  try {
    const raw = storage.getString(StorageKeys.LIKED_SONGS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const useLibraryStore = create<LibraryStore>((set, get) => ({
  likedSongs: loadLikedSongs(),

  toggleLike: (song) => {
    const { likedSongs } = get();
    const isAlreadyLiked = likedSongs.some((s) => s.id === song.id);
    const updated = isAlreadyLiked
      ? likedSongs.filter((s) => s.id !== song.id)
      : [song, ...likedSongs];
    set({ likedSongs: updated });
    storage.set(StorageKeys.LIKED_SONGS, JSON.stringify(updated));
  },

  isLiked: (songId) => {
    return get().likedSongs.some((s) => s.id === songId);
  },
}));
