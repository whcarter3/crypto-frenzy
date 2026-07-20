import { State } from '../types';
import { initialState } from './initialState';
import {
  CURRENT_SAVE_VERSION,
  migrateAndValidate,
} from './saveSchema';

const SAVE_KEY = 'cryptoFrenzySave';

const isBrowser = () => typeof window !== 'undefined';

/**
 * Read + migrate + validate the save. Old-version saves are walked
 * forward through lib/state/saveSchema.ts migrations instead of being
 * discarded (Phase 2; resolves the PR #34 review note) — only corrupt
 * data or saves from an unknown FUTURE version return null.
 */
const readValidState = (): State | null => {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return migrateAndValidate(JSON.parse(raw));
  } catch {
    return null;
  }
};

export const hasSave = (): boolean => readValidState() !== null;

export const loadGame = (): State | null => {
  const saved = readValidState();
  if (!saved) return null;
  // Spread over initialState so SCHEMA-OPTIONAL fields added at the
  // same save version pick up defaults. A field the schema requires
  // needs a version bump + migration instead — see the recipe in
  // saveSchema.ts. A restored run is always mid-run: modal closed,
  // no game-over summary.
  return {
    ...initialState,
    ...saved,
    modalOpen: false,
    gameOver: null,
  };
};

export const saveGame = (state: State): void => {
  if (!isBrowser()) return;
  try {
    const file = {
      version: CURRENT_SAVE_VERSION,
      savedAt: new Date().toISOString(),
      state,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(file));
  } catch {
    // Storage full or unavailable — losing the autosave is acceptable.
  }
};

export const clearSave = (): void => {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // ignore
  }
};
