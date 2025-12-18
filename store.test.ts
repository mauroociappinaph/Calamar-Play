import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useStore } from './store';
import { GameStatus, RUN_SPEED_BASE } from './types';

describe('useStore', () => {
  beforeEach(() => {
    // Restaurar el estado inicial antes de cada test
    useStore.getState().startGame();
  });

  it('debe inicializarse correctamente con startGame', () => {
    const state = useStore.getState();
    expect(state.status).toBe(GameStatus.PLAYING);
    expect(state.score).toBe(0);
    expect(state.lives).toBe(3);
    expect(state.speed).toBe(RUN_SPEED_BASE);
  });

  it('debe sumar puntos correctamente con addScore', () => {
    useStore.getState().addScore(100);
    expect(useStore.getState().score).toBe(100);
  });

  it('debe recolectar gemas y sumar puntos', () => {
    useStore.getState().collectGem(50);
    expect(useStore.getState().score).toBe(50);
    expect(useStore.getState().gemsCollected).toBe(1);
  });

  it('debe restar vidas al recibir daño', () => {
    useStore.getState().takeDamage();
    expect(useStore.getState().lives).toBe(2);
  });

  it('debe cambiar a GAME_OVER cuando las vidas llegan a 0', () => {
    useStore.getState().takeDamage(); // 2
    useStore.getState().takeDamage(); // 1
    useStore.getState().takeDamage(); // 0

    const state = useStore.getState();
    expect(state.lives).toBe(0);
    expect(state.status).toBe(GameStatus.GAME_OVER);
    expect(state.speed).toBe(0);
  });

  it('no debe recibir daño si la inmortalidad está activa', () => {
    // Simulamos que tiene la habilidad y la activa
    useStore.setState({ hasImmortality: true, isImmortalityActive: true });

    useStore.getState().takeDamage();
    expect(useStore.getState().lives).toBe(3);
  });

  it('debe recolectar letras y aumentar la velocidad', () => {
    const initialSpeed = useStore.getState().speed;
    useStore.getState().collectLetter(0); // Recolecta la 'C'

    const state = useStore.getState();
    expect(state.collectedLetters).toContain(0);
    expect(state.speed).toBeGreaterThan(initialSpeed);
  });

  it('debe avanzar de nivel al recolectar todas las letras', () => {
    // El target es ['C', 'A', 'L', 'A', 'M', 'A', 'R', 'L', 'O', 'C', 'O'] (11 letras)
    const lettersCount = 11;

    for (let i = 0; i < lettersCount; i++) {
        useStore.getState().collectLetter(i);
    }

    const state = useStore.getState();
    expect(state.level).toBe(2);
    expect(state.collectedLetters.length).toBe(0); // Se resetean al subir de nivel
  });

  it('debe permitir comprar items si hay puntos suficientes', () => {
    useStore.getState().addScore(1000);
    const success = useStore.getState().buyItem('DOUBLE_JUMP', 500);

    expect(success).toBe(true);
    expect(useStore.getState().hasDoubleJump).toBe(true);
    expect(useStore.getState().score).toBe(500);
  });

  it('no debe permitir comprar items si no hay puntos suficientes', () => {
    useStore.getState().addScore(100);
    const success = useStore.getState().buyItem('DOUBLE_JUMP', 500);

    expect(success).toBe(false);
    expect(useStore.getState().hasDoubleJump).toBe(false);
    expect(useStore.getState().score).toBe(100);
  });
});
