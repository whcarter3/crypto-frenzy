import { useEffect, useReducer, useState } from 'react';
import { reducer } from '../lib/reducer';
import { initialState } from '../lib/state/initialState';
import {
  loadGame,
  saveGame,
  clearSave,
} from '../lib/state/persistence';
import { saveHighScore } from '../lib/state/highScores';
import { useNotification } from '../lib/NotificationContext';
import { playSound } from '../lib/sound';
import { AlertMessages } from '../helpers/alerts';
import { usePageTitle } from '../helpers/usePageTitle';
import AssetTable from '../components/AssetTable';
import StatusBar from '../components/StatusBar';
import GameSidebar from '../components/GameSidebar';
import Log from '../components/Log';
import GameMode from '../components/GameMode';
import GameOver from '../components/GameOver';
import Settings from '../components/Settings';
import HowToPlay from '../components/HowToPlay';

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

  // UI-only chrome, not game state: never saved, never seeded.
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  // The engine is pure — localStorage writes happen out here.
  useEffect(() => {
    if (state.gameOver?.newHighScore) {
      saveHighScore(state.mode, state.gameOver.score);
    }
  }, [state.gameOver, state.mode]);

  // Sound is a side effect too: the run-settled jingle keys off
  // gameOver flipping, the moonshot fanfare off the day's fresh log
  // entries (everything above the newest day separator).
  useEffect(() => {
    if (state.gameOver) playSound('gameOver');
  }, [state.gameOver]);

  useEffect(() => {
    if (state.currentDay <= 1) return;
    const todaysEntries: string[] = [];
    for (const entry of state.log) {
      if (entry.startsWith('=========')) break;
      todaysEntries.push(entry);
    }
    if (todaysEntries.some((entry) => entry.includes('MOONSHOT'))) {
      playSound('moonshot');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentDay]);

  // Warn when one in-game day remains.
  const { showNotification } = useNotification();
  useEffect(() => {
    if (!state.gameOver && state.currentDay === state.days - 1) {
      showNotification(AlertMessages.LAST_DAY, 'warning');
      playSound('warning');
    }
  }, [state.currentDay, state.days, state.gameOver, showNotification]);

  return (
    <div className=" text-crt-green bg-crt-bg crt-scanlines flex min-h-screen">
      {/* min-w-0 on main and both columns: flex items default to
          min-width:auto, which floors them at their content's intrinsic
          width — the wide trade/holdings tables and unwrapped log lines
          were propagating ~600px minimums all the way up and forcing
          horizontal page scroll on phones. min-w-0 lets the overflow-x
          wrappers inside actually do their job. */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Visually hidden: the modals carry their own visible h1 when
            open, but the bare game screen had no heading at all for
            screen-reader users to navigate by. Inside <main> so it's
            contained by a landmark region. */}
        <h1 className="sr-only">Crypto Frenzy – Game</h1>

        {/* Vitals + End Day, sticky above both columns on every viewport */}
        <StatusBar dispatch={dispatch} state={state} />

        <div className="flex-1 flex flex-col lg:flex-row min-w-0">
          <div className="w-full lg:w-1/4 lg:shrink-0 min-w-0 border-b lg:border-b-0 lg:border-r border-white/10 bg-crt-panel/50 px-4 py-6">
            <GameSidebar
              state={state}
              dispatch={dispatch}
              onOpenSettings={() => setSettingsOpen(true)}
              onOpenHelp={() => setHelpOpen(true)}
            />
          </div>

          {/* No mx-auto: auto margins disable flex-item stretch, which at
              mobile widths sized this column to its content's intrinsic
              width (the unwrapped log/table, ~600px) instead of the
              viewport — the root cause of horizontal overflow on phones.
              flex-1 already fills the row on desktop. */}
          <div className="flex flex-1 flex-col min-w-0 px-4 py-6 gap-6">
            <div className="w-full space-y-6">
              <Log log={state.log} />
              <AssetTable state={state} dispatch={dispatch} />
            </div>
          </div>
        </div>
      </main>

      {state.modalOpen && !state.gameOver && (
        <GameMode state={state} dispatch={dispatch} />
      )}
      {state.gameOver && (
        <GameOver state={state} dispatch={dispatch} />
      )}
      {settingsOpen && (
        <Settings onClose={() => setSettingsOpen(false)} />
      )}
      {helpOpen && <HowToPlay onClose={() => setHelpOpen(false)} />}
    </div>
  );
}
