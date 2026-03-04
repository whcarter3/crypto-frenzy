import { useReducer } from 'react';
import Head from 'next/head';
import { initialState, reducer } from '../lib/reducer';
import Table from '../components/Table';
import Actions from '../components/Actions';
import Header from '../components/Header';
import Log from '../components/Log';
import Modal from '../components/GameMode';

export default function Game() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div className="min-h-screen text-crt-yellow bg-crt-bg crt-scanlines">
      <Head>
        <title>Crypto Frenzy – Game</title>
        <meta
          name="description"
          content="Play Crypto Frenzy, the retro crypto trading sim."
        />
        <link rel="icon" href="/favicon1.ico" />
      </Head>

      <main className="container mx-auto px-4 py-6">
        <Header state={state} />

        <div className="mt-8 space-y-8">
          <Log log={state.log} />

          <Actions dispatch={dispatch} state={state} />

          <Table state={state} dispatch={dispatch} />
        </div>

        {state.modalOpen && (
          <Modal state={state} dispatch={dispatch} />
        )}
      </main>
    </div>
  );
}
