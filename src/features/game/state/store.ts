/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import { create } from 'zustand';
import { GameStatus, RUN_SPEED_BASE } from '@/shared/types/types';
import { trackGameEvent } from '@/shared/analytics';
import { checkpointManager, CheckpointData } from './checkpoints';
import { audioEvents } from '@/systems/audio/AudioEngine';

interface GameState {
  status: GameStatus;
  score: number;
  lives: number;
  maxLives: number;
  speed: number;
  collectedLetters: number[];
  level: number;
  laneCount: number;
  gemsCollected: number;
  distance: number;

  // Inventory / Abilities
  hasDoubleJump: boolean;
  hasImmortality: boolean;
  isImmortalityActive: boolean;

  // Onboarding
  isOnboardingActive: boolean;
  onboardingStartTime: number;
  currentTooltip: string | null;
  dismissedTooltips: string[];

  // Actions
  startGame: () => void;
  restartGame: () => void;
  restartFromCheckpoint: () => boolean;
  takeDamage: () => void;
  addScore: (amount: number) => void;
  collectGem: (value: number) => void;
  collectLetter: (index: number) => void;
  setStatus: (status: GameStatus) => void;
  setDistance: (dist: number) => void;

  // Shop / Abilities
  buyItem: (type: 'DOUBLE_JUMP' | 'MAX_LIFE' | 'HEAL' | 'IMMORTAL', cost: number) => boolean;
  advanceLevel: () => void;
  openShop: () => void;
  closeShop: () => void;
  activateImmortality: () => void;
  _transitionTo: (status: GameStatus) => boolean;

  // Checkpoint System
  createCheckpoint: (levelState: { objects: any[]; distanceTraveled: number; nextLetterDistance: number }) => boolean;
  hasCheckpoint: () => boolean;

  // Onboarding
  startOnboarding: () => void;
  dismissTooltip: (tooltip: string) => void;
  updateTooltip: (tooltip: string | null) => void;
}

// FSM Transition Matrix
const VALID_TRANSITIONS: Record<GameStatus, GameStatus[]> = {
  [GameStatus.MENU]: [GameStatus.PLAYING],
  [GameStatus.PLAYING]: [GameStatus.SHOP, GameStatus.GAME_OVER, GameStatus.VICTORY, GameStatus.PLAYING],
  [GameStatus.SHOP]: [GameStatus.PLAYING],
  [GameStatus.GAME_OVER]: [GameStatus.PLAYING],
  [GameStatus.VICTORY]: [GameStatus.PLAYING],
};

const GEMINI_TARGET = ['C', 'A', 'L', 'A', 'M', 'A', 'R', 'L', 'O', 'C', 'O'];
const MAX_LEVEL = 3;

export const useStore = create<GameState>((set, get) => ({
  status: GameStatus.MENU,
  score: 0,
  lives: 3,
  maxLives: 3,
  speed: 0,
  collectedLetters: [],
  level: 1,
  laneCount: 3,
  gemsCollected: 0,
  distance: 0,

  hasDoubleJump: false,
  hasImmortality: false,
  isImmortalityActive: false,

  // Onboarding
  isOnboardingActive: false,
  onboardingStartTime: 0,
  currentTooltip: null,
  dismissedTooltips: [],

  // Helper for internal state transitions
  _transitionTo: (nextStatus: GameStatus) => {
    const { status } = get();
    if (VALID_TRANSITIONS[status].includes(nextStatus)) {
      set({ status: nextStatus });
      return true;
    }
    console.warn(`[FSM] Invalid transition attempt: ${status} -> ${nextStatus}`);
    return false;
  },

  startGame: () => {
    const { _transitionTo, level, laneCount, startOnboarding } = get();
    if (_transitionTo(GameStatus.PLAYING)) {
      set({
        score: 0,
        lives: 3,
        maxLives: 3,
        speed: RUN_SPEED_BASE,
        collectedLetters: [],
        level: 1,
        laneCount: 3,
        gemsCollected: 0,
        distance: 0,
        hasDoubleJump: false,
        hasImmortality: false,
        isImmortalityActive: false
      });

      // Start onboarding
      startOnboarding();

      // Start game audio (music and ambience)
      setTimeout(() => {
        audioEvents.playGameMusic();
        audioEvents.playOceanAmbience();
      }, 500); // Small delay to ensure audio is ready

      // Analytics: Track game start
      trackGameEvent.gameStart(level, laneCount);
    }
  },

  restartGame: () => {
    const { _transitionTo } = get();
    if (_transitionTo(GameStatus.PLAYING)) {
      set({
        score: 0,
        lives: 3,
        maxLives: 3,
        speed: RUN_SPEED_BASE,
        collectedLetters: [],
        level: 1,
        laneCount: 3,
        gemsCollected: 0,
        distance: 0,
        hasDoubleJump: false,
        hasImmortality: false,
        isImmortalityActive: false
      });
    }
  },

  takeDamage: () => {
    const { lives, isImmortalityActive, _transitionTo, level, score } = get();
    if (isImmortalityActive) return;

    if (lives > 1) {
      set({ lives: lives - 1 });
    } else {
      set({ lives: 0, speed: 0 });
      _transitionTo(GameStatus.GAME_OVER);

      // Analytics: Track death
      trackGameEvent.death('damage', level, score);
    }
  },

  addScore: (amount) => set((state) => ({ score: state.score + amount })),

  collectGem: (value) => {
    const { laneCount, distance, speed } = get();

    // VARIABLE REWARDS (TASK-019): Add multipliers based on performance
    let multiplier = 1.0;

    // Timing bonus: faster speed = higher multiplier (up to 1.5x)
    const speedBonus = Math.min(speed / RUN_SPEED_BASE, 2.0) * 0.25;
    multiplier += speedBonus;

    // Distance milestone bonus: every 1000m = 1.2x
    const milestoneBonus = Math.floor(distance / 1000) * 0.1;
    multiplier = Math.min(multiplier + milestoneBonus, 2.0);

    // Random variance (±20%)
    const variance = 0.8 + Math.random() * 0.4;
    multiplier *= variance;

    const finalValue = Math.round(value * multiplier);

    set((state) => ({
      score: state.score + finalValue,
      gemsCollected: state.gemsCollected + 1
    }));

    // Analytics: Track gem collection with multiplier
    trackGameEvent.collectItem('gem', finalValue, Math.floor(Math.random() * laneCount));
  },

  setDistance: (dist) => set({ distance: dist }),

  collectLetter: (index) => {
    const { collectedLetters, level, speed, laneCount } = get();

    if (!collectedLetters.includes(index)) {
      const newLetters = [...collectedLetters, index];

      // BALANCED SPEED INCREASE (TASK-019): Cap per-letter speed increase
      const speedIncrease = Math.min(RUN_SPEED_BASE * 0.05, 5); // Max 5 units per letter
      const nextSpeed = Math.min(speed + speedIncrease, RUN_SPEED_BASE * 3); // Cap at 3x base speed

      set({
        collectedLetters: newLetters,
        speed: nextSpeed
      });

      // Analytics: Track letter collection
      trackGameEvent.collectItem('letter', 100, Math.floor(Math.random() * laneCount));

      // Check if full word collected
      if (newLetters.length === GEMINI_TARGET.length) {
        if (level < MAX_LEVEL) {
            // Immediately advance level
            get().advanceLevel();
        } else {
            // Victory Condition
            const { _transitionTo } = get();
            if (_transitionTo(GameStatus.VICTORY)) {
              set({
                score: get().score + 5000
              });
            }
        }
      }
    }
  },

  advanceLevel: () => {
      const { level, laneCount, speed, score, distance } = get();
      const nextLevel = level + 1;

      // BALANCED LEVEL SPEED INCREASE (TASK-019): Reduced from 30% to 20% with cap
      const speedIncrease = RUN_SPEED_BASE * 0.20;
      const newSpeed = Math.min(speed + speedIncrease, RUN_SPEED_BASE * 3); // Cap at 3x base speed

      set({
          level: nextLevel,
          laneCount: Math.min(laneCount + 2, 9), // Expand lanes
          status: GameStatus.PLAYING, // Keep playing, user runs into shop
          speed: newSpeed,
          collectedLetters: [] // Reset letters
      });

      // Analytics: Track level complete
      trackGameEvent.levelComplete(level, score, distance);
  },

  openShop: () => {
    const availableItems = ['DOUBLE_JUMP', 'MAX_LIFE', 'HEAL', 'IMMORTAL'];
    get()._transitionTo(GameStatus.SHOP);

    // Analytics: Track shop open
    trackGameEvent.shopOpen(availableItems);
  },

  closeShop: () => get()._transitionTo(GameStatus.PLAYING),

  buyItem: (type, cost) => {
      const { score, maxLives, lives } = get();

      if (score >= cost) {
          set({ score: score - cost });

          switch (type) {
              case 'DOUBLE_JUMP':
                  set({ hasDoubleJump: true });
                  break;
              case 'MAX_LIFE':
                  // SCALING COST (TASK-019): Max life costs increase with usage
                  const lifeIncrease = Math.max(1, Math.floor(maxLives / 3)); // Scales with current max lives
                  set({ maxLives: maxLives + lifeIncrease, lives: lives + lifeIncrease });
                  break;
              case 'HEAL':
                  set({ lives: Math.min(lives + 1, maxLives) });
                  break;
              case 'IMMORTAL':
                  set({ hasImmortality: true });
                  break;
          }

          // Analytics: Track item purchase
          trackGameEvent.itemPurchase(type.toLowerCase(), cost, score - cost);
          return true;
      }
      return false;
  },

  activateImmortality: () => {
      const { hasImmortality, isImmortalityActive } = get();
      if (hasImmortality && !isImmortalityActive) {
          set({ isImmortalityActive: true });

          // Lasts 5 seconds
          setTimeout(() => {
              set({ isImmortalityActive: false });
          }, 5000);
      }
  },

  setStatus: (status) => get()._transitionTo(status),
  increaseLevel: () => set((state) => ({ level: state.level + 1 })),

  // Checkpoint System Implementation
  restartFromCheckpoint: () => {
    const checkpoint = checkpointManager.getLastCheckpoint();
    if (!checkpoint || !checkpointManager.validateCheckpoint(checkpoint)) {
      console.warn('[Checkpoint] No valid checkpoint available');
      return false;
    }

    const { _transitionTo } = get();
    if (_transitionTo(GameStatus.PLAYING)) {
      set({
        status: GameStatus.PLAYING,
        score: checkpoint.score,
        lives: checkpoint.lives,
        maxLives: checkpoint.maxLives,
        speed: checkpoint.speed,
        collectedLetters: [...checkpoint.collectedLetters],
        level: checkpoint.level,
        laneCount: checkpoint.laneCount,
        gemsCollected: checkpoint.gemsCollected,
        distance: checkpoint.distance,
        hasDoubleJump: checkpoint.hasDoubleJump,
        hasImmortality: checkpoint.hasImmortality,
        isImmortalityActive: checkpoint.isImmortalityActive
      });

      // Dispatch event to restore level state
      window.dispatchEvent(new CustomEvent('restore-checkpoint', {
        detail: {
          objects: checkpoint.objects,
          distanceTraveled: checkpoint.distanceTraveled,
          nextLetterDistance: checkpoint.nextLetterDistance
        }
      }));

      console.log('[Checkpoint] Restored from checkpoint at distance:', checkpoint.distance);
      return true;
    }
    return false;
  },

  createCheckpoint: (levelState) => {
    const { distance } = get();
    if (!checkpointManager.shouldCreateCheckpoint(distance)) {
      return false;
    }

    const gameState = {
      score: get().score,
      lives: get().lives,
      maxLives: get().maxLives,
      speed: get().speed,
      collectedLetters: [...get().collectedLetters],
      level: get().level,
      laneCount: get().laneCount,
      gemsCollected: get().gemsCollected,
      distance: get().distance,
      hasDoubleJump: get().hasDoubleJump,
      hasImmortality: get().hasImmortality,
      isImmortalityActive: get().isImmortalityActive
    };

    checkpointManager.createCheckpoint(gameState, levelState);

    // Dispatch checkpoint created event for UI feedback
    window.dispatchEvent(new CustomEvent('checkpoint-created', {
      detail: { distance: gameState.distance }
    }));

    return true;
  },

  hasCheckpoint: () => checkpointManager.hasCheckpoint(),

  // Onboarding Implementation
  startOnboarding: () => {
    set({
      isOnboardingActive: true,
      onboardingStartTime: Date.now(),
      currentTooltip: 'move',
      dismissedTooltips: []
    });
  },

  dismissTooltip: (tooltip: string) => {
    set((state) => ({
      dismissedTooltips: [...state.dismissedTooltips, tooltip],
      currentTooltip: null
    }));
  },

  updateTooltip: (tooltip: string | null) => {
    set({ currentTooltip: tooltip });
  },
}));
