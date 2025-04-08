import { Dispatch } from 'react';
import { State, Action } from '../lib/types';
import { numberWithCommas } from '../helpers/utils';
import { AlertMessages, getAlertType } from '../helpers/alerts';
import { buyAsset, sellAsset } from '../lib/buySell';
import { useNotification } from '../lib/NotificationContext';

const Table = ({
  state,
  dispatch,
}: {
  state: State;
  dispatch: Dispatch<Action>;
}) => {
  const { showNotification } = useNotification();

  const handleSell = (
    e,
    state: State,
    dispatch: Dispatch<Action>
  ) => {
    if (state.currentDay === 0) {
      showNotification(
        AlertMessages.NEED_START,
        getAlertType(AlertMessages.NEED_START)
      );
      return;
    }

    if (state.assets[e.target.id].wallet === 0) {
      showNotification(
        AlertMessages.INSUFFICIENT_ASSETS,
        getAlertType(AlertMessages.INSUFFICIENT_ASSETS)
      );
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
      showNotification(
        AlertMessages.NEED_START,
        getAlertType(AlertMessages.NEED_START)
      );
      return;
    }
    if (state.wallet.amount >= state.wallet.capacity) {
      showNotification(
        AlertMessages.NEED_WALLET,
        getAlertType(AlertMessages.NEED_WALLET)
      );
      return;
    }
    if (state.cash < state.assets[e.target.id].price) {
      showNotification(
        AlertMessages.INSUFFICIENT_FUNDS,
        getAlertType(AlertMessages.INSUFFICIENT_FUNDS)
      );
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

  const getPerformanceIndicator = (
    price: number,
    avgCost: number
  ) => {
    if (avgCost === 0 || price === avgCost) return null;
    const percentChange = ((price - avgCost) / avgCost) * 100;
    const isProfit = price > avgCost;
    return (
      <span
        className={`ml-2 text-xs ${
          isProfit ? 'text-green-400' : 'text-red-400'
        }`}
      >
        {isProfit ? '↑' : '↓'} {Math.abs(percentChange).toFixed(1)}%
      </span>
    );
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

            const canBuy = !(
              cash <= price ||
              price === 0 ||
              walletAmount === walletCapacity
            );
            const canSell = wallet > 0;

            return (
              <tr
                key={asset}
                className="hover:bg-slate-800/50 transition-colors"
              >
                <td
                  className="px-4 py-3 text-sm text-slate-300"
                  data-cy="assetSymbol"
                >
                  <div className="flex items-center">
                    <span className="font-medium">{symbol}</span>
                    {wallet > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 text-xs bg-slate-700 text-slate-300 rounded">
                        Holding
                      </span>
                    )}
                  </div>
                </td>
                <td
                  className={`px-4 py-3 text-sm font-medium ${getPriceColor(
                    price,
                    avgCost
                  )}`}
                  data-cy="assetPrice"
                  title={
                    avgCost > 0
                      ? `Performance vs Avg. Cost: ${(
                          ((price - avgCost) / avgCost) *
                          100
                        ).toFixed(1)}%`
                      : ''
                  }
                >
                  <div className="flex items-center">
                    <span>${numberWithCommas(price)}</span>
                    {getPerformanceIndicator(price, avgCost)}
                  </div>
                </td>
                <td
                  className="px-4 py-3 text-sm"
                  data-cy="assetActions"
                >
                  <div className="flex items-center gap-2">
                    <button
                      className={`btn ${
                        canBuy ? 'btn-primary' : 'btn-disabled'
                      }`}
                      onClick={(e) => handleBuy(e, state, dispatch)}
                      id={`${asset}`}
                      disabled={!canBuy}
                      data-cy={`${asset}BuyButton`}
                      title={
                        !canBuy
                          ? 'Not enough cash or wallet capacity'
                          : 'Buy this asset'
                      }
                    >
                      Buy
                    </button>
                    <button
                      className={`btn ${
                        canSell ? 'btn-success' : 'btn-disabled'
                      }`}
                      onClick={(e) => handleSell(e, state, dispatch)}
                      id={`${asset}`}
                      disabled={!canSell}
                      data-cy={`${asset}SellButton`}
                      title={
                        !canSell
                          ? 'No assets to sell'
                          : 'Sell this asset'
                      }
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
