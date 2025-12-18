import '@testing-library/jest-dom';
import { vi } from 'vitest';

class MockAudioContext {
  constructor() {
    this.state = 'running';
    this.sampleRate = 48000;
  }
  createGain() { return { connect: () => {}, gain: { value: 1 } }; }
  createBufferSource() {
    return {
      connect: () => {},
      start: () => {},
      stop: () => {},
      buffer: null,
      onended: null
    };
  }
  createBuffer(numberOfChannels = 1, length = 1, sampleRate = 48000) {
    return {
      length,
      numberOfChannels,
      sampleRate,
      duration: length / sampleRate,
      getChannelData(channel = 0) {
        return new Float32Array(length);
      },
      copyFromChannel() {},
      copyToChannel() {},
    };
  }
  resume() { this.state = 'running'; return Promise.resolve(); }
  suspend() { this.state = 'suspended'; return Promise.resolve(); }
  close() { this.state = 'closed'; return Promise.resolve(); }
  decodeAudioData(buffer, success, fail) {
    if (success) success({});
    return Promise.resolve({});
  }
  destination = {};
  state: string;
  sampleRate: number;
}

// Mock global para tests
globalThis.AudioContext = MockAudioContext as any;
globalThis.webkitAudioContext = MockAudioContext as any;

// Mock Match Media si es necesario para tests de UI
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
