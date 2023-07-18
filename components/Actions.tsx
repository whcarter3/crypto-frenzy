import { Dispatch } from "react"
import { Action, State } from "../lib/types"
import { numberWithCommas } from "../helpers/utils"
import { payDebt } from "../lib/debt"
import { increaseWalletCapacity } from "../lib/wallet"
import { advanceDay } from "../lib/advanceDay"

const Actions = ({
  dispatch,
  state,
}: {
  dispatch: Dispatch<Action>
  state: State
}) => {
  const canPayDebt = state.cash <= state.debt || state.debt === 0
  const cashLessThanWalletExpansionCost =
    state.cash <= state.wallet.expansionCost

  return (
    <>
      <div className="mt-5 flex flex-col max-w-xs">
        <div className="flex w-full items-center">
          <button
            className={`${
              cashLessThanWalletExpansionCost
                ? "bg-slate-700 text-slate-500"
                : "bg-green-500"
            } px-3 py-1 mr-5 rounded-full`}
            onClick={() => increaseWalletCapacity(state, dispatch)}
          >
            Buy
          </button>
          <p
            className={`${cashLessThanWalletExpansionCost && "text-slate-500"}`}
          >
            Wallet Capacity +{state.wallet.increase}: $
            {numberWithCommas(state.wallet.expansionCost)}
          </p>
        </div>
        <div className="flex w-full items-center mt-3">
          <button
            className={`${
              canPayDebt ? "bg-slate-700 text-slate-500" : "bg-green-500"
            } px-3 py-1 mr-5 rounded-full`}
            onClick={() => payDebt(dispatch, state)}
            disabled={canPayDebt}
          >
            Pay
          </button>
          <p className={canPayDebt ? "text-slate-500" : ""}>
            Pay debt: ${numberWithCommas(state.debt)}
          </p>
        </div>
      </div>
      <button
        className="bg-blue-700 px-6 py-4 rounded-full mt-8 mr-5"
        id="advDay"
        onClick={() => advanceDay(state, dispatch)}
      >
        {state.currentDay === state.days ? "Finish Round" : "Advance Day"}
      </button>
      <button
        className="bg-red-700 px-6 py-4 rounded-full"
        onClick={() => dispatch({ type: "INIT" })}
      >
        New Game
      </button>
    </>
  )
}

export default Actions
