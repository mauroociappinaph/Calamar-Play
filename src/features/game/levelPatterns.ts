/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ObjectType } from '@/shared/types/types';

// Pattern types for different game moments
export type PatternType = 'RESPITE' | 'TENSION' | 'PEAK' | 'VARIATION';

// Individual spawn instruction
export interface SpawnInstruction {
  type: ObjectType;
  lane: number; // -2 to +2 (relative to center)
  zOffset: number; // Distance from spawn point
  delay?: number; // Delay in frames after previous spawn
  value?: string; // For letters
  targetIndex?: number; // For letters
}

// Pattern definition
export interface LevelPattern {
  id: string;
  name: string;
  type: PatternType;
  duration: number; // Duration in seconds
  spawns: SpawnInstruction[];
  description: string;
}

// Predefined level patterns
export const LEVEL_PATTERNS: LevelPattern[] = [
  // RESPITE PATTERNS - Low density, recovery moments
  {
    id: 'respite_sparse',
    name: 'Respiro Ligero',
    type: 'RESPITE',
    duration: 8,
    spawns: [
      { type: ObjectType.OBSTACLE, lane: -1, zOffset: 10 },
      { type: ObjectType.GEM, lane: 0, zOffset: 15 },
      { type: ObjectType.OBSTACLE, lane: 1, zOffset: 25 },
      { type: ObjectType.GEM, lane: -1, zOffset: 30 },
    ],
    description: 'Pocas amenazas, permite recuperación y planificación'
  },

  {
    id: 'respite_bonanza',
    name: 'Bonanza de Gemas',
    type: 'RESPITE',
    duration: 6,
    spawns: [
      { type: ObjectType.GEM, lane: -2, zOffset: 8 },
      { type: ObjectType.GEM, lane: -1, zOffset: 12 },
      { type: ObjectType.GEM, lane: 0, zOffset: 16 },
      { type: ObjectType.GEM, lane: 1, zOffset: 20 },
      { type: ObjectType.GEM, lane: 2, zOffset: 24 },
      { type: ObjectType.OBSTACLE, lane: 0, zOffset: 28 },
    ],
    description: 'Muchas gemas para recuperar recursos económicos'
  },

  // TENSION PATTERNS - Moderate challenge
  {
    id: 'tension_alternating',
    name: 'Alternancia de Amenazas',
    type: 'TENSION',
    duration: 10,
    spawns: [
      { type: ObjectType.OBSTACLE, lane: -2, zOffset: 8 },
      { type: ObjectType.ALIEN, lane: 2, zOffset: 15 },
      { type: ObjectType.OBSTACLE, lane: 0, zOffset: 20 },
      { type: ObjectType.GEM, lane: 1, zOffset: 22 },
      { type: ObjectType.ALIEN, lane: -1, zOffset: 28 },
      { type: ObjectType.OBSTACLE, lane: 1, zOffset: 32 },
    ],
    description: 'Amenazas alternadas con oportunidades de recompensa'
  },

  {
    id: 'tension_zigzag',
    name: 'Zigzag de Obstáculos',
    type: 'TENSION',
    duration: 12,
    spawns: [
      { type: ObjectType.OBSTACLE, lane: -2, zOffset: 8 },
      { type: ObjectType.OBSTACLE, lane: 2, zOffset: 12 },
      { type: ObjectType.OBSTACLE, lane: -1, zOffset: 16 },
      { type: ObjectType.OBSTACLE, lane: 1, zOffset: 20 },
      { type: ObjectType.OBSTACLE, lane: 0, zOffset: 24 },
      { type: ObjectType.GEM, lane: 1, zOffset: 26 },
      { type: ObjectType.OBSTACLE, lane: -2, zOffset: 30 },
    ],
    description: 'Patrón serpenteante que requiere cambios de lane constantes'
  },

  // PEAK PATTERNS - High intensity
  {
    id: 'peak_wall',
    name: 'Muro de Obstáculos',
    type: 'PEAK',
    duration: 8,
    spawns: [
      { type: ObjectType.OBSTACLE, lane: -2, zOffset: 8 },
      { type: ObjectType.OBSTACLE, lane: -1, zOffset: 8 },
      { type: ObjectType.OBSTACLE, lane: 0, zOffset: 8 },
      { type: ObjectType.OBSTACLE, lane: 1, zOffset: 8 },
      { type: ObjectType.OBSTACLE, lane: 2, zOffset: 8 },
      { type: ObjectType.GEM, lane: 0, zOffset: 15 },
      { type: ObjectType.ALIEN, lane: -1, zOffset: 18 },
      { type: ObjectType.ALIEN, lane: 1, zOffset: 18 },
    ],
    description: 'Barrera masiva que requiere timing perfecto'
  },

  {
    id: 'peak_homing',
    name: 'Misiles Perseguidores',
    type: 'PEAK',
    duration: 10,
    spawns: [
      { type: ObjectType.OBSTACLE, lane: 0, zOffset: 10 },
      { type: ObjectType.MISSILE, lane: -2, zOffset: 15 },
      { type: ObjectType.MISSILE, lane: 2, zOffset: 15 },
      { type: ObjectType.OBSTACLE, lane: -1, zOffset: 20 },
      { type: ObjectType.MISSILE, lane: 0, zOffset: 25 },
      { type: ObjectType.OBSTACLE, lane: 1, zOffset: 30 },
    ],
    description: 'Misiles que requieren evasión activa y predictiva'
  },

  // VARIATION PATTERNS - Special set pieces
  {
    id: 'variation_letter_rush',
    name: 'Carrera de Letras',
    type: 'VARIATION',
    duration: 15,
    spawns: [
      { type: ObjectType.LETTER, lane: -2, zOffset: 10, value: 'C', targetIndex: 0 },
      { type: ObjectType.OBSTACLE, lane: 0, zOffset: 12 },
      { type: ObjectType.LETTER, lane: 2, zOffset: 18, value: 'A', targetIndex: 1 },
      { type: ObjectType.ALIEN, lane: -1, zOffset: 20 },
      { type: ObjectType.LETTER, lane: 0, zOffset: 25, value: 'L', targetIndex: 2 },
      { type: ObjectType.OBSTACLE, lane: 1, zOffset: 28 },
      { type: ObjectType.LETTER, lane: -1, zOffset: 32, value: 'A', targetIndex: 3 },
      { type: ObjectType.GEM, lane: 1, zOffset: 35 },
    ],
    description: 'Secuencia de letras críticas con obstáculos intercalados'
  },

  {
    id: 'variation_missile_barrage',
    name: 'Barrage de Misiles',
    type: 'VARIATION',
    duration: 12,
    spawns: [
      { type: ObjectType.OBSTACLE, lane: 0, zOffset: 8 },
      { type: ObjectType.MISSILE, lane: -2, zOffset: 12 },
      { type: ObjectType.MISSILE, lane: -1, zOffset: 14 },
      { type: ObjectType.MISSILE, lane: 0, zOffset: 16 },
      { type: ObjectType.MISSILE, lane: 1, zOffset: 18 },
      { type: ObjectType.MISSILE, lane: 2, zOffset: 20 },
      { type: ObjectType.GEM, lane: 0, zOffset: 25 },
    ],
    description: 'Oleada masiva de misiles que requiere movimientos evasivos intensos'
  }
];

// Pattern rotation logic
export class PatternManager {
  private currentPattern: LevelPattern | null = null;
  private patternStartTime: number = 0;
  private patternQueue: PatternType[] = [];
  private lastPatternType: PatternType | null = null;

  constructor() {
    this.initializePatternQueue();
  }

  private initializePatternQueue(): void {
    // Create a balanced sequence: Respite → Tension → Peak → Variation → Respite...
    this.patternQueue = [
      'RESPITE',
      'TENSION',
      'PEAK',
      'VARIATION',
      'RESPITE',
      'TENSION',
      'PEAK',
      'VARIATION'
    ];
  }

  public getCurrentPattern(): LevelPattern | null {
    return this.currentPattern;
  }

  public shouldSwitchPattern(currentTime: number): boolean {
    if (!this.currentPattern) return true;

    const elapsed = currentTime - this.patternStartTime;
    return elapsed >= this.currentPattern.duration * 1000; // Convert to milliseconds
  }

  public getNextPattern(): LevelPattern {
    const nextType = this.patternQueue.shift()!;

    // Replenish queue if empty
    if (this.patternQueue.length === 0) {
      this.initializePatternQueue();
    }

    // Get random pattern of the requested type
    const availablePatterns = LEVEL_PATTERNS.filter(p => p.type === nextType);
    const selectedPattern = availablePatterns[Math.floor(Math.random() * availablePatterns.length)];

    this.currentPattern = selectedPattern;
    this.patternStartTime = Date.now();
    this.lastPatternType = nextType;

    return selectedPattern;
  }

  public getPatternProgress(currentTime: number): number {
    if (!this.currentPattern) return 0;

    const elapsed = currentTime - this.patternStartTime;
    return Math.min(elapsed / (this.currentPattern.duration * 1000), 1);
  }

  public getAllPatterns(): LevelPattern[] {
    return LEVEL_PATTERNS;
  }

  public getPatternsByType(type: PatternType): LevelPattern[] {
    return LEVEL_PATTERNS.filter(p => p.type === type);
  }
}

// Global instance
export const patternManager = new PatternManager();
