import config from "../config/config"
import { numberWithCommas } from "../helpers/utils"
import { payDebt } from "../lib/game"

const Actions = ({
  increaseWalletCapacity,
  walletExpansionCost,
  debt,
  advanceDay,
  init,
  currentDay,
  cash,
  setLog,
  setDebt,
  setCash,
}) => {
  return (
    <>
      <div className="mt-5 flex flex-col max-w-xs">
        <div className="flex w-full items-center">
          <button
            className="bg-green-500 px-3 py-1 mr-5 rounded-full"
            onClick={increaseWalletCapacity}
          >
            Buy
          </button>
          <p>
            Wallet Size (+{config.wallet.increase}): $
            {numberWithCommas(walletExpansionCost)}
          </p>
        </div>
        <div className="flex w-full items-center mt-3">
          <button
            className="bg-green-500 px-3 py-1 mr-5 rounded-full"
            onClick={() =>
              payDebt(currentDay, setLog, debt, setDebt, cash, setCash)
            }
          >
            Pay
          </button>
          <p>Pay debt: ${numberWithCommas(debt)}</p>
        </div>
      </div>

      <button
        className="bg-blue-700 px-6 py-4 rounded-full mt-8 mr-5"
        id="advDay"
        onClick={advanceDay}
      >
        {currentDay === config.days - 1 ? "End Round" : "Advance Day"}
      </button>
      <button className="bg-red-700 px-6 py-4 rounded-full" onClick={init}>
        New Game
      </button>
    </>
  )
}

export default Actions