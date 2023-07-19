import { Dispatch } from "react"
import { Action, State } from "../lib/types"
import { advanceDay } from "../lib/advanceDay"

const GameMode = ({
  dispatch,
  state,
}: {
  dispatch: Dispatch<Action>
  state: State
}) => {
  const handleStart = () => {
    advanceDay(state, dispatch)
    dispatch({ type: "INIT" })
    if (state.mode === "easy") {
      dispatch({ type: "SET_EASY_MODE" })
    } else {
      dispatch({ type: "SET_HARD_MODE" })
    }
    dispatch({ type: "TOGGLE_MODAL" })
  }
  return (
    <div className="w-screen h-screen bg-gray-800/60 z-10 absolute top-0 left-0 flex justify-center items-center">
      <div className="bg-slate-100 w-1/2 h-1/2 rounded-md">
        <h1 className="text-gray-800">Selected game mode: {state.mode}</h1>
        <div className="flex justify-center items-center">
          <button
            className="px-3 py-1 bg-green-400 rounded-full mr-5"
            onClick={() => dispatch({ type: "CHANGE_MODE", payload: "easy" })}
          >
            Easy
          </button>
          <button
            className="px-3 py-1 bg-amber-400 rounded-full mr-5"
            onClick={() => dispatch({ type: "CHANGE_MODE", payload: "normal" })}
          >
            Normal
          </button>
          <button
            className="px-3 py-1 bg-purple-500 rounded-full mr-5"
            onClick={() => dispatch({ type: "CHANGE_MODE", payload: "hard" })}
          >
            Hard
          </button>
        </div>
        <button
          className="px-3 py-1 bg-red-400 rounded-full"
          onClick={handleStart}
        >
          Start Game!
        </button>
      </div>
    </div>
  )
}

export default GameMode
