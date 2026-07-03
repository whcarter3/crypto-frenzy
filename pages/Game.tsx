import { useEffect, useReducer } from 'react';
import { reducer } from '../lib/reducer';
import { initialState } from '../lib/state/initialState';
import {
  loadGame,
  saveGame,
  clearSave,
} from '../lib/state/persistence';
import { saveHighScore } from '../lib/state/highScores';
import { useNotification } from '../lib/NotificationContext';
import { AlertMessages } from '../helpers/alerts';
import { usePageTitle } from '../helpers/usePageTitle';
import AssetTable from '../components/AssetTable';
import Actions from '../components/Actions';
import GameSidebar from '../components/GameSidebar';
import Log from '../components/Log';
import GameMode from '../components/GameMode';
import GameOver from '../components/GameOver';

export default function Game() {
  usePageTitle('Crypto Frenzy – Game');

  // No prerender means the save can load synchronously on first render:
  // a saved run resumes directly, otherwise the difficulty modal shows.
  // A reload keeps ?seed= in the URL, so "seed present" can't mean
  // "start fresh" — only a seed that *doesn't match the saved run*
  // signals explicit intent to play a different market. Without this
  // distinction, reusing a seed link in a browser with an unrelated
  // save just silently resumes that save and the seed is never read.
  const [state, dispatch] = useReducer(reducer, initialState, (fresh) => {
    const seedParam = new URLSearchParams(window.location.search).get(
      'seed',
    );
    const saved = loadGame();
    if (seedParam === null) return saved ?? fresh;
    const urlSeed = Number(seedParam) >>> 0;
    return saved && saved.seed === urlSeed ? saved : fresh;
  });

  // Autosave mid-run; the save is cleared once the run ends.
  useEffect(() => {
    if (state.gameOver) {
      clearSave();
    } else if (!state.modalOpen) {
      saveGame(state);
    }
  }, [state]);

  // The engine is pure — localStorage writes happen out here.
  useEffect(() => {
    if (state.gameOver?.newHighScore) {
      saveHighScore(state.mode, state.gameOver.score);
    }
  }, [state.gameOver, state.mode]);

  // Warn when one in-game day remains.
  const { showNotification } = useNotification();
  useEffect(() => {
    if (!state.gameOver && state.currentDay === state.days - 1) {
      showNotification(AlertMessages.LAST_DAY, 'warning');
    }
  }, [state.currentDay, state.days, state.gameOver, showNotification]);

  return (
    <div className=" text-crt-green bg-crt-bg crt-scanlines flex min-h-screen">
      <main className="flex-1 flex">
        <div className="w-1/4 shrink-0 border-r border-white/10 bg-crt-panel/50 px-4 py-6">
          <GameSidebar state={state} dispatch={dispatch} />
        </div>

        <div className="flex flex-1 flex-col justify-between mx-auto px-4 py-6 gap-6">
          <div className="w-1/2 space-y-6">
            <Log log={state.log} />
            <AssetTable state={state} dispatch={dispatch} />
          </div>
          <Actions dispatch={dispatch} state={state} />
        </div>
      </main>

      {state.modalOpen && !state.gameOver && (
        <GameMode state={state} dispatch={dispatch} />
      )}
      {state.gameOver && (
        <GameOver state={state} dispatch={dispatch} />
      )}
    </div>
  );
}
