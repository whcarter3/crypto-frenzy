import { Dispatch } from "react"
import { State, Action } from "../lib/types"
import { numberWithCommas } from "../helpers/utils"

/**
 * Pays off the player's debt and updates the game state.
 * @param {Dispatch<Action>} dispatch - The dispatch function for updating the game state.
 * @param {State} state - The current game state.
 */
export const payDebt = (dispatch: Dispatch<Action>, state: State) => {
  if (state.currentDay === 0) return
  if (state.debt === 0) return
  if (state.cash < state.debt) return

  dispatch({
    type: "SET_LOG",
    payload: [
      `You have paid off your $${numberWithCommas(state.debt)} debt! 🙌`,
    ],
  })
  dispatch({ type: "PAY_DEBT" })
}
