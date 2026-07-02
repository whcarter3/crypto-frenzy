import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearSave,
  hasSave,
  loadGame,
  saveGame,
} from './persistence';
import { initialState } from './initialState';
import { State } from '../types';

const SAVE_KEY = 'cryptoFrenzySave';
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

const midRun: State = {
  ...initialState,
  cash: 555,
  currentDay: 7,
  rngState: 99,
  modalOpen: false,
};

describe('save/load roundtrip', () => {
  it('restores a saved run', () => {
    saveGame(midRun);
    expect(hasSave()).toBe(true);
    const loaded = loadGame();
    expect(loaded?.cash).toBe(555);
    expect(loaded?.currentDay).toBe(7);
    expect(loaded?.rngState).toBe(99);
  });

  it('normalizes a restored run to mid-run UI state', () => {
    saveGame({
      ...midRun,
      modalOpen: true,
      gameOver: { score: 1, newHighScore: false },
    });
    const loaded = loadGame();
    expect(loaded?.modalOpen).toBe(false);
    expect(loaded?.gameOver).toBeNull();
  });

  it('clearSave removes the save', () => {
    saveGame(midRun);
    clearSave();
    expect(hasSave()).toBe(false);
    expect(loadGame()).toBeNull();
  });
});

describe('save validation', () => {
  it('rejects saves from other versions', () => {
    store.set(
      SAVE_KEY,
      JSON.stringify({ version: 1, savedAt: '', state: midRun }),
    );
    expect(loadGame()).toBeNull();
    expect(hasSave()).toBe(false);
  });

  it('rejects saves missing engine fields', () => {
    const { rngState: _rngState, ...withoutRng } = midRun;
    store.set(
      SAVE_KEY,
      JSON.stringify({ version: 2, savedAt: '', state: withoutRng }),
    );
    expect(loadGame()).toBeNull();
  });

  it('rejects corrupt saves', () => {
    store.set(SAVE_KEY, 'not json {');
    expect(loadGame()).toBeNull();
    expect(hasSave()).toBe(false);
  });
});
