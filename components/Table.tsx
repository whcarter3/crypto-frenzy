import { Dispatch } from "react"
import { State } from "../lib/types"
import config from "../config/config"
import { numberWithCommas } from "../helpers/utils"
import { handleBuy, handleSell } from "../lib/buySell"

const Table = ({
  state,
  dispatch,
}: {
  state: State
  dispatch: Dispatch<any>
}) => {
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
          {Object.keys(config.assets).map((asset) => {
            let price
            let wallet
            switch (asset) {
              case "bitcoin":
                price = state.bitcoinPrice
                wallet = state.bitcoinWallet
                break
              case "ethereum":
                price = state.ethereumPrice
                wallet = state.ethereumWallet
                break
              case "litecoin":
                price = state.litecoinPrice
                wallet = state.litecoinWallet
                break
              case "solana":
                price = state.solanaPrice
                wallet = state.solanaWallet
                break
              default:
                return
            }
            return (
              <tr key={asset}>
                <td>{config.assets[asset].assetName}</td>
                <td>${numberWithCommas(price)}</td>
                <td>
                  <button
                    className={`${
                      state.cash <= price ||
                      price === 0 ||
                      state.walletAmount === state.walletCapacity
                        ? "bg-slate-700 text-slate-500"
                        : "bg-blue-700"
                    } rounded-full  px-3 py-1 mr-4`}
                    onClick={(e) => handleBuy(e, state, dispatch)}
                    id={`${asset}Buy`}
                    disabled={state.cash <= price || price === 0}
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
                    id={`${asset}Sell`}
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
