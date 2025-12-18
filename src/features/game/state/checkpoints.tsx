/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameObject } from '@/shared/types/types';

// Checkpoint data structure
export interface CheckpointData {
  // Game state from store
  score: number;
  lives: number;
  maxLives: number;
  speed: number;
  collectedLetters: number[];
  level: number;
  laneCount: number;
  gemsCollected: number;
  distance: number;
  hasDoubleJump: boolean;
  hasImmortality: boolean;
  isImmortalityActive: boolean;

  // Level state
  objects: GameObject[]; // Current active objects
  distanceTraveled: number;
  nextLetterDistance: number;

  // Timestamp for validation
  timestamp: number;
}

// Checkpoint manager class
export class CheckpointManager {
  private lastCheckpoint: CheckpointData | null = null;
  private checkpointInterval = 50; // Every 50 meters
  private lastCheckpointDistance = 0;

  /**
   * Check if a checkpoint should be created based on current distance
   */
  shouldCreateCheckpoint(currentDistance: number): boolean {
    return currentDistance - this.lastCheckpointDistance >= this.checkpointInterval;
  }

  /**
   * Create a new checkpoint from current game state
   */
  createCheckpoint(
    gameState: {
      score: number;
      lives: number;
      maxLives: number;
      speed: number;
      collectedLetters: number[];
      level: number;
      laneCount: number;
      gemsCollected: number;
      distance: number;
      hasDoubleJump: boolean;
      hasImmortality: boolean;
      isImmortalityActive: boolean;
    },
    levelState: {
      objects: GameObject[];
      distanceTraveled: number;
      nextLetterDistance: number;
    }
  ): CheckpointData {
    const checkpoint: CheckpointData = {
      ...gameState,
      objects: levelState.objects.map(obj => ({ ...obj })), // Deep copy objects
      distanceTraveled: levelState.distanceTraveled,
      nextLetterDistance: levelState.nextLetterDistance,
      timestamp: Date.now()
    };

    this.lastCheckpoint = checkpoint;
    this.lastCheckpointDistance = gameState.distance;

    console.log('[Checkpoint] Created checkpoint at distance:', gameState.distance);
    return checkpoint;
  }

  /**
   * Get the last saved checkpoint
   */
  getLastCheckpoint(): CheckpointData | null {
    return this.lastCheckpoint;
  }

  /**
   * Check if a checkpoint is available for restoration
   */
  hasCheckpoint(): boolean {
    return this.lastCheckpoint !== null;
  }

  /**
   * Clear the current checkpoint (used when starting new game)
   */
  clearCheckpoint(): void {
    this.lastCheckpoint = null;
    this.lastCheckpointDistance = 0;
    console.log('[Checkpoint] Checkpoint cleared');
  }

  /**
   * Validate checkpoint data integrity
   */
  validateCheckpoint(checkpoint: CheckpointData): boolean {
    try {
      // Basic validation
      if (!checkpoint.collectedLetters || !Array.isArray(checkpoint.objects)) {
        return false;
      }

      // Check timestamp is reasonable (not too old)
      const age = Date.now() - checkpoint.timestamp;
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      return age < maxAge;
    } catch (error) {
      console.warn('[Checkpoint] Validation failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const checkpointManager = new CheckpointManager();
