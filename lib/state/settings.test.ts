import { beforeEach, describe, expect, it } from 'vitest';
import {
  defaultSettings,
  loadSettings,
  saveSettings,
} from './settings';

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

describe('settings', () => {
  it('returns defaults when nothing is stored', () => {
    expect(loadSettings()).toEqual(defaultSettings);
  });

  it('round-trips', () => {
    saveSettings({ sound: false, crt: false });
    expect(loadSettings()).toEqual({ sound: false, crt: false });
  });

  it('merges stored values over defaults (forward compat)', () => {
    store.set('cryptoFrenzySettings', JSON.stringify({ sound: false }));
    expect(loadSettings()).toEqual({ ...defaultSettings, sound: false });
  });

  it('falls back to defaults on corrupt storage', () => {
    store.set('cryptoFrenzySettings', 'not json {');
    expect(loadSettings()).toEqual(defaultSettings);
  });
});
