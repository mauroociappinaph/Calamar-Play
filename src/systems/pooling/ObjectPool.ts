/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Generic Object Pool implementation.
 * Reduces GC pressure by reusing object instances instead of creating/destroying them.
 */
export class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private reset: (obj: T) => void;
  private maxSize: number;
  private activeCount: number = 0;

  constructor(factory: () => T, reset: (obj: T) => void, initialSize: number = 0, maxSize: number = 1000) {
    this.factory = factory;
    this.reset = reset;
    this.maxSize = maxSize;

    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.factory());
    }
  }

  /**
   * Acquires an object from the pool or creates a new one if the pool is empty.
   */
  acquire(): T {
    this.activeCount++;
    if (this.pool.length > 0) {
      const obj = this.pool.pop()!;
      this.reset(obj);
      return obj;
    }
    return this.factory();
  }

  /**
   * Returns an object to the pool for later reuse.
   */
  release(obj: T): void {
    if (this.activeCount > 0) {
      this.activeCount--;
    }

    if (this.pool.length < this.maxSize) {
      this.reset(obj);
      this.pool.push(obj);
    }
    // If pool is at maxSize, the object will be garbage collected (fallback)
  }

  /**
   * Clears the pool and releases all references.
   */
  clear(): void {
    this.pool = [];
    this.activeCount = 0;
  }

  /**
   * Returns current statistics for the pool.
   */
  getStats() {
    return {
      size: this.pool.length,
      active: this.activeCount,
      maxSize: this.maxSize
    };
  }
}
