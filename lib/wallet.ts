import { Dispatch } from "react"
import { State, Action } from "../lib/types"

export const increaseWalletCapacity = (
  state: State,
  dispatch: Dispatch<Action>
) => {
  if (state.currentDay === 0) return
  if (state.cash < state.wallet.expansionCost) return

  dispatch({ type: "EXPAND_WALLET" })
  dispatch({
    type: "SET_LOG",
    payload: [
      `You have increased your wallet capacity to ${state.wallet.capacity}`,
      `Wallet Expansion cost has increased in price by 25% to ${state.wallet.expansionCost}`,
    ],
  })
}
