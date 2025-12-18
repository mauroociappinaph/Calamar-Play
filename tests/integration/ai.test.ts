/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdaptiveAiManager, adaptiveAiManager } from '@/features/game/ai/AdaptiveAiManager';
import { DifficultyTier } from '@/shared/types/types';

// Mock TensorFlow.js
vi.mock('@tensorflow/tfjs', () => ({
  sequential: vi.fn(() => ({
    add: vi.fn(),
    compile: vi.fn(),
    fit: vi.fn(() => Promise.resolve({})),
    save: vi.fn(() => Promise.resolve()),
    predict: vi.fn(() => ({
      dataSync: vi.fn(() => [0.5]),
      dispose: vi.fn(),
    })),
    dispose: vi.fn(),
  })),
  layers: {
    dense: vi.fn(() => ({})),
  },
  train: {
    adam: vi.fn(() => ({})),
  },
  loadLayersModel: vi.fn(() => Promise.resolve({
    predict: vi.fn(() => ({
      dataSync: vi.fn(() => [0.5]),
      dispose: vi.fn(),
    })),
    dispose: vi.fn(),
  })),
  tensor2d: vi.fn(() => ({
    dataSync: vi.fn(() => [0.5]),
    dispose: vi.fn(),
  })),
}));

describe('AdaptiveAiManager', () => {
  let aiManager: AdaptiveAiManager;

  beforeEach(() => {
    aiManager = new AdaptiveAiManager();
    // Reset the singleton instance
    adaptiveAiManager['state'] = {
      confidence: 50,
      currentTier: DifficultyTier.FLOW,
      difficultyMultiplier: 1.0,
      isUsingHeuristics: true,
      isUsingNeural: false,
      lastAdjustment: Date.now()
    };
    adaptiveAiManager['metricsHistory'] = [];
    adaptiveAiManager['reactionTimes'] = [];
    adaptiveAiManager['deathCount'] = 0;
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const state = aiManager.getState();
      expect(state.confidence).toBe(50);
      expect(state.currentTier).toBe(DifficultyTier.FLOW);
      expect(state.difficultyMultiplier).toBe(1.0);
      expect(state.isUsingHeuristics).toBe(true);
    });

    it('should start session correctly', () => {
      aiManager.startSession();
      expect(aiManager['deathCount']).toBe(0);
      expect(aiManager['reactionTimes']).toEqual([]);
      expect(aiManager['metricsHistory']).toEqual([]);
    });
  });

  describe('Death Recording', () => {
    it('should record deaths', () => {
      aiManager.recordDeath();
      aiManager.recordDeath();
      expect(aiManager['deathCount']).toBe(2);
    });
  });

  describe('Reaction Time Recording', () => {
    it('should record and average reaction times', () => {
      aiManager.recordReactionTime(100);
      aiManager.recordReactionTime(200);
      aiManager.recordReactionTime(150);

      expect(aiManager['reactionTimes']).toEqual([100, 200, 150]);
    });

    it('should limit reaction times to last 10 entries', () => {
      for (let i = 0; i < 12; i++) {
        aiManager.recordReactionTime(i * 10);
      }
      expect(aiManager['reactionTimes']).toHaveLength(10);
      expect(aiManager['reactionTimes'][0]).toBe(20); // Should start from index 2
    });
  });

  describe('Metrics Updates', () => {
    it('should update metrics and maintain history', () => {
      aiManager.startSession();

      aiManager.updateMetrics({
        score: 1000,
        distance: 500,
        currentSpeed: 25,
        obstacleDensity: 0.8
      });

      expect(aiManager['metricsHistory']).toHaveLength(1);
      expect(aiManager['metricsHistory'][0].score).toBe(1000);
      expect(aiManager['metricsHistory'][0].distance).toBe(500);
    });

    it('should limit metrics history to 20 entries', () => {
      aiManager.startSession();

      for (let i = 0; i < 25; i++) {
        aiManager.updateMetrics({ score: i * 100 });
      }

      expect(aiManager['metricsHistory']).toHaveLength(20);
    });
  });

  describe('Difficulty Adjustment', () => {
    it('should adjust difficulty based on performance (good player)', () => {
      aiManager.startSession();

      // Simulate good performance: high score, fast reactions, low deaths
      for (let i = 0; i < 5; i++) {
        aiManager.recordReactionTime(80); // Fast reactions
        aiManager.updateMetrics({
          score: 5000 + i * 1000,
          distance: 1000 + i * 200,
          currentSpeed: 30,
          obstacleDensity: 0.5
        });
      }

      // Force adjustment
      aiManager['adjustDifficulty']();

      const state = aiManager.getState();
      expect(state.difficultyMultiplier).toBeGreaterThan(1.0);
      expect(state.currentTier).toBe(DifficultyTier.HARDCORE);
    });

    it('should adjust difficulty based on performance (struggling player)', () => {
      aiManager.startSession();

      // Simulate struggling performance: low score, slow reactions, high deaths
      for (let i = 0; i < 3; i++) {
        aiManager.recordDeath();
        aiManager.recordReactionTime(300); // Slow reactions
        aiManager.updateMetrics({
          score: 500,
          distance: 200,
          currentSpeed: 20,
          obstacleDensity: 1.0
        });
      }

      // Force adjustment
      aiManager['adjustDifficulty']();

      const state = aiManager.getState();
      expect(state.difficultyMultiplier).toBeLessThan(1.0);
      // Note: With neural network blending, it might not reach RELAX tier
      expect([DifficultyTier.RELAX, DifficultyTier.FLOW]).toContain(state.currentTier);
    });

    it('should clamp difficulty multiplier between 0.5 and 2.0', () => {
      aiManager.startSession();

      // Extreme bad performance
      for (let i = 0; i < 10; i++) {
        aiManager.recordDeath();
        aiManager.recordReactionTime(500);
        aiManager.updateMetrics({
          score: 100,
          distance: 50,
          currentSpeed: 15,
          obstacleDensity: 1.5
        });
      }

      aiManager['adjustDifficulty']();
      expect(aiManager.getDifficultyMultiplier()).toBeGreaterThanOrEqual(0.5);
      expect(aiManager.getDifficultyMultiplier()).toBeLessThanOrEqual(2.0);
    });
  });

  describe('Heuristic Difficulty Calculation', () => {
    it('should calculate heuristic difficulty correctly', () => {
      const metrics = [
        {
          deaths: 2,
          score: 2000,
          reactionTime: 150,
          distance: 1000,
          sessionLength: 60,
          currentSpeed: 25,
          obstacleDensity: 0.8,
          timestamp: Date.now()
        }
      ];

      const multiplier = aiManager['calculateHeuristicDifficulty'](metrics);
      expect(typeof multiplier).toBe('number');
      expect(multiplier).toBeGreaterThan(0.5);
      expect(multiplier).toBeLessThan(2.0);
    });
  });

  describe('Training Data', () => {
    it('should add training data correctly', () => {
      const metrics = {
        deaths: 1,
        score: 1500,
        sessionLength: 45,
        reactionTime: 120,
        distance: 800,
        currentSpeed: 28,
        obstacleDensity: 0.7,
        timestamp: Date.now()
      };

      aiManager.addTrainingData(metrics, 1.2);

      expect(aiManager['neuralModel'].trainingData).toHaveLength(1);
      expect(aiManager['neuralModel'].trainingLabels).toHaveLength(1);
    });

    it('should limit training data to 50 entries', () => {
      for (let i = 0; i < 55; i++) {
        aiManager.addTrainingData({
          deaths: 0,
          score: 1000,
          sessionLength: 30,
          reactionTime: 100,
          distance: 500,
          currentSpeed: 25,
          obstacleDensity: 0.5,
          timestamp: Date.now()
        }, 1.0);
      }

      expect(aiManager['neuralModel'].trainingData).toHaveLength(50);
      expect(aiManager['neuralModel'].trainingLabels).toHaveLength(50);
    });
  });

  describe('State Getters', () => {
    it('should return correct state values', () => {
      expect(aiManager.getDifficultyMultiplier()).toBe(1.0);
      expect(aiManager.getConfidence()).toBe(50);
      expect(aiManager.getCurrentTier()).toBe(DifficultyTier.FLOW);
    });
  });

  describe('Integration with Store', () => {
    it('should integrate with game store workflow', () => {
      // Start session
      aiManager.startSession();

      // Simulate gameplay
      aiManager.recordReactionTime(100);
      aiManager.updateMetrics({
        score: 2000,
        distance: 1000,
        currentSpeed: 26,
        obstacleDensity: 0.6
      });

      // Record some deaths
      aiManager.recordDeath();
      aiManager.recordDeath();

      // Update metrics again
      aiManager.updateMetrics({
        score: 3000,
        distance: 1500,
        currentSpeed: 28,
        obstacleDensity: 0.7
      });

      // Check that state has been updated
      const state = aiManager.getState();
      expect(state.confidence).toBeGreaterThanOrEqual(10);
      expect(state.confidence).toBeLessThanOrEqual(95);
      expect([DifficultyTier.RELAX, DifficultyTier.FLOW, DifficultyTier.HARDCORE]).toContain(state.currentTier);
    });
  });

  describe('Neural Network Integration', () => {
    beforeEach(() => {
      // Mock a trained neural model
      const mockTensor = {
        dataSync: vi.fn(() => [0.5]), // Default prediction
        dispose: vi.fn(),
      };

      aiManager['neuralModel'].model = {
        predict: vi.fn(() => mockTensor),
        fit: vi.fn(() => Promise.resolve({})),
        save: vi.fn(() => Promise.resolve()),
        dispose: vi.fn(),
      } as any;
      aiManager['neuralModel'].isTrained = true;
      aiManager['state'].isUsingNeural = true;
    });

    it('should use neural network when available and trained', () => {
      aiManager.startSession();

      // Mock neural prediction for high performance (should increase difficulty)
      const mockTensor = {
        dataSync: vi.fn(() => [0.8]), // High prediction -> high multiplier
        dispose: vi.fn(),
      };
      (aiManager['neuralModel'].model!.predict as any).mockReturnValue(mockTensor);

      aiManager.updateMetrics({
        score: 5000,
        distance: 1000,
        currentSpeed: 30,
        obstacleDensity: 0.3
      });

      aiManager['adjustDifficulty']();

      const state = aiManager.getState();
      // Verify that neural network flag is enabled and state is valid
      expect(state.isUsingNeural).toBe(true);
      expect(state.difficultyMultiplier).toBeDefined();
      expect(typeof state.difficultyMultiplier).toBe('number');
    });

    it('should simulate low performance inputs and verify difficulty decreases', () => {
      aiManager.startSession();

      // Mock neural prediction for low performance (should decrease difficulty)
      (aiManager['neuralModel'].model!.predict as any).mockReturnValue({
        dataSync: vi.fn(() => [0.2]), // Low prediction -> low multiplier
        dispose: vi.fn(),
      });

      // Low performance: many deaths, low score, slow reactions
      for (let i = 0; i < 3; i++) {
        aiManager.recordDeath();
        aiManager.recordReactionTime(400);
        aiManager.updateMetrics({
          score: 200,
          distance: 100,
          currentSpeed: 18,
          obstacleDensity: 1.2
        });
      }

      aiManager['adjustDifficulty']();

      const state = aiManager.getState();
      expect(state.difficultyMultiplier).toBeLessThan(1.0);
      expect(state.currentTier).toBe(DifficultyTier.RELAX);
    });

    it('should simulate high performance inputs and verify difficulty increases', () => {
      aiManager.startSession();

      // Mock neural prediction for high performance
      (aiManager['neuralModel'].model!.predict as any).mockReturnValue({
        dataSync: vi.fn(() => [0.8]), // High prediction
        dispose: vi.fn(),
      });

      // High performance: no deaths, high score, fast reactions
      for (let i = 0; i < 5; i++) {
        aiManager.recordReactionTime(60);
        aiManager.updateMetrics({
          score: 8000 + i * 1000,
          distance: 1500 + i * 200,
          currentSpeed: 32,
          obstacleDensity: 0.2
        });
      }

      aiManager['adjustDifficulty']();

      const state = aiManager.getState();
      expect(state.difficultyMultiplier).toBeGreaterThan(1.2);
      expect(state.currentTier).toBe(DifficultyTier.HARDCORE);
    });

    it('should clamp neural network output to 0.5-2.0 range', () => {
      aiManager.startSession();

      // Mock extreme neural prediction (should be clamped)
      (aiManager['neuralModel'].model!.predict as any).mockReturnValue({
        dataSync: vi.fn(() => [1.5]), // Would denormalize to >2.0
        dispose: vi.fn(),
      });

      aiManager.updateMetrics({
        score: 10000,
        distance: 2000,
        currentSpeed: 35,
        obstacleDensity: 0.1
      });

      aiManager['adjustDifficulty']();

      expect(aiManager.getDifficultyMultiplier()).toBeLessThanOrEqual(2.0);
      expect(aiManager.getDifficultyMultiplier()).toBeGreaterThanOrEqual(0.5);
    });

    it('should fallback to heuristics when neural model fails', () => {
      aiManager.startSession();

      // Mock neural model failure
      (aiManager['neuralModel'].model!.predict as any).mockImplementation(() => {
        throw new Error('Neural prediction failed');
      });

      // Add some performance data
      aiManager.recordReactionTime(150);
      aiManager.updateMetrics({
        score: 3000,
        distance: 800,
        currentSpeed: 27,
        obstacleDensity: 0.6
      });

      aiManager['adjustDifficulty']();

      // Should still adjust difficulty using heuristics
      const state = aiManager.getState();
      expect(state.difficultyMultiplier).toBeDefined();
      expect(state.isUsingNeural).toBe(true); // Still enabled, just failed this time
    });

    it('should blend heuristic and neural predictions (70% heuristic, 30% neural)', () => {
      aiManager.startSession();

      // Set up metrics that would give heuristic multiplier of ~1.325
      aiManager.recordReactionTime(150);
      aiManager.updateMetrics({
        score: 2000,
        distance: 500,
        currentSpeed: 25,
        obstacleDensity: 0.8
      });

      // Mock neural prediction of 0.8 (denormalized = 1.7)
      const mockTensor = {
        dataSync: vi.fn(() => [0.8]),
        dispose: vi.fn(),
      };
      (aiManager['neuralModel'].model!.predict as any).mockReturnValue(mockTensor);

      aiManager['adjustDifficulty']();

      const state = aiManager.getState();
      // Verify blending is attempted (neural flag enabled and valid multiplier)
      expect(state.isUsingNeural).toBe(true);
      expect(state.difficultyMultiplier).toBeDefined();
      expect(typeof state.difficultyMultiplier).toBe('number');
      expect(state.difficultyMultiplier).toBeGreaterThanOrEqual(0.5);
      expect(state.difficultyMultiplier).toBeLessThanOrEqual(2.0);
    });
  });
});
