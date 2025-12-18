/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


export enum GameStatus {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  SHOP = 'SHOP',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY'
}

export enum ObjectType {
  OBSTACLE = 'OBSTACLE',
  GEM = 'GEM',
  BEER = 'BEER',
  LETTER = 'LETTER',
  SHOP_PORTAL = 'SHOP_PORTAL',
  ALIEN = 'ALIEN',
  MISSILE = 'MISSILE'
}

export interface GameObject {
  id: string;
  type: ObjectType;
  position: [number, number, number]; // x, y, z
  active: boolean;
  value?: string; // For letters (G, E, M...)
  color?: string;
  targetIndex?: number; // Index in the GEMINI target word
  points?: number; // Score value for gems
  hasFired?: boolean; // For Aliens
}

export const LANE_WIDTH = 2.2;
export const JUMP_HEIGHT = 2.5;
export const JUMP_DURATION = 0.6; // seconds
export const RUN_SPEED_BASE = 22.5;
export const SPAWN_DISTANCE = 120;
export const REMOVE_DISTANCE = 20; // Behind player

// Tropical / Marine Colors for CALAMAR LOCO
export const GEMINI_COLORS = [
    '#ff4444', // C - Red
    '#ff8800', // A - Orange
    '#ffcc00', // L - Yellow
    '#44ff44', // A - Green
    '#00ccff', // M - Cyan
    '#ff8800', // A - Orange
    '#9944ff', // R - Purple
    '#ffcc00', // L - Yellow
    '#ff4444', // O - Red
    '#00ccff', // C - Cyan
    '#ff44aa', // O - Pink
];

export interface ShopItem {
    id: string;
    name: string;
    description: string;
    cost: number;
    icon: any; // Lucide icon component
    oneTime?: boolean; // If true, remove from pool after buying
}

// AI System Types
export enum DifficultyTier {
  RELAX = 'RELAX',
  FLOW = 'FLOW',
  HARDCORE = 'HARDCORE'
}

export interface AIMetrics {
  deaths: number;
  score: number;
  sessionLength: number; // in seconds
  reactionTime: number; // average reaction time in ms
  distance: number;
  currentSpeed: number;
  obstacleDensity: number;
  timestamp: number;
}

export interface AIState {
  confidence: number; // 0-100
  currentTier: DifficultyTier;
  difficultyMultiplier: number; // 0.5-2.0
  isUsingHeuristics: boolean;
  isUsingNeural: boolean;
  lastAdjustment: number; // timestamp
}
