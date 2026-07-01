import { Dispatch } from "react"
import { State, Action } from "../lib/types"

export const increaseWalletCapacity = (
  state: State,
  dispatch: Dispatch<Action>
) => {
  if (state.currentDay === 0) return
  if (state.cash < state.wallet.expansionCost) return

  dispatch({ type: "EXPAND_WALLET" })
  const nextCapacity = state.wallet.capacity * 2
  const nextCost = state.wallet.expansionCost * 2
  dispatch({
    type: "SET_LOG",
    payload: [
      `Wallet upgraded to Level ${state.wallet.level + 1}: capacity ${nextCapacity}.`,
      `Next upgrade: $${nextCost.toLocaleString()} → ${nextCapacity * 2} capacity.`,
    ],
  })
}
