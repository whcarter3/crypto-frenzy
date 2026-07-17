import { Dispatch } from 'react';
import { State, Action } from '../lib/types';
import { calculateMaxShares, numberWithCommas } from '../helpers/utils';
import { useMediaQuery } from '../helpers/useMediaQuery';
import { cn } from '../lib/cn';
import { playSound } from '../lib/sound';
import TradeStepper from './TradeStepper';

const AssetTable = ({
  state,
  dispatch,
}: {
  state: State;
  dispatch: Dispatch<Action>;
}) => {
  // Cards on phones, table on desktop — rendered conditionally (not CSS
  // hidden/block) so controls and their test ids exist exactly once.
  const isDesktop = useMediaQuery('(min-width: 640px)');

  const handleBuy = (assetKey: string, quantity: number) => {
    dispatch({
      type: 'BUY_ASSET',
      payload: { assetKey, amount: quantity },
    });
    playSound('buy');
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

  const activeKeys = Object.keys(state.assets).filter(
    (key) => state.assets[key].active,
  );

  // Max executable quantity + a touch-visible reason when it's zero —
  // hover-only titles explained nothing on phones.
  const getBuyInfo = (assetKey: string) => {
    const asset = state.assets[assetKey];
    const maxShares =
      asset.price > 0
        ? calculateMaxShares(
            asset.price,
            state.wallet.amount,
            state.wallet.capacity,
            state.cash,
          )
        : 0;
    const disabledReason =
      state.wallet.amount >= state.wallet.capacity
        ? 'Wallet full — upgrade capacity'
        : state.cash < asset.price
          ? `Need $${numberWithCommas(asset.price)} cash`
          : undefined;
    return { maxShares, disabled: maxShares <= 0, disabledReason };
  };

  const stepperFor = (assetKey: string) => {
    const asset = state.assets[assetKey];
    const { maxShares, disabled, disabledReason } =
      getBuyInfo(assetKey);
    return (
      <TradeStepper
        assetName={asset.name}
        max={maxShares}
        maxLabel="Max"
        actionLabel="Buy"
        actionCy={`${assetKey}BuyButton`}
        cyPrefix={assetKey}
        onAction={(quantity) => handleBuy(assetKey, quantity)}
        disabled={disabled}
        disabledReason={disabledReason}
      />
    );
  };

  if (!isDesktop) {
    return (
      <div className="space-y-3">
        {activeKeys.map((assetKey) => {
          const asset = state.assets[assetKey];
          return (
            <div
              key={assetKey}
              className="panel-crt rounded-lg p-3 space-y-2"
              data-cy={`${assetKey}Card`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className="flex items-center gap-2 font-medium text-white/90"
                  data-cy="assetSymbol"
                >
                  {asset.symbol}
                  {asset.wallet > 0 && (
                    <span className="px-1.5 py-0.5 text-xs bg-crt-green/20 text-crt-green rounded border border-crt-green/40">
                      Holding
                    </span>
                  )}
                </span>
                <span
                  className="flex items-center text-sm font-medium text-white/90"
                  data-cy="assetPrice"
                >
                  <span>${numberWithCommas(asset.price)}</span>
                  {getDayDelta(assetKey, asset.price, asset.previousPrice)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-white/60 uppercase tracking-wider">
                <span data-cy="assetAveragePrice">
                  Avg{' '}
                  {asset.wallet > 0
                    ? `$${numberWithCommas(asset.averageCost)}`
                    : '—'}
                </span>
                <span>
                  Wallet{' '}
                  <span
                    className="text-crt-cyan"
                    data-cy={`${assetKey}AssetWallet`}
                  >
                    {asset.wallet}
                  </span>
                </span>
              </div>
              {stepperFor(assetKey)}
            </div>
          );
        })}
      </div>
    );
  }

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
          {activeKeys.map((assetKey) => {
            const asset = state.assets[assetKey];
            return (
              <tr
                key={assetKey}
                className="hover:bg-white/5 transition-colors"
              >
                <td
                  className="w-28 min-w-28 max-w-28 px-4 py-3 text-sm text-white/90"
                  data-cy="assetSymbol"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-medium shrink-0">
                      {asset.symbol}
                    </span>
                    {asset.wallet > 0 && (
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
                    <span>${numberWithCommas(asset.price)}</span>
                    {getDayDelta(assetKey, asset.price, asset.previousPrice)}
                  </div>
                </td>
                <td
                  className="px-4 py-3 text-sm text-white/80"
                  data-cy="assetAveragePrice"
                >
                  {asset.wallet > 0
                    ? `$${numberWithCommas(asset.averageCost)}`
                    : '—'}
                </td>
                <td
                  className="px-4 py-3 text-sm text-crt-cyan font-medium"
                  data-cy={`${assetKey}AssetWallet`}
                >
                  {asset.wallet}
                </td>
                <td className="px-4 py-3 text-sm" data-cy="assetActions">
                  {stepperFor(assetKey)}
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
