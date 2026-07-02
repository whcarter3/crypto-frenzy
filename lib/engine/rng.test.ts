import { describe, expect, it } from 'vitest';
import { createRng, nextRandom, seedRng } from './rng';

describe('seedRng', () => {
  it('normalizes seeds to uint32', () => {
    for (const seed of [42, -1, 2 ** 40, Date.parse('2026-07-02')]) {
      const state = seedRng(seed);
      expect(Number.isInteger(state)).toBe(true);
      expect(state).toBeGreaterThanOrEqual(0);
      expect(state).toBeLessThan(2 ** 32);
    }
  });
});

describe('nextRandom', () => {
  it('is deterministic for a given state', () => {
    expect(nextRandom(123)).toEqual(nextRandom(123));
  });

  it('returns values in [0, 1) and advances the state', () => {
    let state = seedRng(7);
    for (let i = 0; i < 1000; i++) {
      const [value, next] = nextRandom(state);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
      expect(next).not.toBe(state);
      state = next;
    }
  });
});

describe('createRng', () => {
  it('produces identical sequences from identical seeds', () => {
    const a = createRng(seedRng(42));
    const b = createRng(seedRng(42));
    const seqA = Array.from({ length: 20 }, () => a.random());
    const seqB = Array.from({ length: 20 }, () => b.random());
    expect(seqA).toEqual(seqB);
  });

  it('produces different sequences from different seeds', () => {
    const a = createRng(seedRng(1));
    const b = createRng(seedRng(2));
    const seqA = Array.from({ length: 5 }, () => a.random());
    const seqB = Array.from({ length: 5 }, () => b.random());
    expect(seqA).not.toEqual(seqB);
  });

  it('resumes a sequence from a captured state', () => {
    const original = createRng(seedRng(42));
    original.random();
    original.random();
    const resumed = createRng(original.state());
    expect(resumed.random()).toBe(original.random());
  });
});
