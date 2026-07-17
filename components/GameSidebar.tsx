import { Dispatch, useRef, useState } from 'react';
import { State, Action } from '../lib/types';
import {
  computeNetWorth,
  formatMoney,
  numberWithCommas,
  seedShareUrl,
} from '../helpers/utils';
import { cn } from '../lib/cn';
import { clearSave } from '../lib/state/persistence';
import { loadHighScore } from '../lib/state/highScores';
import { useNotification } from '../lib/NotificationContext';
import Chip from './Chip';

const GameSidebar = ({
  state,
  dispatch,
  onOpenSettings,
  onOpenHelp,
  onSelectAsset,
}: {
  state: State;
  dispatch: Dispatch<Action>;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onSelectAsset: (assetKey: string) => void;
}) => {
  const { showNotification } = useNotification();

  // NEW GAME wipes the run — require a second tap within 3s to confirm
  const [confirmingReset, setConfirmingReset] = useState(false);
  const confirmTimer = useRef<ReturnType<typeof setTimeout>>();

  const handleNewGame = () => {
    if (!confirmingReset) {
      setConfirmingReset(true);
      clearTimeout(confirmTimer.current);
      confirmTimer.current = setTimeout(
        () => setConfirmingReset(false),
        3000,
      );
      return;
    }
    clearTimeout(confirmTimer.current);
    setConfirmingReset(false);
    clearSave();
    dispatch({
      type: 'INIT',
      payload: { highScore: loadHighScore(state.mode) },
    });
  };

  const copySeedLink = () => {
    navigator.clipboard
      .writeText(seedShareUrl(state.seed))
      .then(() =>
        showNotification(
          'Seed link copied — same market, same moonshots',
          'success',
        ),
      )
      .catch(() =>
        showNotification(`Market seed: ${state.seed}`, 'info'),
      );
  };

  const netWorth = computeNetWorth(state);
  const hasHighScore = state.highScore != null && state.highScore > 0;

  const holdings = Object.entries(state.assets).filter(
    ([_, a]) => a.active && a.wallet > 0,
  );
  const canExpandWallet =
    state.currentDay > 0 && state.cash >= state.wallet.expansionCost;

  return (
    <aside className="w-full min-w-0 flex flex-col gap-6">
      {/* B2: a stat row, not a billboard — the giant colored panel
          dominated the screen and its red state read as an alarm when
          it was just the starting debt. Green celebrates being up;
          being down renders calm and neutral. */}
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm text-white/60 font-semibold tracking-widest uppercase">
          Net worth
        </h2>
        <span
          data-cy="netWorth"
          className={cn(
            'text-3xl font-bold',
            netWorth > 0 ? 'text-crt-green' : 'text-white/90',
          )}
        >
          {formatMoney(netWorth)}
        </span>
      </div>

      {/* B3: hidden on phones — the market table already carries the
          position (dot, avg, count) and its rows open the same modal
          on the Sell tab, so this panel was a full screen of
          duplicate stats standing between the player and the market. */}
      <div className="hidden md:flex flex-col gap-3">
        <h2 className="text-sm text-white/60 font-semibold tracking-widest uppercase">
          Holdings
        </h2>

        {holdings.length === 0 ? (
          <div className="panel-crt rounded-lg py-5 text-center text-crt-yellow text-sm">
            No current holdings
          </div>
        ) : (
          // Display-only: selling happens in the TradeModal (tap a row).
          <div className="panel-crt rounded-lg divide-y divide-white/10 overflow-y-auto max-h-[40vh]">
            {holdings.map(([key, asset]) => {
              const pct =
                asset.averageCost > 0
                  ? ((asset.price - asset.averageCost) /
                      asset.averageCost) *
                    100
                  : 0;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onSelectAsset(key)}
                  aria-label={`Trade ${asset.name}`}
                  className="w-full p-3 flex items-center justify-between text-sm text-white/90 hover:bg-white/5 text-left"
                  data-cy={`${key}HoldingRow`}
                >
                  <span className="font-medium text-crt-cyan">
                    {asset.symbol}
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="text-white/70">
                      avg ${numberWithCommas(asset.averageCost)}
                    </span>
                    {/* E2: a freshly bought coin is ±0.0% — show
                        nothing rather than a celebratory green zero */}
                    {Math.abs(pct) >= 0.05 && (
                      <span
                        className={cn(
                          pct > 0 && 'text-crt-green',
                          pct < 0 && 'text-crt-red',
                        )}
                      >
                        {pct > 0 ? '+' : ''}
                        {pct.toFixed(1)}%
                      </span>
                    )}
                    <span>× {asset.wallet}</span>
                    <span
                      className="text-crt-cyan/60"
                      aria-hidden="true"
                    >
                      ›
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <h2 className="text-sm text-white/60 font-semibold tracking-widest uppercase">
        Wallet
      </h2>
      <Chip
        figure={`${state.wallet.amount}/${state.wallet.capacity}`}
        label={`Lvl.${state.wallet.level}`}
        dataCy="wallet"
        color="cyan"
        className="grow-0"
        button={{
          bool: !canExpandWallet,
          label: `lvl.${state.wallet.level + 1} $${numberWithCommas(state.wallet.expansionCost)}`,
          id: 'expandWallet',
          action: () => dispatch({ type: 'EXPAND_WALLET' }),
          title: canExpandWallet
            ? `Double wallet capacity to ${state.wallet.capacity * 2}`
            : `Costs $${numberWithCommas(state.wallet.expansionCost)} — not enough cash yet`,
        }}
      />

      {state.seed > 0 && (
        <button
          type="button"
          onClick={copySeedLink}
          className="text-xs text-white/50 hover:text-crt-cyan text-left tracking-wider"
          data-cy="seedDisplay"
          title="Copy a link that replays this exact market"
        >
          MARKET SEED: {state.seed} ⧉
        </button>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onOpenHelp}
          className="btn flex-1 py-2 px-3 text-xs font-semibold"
          id="openHowToPlay"
        >
          How to play
        </button>
        <button
          type="button"
          onClick={onOpenSettings}
          className="btn flex-1 py-2 px-3 text-xs font-semibold"
          id="openSettings"
        >
          Settings
        </button>
      </div>

      {hasHighScore ? (
        <p className="text-lg font-bold text-crt-green">
          High Score: ${numberWithCommas(state.highScore!)}
        </p>
      ) : (
        <p className="text-xs text-white/70">
          No high score yet — set a record this run!
        </p>
      )}

      {/* Demoted from the most prominent button on screen: it wipes the
          run, so it reads quiet and asks for a second tap to confirm. */}
      <button
        type="button"
        onClick={handleNewGame}
        className={cn(
          'text-left text-xs tracking-wider py-1',
          confirmingReset
            ? 'text-crt-red font-semibold'
            : 'text-white/50 hover:text-crt-red',
        )}
        id="runInfo"
        title="Abandon this run and start over"
      >
        {confirmingReset
          ? '⚠ TAP AGAIN TO ABANDON THIS RUN'
          : 'ABANDON RUN / NEW GAME'}
      </button>
    </aside>
  );
};

export default GameSidebar;
