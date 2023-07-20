import { useReducer } from "react"
import Head from "next/head"
import { initialState, reducer } from "../lib/reducer"
import Table from "../components/Table"
import Actions from "../components/Actions"
import Header from "../components/Header"
import Log from "../components/Log"
import Modal from "../components/GameMode"

export default function Home() {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <div className="container mx-auto mt-5">
      <Head>
        <title>Crypto Frenzy</title>
        <meta name="description" content="A crypto buying and selling game." />
        <link rel="icon" href="/favicon1.ico" />
      </Head>

      <main className="prose px-5 max-w-md">
        <Header state={state} />

        <Table state={state} dispatch={dispatch} />

        <Actions dispatch={dispatch} state={state} />

        <Log log={state.log} />

        {state.modalOpen && <Modal state={state} dispatch={dispatch} />}
      </main>
    </div>
  )
}
