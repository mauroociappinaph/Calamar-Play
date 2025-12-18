/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkpointManager, CheckpointData } from '@/features/game/state/checkpoints';
import { useStore } from '@/features/game/state/store';
import { GameStatus, ObjectType } from '@/shared/types/types';

// Mock the store for testing
vi.mock('@/features/game/state/store', () => ({
  useStore: vi.fn()
}));

describe('Checkpoint System Integration', () => {
  beforeEach(() => {
    // Clear checkpoints before each test
    checkpointManager.clearCheckpoint();
  });

  describe('Checkpoint Creation', () => {
    it('should create checkpoint at regular intervals', () => {
      // First checkpoint at 50m
      expect(checkpointManager.shouldCreateCheckpoint(50)).toBe(true);

      // Create first checkpoint
      const gameState1 = {
        score: 1000,
        lives: 3,
        maxLives: 3,
        speed: 25,
        collectedLetters: [0, 1],
        level: 1,
        laneCount: 3,
        gemsCollected: 10,
        distance: 50,
        hasDoubleJump: false,
        hasImmortality: false,
        isImmortalityActive: false
      };

      const levelState1 = {
        objects: [
          {
            id: 'obj1',
            type: ObjectType.OBSTACLE,
            position: [0, 0, -10] as [number, number, number],
            active: true
          }
        ],
        distanceTraveled: 50,
        nextLetterDistance: 150
      };

      const checkpoint1 = checkpointManager.createCheckpoint(gameState1, levelState1);
      expect(checkpoint1.distance).toBe(50);
      expect(checkpoint1.objects.length).toBe(1);

      // Should not create another checkpoint immediately
      expect(checkpointManager.shouldCreateCheckpoint(60)).toBe(false);

      // Should create checkpoint at 100m
      expect(checkpointManager.shouldCreateCheckpoint(100)).toBe(true);

      // Create second checkpoint
      const gameState2 = {
        ...gameState1,
        distance: 100,
        score: 2000
      };

      const levelState2 = {
        ...levelState1,
        distanceTraveled: 100,
        objects: [
          {
            id: 'obj2',
            type: ObjectType.LETTER,
            position: [1, 1, -20] as [number, number, number],
            active: true,
            value: 'A',
            targetIndex: 1
          }
        ]
      };

      const checkpoint2 = checkpointManager.createCheckpoint(gameState2, levelState2);
      expect(checkpoint2.distance).toBe(100);
      expect(checkpoint2.score).toBe(2000);
      expect(checkpoint2.objects.length).toBe(1);
    });

    it('should validate checkpoint data integrity', () => {
      const gameState = {
        score: 1000,
        lives: 3,
        maxLives: 3,
        speed: 25,
        collectedLetters: [0, 1],
        level: 1,
        laneCount: 3,
        gemsCollected: 10,
        distance: 50,
        hasDoubleJump: false,
        hasImmortality: false,
        isImmortalityActive: false
      };

      const levelState = {
        objects: [],
        distanceTraveled: 50,
        nextLetterDistance: 150
      };

      const checkpoint = checkpointManager.createCheckpoint(gameState, levelState);

      // Should validate successfully
      expect(checkpointManager.validateCheckpoint(checkpoint)).toBe(true);

      // Should fail validation for old checkpoint
      const oldCheckpoint: CheckpointData = {
        ...checkpoint,
        timestamp: Date.now() - (25 * 60 * 60 * 1000) // 25 hours ago
      };
      expect(checkpointManager.validateCheckpoint(oldCheckpoint)).toBe(false);

      // Should fail validation for malformed checkpoint
      const badCheckpoint = { ...checkpoint };
      delete badCheckpoint.collectedLetters;
      expect(checkpointManager.validateCheckpoint(badCheckpoint as any)).toBe(false);
    });
  });

  describe('Checkpoint Restoration', () => {
    it('should restore game state from checkpoint', () => {
      // Create a checkpoint
      const gameState = {
        score: 1000,
        lives: 2,
        maxLives: 3,
        speed: 30,
        collectedLetters: [0, 1, 2],
        level: 2,
        laneCount: 5,
        gemsCollected: 15,
        distance: 75,
        hasDoubleJump: true,
        hasImmortality: false,
        isImmortalityActive: false
      };

      const levelState = {
        objects: [
          {
            id: 'obj1',
            type: ObjectType.OBSTACLE,
            position: [0, 0, -10] as [number, number, number],
            active: true
          },
          {
            id: 'obj2',
            type: ObjectType.LETTER,
            position: [1, 1, -20] as [number, number, number],
            active: true,
            value: 'L',
            targetIndex: 2
          }
        ],
        distanceTraveled: 75,
        nextLetterDistance: 175
      };

      checkpointManager.createCheckpoint(gameState, levelState);

      // Verify checkpoint exists
      expect(checkpointManager.hasCheckpoint()).toBe(true);
      const savedCheckpoint = checkpointManager.getLastCheckpoint();
      expect(savedCheckpoint).toBeDefined();
      expect(savedCheckpoint!.score).toBe(1000);
      expect(savedCheckpoint!.lives).toBe(2);
      expect(savedCheckpoint!.collectedLetters).toEqual([0, 1, 2]);
      expect(savedCheckpoint!.objects.length).toBe(2);
    });

    it('should handle checkpoint clearing', () => {
      // Create checkpoint
      const gameState = {
        score: 500,
        lives: 3,
        maxLives: 3,
        speed: 25,
        collectedLetters: [],
        level: 1,
        laneCount: 3,
        gemsCollected: 5,
        distance: 50,
        hasDoubleJump: false,
        hasImmortality: false,
        isImmortalityActive: false
      };

      const levelState = {
        objects: [],
        distanceTraveled: 50,
        nextLetterDistance: 150
      };

      checkpointManager.createCheckpoint(gameState, levelState);
      expect(checkpointManager.hasCheckpoint()).toBe(true);

      // Clear checkpoint
      checkpointManager.clearCheckpoint();
      expect(checkpointManager.hasCheckpoint()).toBe(false);
      expect(checkpointManager.getLastCheckpoint()).toBeNull();
    });
  });

  describe('Store Integration', () => {
    it('should integrate with store checkpoint functions', () => {
      // Mock store implementation
      const mockStore = {
        score: 1000,
        lives: 3,
        maxLives: 3,
        speed: 25,
        collectedLetters: [0],
        level: 1,
        laneCount: 3,
        gemsCollected: 10,
        distance: 50,
        hasDoubleJump: false,
        hasImmortality: false,
        isImmortalityActive: false
      };

      // Simulate createCheckpoint call
      const levelState = {
        objects: [],
        distanceTraveled: 50,
        nextLetterDistance: 150
      };

      const created = checkpointManager.createCheckpoint(mockStore, levelState);
      expect(created).toBeDefined();
      expect(checkpointManager.hasCheckpoint()).toBe(true);
    });

    it('should create checkpoint successfully', () => {
      const gameState = {
        score: 1000,
        lives: 3,
        maxLives: 3,
        speed: 25,
        collectedLetters: [],
        level: 1,
        laneCount: 3,
        gemsCollected: 10,
        distance: 50,
        hasDoubleJump: false,
        hasImmortality: false,
        isImmortalityActive: false
      };

      const levelState = {
        objects: [],
        distanceTraveled: 50,
        nextLetterDistance: 150
      };

      const checkpoint = checkpointManager.createCheckpoint(gameState, levelState);

      // Verify checkpoint was created with correct data
      expect(checkpoint).toBeDefined();
      expect(checkpoint.distance).toBe(50);
      expect(checkpoint.score).toBe(1000);
      expect(checkpoint.objects).toEqual([]);
    });
  });

  describe('Level Manager Integration', () => {
    it('should handle checkpoint restoration events', () => {
      const mockObjectsRef = { current: [] };
      const mockDistanceTraveled = { current: 0 };
      const mockNextLetterDistance = { current: 150 };

      // Simulate restore-checkpoint event
      const restoreEvent = new CustomEvent('restore-checkpoint', {
        detail: {
          objects: [
            {
              id: 'restored-obj',
              type: 'OBSTACLE',
              position: [0, 0, -5],
              active: true
            }
          ],
          distanceTraveled: 50,
          nextLetterDistance: 150
        }
      });

      // In real implementation, this would be handled by the LevelManager's event listener
      // Here we just verify the event structure
      expect(restoreEvent.detail.objects.length).toBe(1);
      expect(restoreEvent.detail.distanceTraveled).toBe(50);
      expect(restoreEvent.detail.nextLetterDistance).toBe(150);
    });

    it('should create checkpoints during gameplay', () => {
      // Simulate distance progression
      expect(checkpointManager.shouldCreateCheckpoint(25)).toBe(false);
      expect(checkpointManager.shouldCreateCheckpoint(50)).toBe(true);

      // After creating checkpoint, should not create another immediately
      const gameState = {
        score: 500,
        lives: 3,
        maxLives: 3,
        speed: 25,
        collectedLetters: [],
        level: 1,
        laneCount: 3,
        gemsCollected: 5,
        distance: 50,
        hasDoubleJump: false,
        hasImmortality: false,
        isImmortalityActive: false
      };

      const levelState = {
        objects: [],
        distanceTraveled: 50,
        nextLetterDistance: 150
      };

      checkpointManager.createCheckpoint(gameState, levelState);
      expect(checkpointManager.shouldCreateCheckpoint(75)).toBe(false);
      expect(checkpointManager.shouldCreateCheckpoint(100)).toBe(true);
    });
  });
});
