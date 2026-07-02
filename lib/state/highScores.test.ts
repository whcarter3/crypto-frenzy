import { beforeEach, describe, expect, it } from 'vitest';
import { loadHighScore, saveHighScore } from './highScores';

const store = new Map<string, string>();

beforeEach(() => {
  store.clear();
  (globalThis as unknown as { window: unknown }).window = globalThis;
  (globalThis as unknown as { localStorage: unknown }).localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) =>
      void store.set(key, String(value)),
    removeItem: (key: string) => void store.delete(key),
  };
});

describe('high scores', () => {
  it('returns null when no score is stored', () => {
    expect(loadHighScore('Normal')).toBeNull();
  });

  it('stores scores under a per-mode key', () => {
    saveHighScore('Normal', 100);
    saveHighScore('Easy', 200);
    saveHighScore('Hard', 300);
    expect(store.get('highScore')).toBe('100');
    expect(store.get('highScoreEasy')).toBe('200');
    expect(store.get('highScoreHard')).toBe('300');
    expect(loadHighScore('Normal')).toBe(100);
    expect(loadHighScore('Easy')).toBe(200);
    expect(loadHighScore('Hard')).toBe(300);
  });

  it('never writes in Test mode', () => {
    saveHighScore('Test', 999);
    expect(store.size).toBe(0);
  });
});
