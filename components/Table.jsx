import config from "../config/config"
import { numberWithCommas } from "../helpers/utils"

const Table = ({
  bitcoinPrice,
  bitcoinWallet,
  ethereumPrice,
  ethereumWallet,
  litecoinPrice,
  litecoinWallet,
  solanaPrice,
  solanaWallet,
  handleBuy,
  handleSell,
  cash,
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
                price = bitcoinPrice
                wallet = bitcoinWallet
                break
              case "ethereum":
                price = ethereumPrice
                wallet = ethereumWallet
                break
              case "litecoin":
                price = litecoinPrice
                wallet = litecoinWallet
                break
              case "solana":
                price = solanaPrice
                wallet = solanaWallet
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
                      cash <= price || price === 0
                        ? "bg-slate-700 text-slate-500"
                        : "bg-blue-700"
                    } rounded-full  px-3 py-1 mr-4`}
                    onClick={handleBuy}
                    id={`${asset}Buy`}
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
                    onClick={handleSell}
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
