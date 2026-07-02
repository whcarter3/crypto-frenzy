import { State } from '../types';
import { initialState } from './initialState';

const SAVE_KEY = 'cryptoFrenzySave';
// Bump when the State shape changes incompatibly — old saves are discarded.
// v2: engine refactor added rngState (deterministic PRNG).
const SAVE_VERSION = 2;

type SaveFile = {
  version: number;
  savedAt: string;
  state: State;
};

const isBrowser = () => typeof window !== 'undefined';

const readSaveFile = (): SaveFile | null => {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SaveFile;
    if (parsed?.version !== SAVE_VERSION) return null;
    const saved = parsed.state;
    if (
      typeof saved?.currentDay !== 'number' ||
      typeof saved?.days !== 'number' ||
      typeof saved?.rngState !== 'number' ||
      !saved.assets ||
      !saved.wallet
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const hasSave = (): boolean => readSaveFile() !== null;

export const loadGame = (): State | null => {
  const file = readSaveFile();
  if (!file) return null;
  // Spread over initialState so fields added in newer builds get defaults.
  // A restored run is always mid-run: modal closed, no game-over summary.
  return {
    ...initialState,
    ...file.state,
    modalOpen: false,
    gameOver: null,
  };
};

export const saveGame = (state: State): void => {
  if (!isBrowser()) return;
  try {
    const file: SaveFile = {
      version: SAVE_VERSION,
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
