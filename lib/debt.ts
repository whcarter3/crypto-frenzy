import { Dispatch } from "react"
import { State } from "../lib/types"
import { showAlert, AlertMessages } from "../helpers/alerts"
import { numberWithCommas } from "../helpers/utils"

export const payDebt = (dispatch: Dispatch<any>, state: State) => {
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
    payload: `You have paid off your $${numberWithCommas(state.debt)} debt! 🙌`,
  })
  dispatch({ type: "PAY_DEBT" })
}
