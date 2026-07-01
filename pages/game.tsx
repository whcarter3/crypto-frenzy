import { useEffect, useReducer } from 'react';
import Head from 'next/head';
import { reducer } from '../lib/reducer';
import { initialState } from '../lib/state/initialState';
import AssetTable from '../components/AssetTable';
import Actions from '../components/Actions';
import GameSidebar from '../components/GameSidebar';
import Log from '../components/Log';
// import Modal from '../components/GameMode';

export default function Game() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Difficulty modal commented out: assume Normal mode and auto-start
  useEffect(() => {
    if (state.modalOpen) {
      dispatch({ type: 'INIT' });
      dispatch({ type: 'TOGGLE_MODAL' });
    }
  }, []);

  return (
    <div className=" text-crt-green bg-crt-bg crt-scanlines flex min-h-screen">
      <Head>
        <title>Crypto Frenzy – Game</title>
        <meta
          name="description"
          content="Play Crypto Frenzy, the retro crypto trading sim."
        />
        <link rel="icon" href="/favicon1.ico" />
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

      {/* Difficulty modal commented out – Normal mode only for now
      {state.modalOpen && (
        <Modal state={state} dispatch={dispatch} />
      )}
      */}
    </div>
  );
}
