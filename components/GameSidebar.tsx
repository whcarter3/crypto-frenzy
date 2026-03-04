import { Dispatch } from 'react';
import { State, Action } from '../lib/types';
import { numberWithCommas } from '../helpers/utils';

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
            <p className="text-xs text-white/70">to beat your record</p>
          </>
        ) : (
          <>
            <p className="text-lg font-bold text-crt-cyan">—</p>
            <p className="text-xs text-white/70">set a record this run</p>
          </>
        )}
      </div>

      {/* Round / day panel */}
      <div className="panel-crt rounded-lg p-3">
        <p className="text-xs text-white/90 font-semibold mb-1 tracking-wide">
          ROUND
        </p>
        <p className="text-2xl font-bold text-crt-cyan">
          {state.currentDay}<span className="text-white/70">/{state.days}</span>
        </p>
        <p className="text-xs text-white/70 mt-1">{daysLeft} days left</p>
      </div>

      {/* Net worth / current hand equivalent */}
      <div className="panel-crt rounded-lg p-3">
        <p className="text-xs text-white/90 font-semibold mb-1 tracking-wide">
          NET WORTH
        </p>
        <div className="flex items-baseline gap-2">
          <span
            className={`text-xl font-bold ${
              netWorth >= 0 ? 'text-crt-cyan' : 'text-crt-red'
            }`}
          >
            ${numberWithCommas(netWorth)}
          </span>
        </div>
        <p className="text-xs text-white/70 mt-1">
          {state.mode} • {state.mode === 'Easy' ? '10%' : state.mode === 'Normal' ? '20%' : '30%'} interest
        </p>
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

        <div className="flex-1 grid grid-cols-2 gap-1.5 content-start">
          <div className="chip-crt rounded p-2">
            <p className="text-[10px] text-white/70 uppercase tracking-wider">Day</p>
            <p className="text-sm font-bold text-crt-cyan" data-cy="day">
              {state.currentDay}/{state.days}
            </p>
          </div>
          <div className="chip-crt rounded p-2">
            <p className="text-[10px] text-white/70 uppercase tracking-wider">Debt</p>
            <p className="text-sm font-bold text-crt-red" data-cy="debt">
              ${numberWithCommas(state.debt)}
            </p>
          </div>
          <div className="chip-crt rounded p-2 col-span-2">
            <p className="text-[10px] text-white/70 uppercase tracking-wider">Money</p>
            <p className="text-base font-bold text-crt-yellow" data-cy="cash">
              ${numberWithCommas(state.cash)}
            </p>
          </div>
          <div className="chip-crt rounded p-2">
            <p className="text-[10px] text-white/70 uppercase tracking-wider">Wallet</p>
            <p className="text-sm font-bold text-crt-cyan" data-cy="wallet">
              {state.wallet.amount}/{state.wallet.capacity}
            </p>
          </div>
          <div className="chip-crt rounded p-2">
            <p className="text-[10px] text-white/70 uppercase tracking-wider">Mode</p>
            <p className="text-sm font-bold text-white/90">{state.mode}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default GameSidebar;
