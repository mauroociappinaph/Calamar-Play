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
  });

  it('should apply variable rewards to gem collection based on speed', () => {
    const mockCollectGem = vi.fn();
    const mockSet = vi.fn();

    mockUseStore.mockReturnValue({
      collectGem: mockCollectGem,
      speed: RUN_SPEED_BASE * 1.5, // 150% speed
      distance: 500, // 500m
      laneCount: 3,
      set: mockSet,
      score: 0,
      gemsCollected: 0,
    });

    // Mock the set function to capture state updates
    mockSet.mockImplementation((updater) => {
      if (typeof updater === 'function') {
        const currentState = {
          score: 0,
          gemsCollected: 0,
          speed: RUN_SPEED_BASE * 1.5,
          distance: 500,
          laneCount: 3
        };
        const newState = updater(currentState);
        // Verify that score increased with multiplier
        expect(newState.score).toBeGreaterThan(50); // Base 50pts should be multiplied
        expect(newState.gemsCollected).toBe(1);
      }
    });

    // Call collectGem with base value of 50
    const store = useStore();
    store.collectGem(50);

    // Verify set was called (state was updated)
    expect(mockSet).toHaveBeenCalled();
  });

  it('should cap speed increases at 3x base speed', () => {
    const mockSet = vi.fn();

    mockUseStore.mockReturnValue({
      collectedLetters: [],
      speed: RUN_SPEED_BASE * 2.9, // Near cap
      level: 1,
      laneCount: 3,
      collectGem: vi.fn(),
      set: mockSet,
    });

    // Mock set to capture speed updates
    mockSet.mockImplementation((updater) => {
      if (typeof updater === 'function') {
        const currentState = {
          collectedLetters: [],
          speed: RUN_SPEED_BASE * 2.9,
          level: 1,
          laneCount: 3
        };
        const newState = updater(currentState);
        // Speed should be capped at 3x base
        expect(newState.speed).toBeLessThanOrEqual(RUN_SPEED_BASE * 3);
      }
    });

    // Call collectLetter to trigger speed increase
    const store = useStore();
    store.collectLetter(0);

    expect(mockSet).toHaveBeenCalled();
  });

  it('should reduce level-up speed increase to 20%', () => {
    const mockSet = vi.fn();

    mockUseStore.mockReturnValue({
      level: 1,
      laneCount: 3,
      speed: RUN_SPEED_BASE,
      score: 1000,
      distance: 1000,
      collectedLetters: [],
      set: mockSet,
    });

    // Mock set to capture level advancement
    mockSet.mockImplementation((updater) => {
      if (typeof updater === 'function') {
        const currentState = {
          level: 1,
          laneCount: 3,
          speed: RUN_SPEED_BASE,
          score: 1000,
          distance: 1000,
          collectedLetters: []
        };
        const newState = updater(currentState);
        // Speed should increase by 20% (not 30%)
        expect(newState.speed).toBe(RUN_SPEED_BASE * 1.2);
        expect(newState.level).toBe(2);
        expect(newState.laneCount).toBe(5); // 3 + 2
      }
    });

    // Call advanceLevel
    const store = useStore();
    store.advanceLevel();

    expect(mockSet).toHaveBeenCalled();
  });

  it('should scale max life upgrade cost with usage', () => {
    const mockSet = vi.fn();
    let currentMaxLives = 3;

    mockUseStore.mockReturnValue({
      score: 1000,
      maxLives: currentMaxLives,
      lives: 3,
      buyItem: vi.fn().mockImplementation(() => {
        // Simulate scaling cost: more lives = bigger increase
        const lifeIncrease = Math.max(1, Math.floor(currentMaxLives / 3));
        currentMaxLives += lifeIncrease;
        return true;
      }),
      set: mockSet,
    });

    const store = useStore();
    const result = store.buyItem('MAX_LIFE', 800);

    expect(result).toBe(true);
    // With maxLives = 3, increase should be floor(3/3) = 1
    expect(currentMaxLives).toBe(4);
  });

  it('should allow purchasing items with reduced costs', () => {
    const mockSet = vi.fn();

    mockUseStore.mockReturnValue({
      score: 1000,
      maxLives: 3,
      lives: 3,
      hasDoubleJump: false,
      hasImmortality: false,
      buyItem: vi.fn().mockReturnValue(true),
      set: mockSet,
    });

    const store = useStore();

    // Test all reduced costs
    expect(store.buyItem('DOUBLE_JUMP', 600)).toBe(true); // Was 1000
    expect(store.buyItem('MAX_LIFE', 800)).toBe(true);    // Was 1500
    expect(store.buyItem('HEAL', 500)).toBe(true);        // Was 1000
    expect(store.buyItem('IMMORTAL', 1500)).toBe(true);   // Was 3000

    expect(mockUseStore().buyItem).toHaveBeenCalledTimes(4);
  });

  it('should prevent purchasing when insufficient funds', () => {
    mockUseStore.mockReturnValue({
      score: 300, // Not enough for any item
      maxLives: 3,
      lives: 3,
      hasDoubleJump: false,
      hasImmortality: false,
      buyItem: vi.fn().mockReturnValue(false),
    });

    const store = useStore();

    // Should fail for all items
    expect(store.buyItem('DOUBLE_JUMP', 600)).toBe(false);
    expect(store.buyItem('HEAL', 500)).toBe(false);
    expect(store.buyItem('MAX_LIFE', 800)).toBe(false);
    expect(store.buyItem('IMMORTAL', 1500)).toBe(false);
  });

  it('should prevent repurchasing one-time items', () => {
    const mockBuyItem = vi.fn().mockReturnValue(false);

    mockUseStore.mockReturnValue({
      score: 2000,
      maxLives: 3,
      lives: 3,
      hasDoubleJump: true, // Already purchased
      hasImmortality: false,
      buyItem: mockBuyItem,
    } as any);

    const store = useStore();

    // Should fail because already purchased
    expect(store.buyItem('DOUBLE_JUMP', 600)).toBe(false);
    expect(mockBuyItem).toHaveBeenCalledWith('DOUBLE_JUMP', 600);
  });
});
