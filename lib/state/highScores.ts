import { State } from '../types';

/**
 * High-score persistence lives outside the reducer so the engine stays
 * pure: components read the score into START_RUN/INIT payloads and an
 * effect writes it back when a run settles with a new record.
 */

const keyFor = (mode: State['mode']): string =>
  mode === 'Easy'
    ? 'highScoreEasy'
    : mode === 'Hard'
      ? 'highScoreHard'
      : 'highScore';

export const loadHighScore = (mode: State['mode']): number | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(keyFor(mode));
    return raw ? parseInt(raw, 10) : null;
  } catch {
    return null;
  }
};

export const saveHighScore = (
  mode: State['mode'],
  score: number,
): void => {
  if (mode === 'Test' || typeof window === 'undefined') return;
  try {
    localStorage.setItem(keyFor(mode), score.toString());
  } catch {
    // ignore — losing a high score write beats crashing the game
  }
};

/** Wipes the records for every mode (Settings → reset high scores). */
export const clearHighScores = (): void => {
  if (typeof window === 'undefined') return;
  try {
    (['Easy', 'Normal', 'Hard'] as const).forEach((mode) =>
      localStorage.removeItem(keyFor(mode)),
    );
  } catch {
    // ignore
  }
};
