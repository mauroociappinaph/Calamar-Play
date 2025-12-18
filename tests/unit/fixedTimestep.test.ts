/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FixedTimestepLoop } from '../../src/systems/core/FixedTimestepLoop';

describe('FixedTimestepLoop', () => {
  let loop: FixedTimestepLoop;
  let fixedUpdateSpy: any;
  let renderSpy: any;

  beforeEach(() => {
    loop = new FixedTimestepLoop(1/60, 0.25); // 60 FPS, max 250ms
    fixedUpdateSpy = vi.fn();
    renderSpy = vi.fn();

    loop.setFixedUpdateCallback(fixedUpdateSpy);
    loop.setRenderCallback(renderSpy);
  });

  it('should initialize with correct default values', () => {
    const stats = loop.getStats();
    expect(stats.isRunning).toBe(false);
    expect(stats.accumulator).toBe(0);
    expect(stats.fixedDeltaTime).toBe(1/60);
    expect(stats.maxDeltaTime).toBe(0.25);
  });

  it('should not update when not running', () => {
    loop.update(1.0);
    expect(fixedUpdateSpy).not.toHaveBeenCalled();
    expect(renderSpy).not.toHaveBeenCalled();
  });

  it('should start and pause correctly', () => {
    loop.start();
    expect(loop.getStats().isRunning).toBe(true);

    loop.pause();
    expect(loop.getStats().isRunning).toBe(false);
  });

  it('should reset properly', () => {
    loop.start();
    loop.update(1.0);
    loop.reset();

    const stats = loop.getStats();
    expect(stats.isRunning).toBe(false);
    expect(stats.accumulator).toBe(0);
  });

  it('should call fixed update at correct intervals', () => {
    loop.start();

    // First frame - initialize lastTime
    loop.update(0.0);

    // Second frame - 1/60 seconds later
    loop.update(1/60);

    expect(fixedUpdateSpy).toHaveBeenCalledTimes(1);
    expect(fixedUpdateSpy).toHaveBeenCalledWith(1/60);
  });

  it('should accumulate time correctly', () => {
    loop.start();

    // Initialize
    loop.update(0.0);

    // Add 2 fixed timesteps worth of time
    loop.update(2/60);

    expect(fixedUpdateSpy).toHaveBeenCalledTimes(2);
  });

  it('should call render every frame', () => {
    loop.start();

    loop.update(0.0);
    loop.update(1/60);

    expect(renderSpy).toHaveBeenCalledTimes(1);
  });

  it('should clamp large frame times', () => {
    loop.start();

    loop.update(0.0);
    loop.update(0.5); // Larger than maxDeltaTime (0.25)

    // Should have called fixed update multiple times but clamped
    expect(fixedUpdateSpy).toHaveBeenCalledTimes(Math.floor(0.25 / (1/60)));
  });

  it('should handle input state correctly', () => {
    const inputState1 = { timestamp: 100 };
    const inputState2 = { timestamp: 200 };

    loop.updateInputState(inputState1);
    expect(loop.getCurrentInputState()).toEqual(inputState1);

    loop.updateInputState(inputState2);
    expect(loop.getCurrentInputState()).toEqual(inputState2);
    expect(loop.getInterpolatedInputState(0)).toEqual(inputState1); // Previous
    expect(loop.getInterpolatedInputState(1)).toEqual(inputState2); // Current
  });

  it('should interpolate input state correctly', () => {
    loop.updateInputState({ timestamp: 100 });
    loop.updateInputState({ timestamp: 200 });

    // At 50% interpolation
    const interpolated = loop.getInterpolatedInputState(0.5);
    expect(interpolated.timestamp).toBe(150);
  });

  it('should prevent infinite loops with safety limit', () => {
    loop.start();

    // Set up a scenario that would cause many fixed updates
    loop.update(0.0);
    loop.update(10.0); // Very large frame time

    // Should be limited to prevent infinite loops
    expect(fixedUpdateSpy).toHaveBeenCalledTimes(10); // Safety limit
  });

  it('should handle multiple updates in single frame correctly', () => {
    loop.start();

    loop.update(0.0);
    // Add enough time for 3 fixed updates
    loop.update(3/60);

    expect(fixedUpdateSpy).toHaveBeenCalledTimes(3);
    expect(renderSpy).toHaveBeenCalledTimes(1);
  });
});
