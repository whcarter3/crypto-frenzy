import { useEffect, useReducer } from 'react';
import Head from 'next/head';
import { initialState, reducer } from '../lib/reducer';
import Table from '../components/Table';
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
    <div className="min-h-screen text-crt-green bg-crt-bg crt-scanlines flex">
      <Head>
        <title>Crypto Frenzy – Game</title>
        <meta
          name="description"
          content="Play Crypto Frenzy, the retro crypto trading sim."
        />
        <link rel="icon" href="/favicon1.ico" />
      </Head>

      <main className="flex-1 flex min-w-0">
        <div className="w-1/6 shrink-0 border-r border-white/10 bg-crt-panel/50 py-4 pl-4 pr-2">
          <GameSidebar state={state} dispatch={dispatch} />
        </div>

        <div className="flex-1 min-w-0 container mx-auto px-4 py-6">
          <div className="space-y-6 max-w-4xl">
            <Log log={state.log} />
            <Actions dispatch={dispatch} state={state} />
            <Table state={state} dispatch={dispatch} />
          </div>
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
