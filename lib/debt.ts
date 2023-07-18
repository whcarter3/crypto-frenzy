import { Dispatch } from "react"
import { State, Action } from "../lib/types"
import { showAlert, AlertMessages } from "../helpers/alerts"
import { numberWithCommas } from "../helpers/utils"

/**
 * Pays off the player's debt and updates the game state.
 * @param {Dispatch<Action>} dispatch - The dispatch function for updating the game state.
 * @param {State} state - The current game state.
 */
export const payDebt = (dispatch: Dispatch<Action>, state: State) => {
  //error checks =====
  if (state.currentDay == 0) {
    showAlert(AlertMessages.NEED_START)
    return
  }
  if (state.debt === 0) {
    showAlert(AlertMessages.NEED_DEBT)
    return
  }
  if (state.cash < state.debt) {
    showAlert(AlertMessages.NEED_DEBT_CASH)
    return
  }
  // =================
  dispatch({
    type: "SET_LOG",
    payload: [
      `You have paid off your $${numberWithCommas(state.debt)} debt! 🙌`,
    ],
  })
  dispatch({ type: "PAY_DEBT" })
}
