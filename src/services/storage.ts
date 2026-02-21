import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV({
  id: 'music-player-storage',
});

export const StorageKeys = {
  QUEUE: 'queue',
  CURRENT_SONG_INDEX: 'currentSongIndex',
  REPEAT_MODE: 'repeatMode',
  SHUFFLE: 'shuffle',
  DOWNLOADED_SONGS: 'downloaded_songs',
  RECENT_SEARCHES: 'recentSearches',
  LIKED_SONGS: 'likedSongs',
};
