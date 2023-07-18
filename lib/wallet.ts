import { Dispatch } from "react"
import { State, Action } from "../lib/types"
import { showAlert, AlertMessages } from "../helpers/alerts"

export const increaseWalletCapacity = (
  state: State,
  dispatch: Dispatch<Action>
) => {
  //error checks =====
  if (state.currentDay == 0) {
    showAlert(AlertMessages.NEED_START)
    return
  }
  if (state.cash < state.wallet.expansionCost) {
    alert("You do not have enough cash to expand your wallet")
    return
  }
  // =================
  dispatch({ type: "EXPAND_WALLET" })
  dispatch({
    type: "SET_LOG",
    payload: [
      `You have increased your wallet capacity to ${state.wallet.capacity}`,
      `Wallet Expansion cost has increased in price by 25% to ${state.wallet.expansionCost}`,
    ],
  })
}
