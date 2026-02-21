import * as FileSystem from 'expo-file-system';
import { Song } from '../types';
import { getBestAudioUrl, getBestImageUrl } from './api';
import { storage } from './storage';

const DOWNLOADS_DIR = `${FileSystem.documentDirectory}downloads/`;
const DOWNLOADED_SONGS_KEY = 'downloaded_songs';

export interface DownloadedSong extends Song {
  localAudioPath: string;
  localImagePath?: string;
  downloadedAt: number;
}

export async function ensureDownloadDir() {
  const info = await FileSystem.getInfoAsync(DOWNLOADS_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(DOWNLOADS_DIR, { intermediates: true });
  }
}

export async function downloadSong(
  song: Song,
  onProgress?: (progress: number) => void
): Promise<DownloadedSong> {
  await ensureDownloadDir();

  const audioUrl = getBestAudioUrl(song.downloadUrl);
  const imageUrl = getBestImageUrl(song.image);

  const audioPath = `${DOWNLOADS_DIR}${song.id}.mp4`;
  const imagePath = `${DOWNLOADS_DIR}${song.id}.jpg`;

  // Download audio
  const downloadResumable = FileSystem.createDownloadResumable(
    audioUrl,
    audioPath,
    {},
    (downloadProgress) => {
      const progress =
        downloadProgress.totalBytesWritten /
        downloadProgress.totalBytesExpectedToWrite;
      onProgress?.(progress);
    }
  );

  await downloadResumable.downloadAsync();

  // Download image
  if (imageUrl) {
    try {
      await FileSystem.downloadAsync(imageUrl, imagePath);
    } catch {
      // Image download failure is non-fatal
    }
  }

  const downloadedSong: DownloadedSong = {
    ...song,
    localAudioPath: audioPath,
    localImagePath: imageUrl ? imagePath : undefined,
    downloadedAt: Date.now(),
  };

  // Save to storage
  const existing = getDownloadedSongs();
  const updated = [...existing.filter((s) => s.id !== song.id), downloadedSong];
  storage.set(DOWNLOADED_SONGS_KEY, JSON.stringify(updated));

  return downloadedSong;
}

export function getDownloadedSongs(): DownloadedSong[] {
  try {
    const raw = storage.getString(DOWNLOADED_SONGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function deleteSong(songId: string): Promise<void> {
  const audioPath = `${DOWNLOADS_DIR}${songId}.mp4`;
  const imagePath = `${DOWNLOADS_DIR}${songId}.jpg`;

  try {
    await FileSystem.deleteAsync(audioPath, { idempotent: true });
    await FileSystem.deleteAsync(imagePath, { idempotent: true });
  } catch {}

  const existing = getDownloadedSongs();
  const updated = existing.filter((s) => s.id !== songId);
  storage.set(DOWNLOADED_SONGS_KEY, JSON.stringify(updated));
}

export function isDownloaded(songId: string): boolean {
  const songs = getDownloadedSongs();
  return songs.some((s) => s.id === songId);
}

export function getDownloadedSong(songId: string): DownloadedSong | null {
  const songs = getDownloadedSongs();
  return songs.find((s) => s.id === songId) || null;
}
