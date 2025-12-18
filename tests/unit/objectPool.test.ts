/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ObjectPool } from '../../src/systems/pooling/ObjectPool';

interface TestObject {
  id: number;
  value: string;
  active: boolean;
}

describe('ObjectPool', () => {
  let pool: ObjectPool<TestObject>;
  let factoryCallCount: number;

  beforeEach(() => {
    factoryCallCount = 0;
    const factory = (): TestObject => {
      factoryCallCount++;
      return { id: factoryCallCount, value: 'default', active: false };
    };

    const reset = (obj: TestObject): void => {
      obj.value = 'reset';
      obj.active = false;
    };

    pool = new ObjectPool(factory, reset, 2, 5);
  });

  it('should create initial objects on construction', () => {
    const stats = pool.getStats();
    expect(stats.size).toBe(2);
    expect(stats.active).toBe(0);
    expect(stats.maxSize).toBe(5);
  });

  it('should acquire objects from pool first', () => {
    const obj1 = pool.acquire();
    const obj2 = pool.acquire();
    const obj3 = pool.acquire();

    // Since pool.pop() removes from end, first acquire gets the last created object
    expect(obj1.id).toBe(2); // Second initial object (last in array)
    expect(obj2.id).toBe(1); // First initial object
    expect(obj3.id).toBe(3); // New object created

    const stats = pool.getStats();
    expect(stats.size).toBe(0); // All initial objects used
    expect(stats.active).toBe(3);
  });

  it('should reset objects when acquired from pool', () => {
    const obj = pool.acquire();
    expect(obj.value).toBe('reset');
    expect(obj.active).toBe(false);
  });

  it('should release objects back to pool', () => {
    const obj1 = pool.acquire();
    const obj2 = pool.acquire();

    pool.release(obj1);
    pool.release(obj2);

    const stats = pool.getStats();
    expect(stats.size).toBe(2);
    expect(stats.active).toBe(0);
  });

  it('should reset objects when released to pool', () => {
    const obj = pool.acquire();
    obj.value = 'modified';
    obj.active = true;

    pool.release(obj);

    const stats = pool.getStats();
    expect(stats.size).toBe(2);
    expect(stats.active).toBe(0);

    const reacquired = pool.acquire();
    expect(reacquired.value).toBe('reset');
    expect(reacquired.active).toBe(false);
  });

  it('should respect maxSize when releasing', () => {
    // Fill pool to maxSize first
    for (let i = 0; i < 5; i++) {
      pool.acquire();
    }

    // Release 3 objects back to pool
    for (let i = 0; i < 3; i++) {
      pool.release({ id: i, value: 'test', active: true });
    }

    const stats = pool.getStats();
    expect(stats.size).toBe(3); // Objects added back to pool
    expect(stats.active).toBe(2); // 5 - 3 = 2 still active
  });

  it('should handle active count correctly', () => {
    const obj1 = pool.acquire();
    const obj2 = pool.acquire();
    const obj3 = pool.acquire();

    let stats = pool.getStats();
    expect(stats.active).toBe(3);

    pool.release(obj1);
    pool.release(obj2);

    stats = pool.getStats();
    expect(stats.active).toBe(1);

    pool.release(obj3);
    stats = pool.getStats();
    expect(stats.active).toBe(0);
  });

  it('should clear pool properly', () => {
    pool.acquire();
    pool.acquire();

    pool.clear();

    const stats = pool.getStats();
    expect(stats.size).toBe(0);
    expect(stats.active).toBe(0);
  });

  it('should handle factory function calls correctly', () => {
    pool.acquire(); // Uses pool
    pool.acquire(); // Uses pool

    expect(factoryCallCount).toBe(2); // Only initial objects

    pool.acquire(); // Creates new

    expect(factoryCallCount).toBe(3);
  });
});
