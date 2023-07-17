import { Dispatch } from "react"
import { State } from "../lib/types"
import { numberWithCommas } from "../helpers/utils"
import { showAlert, AlertMessages } from "../helpers/alerts"
import { buyAsset, sellAsset } from "../lib/buySell"

const Table = ({
  state,
  dispatch,
}: {
  state: State
  dispatch: Dispatch<any>
}) => {
  const handleSell = (e, state: State, dispatch: Dispatch<any>) => {
    if (state.currentDay === 0) {
      showAlert(AlertMessages.NEED_START)
      return
    }

    sellAsset(
      e.target.id,
      state.assets[e.target.id].price,
      state.assets[e.target.id].wallet,
      dispatch
    )
  }

  const handleBuy = (e, state: State, dispatch: Dispatch<any>) => {
    //error checks =====
    if (state.currentDay === 0) {
      showAlert(AlertMessages.NEED_START)
      return
    }
    if (state.wallet.amount >= state.wallet.capacity) {
      showAlert(AlertMessages.NEED_WALLET)
      return
    }

    buyAsset(e.target.id, state.assets[e.target.id].price, state, dispatch)
  }

  return (
    <div className="max-w-md">
      <table className="mt-5 w-full table-auto border-collapse">
        <thead>
          <tr>
            <th>Asset</th>
            <th>Price</th>
            <th>Action</th>
            <th>Wallet</th>
          </tr>
        </thead>
        <tbody className="bg-slate-800">
          {Object.keys(state.assets).map((asset) => {
            const name = state.assets[asset].name
            const symbol = state.assets[asset].symbol
            const price = state.assets[asset].price
            const wallet = state.assets[asset].wallet
            const walletCapacity = state.wallet.capacity
            const walletAmount = state.wallet.amount
            const cash = state.cash

            if (!state.assets[asset].active) return

            return (
              <tr key={asset}>
                <td>{symbol}</td>
                <td>${numberWithCommas(price)}</td>
                <td>
                  <button
                    className={`${
                      cash <= price ||
                      price === 0 ||
                      walletAmount === walletCapacity
                        ? "bg-slate-700 text-slate-500"
                        : "bg-blue-700"
                    } rounded-full  px-3 py-1 mr-4`}
                    onClick={(e) => handleBuy(e, state, dispatch)}
                    id={`${asset}`}
                    disabled={cash <= price || price === 0}
                  >
                    Buy
                  </button>
                  <button
                    className={`${
                      wallet === 0
                        ? "bg-slate-700 text-slate-500"
                        : "bg-green-500"
                    } rounded-full px-3 py-1`}
                    onClick={(e) => handleSell(e, state, dispatch)}
                    id={`${asset}`}
                    disabled={wallet === 0}
                  >
                    Sell
                  </button>
                </td>
                <td>{wallet}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default Table
