import { useEffect, useReducer, useState } from 'react';
import Head from 'next/head';
import { reducer } from '../lib/reducer';
import { initialState } from '../lib/state/initialState';
import {
  loadGame,
  saveGame,
  clearSave,
} from '../lib/state/persistence';
import AssetTable from '../components/AssetTable';
import Actions from '../components/Actions';
import GameSidebar from '../components/GameSidebar';
import Log from '../components/Log';
import GameMode from '../components/GameMode';
import GameOver from '../components/GameOver';

export default function Game() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [hydrated, setHydrated] = useState(false);

  // Restore a saved run once on mount; otherwise the difficulty modal shows.
  useEffect(() => {
    const saved = loadGame();
    if (saved) {
      dispatch({ type: 'RESTORE', payload: saved });
    }
    setHydrated(true);
  }, []);

  // Autosave mid-run; the save is cleared once the run ends.
  useEffect(() => {
    if (!hydrated) return;
    if (state.gameOver) {
      clearSave();
    } else if (!state.modalOpen) {
      saveGame(state);
    }
  }, [state, hydrated]);

  return (
    <div className=" text-crt-green bg-crt-bg crt-scanlines flex min-h-screen">
      <Head>
        <title>Crypto Frenzy – Game</title>
        <meta
          name="description"
          content="Play Crypto Frenzy, the retro crypto trading sim."
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </Head>

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

      {hydrated && state.modalOpen && !state.gameOver && (
        <GameMode state={state} dispatch={dispatch} />
      )}
      {hydrated && state.gameOver && (
        <GameOver state={state} dispatch={dispatch} />
      )}
    </div>
  );
}
