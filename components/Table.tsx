import { Dispatch } from 'react';
import { State, Action } from '../lib/types';
import { numberWithCommas } from '../helpers/utils';
import { showAlert, AlertMessages } from '../helpers/alerts';
import { buyAsset, sellAsset } from '../lib/buySell';

const Table = ({
  state,
  dispatch,
}: {
  state: State;
  dispatch: Dispatch<Action>;
}) => {
  const handleSell = (
    e,
    state: State,
    dispatch: Dispatch<Action>
  ) => {
    if (state.currentDay === 0) {
      showAlert(AlertMessages.NEED_START);
      return;
    }

    sellAsset(
      e.target.id,
      state.assets[e.target.id].price,
      state.assets[e.target.id].wallet,
      dispatch
    );
  };

  const handleBuy = (e, state: State, dispatch: Dispatch<Action>) => {
    if (state.currentDay === 0) {
      showAlert(AlertMessages.NEED_START);
      return;
    }
    if (state.wallet.amount >= state.wallet.capacity) {
      showAlert(AlertMessages.NEED_WALLET);
      return;
    }

    buyAsset(
      e.target.id,
      state.assets[e.target.id].price,
      state,
      dispatch
    );
  };

  const getPriceColor = (price: number, avgCost: number) => {
    if (avgCost === 0 || price === avgCost) return 'text-slate-300';
    return price > avgCost ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-700">
      <table className="w-full">
        <thead className="bg-slate-800">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
              Asset
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
              Price
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
              Action
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
              Avg. Price
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
              Wallet
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {Object.keys(state.assets).map((asset) => {
            const name = state.assets[asset].name;
            const symbol = state.assets[asset].symbol;
            const price = state.assets[asset].price;
            const avgCost = state.assets[asset].averageCost;
            const wallet = state.assets[asset].wallet;
            const walletCapacity = state.wallet.capacity;
            const walletAmount = state.wallet.amount;
            const cash = state.cash;

            if (!state.assets[asset].active) return;

            return (
              <tr
                key={asset}
                className="hover:bg-slate-800/50 transition-colors"
              >
                <td
                  className="px-4 py-3 text-sm text-slate-300"
                  data-cy="assetSymbol"
                >
                  {symbol}
                </td>
                <td
                  className={`px-4 py-3 text-sm font-medium ${getPriceColor(
                    price,
                    avgCost
                  )}`}
                  data-cy="assetPrice"
                >
                  ${numberWithCommas(price)}
                </td>
                <td
                  className="px-4 py-3 text-sm"
                  data-cy="assetActions"
                >
                  <div className="flex items-center gap-2">
                    <button
                      className={`btn ${
                        cash <= price ||
                        price === 0 ||
                        walletAmount === walletCapacity
                          ? 'btn-disabled'
                          : 'btn-primary'
                      }`}
                      onClick={(e) => handleBuy(e, state, dispatch)}
                      id={`${asset}`}
                      disabled={cash <= price || price === 0}
                      data-cy={`${asset}BuyButton`}
                    >
                      Buy
                    </button>
                    <button
                      className={`btn ${
                        wallet === 0 ? 'btn-disabled' : 'btn-success'
                      }`}
                      onClick={(e) => handleSell(e, state, dispatch)}
                      id={`${asset}`}
                      disabled={wallet === 0}
                      data-cy={`${asset}SellButton`}
                    >
                      Sell
                    </button>
                  </div>
                </td>
                <td
                  className="px-4 py-3 text-sm text-slate-300"
                  data-cy="assetAveragePrice"
                >
                  ${numberWithCommas(avgCost)}
                </td>
                <td
                  className="px-4 py-3 text-sm text-slate-300"
                  data-cy={`${asset}AssetWallet`}
                >
                  {wallet}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
