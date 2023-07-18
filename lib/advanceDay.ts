import { Dispatch } from "react"
import { State, Action } from "../lib/types"
import { randomizePrices } from "../lib/prices"
import { numberWithCommas } from "../helpers/utils"
import { AlertMessages, showAlert } from "../helpers/alerts"

/**
 * Advances the game by one day, updating the state and dispatching actions accordingly.
 * @param {State} state - The current state of the application.
 * @param {Dispatch<Action>} dispatch - The dispatch function for updating the state.
 */

export const advanceDay = (state: State, dispatch: Dispatch<Action>) => {
  //warning before last day
  if (state.currentDay === state.days - 1) {
    showAlert(AlertMessages.LAST_DAY)
  }
  //end of game -- alert score -- set high score -- restart
  if (state.currentDay >= state.days) {
    alert(
      `This round has been completed. You amassed $${numberWithCommas(
        state.cash - state.debt
      )}! Try again to beat your high score! 🤑`
    )
    if (state.cash > state.highScore || state.highScore === null) {
      dispatch({ type: "SET_HIGH_SCORE", payload: state.cash })
    }
    dispatch({ type: "INIT" })
  } else {
    if (state.currentDay === 0) {
      //sets initial prices to randomized value from mid range
      dispatch({
        type: "SET_LOG",
        payload: [
          `======== Start of Game =========`,
          `You borrowed $${numberWithCommas(state.cash)} at ${
            state.interestRate * 100
          }% daily interest`,
          `You have ${state.days} days to make as much money as you can! 💎🙌`,
        ],
      })
      randomizePrices(state, dispatch)
    } else {
      dispatch({
        type: "SET_LOG",
        payload: [`========= End of Day ${state.currentDay} =========`],
      })

      randomizePrices(state, dispatch)

      dispatch({
        type: "INCREASE_DEBT",
      })
    }
    //increase day
    dispatch({ type: "ADVANCE_DAY" })
  }
}
