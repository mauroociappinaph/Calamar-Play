/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LEVEL_PATTERNS, PatternManager, PatternType } from '@/features/game/levelPatterns';

// Mock performance.now for consistent timing
const mockNow = vi.fn();
global.performance.now = mockNow;

describe('Level Patterns System (TASK-003)', () => {
  let patternManager: PatternManager;

  beforeEach(() => {
    vi.clearAllMocks();
    patternManager = new PatternManager();
    mockNow.mockReturnValue(0);
  });

  it('should initialize with proper pattern queue', () => {
    expect(patternManager.getCurrentPattern()).toBeNull();

    // Should have 8 patterns in queue initially
    const allPatterns = patternManager.getAllPatterns();
    expect(allPatterns.length).toBe(8);
  });

  it('should switch to first pattern on initial call', () => {
    const pattern = patternManager.getNextPattern();
    expect(pattern.type).toBe('RESPITE');
    expect(pattern.duration).toBeGreaterThan(0);
    expect(pattern.spawns.length).toBeGreaterThan(0);
  });

  it('should cycle through pattern types correctly', () => {
    const expectedSequence: PatternType[] = [
      'RESPITE', 'TENSION', 'PEAK', 'VARIATION',
      'RESPITE', 'TENSION', 'PEAK', 'VARIATION'
    ];

    for (let i = 0; i < expectedSequence.length; i++) {
      const pattern = patternManager.getNextPattern();
      expect(pattern.type).toBe(expectedSequence[i]);
    }

    // Should cycle back to beginning
    const nextPattern = patternManager.getNextPattern();
    expect(nextPattern.type).toBe('RESPITE');
  });

  it('should provide patterns by type', () => {
    const respitePatterns = patternManager.getPatternsByType('RESPITE');
    expect(respitePatterns.length).toBe(2);
    expect(respitePatterns.every(p => p.type === 'RESPITE')).toBe(true);

    const tensionPatterns = patternManager.getPatternsByType('TENSION');
    expect(tensionPatterns.length).toBe(2);
    expect(tensionPatterns.every(p => p.type === 'TENSION')).toBe(true);

    const peakPatterns = patternManager.getPatternsByType('PEAK');
    expect(peakPatterns.length).toBe(2);

    const variationPatterns = patternManager.getPatternsByType('VARIATION');
    expect(variationPatterns.length).toBe(2);
  });

  it('should calculate pattern progress correctly', () => {
    const startTime = Date.now();
    mockNow.mockReturnValue(startTime);
    const pattern = patternManager.getNextPattern();

    // At start, progress should be 0
    expect(patternManager.getPatternProgress(startTime)).toBe(0);

    // At halfway point
    const halfwayTime = startTime + (pattern.duration * 1000) / 2;
    expect(patternManager.getPatternProgress(halfwayTime)).toBeCloseTo(0.5, 1);

    // At end
    const endTime = startTime + (pattern.duration * 1000);
    expect(patternManager.getPatternProgress(endTime)).toBe(1);

    // Over time should be capped at 1
    const overTime = startTime + (pattern.duration * 1000 * 2);
    expect(patternManager.getPatternProgress(overTime)).toBe(1);
  });

  it('should have valid pattern structures', () => {
    const allPatterns = patternManager.getAllPatterns();

    allPatterns.forEach(pattern => {
      // Basic structure validation
      expect(pattern.id).toBeDefined();
      expect(pattern.name).toBeDefined();
      expect(['RESPITE', 'TENSION', 'PEAK', 'VARIATION']).toContain(pattern.type);
      expect(pattern.duration).toBeGreaterThan(0);
      expect(Array.isArray(pattern.spawns)).toBe(true);
      expect(pattern.spawns.length).toBeGreaterThan(0);
      expect(pattern.description).toBeDefined();

      // Validate spawn instructions
      pattern.spawns.forEach(spawn => {
        expect(spawn.type).toBeDefined();
        expect(typeof spawn.lane).toBe('number');
        expect(spawn.lane).toBeGreaterThanOrEqual(-2);
        expect(spawn.lane).toBeLessThanOrEqual(2);
        expect(typeof spawn.zOffset).toBe('number');

        // Type-specific validation
        if (spawn.type === 'LETTER') {
          expect(spawn.value).toBeDefined();
          expect(typeof spawn.targetIndex).toBe('number');
        }
      });
    });
  });

  it('should have balanced pattern difficulty', () => {
    const respitePatterns = patternManager.getPatternsByType('RESPITE');
    const tensionPatterns = patternManager.getPatternsByType('TENSION');
    const peakPatterns = patternManager.getPatternsByType('PEAK');
    const variationPatterns = patternManager.getPatternsByType('VARIATION');

    // Respite should have fewer obstacles
    respitePatterns.forEach(pattern => {
      const obstacleCount = pattern.spawns.filter(s => s.type === 'OBSTACLE').length;
      expect(obstacleCount).toBeLessThanOrEqual(4);
    });

    // Peak should have more obstacles
    peakPatterns.forEach(pattern => {
      const obstacleCount = pattern.spawns.filter(s => s.type === 'OBSTACLE').length;
      expect(obstacleCount).toBeGreaterThanOrEqual(1); // At least one obstacle
    });

    // At least one variation pattern should include letters
    const hasAnyVariationWithLetters = variationPatterns.some(pattern => {
      return pattern.spawns.some(s => s.type === 'LETTER');
    });
    expect(hasAnyVariationWithLetters).toBe(true);
  });

  it('should maintain consistent lane usage', () => {
    const allPatterns = patternManager.getAllPatterns();

    allPatterns.forEach(pattern => {
      pattern.spawns.forEach(spawn => {
        // Lanes should be integers between -2 and 2
        expect(Number.isInteger(spawn.lane)).toBe(true);
        expect(spawn.lane).toBeGreaterThanOrEqual(-2);
        expect(spawn.lane).toBeLessThanOrEqual(2);
      });
    });
  });

  it('should have reasonable spawn timing', () => {
    const allPatterns = patternManager.getAllPatterns();

    allPatterns.forEach(pattern => {
      // Sort spawns by zOffset to check timing
      const sortedSpawns = [...pattern.spawns].sort((a, b) => a.zOffset - b.zOffset);

      // First spawn should be at reasonable distance
      expect(sortedSpawns[0].zOffset).toBeGreaterThanOrEqual(6);
      expect(sortedSpawns[0].zOffset).toBeLessThanOrEqual(15);

      // Check that spawns are spaced reasonably (only for non-same-position spawns)
      for (let i = 1; i < sortedSpawns.length; i++) {
        const gap = sortedSpawns[i].zOffset - sortedSpawns[i-1].zOffset;
        if (gap > 0) { // Only check spacing for spawns that are not at the same position
          expect(gap).toBeGreaterThanOrEqual(1); // Minimum spacing of 1 unit
          expect(gap).toBeLessThanOrEqual(30); // Maximum reasonable gap
        }
      }
    });
  });

  it('should validate obstacle density (density requirement)', () => {
    const allPatterns = patternManager.getAllPatterns();

    allPatterns.forEach(pattern => {
      // Get obstacle spawns grouped by zOffset to check clustering
      const obstacleByZ = new Map<number, number>();

      pattern.spawns
        .filter(s => s.type === 'OBSTACLE')
        .forEach(spawn => {
          obstacleByZ.set(spawn.zOffset, (obstacleByZ.get(spawn.zOffset) || 0) + 1);
        });

      // Check that no single z-position has too many obstacles (max 2 per z-level)
      obstacleByZ.forEach((count, z) => {
        expect(count).toBeLessThanOrEqual(2);
      });

      // Check that obstacles are reasonably spaced (at least 2 units apart)
      const zOffsets = Array.from(obstacleByZ.keys()).sort((a, b) => a - b);
      for (let i = 1; i < zOffsets.length; i++) {
        const gap = zOffsets[i] - zOffsets[i-1];
        expect(gap).toBeGreaterThanOrEqual(2); // Minimum 2 units between obstacle groups
        expect(gap).toBeLessThanOrEqual(20); // Maximum 20 units between obstacle groups
      }
    });
  });

  it('should use BEER instead of GEM in patterns', () => {
    const allPatterns = patternManager.getAllPatterns();

    // Check that no GEM spawns exist
    allPatterns.forEach(pattern => {
      const gemSpawns = pattern.spawns.filter(s => s.type === 'GEM');
      expect(gemSpawns.length).toBe(0);

      // Check that BEER spawns exist in appropriate patterns
      const beerSpawns = pattern.spawns.filter(s => s.type === 'BEER');
      if (pattern.type === 'RESPITE') {
        expect(beerSpawns.length).toBeGreaterThan(0); // Respite patterns should have beers
      }
    });
  });

  it('should have updated pattern names for beer theme', () => {
    const respitePatterns = patternManager.getPatternsByType('RESPITE');
    const hasBonanzaPattern = respitePatterns.some(p => p.name.includes('Cervezas'));
    expect(hasBonanzaPattern).toBe(true);
  });

  it('should simulate 100 meters of gameplay with continuous obstacle flow', () => {
    // Mock the LevelManager behavior for 100 meters simulation
    let currentZ = 0;
    let lastObstacleZ = 0;
    let maxGapWithoutObstacle = 0;
    let obstaclesSpawned = 0;

    // Simulate player movement at speed 30 units/second
    const playerSpeed = 30;
    const simulationDuration = 100 / playerSpeed; // Time to travel 100 meters
    const frameRate = 60;
    const frameTime = 1 / frameRate;
    const totalFrames = Math.ceil(simulationDuration / frameTime);

    // Track active objects
    const activeObjects: Array<{type: string, z: number}> = [];

    for (let frame = 0; frame < totalFrames; frame++) {
      const deltaTime = frameTime;
      currentZ += playerSpeed * deltaTime;

      // Remove objects that have passed the player
      activeObjects.forEach((obj, index) => {
        if (obj.z < currentZ - 50) { // Remove objects far behind
          activeObjects.splice(index, 1);
        }
      });

      // Check if we need to switch patterns (simplified logic)
      const shouldSwitch = frame % (8 * frameRate) === 0; // Every 8 seconds

      if (shouldSwitch || frame === 0) {
        const pattern = patternManager.getNextPattern();

        // Spawn all objects from the pattern at current position
        pattern.spawns.forEach(spawn => {
          const spawnZ = currentZ - 10; // Spawn ahead of player
          activeObjects.push({
            type: spawn.type,
            z: spawnZ + spawn.zOffset
          });
          obstaclesSpawned++;

          // Update last obstacle position
          if (spawn.type === 'OBSTACLE') {
            lastObstacleZ = spawnZ + spawn.zOffset;
          }
        });
      }

      // Check gap between current position and last obstacle
      const gap = currentZ - lastObstacleZ;
      maxGapWithoutObstacle = Math.max(maxGapWithoutObstacle, gap);

      // Verify no gap exceeds 2 meters (2 units in our scale)
      expect(gap).toBeLessThanOrEqual(2);

      // Verify we have continuous flow - at least one obstacle every 2 meters
      const obstaclesInRange = activeObjects.filter(obj =>
        obj.type === 'OBSTACLE' &&
        obj.z >= currentZ - 10 && // Ahead of player
        obj.z <= currentZ + 5    // Behind player
      );
      expect(obstaclesInRange.length).toBeGreaterThan(0);
    }

    // Final verification
    expect(maxGapWithoutObstacle).toBeLessThanOrEqual(2);
    expect(obstaclesSpawned).toBeGreaterThan(50); // Should have spawned many obstacles
    console.log(`Simulation complete: ${obstaclesSpawned} obstacles spawned, max gap: ${maxGapWithoutObstacle.toFixed(2)} meters`);
  });
});
