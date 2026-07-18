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
  seed: 42,
  rngState: 99,
  modalOpen: false,
};

/**
 * FROZEN historical save shapes, transcribed from git history — NOT
 * derived from the current State, so they can't silently drift when
 * the present shape changes (deriving them is exactly how the
 * early-v2 missing-seed bug hid from the first version of this
 * suite). Two coins instead of five for readability; the shape is
 * what matters. Sources:
 *   v1        — commit 6b0417f (phase 1a): no seed, no rngState,
 *               assets without previousPrice
 *   v2 early  — commit dee581f (engine refactor): + rngState, still
 *               NO seed (it landed later in PR #35 without a bump)
 *   v2 late   — post-PR #35: + seed
 */
const frozenAsset = {
  name: 'Bitcoin',
  symbol: 'BTC',
  wallet: 2,
  active: true,
  averageCost: 20000,
  totalCost: 40000,
  range: {
    low: [3000, 9000],
    mid: [10000, 45000],
    high: [50000, 90000],
    moon: [100000, 250000],
  },
  price: 21000,
};

const FROZEN_V1 = {
  days: 31,
  currentDay: 9,
  cash: 777,
  debt: 3100,
  interestRate: 0.2,
  log: ['Bought 2 Bitcoin', 'Game start'],
  highScore: null,
  modalOpen: false,
  gameOver: null,
  stats: { peakNetWorth: 500, totalTrades: 3, bestTradeProfit: 120 },
  lowRangePriceChance: 5,
  highRangePriceChance: 94,
  mode: 'Normal',
  assets: {
    bitcoin: { ...frozenAsset },
    solana: {
      ...frozenAsset,
      name: 'Solana',
      symbol: 'SOL',
      wallet: 0,
      averageCost: 0,
      totalCost: 0,
      price: 55,
    },
  },
  wallet: { amount: 2, capacity: 100, level: 0, expansionCost: 50000 },
};

const FROZEN_V2_EARLY = { ...FROZEN_V1, rngState: 987654321 };
const FROZEN_V2_LATE = { ...FROZEN_V2_EARLY, seed: 42 };

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

  it('keeps unknown fields from a same-version newer build', () => {
    // A newer patch added a field without bumping the version: the
    // save must load (and later resave) without stripping it.
    store.set(
      SAVE_KEY,
      JSON.stringify({
        version: 3,
        savedAt: '',
        state: { ...midRun, futureField: 'keep-me' },
      }),
    );
    const loaded = loadGame() as (State & { futureField?: string }) | null;
    expect(loaded?.futureField).toBe('keep-me');
  });
});

describe('migrations', () => {
  it('migrates a late-v2 save: assets gain previousPrice, run resumes', () => {
    store.set(
      SAVE_KEY,
      JSON.stringify({ version: 2, savedAt: '', state: FROZEN_V2_LATE }),
    );
    const loaded = loadGame();
    expect(loaded).not.toBeNull();
    expect(loaded?.cash).toBe(777);
    expect(loaded?.currentDay).toBe(9);
    // engine identity survives untouched
    expect(loaded?.seed).toBe(42);
    expect(loaded?.rngState).toBe(987654321);
    // every asset gets the "no yesterday" sentinel — deltas stay
    // hidden until the next roll, like day 1 of a fresh run
    for (const asset of Object.values(loaded!.assets)) {
      expect(asset.previousPrice).toBe(0);
    }
  });

  it('migrates an early-v2 save (rngState but no seed — dee581f era)', () => {
    // SAVE_VERSION 2 spans two shapes: `seed` landed mid-version
    // without a bump. These saves are real runs and must migrate.
    store.set(
      SAVE_KEY,
      JSON.stringify({ version: 2, savedAt: '', state: FROZEN_V2_EARLY }),
    );
    const loaded = loadGame();
    expect(loaded).not.toBeNull();
    expect(loaded?.rngState).toBe(987654321);
    // pre-seed run: gets the "unknown" sentinel the UI hides
    expect(loaded?.seed).toBe(0);
  });

  it('migrates a v1 save: engine fields derived, run resumes', () => {
    store.set(
      SAVE_KEY,
      JSON.stringify({ version: 1, savedAt: '', state: FROZEN_V1 }),
    );
    const loaded = loadGame();
    expect(loaded).not.toBeNull();
    expect(loaded?.cash).toBe(777);
    // v1 runs predate seeds: 0 is the "unknown" sentinel the UI hides
    expect(loaded?.seed).toBe(0);
    // a real, nonzero rng state so ADVANCE_DAY can roll prices
    expect(typeof loaded?.rngState).toBe('number');
    expect(loaded?.rngState).not.toBe(0);
    for (const asset of Object.values(loaded!.assets)) {
      expect(asset.previousPrice).toBe(0);
    }
  });

  it('migration is pure: the same save migrates identically', () => {
    const file = JSON.stringify({
      version: 1,
      savedAt: '',
      state: FROZEN_V1,
    });
    store.set(SAVE_KEY, file);
    const first = loadGame();
    store.set(SAVE_KEY, file);
    const second = loadGame();
    expect(first).toEqual(second);
  });
});

describe('save validation', () => {
  it('rejects saves from an unknown future version', () => {
    // A newer build's save is left for that build to read — an older
    // build must not guess at a shape it has never seen.
    store.set(
      SAVE_KEY,
      JSON.stringify({ version: 99, savedAt: '', state: midRun }),
    );
    expect(loadGame()).toBeNull();
    expect(hasSave()).toBe(false);
  });

  it('rejects saves missing engine fields at their version', () => {
    // rngState existed from the first moment of v2 — a v2 save
    // without it is corrupt, not old
    const { rngState: _rngState, ...withoutRng } = FROZEN_V2_EARLY;
    store.set(
      SAVE_KEY,
      JSON.stringify({ version: 2, savedAt: '', state: withoutRng }),
    );
    expect(loadGame()).toBeNull();
  });

  it('rejects saves with mistyped fields', () => {
    store.set(
      SAVE_KEY,
      JSON.stringify({
        version: 3,
        savedAt: '',
        state: { ...midRun, cash: 'all of it' },
      }),
    );
    expect(loadGame()).toBeNull();
  });

  it('rejects corrupt saves', () => {
    store.set(SAVE_KEY, 'not json {');
    expect(loadGame()).toBeNull();
    expect(hasSave()).toBe(false);
  });
});
