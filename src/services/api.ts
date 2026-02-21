import { Song, Album, Artist, Playlist, SearchResult } from '../types';

const BASE_URL = 'https://saavn.sumit.co';

async function fetchAPI<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  const data = await response.json();
  return data;
}

export const searchSongs = async (
  query: string,
  page: number = 1,
  limit: number = 20
): Promise<{ results: Song[]; total: number }> => {
  const data = await fetchAPI<any>(
    `/api/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
  );
  return {
    results: data.data?.results || [],
    total: data.data?.total || 0,
  };
};

export const searchAll = async (query: string): Promise<SearchResult> => {
  const data = await fetchAPI<any>(
    `/api/search?query=${encodeURIComponent(query)}`
  );
  return data.data || {};
};

export const searchAlbums = async (
  query: string,
  page: number = 1
): Promise<{ results: Album[]; total: number }> => {
  const data = await fetchAPI<any>(
    `/api/search/albums?query=${encodeURIComponent(query)}&page=${page}`
  );
  return {
    results: data.data?.results || [],
    total: data.data?.total || 0,
  };
};

export const searchArtists = async (
  query: string,
  page: number = 1
): Promise<{ results: Artist[]; total: number }> => {
  const data = await fetchAPI<any>(
    `/api/search/artists?query=${encodeURIComponent(query)}&page=${page}`
  );
  return {
    results: data.data?.results || [],
    total: data.data?.total || 0,
  };
};

export const getSong = async (id: string): Promise<Song | null> => {
  const data = await fetchAPI<any>(`/api/songs/${id}`);
  return data.data?.[0] || null;
};

export const getSongSuggestions = async (id: string): Promise<Song[]> => {
  const data = await fetchAPI<any>(`/api/songs/${id}/suggestions`);
  return data.data || [];
};

export const getArtist = async (id: string): Promise<Artist | null> => {
  const data = await fetchAPI<any>(`/api/artists/${id}`);
  return data.data || null;
};

export const getArtistSongs = async (
  id: string,
  page: number = 0
): Promise<{ results: Song[]; total: number }> => {
  const data = await fetchAPI<any>(`/api/artists/${id}/songs?page=${page}`);
  return {
    results: data.data?.songs?.results || [],
    total: data.data?.songs?.total || 0,
  };
};

export const getAlbum = async (id: string): Promise<Album | null> => {
  const data = await fetchAPI<any>(`/api/albums?id=${id}`);
  return data.data || null;
};

export const getTrendingSongs = async (): Promise<Song[]> => {
  // Use a popular search as trending fallback
  const data = await searchSongs('arijit singh', 1, 20);
  return data.results;
};

export const getTopCharts = async (): Promise<Song[]> => {
  const data = await searchSongs('bollywood hits 2024', 1, 20);
  return data.results;
};

export function getBestImageUrl(images: any[]): string {
  if (!images || images.length === 0) return '';
  const preferred = images.find(
    (img) => img.quality === '500x500' || img.quality === '150x150'
  );
  const img = preferred || images[images.length - 1];
  return img?.link || img?.url || '';
}

export function getBestAudioUrl(downloadUrls: any[]): string {
  if (!downloadUrls || downloadUrls.length === 0) return '';
  const preferred = downloadUrls.find((d) => d.quality === '320kbps');
  const fallback = downloadUrls.find((d) => d.quality === '160kbps');
  const item = preferred || fallback || downloadUrls[downloadUrls.length - 1];
  return item?.link || item?.url || '';
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getArtistNames(song: Song): string {
  if (song.primaryArtists) return song.primaryArtists;
  if (song.artists?.primary?.length) {
    return song.artists.primary.map((a) => a.name).join(', ');
  }
  return 'Unknown Artist';
}