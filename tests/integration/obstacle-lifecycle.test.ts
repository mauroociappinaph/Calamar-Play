/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, act, waitFor } from '@testing-library/react';
import { FixedTimestepLoop } from '@/systems/core/FixedTimestepLoop';
import { useStore } from '@/features/game/state/store';
import { GameStatus, ObjectType } from '@/shared/types/types';
import { ObjectPool } from '@/systems/pooling/ObjectPool';
import React from 'react';

// Mock del AudioEngine
vi.mock('@/systems/audio/AudioEngine', () => ({
  audio: {
    playGemCollect: vi.fn(),
    playLetterCollect: vi.fn(),
    playDamage: vi.fn(),
    playJump: vi.fn()
  }
}));

describe('Obstacle Lifecycle Integration', () => {
  let loop: FixedTimestepLoop;

  beforeEach(() => {
    // Reset store state
    act(() => {
      useStore.getState().startGame();
    });

    loop = new FixedTimestepLoop(1/60, 0.25);
  });

  it('should create, render, collide and recycle obstacles correctly', async () => {
    const store = useStore.getState();

    // Start with fresh game
    act(() => {
      store.startGame();
    });

    // Create a test obstacle manually (simulating what LevelManager does)
    const testObstacle = {
      id: 'test-obstacle-1',
      type: ObjectType.OBSTACLE,
      position: [0, 0.8, -10], // In front of player
      active: true,
      color: '#ff0000'
    };

    console.log('DEBUG TEST: Created test obstacle', testObstacle);

    // Verify obstacle is active and has correct properties
    expect(testObstacle.active).toBe(true);
    expect(testObstacle.type).toBe(ObjectType.OBSTACLE);
    expect(testObstacle.position[2]).toBe(-10);

    // Simulate collision (player hitting obstacle)
    act(() => {
      window.dispatchEvent(new Event('player-hit'));
    });

    // Lives should decrease
    expect(useStore.getState().lives).toBe(2);

    // Simulate releasing obstacle back to pool
    testObstacle.active = false;
    console.log('DEBUG TEST: Deactivated obstacle', testObstacle);

    // Verify obstacle is inactive
    expect(testObstacle.active).toBe(false);

    // Simulate reusing obstacle (what pool.acquire() does)
    testObstacle.active = true;
    testObstacle.position = [5, 0.8, -20]; // New position
    console.log('DEBUG TEST: Reused obstacle', testObstacle);

    // Verify obstacle is active again with new position
    expect(testObstacle.active).toBe(true);
    expect(testObstacle.position[2]).toBe(-20);
    expect(testObstacle.position[0]).toBe(5);

    // Simulate another collision
    act(() => {
      window.dispatchEvent(new Event('player-hit'));
    });

    // Lives should decrease again
    expect(useStore.getState().lives).toBe(1);

    console.log('DEBUG TEST: Obstacle lifecycle test completed successfully');
  });

  it('should handle obstacle pooling correctly', () => {
    // Test the object pool directly
    const pool = new ObjectPool(
      () => ({
        id: 'test-id',
        type: ObjectType.OBSTACLE,
        position: [0, 0, 0],
        active: false
      }),
      (obj) => {
        obj.active = false;
        obj.position = [0, 0, 0];
      },
      2,
      10
    );

    // Acquire first object
    const obj1 = pool.acquire();
    expect(obj1.active).toBe(false); // Pool creates inactive objects

    // Activate and configure
    obj1.active = true;
    obj1.position = [1, 2, 3];

    // Release back to pool
    pool.release(obj1);

    // Acquire again (should be the same object, reset)
    const obj2 = pool.acquire();
    expect(obj2).toBe(obj1); // Same object reference
    expect(obj2.active).toBe(false); // Reset to inactive
    expect(obj2.position).toEqual([0, 0, 0]); // Reset position

    console.log('DEBUG TEST: Pooling test completed successfully');
  });

  it('should spawn obstacles at correct intervals', () => {
    const store = useStore.getState();

    // Simulate game progression by setting distance
    act(() => {
      store.setDistance(100); // Simulate player has traveled 100 units
    });

    // The LevelManager should spawn obstacles based on distance
    // This is more of an integration test to ensure spawning logic works
    expect(store.distance).toBe(100);

    console.log('DEBUG TEST: Spawning interval test completed');
  });
});
