/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useStore } from '@/features/game/state/store';
import { RUN_SPEED_BASE } from '@/shared/types/types';

// Mock the store
vi.mock('@/features/game/state/store', () => ({
  useStore: vi.fn(),
}));

const mockUseStore = vi.mocked(useStore);

describe('Economy Balance Integration (TASK-019)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store to clean state
    useStore.getState().startGame();
  });

  it('should apply variable rewards to gem collection based on speed', () => {
    const store = useStore.getState();

    // Set up state for testing
    store.setDistance(500); // 500m traveled

    const initialScore = store.score;
    const initialGems = store.gemsCollected;

    // Collect a gem - should get variable rewards
    store.collectGem(50);

    // Verify score increased (with multipliers) and gems collected
    expect(store.score).toBeGreaterThan(initialScore);
    expect(store.gemsCollected).toBe(initialGems + 1);
    expect(store.score).toBeGreaterThanOrEqual(50); // At least base value
  });

  it('should cap speed increases at 3x base speed', () => {
    const store = useStore.getState();

    // Set speed near the cap
    store.setDistance(RUN_SPEED_BASE * 2.9);

    const initialSpeed = store.speed;

    // Collect a letter to trigger speed increase
    store.collectLetter(0);

    // Speed should increase but be capped at 3x base
    expect(store.speed).toBeGreaterThan(initialSpeed);
    expect(store.speed).toBeLessThanOrEqual(RUN_SPEED_BASE * 3);
  });

  it('should reduce level-up speed increase to 20%', () => {
    const store = useStore.getState();

    // Need to collect all letters to trigger level up
    const lettersCount = 11; // CALAMARLOCO
    for (let i = 0; i < lettersCount; i++) {
      store.collectLetter(i);
    }

    // After collecting all letters, should advance to level 2
    expect(store.level).toBe(2);
    expect(store.speed).toBe(RUN_SPEED_BASE * 1.2); // 20% increase, not 30%
    expect(store.laneCount).toBe(5); // 3 + 2
  });

  it('should allow purchasing items with sufficient funds', () => {
    const store = useStore.getState();

    // Add enough score for purchases
    store.addScore(2000);

    // Test purchasing items with the new reduced costs
    expect(store.buyItem('DOUBLE_JUMP', 600)).toBe(true); // Was 1000
    expect(store.score).toBe(1400); // 2000 - 600

    expect(store.buyItem('HEAL', 500)).toBe(true); // Was 1000
    expect(store.score).toBe(900); // 1400 - 500
  });

  it('should prevent purchasing when insufficient funds', () => {
    const store = useStore.getState();

    // Set low score
    store.addScore(300); // Not enough for any item

    // Should fail for all items
    expect(store.buyItem('DOUBLE_JUMP', 600)).toBe(false);
    expect(store.buyItem('HEAL', 500)).toBe(false);
    expect(store.buyItem('MAX_LIFE', 800)).toBe(false);
    expect(store.buyItem('IMMORTAL', 1500)).toBe(false);
  });

  it('should prevent repurchasing one-time items', () => {
    const store = useStore.getState();

    // Add score and purchase double jump
    store.addScore(1000);
    expect(store.buyItem('DOUBLE_JUMP', 600)).toBe(true);

    // Try to purchase again - should fail
    expect(store.buyItem('DOUBLE_JUMP', 600)).toBe(false);
    expect(store.hasDoubleJump).toBe(true);
  });
});
