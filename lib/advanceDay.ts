import { Dispatch } from 'react';
import { Action, State } from './types';
import { randomizePrices } from '../lib/prices';
import { numberWithCommas } from '../helpers/utils';
import { AlertMessages, getAlertType } from '../helpers/alerts';

const saveHighScore = (
  score: number,
  mode: 'Easy' | 'Hard' | 'Normal' | 'Test'
) => {
  if (mode === 'Test') return; // Don't save high scores for test mode

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

const getModeEmoji = (mode: 'Easy' | 'Hard' | 'Normal' | 'Test') => {
  switch (mode) {
    case 'Easy':
      return '🌱'; // Sprout for beginner
    case 'Hard':
      return '🔥'; // Fire for hard
    case 'Normal':
      return '⚡'; // Lightning for normal
    default:
      return '';
  }
};

/**
 * Advances the game by one day, updating the state and dispatching actions accordingly.
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
  // Handle game over state first
  if (state.currentDay >= state.days) {
    const score = state.cash - state.debt;
    const isNewHighScore = saveHighScore(score, state.mode);
    const modeEmoji = getModeEmoji(state.mode);

    showNotification?.(
      `Game Over! Your score: $${numberWithCommas(score)}${
        isNewHighScore
          ? ` - New ${state.mode} Mode ${modeEmoji} High Score! 🏆`
          : ` (${state.mode} Mode ${modeEmoji})`
      }`,
      isNewHighScore ? 'success' : 'info'
    );

    dispatch({ type: 'SET_HIGH_SCORE', payload: score });
    dispatch({ type: 'TOGGLE_MODAL' }); // Show game mode modal
    return;
  }

  dispatch({ type: 'ADVANCE_DAY' });

  //warning before last day
  if (state.currentDay === state.days - 1) {
    showNotification?.(AlertMessages.LAST_DAY, 'warning');
  }

  //end of game -- alert score -- set high score -- show game mode modal
  if (state.currentDay >= state.days) {
    const score = state.cash - state.debt;
    const isNewHighScore = saveHighScore(score, state.mode);
    const modeEmoji = getModeEmoji(state.mode);

    showNotification?.(
      `Game Over! Your score: $${numberWithCommas(score)}${
        isNewHighScore
          ? ` - New ${state.mode} Mode ${modeEmoji} High Score! 🏆`
          : ` (${state.mode} Mode ${modeEmoji})`
      }`,
      isNewHighScore ? 'success' : 'info'
    );

    dispatch({ type: 'SET_HIGH_SCORE', payload: score });
    dispatch({ type: 'TOGGLE_MODAL' }); // Show game mode modal
  } else {
    if (state.currentDay === 0) {
      //sets initial prices to randomized value from mid range
      dispatch({
        type: 'SET_LOG',
        payload: [
          `======== Start of Game =========`,
          `You borrowed $${numberWithCommas(state.cash)} at ${
            state.interestRate * 100
          }% daily interest`,
          `You have ${state.days} days to make as much money as you can! 💎🙌`,
        ],
      });
      randomizePrices(state, dispatch);
    } else {
      dispatch({
        type: 'SET_LOG',
        payload: [
          `========= End of Day ${state.currentDay} =========`,
        ],
      });

      randomizePrices(state, dispatch);

      dispatch({
        type: 'INCREASE_DEBT',
      });
    }
  }
};
