import { create } from 'zustand';
import { Song } from '../types';
import { storage, StorageKeys } from '../services/storage';

interface SearchStore {
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  removeRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
}

const loadRecentSearches = (): string[] => {
  try {
    const raw = storage.getString(StorageKeys.RECENT_SEARCHES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const useSearchStore = create<SearchStore>((set, get) => ({
  recentSearches: loadRecentSearches(),

  addRecentSearch: (query) => {
    const { recentSearches } = get();
    const filtered = recentSearches.filter((s) => s !== query);
    const updated = [query, ...filtered].slice(0, 10);
    set({ recentSearches: updated });
    storage.set(StorageKeys.RECENT_SEARCHES, JSON.stringify(updated));
  },

  removeRecentSearch: (query) => {
    const { recentSearches } = get();
    const updated = recentSearches.filter((s) => s !== query);
    set({ recentSearches: updated });
    storage.set(StorageKeys.RECENT_SEARCHES, JSON.stringify(updated));
  },

  clearRecentSearches: () => {
    set({ recentSearches: [] });
    storage.set(StorageKeys.RECENT_SEARCHES, JSON.stringify([]));
  },
}));
