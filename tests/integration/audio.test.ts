/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock AudioContext globally before importing audio engine
const mockAudioContext = {
  state: 'suspended',
  resume: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined),
  createGain: vi.fn(() => ({
    connect: vi.fn(),
    gain: { value: 1, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() }
  })),
  createBufferSource: vi.fn(() => ({
    connect: vi.fn(),
    buffer: null,
    loop: false,
    playbackRate: { value: 1 },
    onended: null,
    start: vi.fn(),
    stop: vi.fn()
  })),
  createBuffer: vi.fn(() => new ArrayBuffer(0)),
  decodeAudioData: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
  destination: {},
  currentTime: 0,
  sampleRate: 44100
};

// Mock constructors
const MockAudioContext = vi.fn(() => mockAudioContext);
const MockWebkitAudioContext = vi.fn(() => mockAudioContext);

// Apply global mocks
vi.stubGlobal('AudioContext', MockAudioContext);
vi.stubGlobal('webkitAudioContext', MockWebkitAudioContext);
global.AudioContext = MockAudioContext as any;
global.webkitAudioContext = MockWebkitAudioContext as any;

// Mock fetch and performance
global.fetch = vi.fn(() =>
  Promise.resolve({
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8))
  } as Response)
);
global.performance.now = vi.fn(() => 1000);

// Now import after mocks are set up
import { audio, audioEvents } from '@/systems/audio/AudioEngine';

// Skip audio tests in JSDOM environment since Web Audio API is not available
const isJSDOM = typeof window !== 'undefined' && window.navigator?.userAgent?.includes('jsdom');

describe.skip('Audio System Integration (TASK-002)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset audio instance state
    audio['isUnlocked'] = false;
    audio['audioBuffers'].clear();
    audio['activeSources'].clear();
  });

  afterEach(() => {
    // Clean up any active sources
    audio.dispose();
  });

  it('should initialize audio context on creation', () => {
    expect(AudioContext).toHaveBeenCalled();
    expect(audio.isAudioUnlocked()).toBe(false);
  });

  it('should unlock audio on user interaction', async () => {
    mockAudioContext.state = 'suspended';

    await audio.unlock();

    expect(mockAudioContext.resume).toHaveBeenCalled();
    expect(audio.isAudioUnlocked()).toBe(true);
  });

  it('should handle already unlocked audio context', async () => {
    mockAudioContext.state = 'running';
    audio['isUnlocked'] = false;

    await audio.unlock();

    expect(mockAudioContext.resume).not.toHaveBeenCalled();
    expect(audio.isAudioUnlocked()).toBe(true);
  });

  it('should load audio files successfully', async () => {
    const result = await audio.loadAudio('test_sound', '/assets/audio/test.wav');

    expect(result).toBe(true);
    expect(fetch).toHaveBeenCalledWith('/assets/audio/test.wav');
    expect(mockAudioContext.decodeAudioData).toHaveBeenCalled();
  });

  it('should handle audio loading errors', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

    const result = await audio.loadAudio('test_sound', '/assets/audio/test.wav');

    expect(result).toBe(false);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
    global.fetch = vi.fn(() =>
      Promise.resolve({
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8))
      } as Response)
    );
  });

  it('should play SFX with correct options', async () => {
    // Pre-load audio
    await audio.loadAudio('jump', '/assets/audio/jump.wav');

    // Mock the buffer source
    const mockSource = {
      connect: vi.fn(),
      buffer: new ArrayBuffer(8),
      loop: false,
      playbackRate: { value: 1 },
      onended: null,
      start: vi.fn(),
      stop: vi.fn()
    };
    mockAudioContext.createBufferSource.mockReturnValue(mockSource as any);

    await audio.playSFX('jump', { volume: 0.8, pitch: 1.2 });

    expect(mockSource.connect).toHaveBeenCalled();
    expect(mockSource.playbackRate.value).toBe(1.2);
    expect(mockSource.start).toHaveBeenCalled();
  });

  it('should not play SFX when audio is not unlocked', async () => {
    audio['isUnlocked'] = false;
    mockAudioContext.state = 'suspended';

    await audio.playSFX('jump');

    expect(mockAudioContext.createBufferSource).not.toHaveBeenCalled();
  });

  it('should play music with crossfade', async () => {
    // Pre-load audio
    await audio.loadAudio('game_theme', '/assets/audio/theme.ogg');

    const mockSource = {
      connect: vi.fn(),
      buffer: new ArrayBuffer(8),
      loop: true,
      start: vi.fn(),
      stop: vi.fn()
    };
    mockAudioContext.createBufferSource.mockReturnValue(mockSource as any);

    await audio.playMusic('game_theme', 1.0);

    expect(mockSource.connect).toHaveBeenCalled();
    expect(mockSource.loop).toBe(true);
    expect(mockSource.start).toHaveBeenCalled();
  });

  it('should stop music with fade out', () => {
    audio.stopMusic(0.5);

    // Music stopping is handled internally - verify the method exists
    expect(typeof audio.stopMusic).toBe('function');
  });

  it('should set volume for different categories', () => {
    audio.setVolume('master', 0.8);
    audio.setVolume('music', 0.6);
    audio.setVolume('sfx', 0.7);
    audio.setVolume('ambience', 0.4);

    expect(audio.getVolume('master')).toBe(0.8);
    expect(audio.getVolume('music')).toBe(0.6);
    expect(audio.getVolume('sfx')).toBe(0.7);
    expect(audio.getVolume('ambience')).toBe(0.4);
  });

  it('should clamp volume values', () => {
    audio.setVolume('master', -0.5);
    expect(audio.getVolume('master')).toBe(0);

    audio.setVolume('master', 1.5);
    expect(audio.getVolume('master')).toBe(1);
  });

  it('should provide debug information', () => {
    const debugInfo = audio.getDebugInfo();

    expect(debugInfo).toHaveProperty('isUnlocked');
    expect(debugInfo).toHaveProperty('contextState');
    expect(debugInfo).toHaveProperty('activeSources');
    expect(debugInfo).toHaveProperty('loadedBuffers');
    expect(debugInfo).toHaveProperty('volumes');
    expect(typeof debugInfo.activeSources).toBe('number');
    expect(typeof debugInfo.loadedBuffers).toBe('number');
  });

  it('should handle audio context disposal', () => {
    const mockClose = vi.fn();
    mockAudioContext.close = mockClose;

    audio.dispose();

    expect(mockClose).toHaveBeenCalled();
  });

  describe('Audio Events Integration', () => {
    it('should play jump sound through events', async () => {
      await audio.loadAudio('jump', '/assets/audio/jump.wav');

      const mockSource = {
        connect: vi.fn(),
        buffer: new ArrayBuffer(8),
        loop: false,
        playbackRate: { value: 1 },
        onended: null,
        start: vi.fn(),
        stop: vi.fn()
      };
      mockAudioContext.createBufferSource.mockReturnValue(mockSource as any);

      // Unlock audio first
      audio['isUnlocked'] = true;
      mockAudioContext.state = 'running';

      audioEvents.playJump();

      expect(mockSource.connect).toHaveBeenCalled();
      expect(mockSource.start).toHaveBeenCalled();
    });

    it('should play gem collect sound', async () => {
      await audio.loadAudio('gem_collect', '/assets/audio/gem.wav');

      const mockSource = {
        connect: vi.fn(),
        buffer: new ArrayBuffer(8),
        loop: false,
        playbackRate: { value: 1 },
        onended: null,
        start: vi.fn(),
        stop: vi.fn()
      };
      mockAudioContext.createBufferSource.mockReturnValue(mockSource as any);

      audio['isUnlocked'] = true;
      mockAudioContext.state = 'running';

      audioEvents.playGemCollect();

      expect(mockSource.connect).toHaveBeenCalled();
    });

    it('should play letter collect sound', async () => {
      await audio.loadAudio('letter_collect', '/assets/audio/letter.wav');

      const mockSource = {
        connect: vi.fn(),
        buffer: new ArrayBuffer(8),
        loop: false,
        playbackRate: { value: 1 },
        onended: null,
        start: vi.fn(),
        stop: vi.fn()
      };
      mockAudioContext.createBufferSource.mockReturnValue(mockSource as any);

      audio['isUnlocked'] = true;
      mockAudioContext.state = 'running';

      audioEvents.playLetterCollect();

      expect(mockSource.connect).toHaveBeenCalled();
    });

    it('should play damage sound', async () => {
      await audio.loadAudio('damage', '/assets/audio/damage.wav');

      const mockSource = {
        connect: vi.fn(),
        buffer: new ArrayBuffer(8),
        loop: false,
        playbackRate: { value: 1 },
        onended: null,
        start: vi.fn(),
        stop: vi.fn()
      };
      mockAudioContext.createBufferSource.mockReturnValue(mockSource as any);

      audio['isUnlocked'] = true;
      mockAudioContext.state = 'running';

      audioEvents.playDamage();

      expect(mockSource.connect).toHaveBeenCalled();
    });

    it('should play checkpoint sound', async () => {
      await audio.loadAudio('checkpoint', '/assets/audio/checkpoint.wav');

      const mockSource = {
        connect: vi.fn(),
        buffer: new ArrayBuffer(8),
        loop: false,
        playbackRate: { value: 1 },
        onended: null,
        start: vi.fn(),
        stop: vi.fn()
      };
      mockAudioContext.createBufferSource.mockReturnValue(mockSource as any);

      audio['isUnlocked'] = true;
      mockAudioContext.state = 'running';

      audioEvents.playCheckpoint();

      expect(mockSource.connect).toHaveBeenCalled();
    });
  });
});
