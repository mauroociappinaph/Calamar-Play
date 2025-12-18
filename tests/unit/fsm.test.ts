import { beforeEach, describe, expect, it } from 'vitest';
import { useStore } from '@/features/game/state/store';
import { GameStatus } from '@/shared/types/types';

describe('Store FSM (Máquina de Estados)', () => {
  beforeEach(() => {
    // Reset fundamental: volver al menú
    useStore.setState({ status: GameStatus.MENU });
  });

  it('debe permitir transiciones válidas', () => {
    const state = useStore.getState();

    // MENU -> PLAYING
    expect(state._transitionTo(GameStatus.PLAYING)).toBe(true);
    expect(useStore.getState().status).toBe(GameStatus.PLAYING);

    // PLAYING -> SHOP
    expect(useStore.getState()._transitionTo(GameStatus.SHOP)).toBe(true);
    expect(useStore.getState().status).toBe(GameStatus.SHOP);

    // SHOP -> PLAYING
    expect(useStore.getState()._transitionTo(GameStatus.PLAYING)).toBe(true);
    expect(useStore.getState().status).toBe(GameStatus.PLAYING);
  });

  it('debe bloquear transiciones inválidas', () => {
    const state = useStore.getState();

    // MENU -> SHOP (Inválido)
    expect(state._transitionTo(GameStatus.SHOP)).toBe(false);
    expect(useStore.getState().status).toBe(GameStatus.MENU);

    // Mover a PLAYING
    state._transitionTo(GameStatus.PLAYING);

    // PLAYING -> MENU (Inválido)
    expect(useStore.getState()._transitionTo(GameStatus.MENU)).toBe(false);
    expect(useStore.getState().status).toBe(GameStatus.PLAYING);
  });

  it('debe manejar correctamente el ciclo de Game Over', () => {
    useStore.setState({ status: GameStatus.PLAYING, lives: 1 });

    // Recibir daño final -> GAME_OVER
    useStore.getState().takeDamage();
    expect(useStore.getState().status).toBe(GameStatus.GAME_OVER);

    // GAME_OVER -> MENU (Inválido)
    expect(useStore.getState()._transitionTo(GameStatus.MENU)).toBe(false);

    // GAME_OVER -> PLAYING (Reintentar)
    expect(useStore.getState().restartGame());
    expect(useStore.getState().status).toBe(GameStatus.PLAYING);
  });

  it('debe llegar a VICTORY solo desde PLAYING', () => {
    // Desde MENU -> VICTORY (Fallido)
    expect(useStore.getState()._transitionTo(GameStatus.VICTORY)).toBe(false);

    // Desde PLAYING -> VICTORY (Exitoso)
    useStore.getState()._transitionTo(GameStatus.PLAYING);
    expect(useStore.getState()._transitionTo(GameStatus.VICTORY)).toBe(true);
    expect(useStore.getState().status).toBe(GameStatus.VICTORY);
  });
});
