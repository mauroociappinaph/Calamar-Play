/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Fixed Timestep Game Loop Implementation
 * Decouples physics/logic updates from rendering for consistent gameplay
 */

export interface FixedUpdateCallback {
  (deltaTime: number): void;
}

export interface RenderCallback {
  (interpolationAlpha: number): void;
}

export interface InputState {
  // Add input fields as needed
  timestamp: number;
  // Example: touch positions, button states, etc.
}

export class FixedTimestepLoop {
  private fixedDeltaTime: number;
  private maxDeltaTime: number;
  private accumulator: number = 0;
  private lastTime: number = 0;
  private isRunning: boolean = false;

  private onFixedUpdate: FixedUpdateCallback | null = null;
  private onRender: RenderCallback | null = null;

  private currentInputState: InputState = { timestamp: 0 };
  private previousInputState: InputState = { timestamp: 0 };

  constructor(
    fixedDeltaTime: number = 1/60, // 60 FPS
    maxDeltaTime: number = 0.25 // Max 250ms to prevent spiral of death
  ) {
    this.fixedDeltaTime = fixedDeltaTime;
    this.maxDeltaTime = maxDeltaTime;
  }

  /**
   * Set the callback for fixed timestep updates (physics, logic, etc.)
   */
  setFixedUpdateCallback(callback: FixedUpdateCallback): void {
    this.onFixedUpdate = callback;
  }

  /**
   * Set the callback for variable render updates
   */
  setRenderCallback(callback: RenderCallback): void {
    this.onRender = callback;
  }

  /**
   * Update input state snapshot
   */
  updateInputState(newState: InputState): void {
    this.previousInputState = { ...this.currentInputState };
    this.currentInputState = { ...newState };
  }

  /**
   * Get current input state (for fixed updates)
   */
  getCurrentInputState(): InputState {
    return { ...this.currentInputState };
  }

  /**
   * Get interpolated input state (for rendering)
   */
  getInterpolatedInputState(alpha: number): InputState {
    // Simple interpolation - can be extended for more complex inputs
    return {
      timestamp: this.previousInputState.timestamp +
                 (this.currentInputState.timestamp - this.previousInputState.timestamp) * alpha
    };
  }

  /**
   * Main game loop - call this from your render loop (useFrame)
   */
  update(currentTime: number): void {
    if (!this.isRunning) return;

    // Initialize lastTime on first call
    if (this.lastTime === 0) {
      this.lastTime = currentTime;
      return;
    }

    // Calculate frame time
    let frameTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Clamp frame time to prevent spiral of death
    frameTime = Math.min(frameTime, this.maxDeltaTime);

    // Accumulate time
    this.accumulator += frameTime;

    // Fixed timestep updates
    let fixedUpdateCount = 0;
    while (this.accumulator >= this.fixedDeltaTime && fixedUpdateCount < 10) { // Safety limit
      if (this.onFixedUpdate) {
        this.onFixedUpdate(this.fixedDeltaTime);
      }
      this.accumulator -= this.fixedDeltaTime;
      fixedUpdateCount++;
    }

    // Calculate interpolation alpha for smooth rendering
    const alpha = this.accumulator / this.fixedDeltaTime;

    // Render update
    if (this.onRender) {
      this.onRender(alpha);
    }
  }

  /**
   * Start the game loop
   */
  start(): void {
    this.isRunning = true;
    this.accumulator = 0;
    this.lastTime = 0;
  }

  /**
   * Pause the game loop
   */
  pause(): void {
    this.isRunning = false;
  }

  /**
   * Reset the loop state
   */
  reset(): void {
    this.accumulator = 0;
    this.lastTime = 0;
    this.isRunning = false;
  }

  /**
   * Get current loop statistics
   */
  getStats() {
    return {
      isRunning: this.isRunning,
      accumulator: this.accumulator,
      fixedDeltaTime: this.fixedDeltaTime,
      maxDeltaTime: this.maxDeltaTime
    };
  }
}
