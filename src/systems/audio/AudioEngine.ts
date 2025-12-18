/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameStatus } from '@/shared/types/types';

// Audio categories for volume control
export type AudioCategory = 'master' | 'music' | 'sfx' | 'ambience';

// SFX playback options
export interface SFXOptions {
  volume?: number;
  pitch?: number;
  loop?: boolean;
  fadeIn?: number;
  fadeOut?: number;
}

// Audio engine configuration
interface AudioConfig {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  ambienceVolume: number;
  crossfadeDuration: number;
}

// Audio asset definitions
interface AudioAsset {
  url: string;
  volume: number;
  category: AudioCategory;
}

// Global audio instance
class AudioEngine {
  private audioContext: AudioContext | null = null;
  private gainNodes: Map<AudioCategory, GainNode> = new Map();
  private masterGain: GainNode | null = null;
  private currentMusic: AudioBufferSourceNode | null = null;
  private currentMusicBuffer: AudioBuffer | null = null;
  private isUnlocked = false;
  private config: AudioConfig;
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private activeSources: Set<AudioBufferSourceNode> = new Set();

  constructor() {
    this.config = {
      masterVolume: 1.0,
      musicVolume: 0.6,
      sfxVolume: 0.8,
      ambienceVolume: 0.4,
      crossfadeDuration: 2.0
    };

    this.initializeAudioContext();
  }

  private async initializeAudioContext(): Promise<void> {
    try {
      // Create audio context with fallback for Safari
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass();

      console.log('🎵 AudioEngine: Created AudioContext:', {
        state: this.audioContext.state,
        sampleRate: this.audioContext.sampleRate,
        baseLatency: this.audioContext.baseLatency,
        userAgent: navigator.userAgent
      });

      // Create master gain node
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = this.config.masterVolume;

      console.log('🎵 AudioEngine: Created master gain node, volume:', this.config.masterVolume);

      // Create category gain nodes
      this.createGainNodes();

      console.log('🎵 AudioEngine initialized successfully:', this.audioContext.state);
    } catch (error) {
      console.error('❌ Failed to initialize AudioEngine:', error);
      console.error('❌ Browser support:', {
        hasAudioContext: !!window.AudioContext,
        hasWebkitAudioContext: !!(window as any).webkitAudioContext,
        userAgent: navigator.userAgent
      });
    }
  }

  private createGainNodes(): void {
    if (!this.audioContext || !this.masterGain) return;

    const categories: AudioCategory[] = ['music', 'sfx', 'ambience'];

    categories.forEach(category => {
      const gainNode = this.audioContext.createGain();
      gainNode.connect(this.masterGain);

      // Set initial volume based on config
      const volumeKey = `${category}Volume` as keyof AudioConfig;
      gainNode.gain.value = this.config[volumeKey] as number;

      this.gainNodes.set(category, gainNode);
    });
  }

  // AUDIO UNLOCK: Handle browser audio policies
  public async unlock(): Promise<void> {
    if (!this.audioContext) {
      console.error('❌ Cannot unlock: AudioContext not initialized');
      return;
    }

    console.log('🔊 Audio unlock attempt. Context state before:', this.audioContext.state);

    if (this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
        this.isUnlocked = true;
        console.log('🔊 Audio unlocked successfully. Context state after:', this.audioContext.state);

        // Play a silent sound to confirm unlock
        await this.playSilentSound();
      } catch (error) {
        console.error('❌ Failed to unlock audio:', error);
        this.isUnlocked = false;
      }
    } else {
      console.log('🔊 Audio already unlocked. Context state:', this.audioContext.state);
      this.isUnlocked = true;
    }
  }

  private async playSilentSound(): Promise<void> {
    if (!this.audioContext) return;

    const buffer = this.audioContext.createBuffer(1, 1, 22050);
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    source.start();
  }

  public isAudioUnlocked(): boolean {
    return this.isUnlocked && this.audioContext?.state === 'running';
  }

  // VOLUME CONTROL
  public setVolume(category: AudioCategory, value: number): void {
    this.config[`${category}Volume` as keyof AudioConfig] = Math.max(0, Math.min(1, value));

    if (category === 'master' && this.masterGain) {
      this.masterGain.gain.value = value;
    } else {
      const gainNode = this.gainNodes.get(category);
      if (gainNode) {
        gainNode.gain.value = value;
      }
    }
  }

  public getVolume(category: AudioCategory): number {
    return this.config[`${category}Volume` as keyof AudioConfig] as number;
  }

  // AUDIO LOADING
  public async loadAudio(id: string, url: string): Promise<boolean> {
    if (!this.audioContext) {
      console.error(`❌ Cannot load audio ${id}: AudioContext not initialized`);
      return false;
    }

    console.log(`📦 Loading audio: ${id} from ${url}`);

    try {
      const response = await fetch(url);
      console.log(`📦 Fetch response for ${id}:`, response.status, response.statusText);

      if (!response.ok) {
        console.error(`❌ HTTP error loading ${id}: ${response.status} ${response.statusText}`);
        return false;
      }

      const arrayBuffer = await response.arrayBuffer();
      console.log(`📦 ArrayBuffer loaded for ${id}, size: ${arrayBuffer.byteLength} bytes`);

      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      console.log(`📦 Audio decoded for ${id}:`, {
        duration: audioBuffer.duration,
        sampleRate: audioBuffer.sampleRate,
        numberOfChannels: audioBuffer.numberOfChannels
      });

      this.audioBuffers.set(id, audioBuffer);
      console.log(`📦 Audio loaded successfully: ${id}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to load audio ${id}:`, error);
      return false;
    }
  }

  // MUSIC PLAYBACK
  public async playMusic(id: string, crossfade: number = this.config.crossfadeDuration): Promise<void> {
    if (!this.isAudioUnlocked() || !this.audioContext) return;

    const buffer = this.audioBuffers.get(id);
    if (!buffer) {
      console.warn(`⚠️ Music not loaded: ${id}`);
      return;
    }

    // Stop current music with crossfade
    if (this.currentMusic) {
      this.fadeOutSource(this.currentMusic, crossfade);
    }

    // Create new music source
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Connect through music gain node
    const musicGain = this.gainNodes.get('music');
    if (musicGain) {
      source.connect(musicGain);
    }

    // Fade in
    this.fadeInSource(source, crossfade);

    source.start();
    this.currentMusic = source;
    this.currentMusicBuffer = buffer;

    console.log(`🎵 Music playing: ${id}`);
  }

  public stopMusic(fadeOut: number = 0.5): void {
    if (this.currentMusic) {
      this.fadeOutSource(this.currentMusic, fadeOut);
      this.currentMusic = null;
      this.currentMusicBuffer = null;
    }
  }

  // SFX PLAYBACK
  public async playSFX(id: string, options: SFXOptions = {}): Promise<void> {
    console.log(`🔊 playSFX called: ${id}`, {
      isUnlocked: this.isAudioUnlocked(),
      contextState: this.audioContext?.state,
      hasBuffer: this.audioBuffers.has(id),
      options
    });

    if (!this.audioContext) {
      console.warn(`⚠️ Cannot play SFX ${id}: No audio context`);
      return;
    }

    // Auto-unlock if not unlocked yet
    if (!this.isAudioUnlocked()) {
      console.log(`🔊 Auto-unlocking audio for SFX ${id}`);
      await this.unlock();

      // If still not unlocked after auto-unlock attempt, warn and return
      if (!this.isAudioUnlocked()) {
        console.warn(`⚠️ Cannot play SFX ${id}: Audio context still suspended after unlock attempt`);
        return;
      }
    }

    const buffer = this.audioBuffers.get(id);
    if (!buffer) {
      console.warn(`⚠️ SFX not loaded: ${id}. Available buffers:`, Array.from(this.audioBuffers.keys()));
      return;
    }

    console.log(`✅ Playing SFX ${id}:`, {
      bufferDuration: buffer.duration,
      bufferSampleRate: buffer.sampleRate,
      bufferNumberOfChannels: buffer.numberOfChannels
    });

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;

    // Set playback rate for pitch variation
    if (options.pitch) {
      source.playbackRate.value = options.pitch;
    }

    // Create gain node for volume control
    const gainNode = this.audioContext.createGain();
    const volume = options.volume ?? 1.0;
    gainNode.gain.value = volume;

    // Connect through SFX gain node
    const sfxGain = this.gainNodes.get('sfx');
    if (sfxGain) {
      source.connect(gainNode);
      gainNode.connect(sfxGain);
    }

    // Handle fade in/out
    if (options.fadeIn) {
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + options.fadeIn);
    }

    if (options.fadeOut) {
      const fadeTime = buffer.duration - options.fadeOut;
      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime + fadeTime);
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + buffer.duration);
    }

    // Set loop if requested
    source.loop = options.loop ?? false;

    // Track active source for cleanup
    this.activeSources.add(source);

    // Cleanup when finished
    source.onended = () => {
      this.activeSources.delete(source);
    };

    source.start();

    // Auto-stop if not looping
    if (!options.loop) {
      source.stop(this.audioContext.currentTime + buffer.duration);
    }

    console.log(`🔊 SFX played: ${id}`, options);
  }

  // UTILITY METHODS
  private fadeInSource(source: AudioBufferSourceNode, duration: number): void {
    if (!this.audioContext) return;

    // Note: fadeInSource is simplified - the gain control is handled in playMusic
    // This method is kept for future enhancement
  }

  private fadeOutSource(source: AudioBufferSourceNode, duration: number): void {
    if (!this.audioContext) return;

    // Find gain node and fade out
    const connections = (source as any)._connections;
    if (connections) {
      connections.forEach((node: AudioNode) => {
        if (node instanceof GainNode) {
          node.gain.linearRampToValueAtTime(0, this.audioContext!.currentTime + duration);
        }
      });
    }

    // Stop after fade
    setTimeout(() => {
      try {
        source.stop();
      } catch (e) {
        // Source might already be stopped
      }
    }, duration * 1000);
  }

  // CLEANUP
  public dispose(): void {
    // Stop all active sources
    this.activeSources.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // Source might already be stopped
      }
    });
    this.activeSources.clear();

    // Close audio context
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }

    // Clear buffers
    this.audioBuffers.clear();

    console.log('🗑️ AudioEngine disposed');
  }

  // DEBUG INFO
  public getDebugInfo(): any {
    return {
      isUnlocked: this.isUnlocked,
      contextState: this.audioContext?.state,
      activeSources: this.activeSources.size,
      loadedBuffers: this.audioBuffers.size,
      volumes: {
        master: this.config.masterVolume,
        music: this.config.musicVolume,
        sfx: this.config.sfxVolume,
        ambience: this.config.ambienceVolume
      }
    };
  }
}

// Export singleton instance
export const audio = new AudioEngine();

// Convenience functions for common audio events
export const audioEvents = {
  // Gameplay SFX
  playGemCollect: () => audio.playSFX('gem_collect', { volume: 0.6 }),
  playLetterCollect: () => audio.playSFX('letter_collect', { volume: 0.8 }),
  playJump: () => audio.playSFX('jump', { volume: 0.7, pitch: 0.9 + Math.random() * 0.2 }),
  playDamage: () => audio.playSFX('damage', { volume: 0.9 }),
  playCheckpoint: () => audio.playSFX('checkpoint', { volume: 0.8 }),

  // UI SFX
  playMenuSelect: () => audio.playSFX('menu_select', { volume: 0.5 }),
  playMenuConfirm: () => audio.playSFX('menu_confirm', { volume: 0.6 }),

  // Music
  playGameMusic: () => audio.playMusic('game_theme'),
  stopMusic: () => audio.stopMusic(),

  // Ambience
  playOceanAmbience: () => audio.playSFX('ocean_ambience', { volume: 0.3, loop: true }),
};
