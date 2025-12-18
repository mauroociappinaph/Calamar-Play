/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from '@testing-library/react';
import { useStore } from '@/features/game/state/store';
import { GameStatus } from '@/shared/types/types';

// Mock del AudioEngine
vi.mock('@/systems/audio/AudioEngine', () => ({
  audio: {
    playGemCollect: vi.fn(),
    playLetterCollect: vi.fn(),
    playDamage: vi.fn(),
    playJump: vi.fn()
  }
}));

describe('Collision System Integration', () => {
  beforeEach(() => {
    // Reset store state
    act(() => {
      useStore.getState().startGame();
    });
  });

  it('should reduce lives when takeDamage is called', () => {
    const store = useStore.getState();

    // Initial state: 3 lives
    expect(store.lives).toBe(3);

    // Simulate damage
    act(() => {
      store.takeDamage();
    });

    // Should reduce to 2 lives
    expect(useStore.getState().lives).toBe(2);
  });

  it('should change to GAME_OVER when lives reach 0', () => {
    const store = useStore.getState();

    // Start with fresh game
    act(() => {
      store.startGame();
    });

    expect(store.lives).toBe(3);
    expect(store.status).toBe(GameStatus.PLAYING);

    // Simulate 3 damages to reduce all lives
    act(() => {
      store.takeDamage();
      store.takeDamage();
      store.takeDamage();
    });

    // Should be GAME_OVER with 0 lives
    const finalState = useStore.getState();
    expect(finalState.lives).toBe(0);
    expect(finalState.status).toBe(GameStatus.GAME_OVER);
  });

  it('should not reduce lives when immortality is active', () => {
    const store = useStore.getState();

    // First buy immortality item
    act(() => {
      store.addScore(200); // Give enough score
      store.buyItem('IMMORTAL', 100);
    });

    // Now activate immortality
    act(() => {
      store.activateImmortality();
    });

    expect(useStore.getState().isImmortalityActive).toBe(true);

    // Simulate damage - should not reduce lives
    act(() => {
      store.takeDamage();
    });

    // Lives should remain 3
    expect(useStore.getState().lives).toBe(3);
  });

  it('should handle rapid consecutive damages correctly', () => {
    const store = useStore.getState();

    expect(store.lives).toBe(3);

    // Simulate rapid damages
    act(() => {
      for (let i = 0; i < 5; i++) {
        store.takeDamage();
      }
    });

    // Should only lose 3 lives and go to GAME_OVER
    const finalState = useStore.getState();
    expect(finalState.lives).toBe(0);
    expect(finalState.status).toBe(GameStatus.GAME_OVER);
  });

  it('should restore max lives when buying MAX_LIFE upgrade', () => {
    const store = useStore.getState();

    // Give enough score to buy item
    act(() => {
      store.addScore(200);
    });

    // Reduce lives first
    act(() => {
      store.takeDamage();
    });

    expect(useStore.getState().lives).toBe(2);
    expect(useStore.getState().maxLives).toBe(3);

    // Buy MAX_LIFE upgrade (should increase max lives and heal)
    act(() => {
      const success = store.buyItem('MAX_LIFE', 100);
      expect(success).toBe(true);
    });

    // Should have increased max lives and healed
    const finalState = useStore.getState();
    expect(finalState.maxLives).toBe(4);
    expect(finalState.lives).toBe(3); // Healed back to new max - 1
  });
});
