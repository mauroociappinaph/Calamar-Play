/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as tf from '@tensorflow/tfjs';
import { DifficultyTier, AIMetrics, AIState, RUN_SPEED_BASE } from '@/shared/types/types';

interface NeuralModel {
  model: tf.LayersModel | null;
  isTrained: boolean;
  trainingData: number[][];
  trainingLabels: number[][];
}

export class AdaptiveAiManager {
  private state: AIState;
  private metricsHistory: AIMetrics[] = [];
  private neuralModel: NeuralModel;
  private sessionStartTime: number = 0;
  private lastAdjustmentTime: number = 0;
  private reactionTimes: number[] = [];
  private deathCount: number = 0;

  constructor() {
    this.state = {
      confidence: 50,
      currentTier: DifficultyTier.FLOW,
      difficultyMultiplier: 1.0,
      isUsingHeuristics: true,
      isUsingNeural: false,
      lastAdjustment: Date.now()
    };

    this.neuralModel = {
      model: null,
      isTrained: false,
      trainingData: [],
      trainingLabels: []
    };

    this.initializeNeuralModel();
  }

  private async initializeNeuralModel(): Promise<void> {
    try {
      // Simple sequential model as per spec: Input(3) → Hidden(3, ReLU) → Output(1, Sigmoid)
      const model = tf.sequential();

      model.add(tf.layers.dense({ inputShape: [3], units: 3, activation: 'relu' }));
      model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

      model.compile({
        optimizer: tf.train.adam(0.01),
        loss: 'meanSquaredError',
        metrics: ['accuracy']
      });

      this.neuralModel.model = model;

      // Try to load from indexedDB
      await this.loadModelFromStorage();
    } catch (error) {
      console.warn('[AI] Failed to initialize neural model, using heuristics only:', error);
      this.state.isUsingNeural = false;
    }
  }

  private async loadModelFromStorage(): Promise<void> {
    try {
      const model = await tf.loadLayersModel('indexeddb://adaptive-ai-model');
      this.neuralModel.model = model;
      this.neuralModel.isTrained = true;
      this.state.isUsingNeural = true;
      console.log('[AI] Loaded neural model from storage');
    } catch (error) {
      console.log('[AI] No saved model found, starting fresh');
    }
  }

  private async saveModelToStorage(): Promise<void> {
    if (this.neuralModel.model && this.neuralModel.isTrained) {
      try {
        await this.neuralModel.model.save('indexeddb://adaptive-ai-model');
        console.log('[AI] Saved neural model to storage');
      } catch (error) {
        console.warn('[AI] Failed to save model:', error);
      }
    }
  }

  public startSession(): void {
    this.sessionStartTime = Date.now();
    this.deathCount = 0;
    this.reactionTimes = [];
    this.metricsHistory = [];
  }

  public recordDeath(): void {
    this.deathCount++;
  }

  public recordReactionTime(reactionTimeMs: number): void {
    this.reactionTimes.push(reactionTimeMs);
    // Keep only last 10 reaction times for averaging
    if (this.reactionTimes.length > 10) {
      this.reactionTimes.shift();
    }
  }

  public updateMetrics(metrics: Partial<AIMetrics>): void {
    const currentMetrics: AIMetrics = {
      deaths: this.deathCount,
      score: metrics.score || 0,
      sessionLength: (Date.now() - this.sessionStartTime) / 1000,
      reactionTime: this.reactionTimes.length > 0
        ? this.reactionTimes.reduce((a, b) => a + b) / this.reactionTimes.length
        : 100, // default 100ms
      distance: metrics.distance || 0,
      currentSpeed: metrics.currentSpeed || RUN_SPEED_BASE,
      obstacleDensity: metrics.obstacleDensity || 1.0,
      timestamp: Date.now()
    };

    this.metricsHistory.push(currentMetrics);

    // Keep only last 20 metrics
    if (this.metricsHistory.length > 20) {
      this.metricsHistory.shift();
    }

    // Update difficulty every 5 seconds or when significant events happen
    if (Date.now() - this.lastAdjustmentTime > 5000) {
      this.adjustDifficulty();
    }
  }

  private adjustDifficulty(): void {
    if (this.metricsHistory.length < 2) return;

    const recentMetrics = this.metricsHistory.slice(-3); // Last 3 measurements
    const latest = recentMetrics[recentMetrics.length - 1];

    let newMultiplier = this.state.difficultyMultiplier;

    // Heuristic-based adjustment
    if (this.state.isUsingHeuristics) {
      newMultiplier = this.calculateHeuristicDifficulty(recentMetrics);
    }

    // Neural network prediction (if available)
    if (this.state.isUsingNeural && this.neuralModel.model && this.neuralModel.isTrained) {
      const neuralMultiplier = this.predictWithNeural(latest);
      if (neuralMultiplier !== null) {
        // Blend heuristic and neural predictions
        newMultiplier = (newMultiplier * 0.7) + (neuralMultiplier * 0.3);
      }
    }

    // Clamp to safe bounds
    newMultiplier = Math.max(0.5, Math.min(2.0, newMultiplier));

    // Update tier based on multiplier
    let newTier = DifficultyTier.FLOW;
    if (newMultiplier < 0.8) newTier = DifficultyTier.RELAX;
    else if (newMultiplier > 1.3) newTier = DifficultyTier.HARDCORE;

    // Update confidence based on prediction stability
    const multiplierVariance = this.calculateVariance(
      this.metricsHistory.slice(-5).map(m => this.calculateHeuristicDifficulty([m]))
    );
    this.state.confidence = Math.max(10, Math.min(95, 100 - (multiplierVariance * 100)));

    // Apply changes
    this.state.difficultyMultiplier = newMultiplier;
    this.state.currentTier = newTier;
    this.state.lastAdjustment = Date.now();
    this.lastAdjustmentTime = Date.now();

    // Train neural model with new data (every 5 adjustments)
    if (this.neuralModel.trainingData.length >= 10 && Math.random() < 0.2) {
      this.trainNeuralModel();
    }
  }

  private calculateHeuristicDifficulty(metrics: AIMetrics[]): number {
    if (metrics.length === 0) return 1.0;

    const avg = metrics.reduce((acc, m) => ({
      deaths: acc.deaths + m.deaths,
      score: acc.score + m.score,
      reactionTime: acc.reactionTime + m.reactionTime,
      distance: acc.distance + m.distance
    }), { deaths: 0, score: 0, reactionTime: 0, distance: 0 });

    const count = metrics.length;
    const avgDeaths = avg.deaths / count;
    const avgScore = avg.score / count;
    const avgReactionTime = avg.reactionTime / count;
    const avgDistance = avg.distance / count;

    // Heuristic formula:
    // - More deaths = easier (lower multiplier)
    // - Higher score = harder (higher multiplier)
    // - Slower reaction = easier
    // - Longer distance = slightly harder
    let multiplier = 1.0;

    // Death penalty: reduce difficulty if dying too much (more aggressive)
    multiplier -= Math.min(0.5, avgDeaths * 0.15);

    // Score reward: increase difficulty with good performance
    multiplier += Math.min(0.4, (avgScore / 1000) * 0.1);

    // Reaction time: faster reactions = harder
    const normalizedReaction = Math.max(50, Math.min(300, avgReactionTime));
    multiplier += (300 - normalizedReaction) / 300 * 0.2;

    // Distance progression: gradual increase
    multiplier += Math.min(0.2, (avgDistance / 1000) * 0.05);

    return multiplier;
  }

  private predictWithNeural(metrics: AIMetrics): number | null {
    if (!this.neuralModel.model || !this.neuralModel.isTrained) return null;

    try {
      // Normalize inputs as per spec
      const playerScoreNormalized = Math.min(metrics.score / 10000, 1); // 0-1
      const avgObstacleDistance = 1 - Math.min(metrics.obstacleDensity, 1); // Invert density
      const reactionTimeNormalized = Math.min(metrics.reactionTime / 500, 1); // 0-1, cap at 500ms

      const inputs = [playerScoreNormalized, avgObstacleDistance, reactionTimeNormalized];
      const input = tf.tensor2d([inputs]);
      const prediction = this.neuralModel.model.predict(input) as tf.Tensor;
      const result = prediction.dataSync()[0];

      // Denormalize output to multiplier range
      const output = 0.5 + (result * 1.5); // 0.5-2.0 range
      const confidence = Math.abs(result - 0.5) * 200; // Rough confidence estimate
      const tier = output < 0.8 ? DifficultyTier.RELAX : output > 1.3 ? DifficultyTier.HARDCORE : DifficultyTier.FLOW;

      console.log('AI Inference:', { inputs, output, confidence, tier });

      input.dispose();
      prediction.dispose();

      return output;
    } catch (error) {
      console.warn('[AI] Neural prediction failed:', error);
      return null;
    }
  }

  private async trainNeuralModel(): Promise<void> {
    if (!this.neuralModel.model || this.neuralModel.trainingData.length < 5) return;

    try {
      const inputs = tf.tensor2d(this.neuralModel.trainingData);
      const labels = tf.tensor2d(this.neuralModel.trainingLabels);

      await this.neuralModel.model.fit(inputs, labels, {
        epochs: 10,
        batchSize: 4,
        verbose: 0
      });

      this.neuralModel.isTrained = true;
      this.state.isUsingNeural = true;

      // Save model
      await this.saveModelToStorage();

      inputs.dispose();
      labels.dispose();

      console.log('[AI] Neural model retrained');
    } catch (error) {
      console.warn('[AI] Neural training failed:', error);
    }
  }

  private calculateVariance(values: number[]): number {
    if (values.length < 2) return 0;
    const mean = values.reduce((a, b) => a + b) / values.length;
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  public getState(): AIState {
    return { ...this.state };
  }

  public getDifficultyMultiplier(): number {
    return this.state.difficultyMultiplier;
  }

  public getConfidence(): number {
    return this.state.confidence;
  }

  public getCurrentTier(): DifficultyTier {
    return this.state.currentTier;
  }

  public addTrainingData(metrics: AIMetrics, actualMultiplier: number): void {
    // Normalize inputs
    const playerScoreNormalized = Math.min(metrics.score / 10000, 1);
    const avgObstacleDistance = 1 - Math.min(metrics.obstacleDensity, 1);
    const reactionTimeNormalized = Math.min(metrics.reactionTime / 500, 1);

    this.neuralModel.trainingData.push([
      playerScoreNormalized,
      avgObstacleDistance,
      reactionTimeNormalized
    ]);

    // Normalize output
    const normalizedMultiplier = (actualMultiplier - 0.5) / 1.5; // 0-1 range
    this.neuralModel.trainingLabels.push([normalizedMultiplier]);

    // Keep only recent data
    if (this.neuralModel.trainingData.length > 50) {
      this.neuralModel.trainingData.shift();
      this.neuralModel.trainingLabels.shift();
    }
  }

  public dispose(): void {
    if (this.neuralModel.model) {
      this.neuralModel.model.dispose();
    }
  }
}

// Singleton instance
export const adaptiveAiManager = new AdaptiveAiManager();
