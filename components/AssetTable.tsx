import { State } from '../lib/types';
import { numberWithCommas } from '../helpers/utils';
import { cn } from '../lib/cn';

/**
 * The market: a slim, scannable table at every viewport (owner call,
 * 2026-07-17 — "the asset table makes more sense to see everything
 * together"). Rows are tap targets that open the TradeModal; moving
 * the trade controls out of the table is what lets it fit a phone
 * without horizontal scroll.
 */
const AssetTable = ({
  state,
  onSelectAsset,
}: {
  state: State;
  onSelectAsset: (assetKey: string) => void;
}) => {
  // Day-over-day movement — the market's motion was previously
  // invisible (a 60% crash produced zero on-screen change unless you
  // held the coin). Position performance vs. your avg cost lives in
  // the holdings panel and the trade modal.
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
          'text-xs sm:ml-2',
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

  return (
    <div
      className="overflow-x-auto panel-crt rounded-lg"
      data-cy="marketTable"
    >
      {/* px-2 below sm: five columns × px-3 alone overflow a 375px
          phone, and this table scrolling sideways is the exact
          complaint that killed the previous layout */}
      <table className="w-full">
        <thead className="bg-white/5">
          <tr className="border-b border-white/20">
            <th className="px-2 sm:px-3 py-3 text-left text-xs font-semibold text-crt-cyan uppercase tracking-wider">
              Asset
            </th>
            <th className="px-2 sm:px-3 py-3 text-left text-xs font-semibold text-crt-cyan uppercase tracking-wider">
              Price
            </th>
            {/* No AVG column (owner call, 2026-07-17): your cost basis
                lives in the holdings panel and the trade modal — the
                market table is about the market */}
            {/* HELD, not WALLET: "wallet" is the capacity container;
                this column is what you hold (copy review terminology) */}
            <th className="px-2 sm:px-3 py-3 text-right text-xs font-semibold text-crt-cyan uppercase tracking-wider">
              Held
            </th>
            {/* chevron affordance column */}
            <th className="w-6 sm:w-8 px-1 sm:px-3 py-3" aria-hidden="true"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {activeKeys.map((assetKey) => {
            const asset = state.assets[assetKey];
            return (
              <tr
                key={assetKey}
                role="button"
                tabIndex={0}
                aria-label={`Trade ${asset.name}`}
                onClick={() => onSelectAsset(assetKey)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectAsset(assetKey);
                  }
                }}
                className="cursor-pointer hover:bg-white/5 focus-visible:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-crt-cyan transition-colors"
                data-cy={`${assetKey}Row`}
              >
                <td
                  className="px-2 sm:px-3 py-3 text-sm text-white/90"
                  data-cy="assetSymbol"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-medium shrink-0">
                      {asset.symbol}
                    </span>
                    {asset.wallet > 0 && (
                      <>
                        <span
                          className="sm:hidden text-crt-green text-xs"
                          title="Holding"
                          aria-hidden="true"
                        >
                          ●
                        </span>
                        <span className="hidden sm:inline-flex shrink-0 px-1.5 py-0.5 text-xs bg-crt-green/20 text-crt-green rounded border border-crt-green/40">
                          Holding
                        </span>
                      </>
                    )}
                  </div>
                </td>
                <td
                  className="px-2 sm:px-3 py-3 text-sm font-medium text-white/90"
                  data-cy="assetPrice"
                >
                  {/* delta stacks under the price below sm — inline it
                      adds ~50px to the widest column on a phone */}
                  <div className="flex flex-col items-start sm:flex-row sm:items-center whitespace-nowrap">
                    <span>${numberWithCommas(asset.price)}</span>
                    {getDayDelta(
                      assetKey,
                      asset.price,
                      asset.previousPrice,
                    )}
                  </div>
                </td>
                <td
                  className="px-2 sm:px-3 py-3 text-sm text-right text-crt-cyan font-medium"
                  data-cy={`${assetKey}AssetWallet`}
                >
                  {asset.wallet}
                </td>
                <td
                  className="w-6 sm:w-8 px-1 sm:px-3 py-3 text-crt-cyan/60 text-right"
                  aria-hidden="true"
                >
                  ›
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
