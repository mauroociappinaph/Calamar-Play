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

  it('should validate maximum gap between obstacles (density requirement)', () => {
    const allPatterns = patternManager.getAllPatterns();

    allPatterns.forEach(pattern => {
      // Get only obstacle spawns
      const obstacleSpawns = pattern.spawns
        .filter(s => s.type === 'OBSTACLE')
        .sort((a, b) => a.zOffset - b.zOffset);

      // Check gaps between obstacles
      for (let i = 1; i < obstacleSpawns.length; i++) {
        const gap = obstacleSpawns[i].zOffset - obstacleSpawns[i-1].zOffset;
        expect(gap).toBeLessThanOrEqual(20); // Maximum 20 units between obstacles (density requirement)
        expect(gap).toBeGreaterThanOrEqual(2); // Minimum spacing to avoid impossible gameplay
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
});
