import { Audio } from 'expo-av';
import { Song } from '../types';
import { getBestAudioUrl } from './api';

type StatusCallback = (status: any) => void;

class PlayerService {
  private sound: Audio.Sound | null = null;
  private onStatusUpdate: StatusCallback | null = null;
  private onPlaybackEnd: (() => void) | null = null;

  async init() {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      interruptionModeIOS: 1,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: 1,
      playThroughEarpieceAndroid: false,
    });
  }

  setStatusUpdateCallback(callback: StatusCallback) {
    this.onStatusUpdate = callback;
  }

  setPlaybackEndCallback(callback: () => void) {
    this.onPlaybackEnd = callback;
  }

  async loadAndPlay(song: Song): Promise<void> {
    try {
      const url = getBestAudioUrl(song.downloadUrl);
      if (!url) throw new Error('No audio URL found');

      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true },
        (status: any) => {
          if (this.onStatusUpdate) {
            this.onStatusUpdate(status);
          }
          if (status.isLoaded && status.didJustFinish && !status.isLooping) {
            if (this.onPlaybackEnd) {
              this.onPlaybackEnd();
            }
          }
        }
      );

      this.sound = sound;
    } catch (error) {
      console.error('PlayerService loadAndPlay error:', error);
      throw error;
    }
  }

  async play(): Promise<void> {
    if (this.sound) await this.sound.playAsync();
  }

  async pause(): Promise<void> {
    if (this.sound) await this.sound.pauseAsync();
  }

  async seekTo(positionMillis: number): Promise<void> {
    if (this.sound) await this.sound.setPositionAsync(positionMillis);
  }

  async setVolume(volume: number): Promise<void> {
    if (this.sound) await this.sound.setVolumeAsync(volume);
  }

  async setLooping(looping: boolean): Promise<void> {
    if (this.sound) await this.sound.setIsLoopingAsync(looping);
  }

  async unload(): Promise<void> {
    if (this.sound) {
      await this.sound.stopAsync();
      await this.sound.unloadAsync();
      this.sound = null;
    }
  }

  getSound(): Audio.Sound | null {
    return this.sound;
  }
}

export const playerService = new PlayerService();
