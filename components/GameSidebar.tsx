import { Dispatch } from 'react';
import { State, Action } from '../lib/types';
import { numberWithCommas } from '../helpers/utils';
import { increaseWalletCapacity } from '../lib/wallet';

const GameSidebar = ({
  state,
  dispatch,
}: {
  state: State;
  dispatch: Dispatch<Action>;
}) => {
  const getNetWorth = (): number => {
    const assetsValue = Object.values(state.assets).reduce(
      (total, asset) => {
        if (!asset.active) return total;
        return total + asset.price * asset.wallet;
      },
      0,
    );
    return assetsValue + state.cash - state.debt;
  };

  const netWorth = getNetWorth();
  const daysLeft = Math.max(0, state.days - state.currentDay);
  const hasHighScore = state.highScore != null && state.highScore > 0;

  const holdings = Object.entries(state.assets).filter(
    ([_, a]) => a.active && a.wallet > 0,
  );
  const canExpandWallet =
    state.currentDay > 0 && state.cash >= state.wallet.expansionCost;

  return (
    <aside className="w-full flex flex-col gap-3">
      {/* Contract / objective panel */}
      <div className="panel-crt rounded-lg p-3">
        <p className="text-xs text-white/90 font-semibold mb-1.5 tracking-wide">
          THE RUN
        </p>
        <p className="text-xs text-white/80 mb-2">
          Clear debt and beat the clock.
        </p>
        <p className="text-xs text-white/80 mb-1">Score at least</p>
        {hasHighScore ? (
          <>
            <p className="text-lg font-bold text-crt-red">
              ${numberWithCommas(state.highScore!)}
            </p>
            <p className="text-xs text-white/70">
              to beat your record
            </p>
          </>
        ) : (
          <>
            <p className="text-lg font-bold text-crt-cyan">—</p>
            <p className="text-xs text-white/70">
              set a record this run
            </p>
          </>
        )}
      </div>

      {/* Round / day panel */}
      <div className="panel-crt rounded-lg p-3">
        <p className="text-3xl font-bold text-crt-cyan">{daysLeft}</p>
        <p className="text-sm text-white/70 mt-1">days left</p>
      </div>

      {/* Net worth */}
      <div className="panel-crt rounded-lg p-3">
        <div className="flex items-baseline gap-2">
          <span
            className={`text-3xl font-bold ${
              netWorth >= 0 ? 'text-crt-cyan' : 'text-crt-red'
            }`}
          >
            ${numberWithCommas(netWorth)}
          </span>
        </div>
        <p className="text-sm text-white/90 font-semibold mt-1 tracking-wide">
          NET WORTH
        </p>
      </div>

      {/* Holdings + Wallet capacity */}
      <div className="panel-crt rounded-lg p-3 space-y-3">
        <p className="text-xs text-white/90 font-semibold tracking-wide">
          HOLDINGS
        </p>
        <div className="overflow-x-auto max-h-36 overflow-y-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-1 pr-2 font-semibold text-crt-cyan uppercase tracking-wider">
                  Asset
                </th>
                <th className="text-left py-1 pr-2 font-semibold text-white/80 uppercase tracking-wider">
                  Avg Cost
                </th>
                <th className="text-left py-1 pr-2 font-semibold text-white/80 uppercase tracking-wider">
                  %
                </th>
                <th className="text-right py-1 font-semibold text-white/80 uppercase tracking-wider">
                  #
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {holdings.length > 0 ? (
                holdings.map(([key, asset]) => {
                  const pct =
                    asset.averageCost > 0
                      ? ((asset.price - asset.averageCost) /
                          asset.averageCost) *
                        100
                      : 0;
                  return (
                    <tr key={key} className="text-white/90 text-sm">
                      <td className="py-1 pr-2 font-medium text-crt-cyan">
                        {asset.symbol}
                      </td>
                      <td className="py-1 pr-2">
                        ${numberWithCommas(asset.averageCost)}
                      </td>
                      <td
                        className={`py-1 pr-2 ${
                          pct >= 0 ? 'text-crt-green' : 'text-crt-red'
                        }`}
                      >
                        {pct >= 0 ? '+' : ''}
                        {pct.toFixed(1)}%
                      </td>
                      <td className="py-1 text-right">
                        {asset.wallet}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="py-5 text-center text-crt-cyan text-sm"
                  >
                    No current holdings
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-white/10 pt-3 space-y-2">
          <div className="flex flex-col justify-end items-end">
            <p className="text-sm font-bold text-crt-cyan">
              Wallet: {state.wallet.amount} / {state.wallet.capacity}
            </p>
          </div>
          <button
            type="button"
            className={`btn w-full py-2 text-xs ${
              canExpandWallet ? 'btn-success' : 'btn-disabled'
            }`}
            onClick={() => increaseWalletCapacity(state, dispatch)}
            disabled={!canExpandWallet}
            id="expandWallet"
          >
            +{state.wallet.increase} slots — $
            {numberWithCommas(state.wallet.expansionCost)}
          </button>
        </div>
      </div>

      {/* Bottom: Run Info / Options + stat chips */}
      <div className="mt-auto flex gap-2">
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => dispatch({ type: 'TOGGLE_MODAL' })}
            className="btn-run w-full py-2 px-3 text-xs font-semibold"
            id="runInfo"
          >
            RUN INFO
          </button>
          <button
            type="button"
            className="btn-run w-full py-2 px-3 text-xs font-semibold opacity-70"
            disabled
            title="Coming soon"
          >
            OPTIONS
          </button>
        </div>

        <div className="flex-1 grid grid-cols-1 gap-1.5 content-start">
          <div className="chip-crt rounded p-2">
            <p className="text-[10px] text-white/70 uppercase tracking-wider">
              Debt
            </p>
            <p
              className="text-sm font-bold text-crt-red"
              data-cy="debt"
            >
              ${numberWithCommas(state.debt)}
            </p>
          </div>
          <div className="chip-crt rounded p-2">
            <p className="text-[10px] text-white/70 uppercase tracking-wider">
              Cash
            </p>
            <p
              className="text-base font-bold text-crt-yellow"
              data-cy="cash"
            >
              ${numberWithCommas(state.cash)}
            </p>
          </div>
          <div className="chip-crt rounded p-2">
            <p className="text-[10px] text-white/70 uppercase tracking-wider">
              Wallet
            </p>
            <p
              className="text-sm font-bold text-crt-cyan"
              data-cy="wallet"
            >
              {state.wallet.amount}/{state.wallet.capacity}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default GameSidebar;
