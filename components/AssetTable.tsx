import { Dispatch, useState } from 'react';
import { State, Action } from '../lib/types';
import { numberWithCommas } from '../helpers/utils';
import { cn } from '../lib/cn';
import { playSound } from '../lib/sound';

const AssetTable = ({
  state,
  dispatch,
}: {
  state: State;
  dispatch: Dispatch<Action>;
}) => {
  // Per-asset buy amount; empty string means "max affordable"
  const [amounts, setAmounts] = useState<Record<string, string>>({});

  const setAmount = (assetKey: string, value: string) =>
    setAmounts((prev) => ({ ...prev, [assetKey]: value }));

  const handleBuy = (assetKey: string) => {
    const parsed = parseInt(amounts[assetKey], 10);
    dispatch({
      type: 'BUY_ASSET',
      payload: {
        assetKey,
        amount: Number.isFinite(parsed) && parsed > 0 ? parsed : undefined,
      },
    });
    playSound('buy');
    setAmount(assetKey, '');
  };

  // Day-over-day movement — the market's motion was previously
  // invisible (a 60% crash produced zero on-screen change unless you
  // held the coin). Position performance vs. your avg cost still lives
  // in the holdings panel.
  const getDayDelta = (
    assetKey: string,
    price: number,
    previousPrice: number,
  ) => {
    if (!previousPrice || previousPrice <= 0) return null;
    const percentChange =
      ((price - previousPrice) / previousPrice) * 100;
    if (Math.abs(percentChange) < 0.05) return null;
    const isUp = price > previousPrice;
    return (
      <span
        className={cn(
          'ml-2 text-xs',
          isUp && 'text-crt-green',
          !isUp && 'text-crt-red',
        )}
        data-cy={`${assetKey}DayDelta`}
        title="Change vs yesterday"
      >
        {isUp ? '▲' : '▼'} {Math.abs(percentChange).toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="overflow-x-auto panel-crt rounded-lg">
      <table className="w-full">
        <thead className="bg-white/5">
          <tr className="border-b border-white/20">
            <th className="w-28 min-w-28 max-w-28 px-4 py-3 text-left text-xs font-semibold text-crt-cyan uppercase tracking-wider">
              Asset
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-crt-cyan uppercase tracking-wider">
              Price
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-crt-cyan uppercase tracking-wider">
              Avg. Price
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-crt-cyan uppercase tracking-wider">
              Wallet
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-crt-cyan uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
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

            return (
              <tr
                key={asset}
                className="hover:bg-white/5 transition-colors"
              >
                <td
                  className="w-28 min-w-28 max-w-28 px-4 py-3 text-sm text-white/90"
                  data-cy="assetSymbol"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-medium shrink-0">
                      {symbol}
                    </span>
                    {wallet > 0 && (
                      <span className="shrink-0 px-1.5 py-0.5 text-xs bg-crt-green/20 text-crt-green rounded border border-crt-green/40">
                        Holding
                      </span>
                    )}
                  </div>
                </td>
                <td
                  className="px-4 py-3 text-sm font-medium text-white/90"
                  data-cy="assetPrice"
                >
                  <div className="flex items-center">
                    <span>${numberWithCommas(price)}</span>
                    {getDayDelta(
                      asset,
                      price,
                      state.assets[asset].previousPrice,
                    )}
                  </div>
                </td>
                <td
                  className="px-4 py-3 text-sm text-white/80"
                  data-cy="assetAveragePrice"
                >
                  {wallet > 0 ? `$${numberWithCommas(avgCost)}` : '—'}
                </td>
                <td
                  className="px-4 py-3 text-sm text-crt-cyan font-medium"
                  data-cy={`${asset}AssetWallet`}
                >
                  {wallet}
                </td>
                <td
                  className="px-4 py-3 text-sm"
                  data-cy="assetActions"
                >
                  <div className="flex items-center gap-2 justify-end">
                    <input
                      type="number"
                      min={1}
                      value={amounts[asset] ?? ''}
                      onChange={(e) => setAmount(asset, e.target.value)}
                      placeholder="max"
                      disabled={!canBuy}
                      className="w-16 bg-black/40 border border-white/20 rounded px-2 py-1 text-sm text-white/90 placeholder:text-white/40 disabled:opacity-40"
                      data-cy={`${asset}AmountInput`}
                      title="How many to buy — leave empty to buy the max"
                      aria-label={`Amount of ${name} to buy — leave empty to buy the max`}
                    />
                    <button
                      className={cn(
                        'btn',
                        canBuy && 'btn-primary',
                        !canBuy && 'btn-disabled',
                      )}
                      onClick={() => handleBuy(asset)}
                      id={`${asset}`}
                      disabled={!canBuy}
                      data-cy={`${asset}BuyButton`}
                      title={
                        !canBuy
                          ? 'Not enough cash or wallet capacity'
                          : 'Buy this asset'
                      }
                      aria-label={`Buy ${name}`}
                    >
                      Buy
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AssetTable;
