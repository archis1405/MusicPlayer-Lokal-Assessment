import { create } from 'zustand';
import { Song, RepeatMode } from '../types';
import { playerService } from '../services/playerService';
import { storage, StorageKeys } from '../services/storage';
import { getDownloadedSong } from '../services/downloadService';

interface PlayerState {
  currentSong: Song | null;
  queue: Song[];
  currentIndex: number;
  isPlaying: boolean;
  isLoading: boolean;
  duration: number;
  position: number;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  shuffledIndices: number[];
  volume: number;

  // Actions
  playSong: (song: Song, queue?: Song[]) => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  togglePlay: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  setRepeatMode: (mode: RepeatMode) => void;
  toggleShuffle: () => void;
  setPosition: (position: number) => void;
  setDuration: (duration: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (from: number, to: number) => void;
  clearQueue: () => void;
  playAtIndex: (index: number) => Promise<void>;
}

const loadPersistedState = () => {
  try {
    const queueRaw = storage.getString(StorageKeys.QUEUE);
    const indexRaw = storage.getString(StorageKeys.CURRENT_SONG_INDEX);
    const repeatMode = storage.getString(StorageKeys.REPEAT_MODE) as RepeatMode;
    const shuffle = storage.getBoolean(StorageKeys.SHUFFLE);

    return {
      queue: queueRaw ? JSON.parse(queueRaw) : [],
      currentIndex: indexRaw ? parseInt(indexRaw) : 0,
      repeatMode: repeatMode || 'none',
      isShuffle: shuffle || false,
    };
  } catch {
    return { queue: [], currentIndex: 0, repeatMode: 'none' as RepeatMode, isShuffle: false };
  }
};

const persisted = loadPersistedState();

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSong: persisted.queue[persisted.currentIndex] || null,
  queue: persisted.queue,
  currentIndex: persisted.currentIndex,
  isPlaying: false,
  isLoading: false,
  duration: 0,
  position: 0,
  repeatMode: persisted.repeatMode,
  isShuffle: persisted.isShuffle,
  shuffledIndices: [],
  volume: 1,

  playSong: async (song, queue) => {
    const state = get();
    let newQueue = queue || state.queue;
    let index = newQueue.findIndex((s) => s.id === song.id);

    if (index === -1) {
      if (!queue) {
        newQueue = [...state.queue, song];
        index = newQueue.length - 1;
      } else {
        index = 0;
        newQueue = queue;
      }
    }

    set({ isLoading: true, currentSong: song, currentIndex: index, queue: newQueue });
    storage.set(StorageKeys.QUEUE, JSON.stringify(newQueue));
    storage.set(StorageKeys.CURRENT_SONG_INDEX, index.toString());

    try {
     
      const downloaded = getDownloadedSong(song.id);
      const songToPlay = downloaded
        ? { ...song, downloadUrl: [{ quality: '320kbps', url: downloaded.localAudioPath }] }
        : song;

      playerService.setStatusUpdateCallback((status) => {
        if (status.isLoaded) {
          set({
            isPlaying: status.isPlaying,
            position: status.positionMillis || 0,
            duration: status.durationMillis || 0,
            isLoading: false,
          });
        }
      });

      playerService.setPlaybackEndCallback(() => {
        get().playNext();
      });

      await playerService.loadAndPlay(songToPlay);
      set({ isLoading: false });
    } catch (error) {
      console.error('playSong error:', error);
      set({ isLoading: false });
    }
  },

  playNext: async () => {
    const { queue, currentIndex, repeatMode, isShuffle, shuffledIndices } = get();
    if (!queue.length) return;

    let nextIndex: number;

    if (repeatMode === 'one') {
      nextIndex = currentIndex;
    } else if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * queue.length);
      nextIndex = randomIndex;
    } else {
      nextIndex = currentIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeatMode === 'all') {
          nextIndex = 0;
        } 
        else {
          return;
        }
      }
    }

    storage.set(StorageKeys.CURRENT_SONG_INDEX, nextIndex.toString());
    await get().playSong(queue[nextIndex], queue);
  },

  playPrevious: async () => {
    const { queue, currentIndex, position } = get();
    if (!queue.length) return;

    // If more than 3 seconds, restart current song
    if (position > 3000) {
      await playerService.seekTo(0);
      return;
    }

    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) prevIndex = queue.length - 1;

    storage.set(StorageKeys.CURRENT_SONG_INDEX, prevIndex.toString());
    await get().playSong(queue[prevIndex], queue);
  },

  togglePlay: async () => {
    const { isPlaying } = get();
    if (isPlaying) {
      await playerService.pause();
    } else {
      await playerService.play();
    }
    set({ isPlaying: !isPlaying });
  },

  seekTo: async (position) => {
    await playerService.seekTo(position);
    set({ position });
  },

  setRepeatMode: (mode) => {
    set({ repeatMode: mode });
    storage.set(StorageKeys.REPEAT_MODE, mode);
    playerService.setLooping(mode === 'one');
  },

  toggleShuffle: () => {
    const { isShuffle } = get();
    const newShuffle = !isShuffle;
    set({ isShuffle: newShuffle });
    storage.set(StorageKeys.SHUFFLE, newShuffle);
  },

  setPosition: (position) => set({ position }),
  setDuration: (duration) => set({ duration }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setIsLoading: (loading) => set({ isLoading: loading }),

  addToQueue: (song) => {
    const { queue } = get();
    const newQueue = [...queue, song];
    set({ queue: newQueue });
    storage.set(StorageKeys.QUEUE, JSON.stringify(newQueue));
  },

  removeFromQueue: (index) => {
    const { queue, currentIndex } = get();
    const newQueue = queue.filter((_, i) => i !== index);
    const newIndex = index < currentIndex ? currentIndex - 1 : currentIndex;
    set({ queue: newQueue, currentIndex: newIndex });
    storage.set(StorageKeys.QUEUE, JSON.stringify(newQueue));
    storage.set(StorageKeys.CURRENT_SONG_INDEX, newIndex.toString());
  },

  reorderQueue: (from, to) => {
    const { queue } = get();
    const newQueue = [...queue];
    const [removed] = newQueue.splice(from, 1);
    newQueue.splice(to, 0, removed);
    set({ queue: newQueue });
    storage.set(StorageKeys.QUEUE, JSON.stringify(newQueue));
  },

  clearQueue: () => {
    set({ queue: [], currentIndex: 0 });
    storage.set(StorageKeys.QUEUE, JSON.stringify([]));
    storage.set(StorageKeys.CURRENT_SONG_INDEX, '0');
  },

  playAtIndex: async (index) => {
    const { queue } = get();
    if (index >= 0 && index < queue.length) {
      await get().playSong(queue[index], queue);
    }
  },
}));
