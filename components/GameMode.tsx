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
    if (state.mode === "Easy") {
      dispatch({ type: "SET_EASY_MODE" })
    } else if (state.mode === "Hard") {
      dispatch({ type: "SET_HARD_MODE" })
    } else if (state.mode === "Test") {
      dispatch({ type: "SET_TEST_MODE" })
    }
    dispatch({ type: "TOGGLE_MODAL" })
  }
  return (
    <div className="w-screen h-screen bg-gray-800/60 z-10 absolute top-0 left-0 flex justify-center items-center">
      <div className="bg-slate-300 max-w-[600px] rounded-md p-6">
        <div className="text-gray-800">
          <h1 className="text-gray-800 mb-6 font-bold">🚀Crypto Frenzy🌙</h1>
          <p>
            Make as much money as you can before the days run out! But,
            don&apos;t forget about the money you borrowed, your debt will
            increase every day. You buy assets, hope the price rises, and sell
            at a profit. Diamond hands to the moon!
          </p>
          <p></p>
        </div>
        <div className="flex items-center justify-between mt-4 mb-2">
          <h4 className="text-gray-800" id="difficultyMode">
            Choose your difficulty: {state.mode}
          </h4>
          <div>
            <button
              className="px-3 py-1 bg-green-500 rounded-full mr-5 text-xl"
              onClick={() => dispatch({ type: "CHANGE_MODE", payload: "Easy" })}
              id="easyMode"
            >
              Easy
            </button>
            <button
              className="px-3 py-1 bg-amber-400 rounded-full mr-5 text-xl"
              onClick={() =>
                dispatch({ type: "CHANGE_MODE", payload: "Normal" })
              }
              id="normalMode"
            >
              Normal
            </button>
            <button
              className="px-3 py-1 bg-purple-500 rounded-full text-xl"
              onClick={() => dispatch({ type: "CHANGE_MODE", payload: "Hard" })}
              id="hardMode"
            >
              Hard
            </button>
            <button
              className="w-[1px] h-[1px] opacity-0"
              onClick={() => dispatch({ type: "CHANGE_MODE", payload: "Test" })}
              id="testMode"
            ></button>
          </div>
        </div>
        <button
          className="px-3 py-1 bg-red-400 rounded-full w-2/3 mt-5 text-3xl mx-auto block"
          onClick={handleStart}
          id="startGame"
        >
          Start Game!
        </button>
      </div>
    </div>
  )
}

export default GameMode
