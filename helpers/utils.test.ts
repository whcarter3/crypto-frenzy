import { describe, expect, it } from 'vitest';
import { normalizeQuantity } from './utils';

describe('normalizeQuantity', () => {
  it('clamps above the cap to the cap', () => {
    expect(normalizeQuantity('999', 36)).toBe(36);
  });

  it('passes through in-range values', () => {
    expect(normalizeQuantity('12', 36)).toBe(12);
  });

  it('normalizes invalid and negative input to 0', () => {
    expect(normalizeQuantity('', 36)).toBe(0);
    expect(normalizeQuantity('abc', 36)).toBe(0);
    expect(normalizeQuantity('-5', 36)).toBe(0);
  });

  it('never goes below zero even with a broken cap', () => {
    expect(normalizeQuantity('5', -3)).toBe(0);
    expect(normalizeQuantity('5', 0)).toBe(0);
  });
});
