import config from "../config/config"
import { numberWithCommas } from "../helpers/utils"

const Actions = ({
  increaseWalletCapacity,
  walletExpansionCost,
  debt,
  advanceDay,
  init,
  currentDay,
  payDebt,
  cash,
}) => {
  const canPayDebt = cash <= debt || debt === 0
  const cashLessThanWalletExpansionCost = cash <= walletExpansionCost
  return (
    <>
      <div className="mt-5 flex flex-col max-w-xs">
        <div className="flex w-full items-center">
          <button
            className={`${
              cashLessThanWalletExpansionCost
                ? "bg-slate-700 text-slate-500"
                : "bg-green-500"
            } px-3 py-1 mr-5 rounded-full`}
            onClick={increaseWalletCapacity}
          >
            Buy
          </button>
          <p
            className={`${cashLessThanWalletExpansionCost && "text-slate-500"}`}
          >
            Wallet Capacity +{config.wallet.increase}: $
            {numberWithCommas(walletExpansionCost)}
          </p>
        </div>
        <div className="flex w-full items-center mt-3">
          <button
            className={`${
              canPayDebt ? "bg-slate-700 text-slate-500" : "bg-green-500"
            } px-3 py-1 mr-5 rounded-full`}
            onClick={payDebt}
            disabled={canPayDebt}
          >
            Pay
          </button>
          <p className={canPayDebt ? "text-slate-500" : ""}>
            Pay debt: ${numberWithCommas(debt)}
          </p>
        </div>
      </div>
      <button
        className="bg-blue-700 px-6 py-4 rounded-full mt-8 mr-5"
        id="advDay"
        onClick={advanceDay}
      >
        {currentDay === config.days ? "Finish Round" : "Advance Day"}
      </button>
      <button className="bg-red-700 px-6 py-4 rounded-full" onClick={init}>
        New Game
      </button>
    </>
  )
}

export default Actions
