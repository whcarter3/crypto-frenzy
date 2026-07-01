import { Dispatch } from 'react';
import { State, Action } from '../lib/types';
import {
  computeNetWorth,
  formatMoney,
  numberWithCommas,
} from '../helpers/utils';
import { cn } from '../lib/cn';
import { increaseWalletCapacity } from '../lib/wallet';
import { clearSave } from '../lib/state/persistence';
import Chip from './Chip';
import { AlertMessages, getAlertType } from '../helpers/alerts';
import { sellAsset } from '../lib/buySell';
import { useNotification } from '../lib/NotificationContext';

const GameSidebar = ({
  state,
  dispatch,
}: {
  state: State;
  dispatch: Dispatch<Action>;
}) => {
  const { showNotification } = useNotification();

  const handleSell = (assetKey: string) => {
    if (state.currentDay === 0) {
      showNotification(
        AlertMessages.NEED_START,
        getAlertType(AlertMessages.NEED_START),
      );
      return;
    }

    const asset = state.assets[assetKey];

    if (!asset || asset.wallet === 0) {
      showNotification(
        AlertMessages.INSUFFICIENT_ASSETS,
        getAlertType(AlertMessages.INSUFFICIENT_ASSETS),
      );
      return;
    }

    sellAsset(assetKey, asset.price, asset.wallet, dispatch);
  };

  const netWorth = computeNetWorth(state);
  const daysLeft = Math.max(0, state.days - state.currentDay);
  const hasHighScore = state.highScore != null && state.highScore > 0;

  const holdings = Object.entries(state.assets).filter(
    ([_, a]) => a.active && a.wallet > 0,
  );
  const canExpandWallet =
    state.currentDay > 0 && state.cash >= state.wallet.expansionCost;

  return (
    <aside className="w-full flex flex-col gap-6">
      <p className="text-2xl text-white/90 font-semibold tracking-wide">
        NET WORTH
      </p>
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

      <p className="text-2xl text-white/90 font-semibold tracking-wide">
        HOLDINGS
      </p>

      <div className="overflow-y-auto panel-crt rounded-lg flex-1 h-[40vh]">
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
                      >
                        Sell
                      </button>
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

      <p className="text-2xl text-white/90 font-semibold tracking-wide">
        WALLET
      </p>
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
          action: () => increaseWalletCapacity(state, dispatch),
        }}
      />

      <button
        type="button"
        onClick={() => {
          clearSave();
          dispatch({ type: 'INIT' });
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
