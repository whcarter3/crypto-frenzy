import { Dispatch } from 'react';
import { Action, State } from './types';
import { randomizePrices } from '../lib/prices';
import { AlertMessages } from '../helpers/alerts';

/**
 * Persists a score to localStorage if it beats the saved high score
 * for the given mode.
 * @param {number} score - The score to consider.
 * @param {State['mode']} mode - The mode the run was played in.
 * @returns {boolean} Whether the score set a new high score.
 */
const saveHighScore = (
  score: number,
  mode: 'Easy' | 'Hard' | 'Normal' | 'Test'
) => {
  if (mode === 'Test') return false; // Don't save high scores for test mode

  const key =
    mode === 'Easy'
      ? 'highScoreEasy'
      : mode === 'Hard'
      ? 'highScoreHard'
      : 'highScore';
  const currentHighScore = localStorage.getItem(key);
  const highScore = currentHighScore ? parseInt(currentHighScore) : 0;

  if (score > highScore) {
    localStorage.setItem(key, score.toString());
    return true;
  }
  return false;
};

/**
 * Advances the game by one day, updating the state and dispatching actions accordingly.
 * When the final day is reached the run is settled: the score (cash - debt) is
 * computed, the high score persisted, and GAME_OVER dispatched so the game-over
 * screen renders.
 * @param {State} state - The current state of the application.
 * @param {Dispatch<Action>} dispatch - The dispatch function for updating the state.
 * @param {Function} showNotification - The function to show notifications.
 */
export const advanceDay = (
  state: State,
  dispatch: Dispatch<Action>,
  showNotification?: (
    message: string,
    type: 'info' | 'success' | 'error' | 'warning'
  ) => void
) => {
  if (state.currentDay >= state.days || state.gameOver) return;

  const completedDay = state.currentDay;
  const newDay = completedDay + 1;
  dispatch({ type: 'ADVANCE_DAY' });

  if (newDay >= state.days) {
    // Run complete — settle up. Unsold holdings don't count toward the score.
    const score = state.cash - state.debt;
    const newHighScore = saveHighScore(score, state.mode);
    dispatch({ type: 'GAME_OVER', payload: { score, newHighScore } });
    return;
  }

  if (newDay === state.days - 1) {
    showNotification?.(AlertMessages.LAST_DAY, 'warning');
  }

  dispatch({
    type: 'SET_LOG',
    payload: [`========= End of Day ${completedDay} =========`],
  });
  randomizePrices(state, dispatch);
  dispatch({ type: 'INCREASE_DEBT' });
};
