import { useReducer } from 'react';
import Head from 'next/head';
import { initialState, reducer } from '../lib/reducer';
import Table from '../components/Table';
import Actions from '../components/Actions';
import Header from '../components/Header';
import Log from '../components/Log';
import Modal from '../components/GameMode';

export default function Home() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div className="min-h-screen bg-slate-900">
      <Head>
        <title>Crypto Frenzy</title>
        <meta
          name="description"
          content="A crypto buying and selling game."
        />
        <link rel="icon" href="/favicon1.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
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
