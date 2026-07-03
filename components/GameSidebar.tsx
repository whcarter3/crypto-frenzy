import { Dispatch, useState } from 'react';
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
}: {
  state: State;
  dispatch: Dispatch<Action>;
}) => {
  const { showNotification } = useNotification();

  // Per-asset sell amount; empty string means "sell the whole position"
  const [amounts, setAmounts] = useState<Record<string, string>>({});

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

  const setAmount = (assetKey: string, value: string) =>
    setAmounts((prev) => ({ ...prev, [assetKey]: value }));

  const handleSell = (assetKey: string) => {
    const parsed = parseInt(amounts[assetKey], 10);
    dispatch({
      type: 'SELL_ASSET',
      payload: {
        assetKey,
        amount: Number.isFinite(parsed) && parsed > 0 ? parsed : undefined,
      },
    });
    setAmount(assetKey, '');
  };

  const netWorth = computeNetWorth(state);
  const hasHighScore = state.highScore != null && state.highScore > 0;

  const holdings = Object.entries(state.assets).filter(
    ([_, a]) => a.active && a.wallet > 0,
  );
  const canExpandWallet =
    state.currentDay > 0 && state.cash >= state.wallet.expansionCost;

  return (
    <aside className="w-full flex flex-col gap-6">
      <h2 className="text-2xl text-white/90 font-semibold tracking-wide">
        NET WORTH
      </h2>
      <div
        className={cn(
          'panel-crt rounded-lg p-3 h-40 text-right flex flex-col justify-center',
          netWorth >= 0 && 'bg-crt-transparentGreen',
          netWorth < 0 && 'bg-crt-transparentRed',
        )}
      >
        <div
          className={cn(
            'text-7xl font-bold text-white/90 break-all',
            netWorth >= 0 && 'text-crt-green',
            netWorth < 0 && 'text-crt-red',
          )}
        >
          {formatMoney(netWorth)}
        </div>
      </div>

      <h2 className="text-2xl text-white/90 font-semibold tracking-wide">
        HOLDINGS
      </h2>

      {/* overflow-x-auto: table-layout:auto resists shrinking columns
          below their header text's natural width, which blew out the
          whole page horizontally on narrow viewports since nothing
          contained the excess — matches AssetTable's existing pattern. */}
      <div className="overflow-auto panel-crt rounded-lg flex-1 h-[40vh]">
        <table className="w-full h-full text-base">
          <thead className="sticky top-0 bg-white/5">
            <tr className="border-b border-white/20">
              <th className="text-left px-4 py-3 font-semibold text-crt-cyan uppercase tracking-wider">
                Asset
              </th>
              <th className="text-left px-4 py-3 font-semibold text-crt-cyan uppercase tracking-wider">
                Avg Cost
              </th>
              <th className="text-left px-4 py-3 font-semibold text-crt-cyan uppercase tracking-wider">
                %
              </th>
              <th className="text-right px-4 py-3 font-semibold text-crt-cyan uppercase tracking-wider">
                #
              </th>
              <th className="text-right px-4 py-3 font-semibold text-crt-cyan uppercase tracking-wider">
                Sell
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
                  <tr
                    key={key}
                    className="text-white/90 text-sm px-4 py-3"
                  >
                    <td className="px-4 py-3 font-medium text-crt-cyan">
                      {asset.symbol}
                    </td>
                    <td className="px-4 py-3">
                      ${numberWithCommas(asset.averageCost)}
                    </td>
                    <td
                      className={cn(
                        'px-4 py-3',
                        pct >= 0 && 'text-crt-green',
                        pct < 0 && 'text-crt-red',
                      )}
                    >
                      {pct >= 0 ? '+' : ''}
                      {pct.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-right">
                      {asset.wallet}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        <input
                          type="number"
                          min={1}
                          max={asset.wallet}
                          value={amounts[key] ?? ''}
                          onChange={(e) =>
                            setAmount(key, e.target.value)
                          }
                          placeholder="all"
                          className="w-14 bg-black/40 border border-white/20 rounded px-1.5 py-1 text-sm text-white/90 placeholder:text-white/40"
                          data-cy={`${key}SellInput`}
                          title="How many to sell — leave empty to sell the whole position"
                          aria-label={`Amount of ${asset.name} to sell — leave empty to sell all`}
                        />
                        <button
                          className={cn(
                            'btn',
                            asset.wallet > 0 && 'btn-primary',
                            asset.wallet === 0 && 'btn-disabled',
                          )}
                          onClick={() => handleSell(key)}
                          disabled={asset.wallet === 0}
                          data-cy={`${key}SellButton`}
                          title={
                            asset.wallet === 0
                              ? 'No assets to sell'
                              : 'Sell this asset'
                          }
                          aria-label={`Sell ${asset.name}`}
                        >
                          Sell
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="py-5 text-center text-crt-yellow text-sm"
                >
                  No current holdings
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl text-white/90 font-semibold tracking-wide">
        WALLET
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

      <button
        type="button"
        onClick={() => {
          clearSave();
          dispatch({
            type: 'INIT',
            payload: { highScore: loadHighScore(state.mode) },
          });
        }}
        className="btn btn-danger w-full py-2 px-3 text-xs font-semibold"
        id="runInfo"
      >
        new game
      </button>

      {hasHighScore ? (
        <>
          <p className="text-lg font-bold text-crt-green">
            High Score: ${numberWithCommas(state.highScore!)}
          </p>
        </>
      ) : (
        <>
          <p className="text-lg font-bold text-crt-cyan">—</p>
          <p className="text-xs text-white/70">
            Set a record this run!
          </p>
        </>
      )}
    </aside>
  );
};

export default GameSidebar;
