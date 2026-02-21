export interface Song {
  id: string;
  name: string;
  duration: number;
  language?: string;
  year?: string;
  album?: {
    id: string;
    name: string;
    url?: string;
  };
  artists?: {
    primary: Artist[];
    featured?: Artist[];
  };
  primaryArtists?: string;
  image: ImageQuality[];
  downloadUrl: DownloadUrl[];
  hasLyrics?: string;
  playCount?: string;
  url?: string;
  label?: string;
}

export interface Artist {
  id: string;
  name: string;
  image?: ImageQuality[];
  url?: string;
}

export interface Album {
  id: string;
  name: string;
  year?: string;
  image?: ImageQuality[];
  artists?: { primary: Artist[] };
  songCount?: number;
  url?: string;
}

export interface Playlist {
  id: string;
  name: string;
  followerCount?: string;
  songCount?: string;
  image?: ImageQuality[];
  url?: string;
}

export interface ImageQuality {
  quality: string;
  link?: string;
  url?: string;
}

export interface DownloadUrl {
  quality: string;
  link?: string;
  url?: string;
}

export interface SearchResult {
  songs?: {
    results: Song[];
    total: number;
  };
  albums?: {
    results: Album[];
    total: number;
  };
  artists?: {
    results: Artist[];
    total: number;
  };
  playlists?: {
    results: Playlist[];
    total: number;
  };
}

export type RepeatMode = 'none' | 'one' | 'all';

export type RootStackParamList = {
  MainTabs: undefined;
  Player: undefined;
  Queue: undefined;
  ArtistDetail: { artistId: string };
  AlbumDetail: { albumId: string };
};

export type BottomTabParamList = {
  Home: undefined;
  Search: undefined;
  Library: undefined;
};
