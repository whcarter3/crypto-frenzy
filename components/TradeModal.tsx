import { Dispatch } from 'react';
import { State, Action } from '../lib/types';
import { calculateMaxShares, numberWithCommas } from '../helpers/utils';
import { cn } from '../lib/cn';
import { playSound } from '../lib/sound';
import TradeStepper from './TradeStepper';

/**
 * The per-asset trade surface (owner design, 2026-07-17): tap a market
 * row to trade. Buying and selling — previously split between the
 * market table and the holdings sidebar — live together here, with the
 * context the decision needs (price, today's move, your position, your
 * cash). Stays open after a trade so the updated position is the
 * feedback.
 */
const TradeModal = ({
  assetKey,
  state,
  dispatch,
  onClose,
}: {
  assetKey: string;
  state: State;
  dispatch: Dispatch<Action>;
  onClose: () => void;
}) => {
  const asset = state.assets[assetKey];
  if (!asset) return null;

  const maxBuy =
    asset.price > 0
      ? calculateMaxShares(
          asset.price,
          state.wallet.amount,
          state.wallet.capacity,
          state.cash,
        )
      : 0;
  const buyDisabledReason =
    state.wallet.amount >= state.wallet.capacity
      ? 'Wallet full — upgrade capacity'
      : state.cash < asset.price
        ? `Need $${numberWithCommas(asset.price)} cash`
        : undefined;

  const positionPct =
    asset.wallet > 0 && asset.averageCost > 0
      ? ((asset.price - asset.averageCost) / asset.averageCost) * 100
      : 0;

  const dayPct =
    asset.previousPrice > 0
      ? ((asset.price - asset.previousPrice) / asset.previousPrice) *
        100
      : null;

  const handleBuy = (quantity: number) => {
    dispatch({
      type: 'BUY_ASSET',
      payload: { assetKey, amount: quantity },
    });
    playSound('buy');
  };

  const handleSell = (quantity: number) => {
    dispatch({
      type: 'SELL_ASSET',
      payload: { assetKey, amount: quantity },
    });
    playSound('sell');
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-10 flex items-center justify-center p-4 md:p-8"
      data-cy="tradeModal"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <div
        className="bg-black w-full max-w-md rounded-sm border border-crt-yellow box-shadow-crt p-6 space-y-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tradeModalTitle"
        tabIndex={0}
      >
        <div className="flex items-baseline justify-between gap-3">
          <h1
            id="tradeModalTitle"
            className="text-2xl font-bold text-slate-300 text-glow-crt"
          >
            {asset.name}{' '}
            <span className="text-crt-cyan text-lg">
              {asset.symbol}
            </span>
          </h1>
          <span className="text-xl font-bold text-white/90">
            ${numberWithCommas(asset.price)}
            {dayPct !== null && Math.abs(dayPct) >= 0.05 && (
              <span
                className={cn(
                  'ml-2 text-sm',
                  dayPct > 0 ? 'text-crt-green' : 'text-crt-red',
                )}
              >
                {dayPct > 0 ? '▲' : '▼'} {Math.abs(dayPct).toFixed(1)}%
              </span>
            )}
          </span>
        </div>

        <div className="flex justify-between text-xs text-white/60 uppercase tracking-wider">
          <span>
            Cash{' '}
            <span className="text-crt-green">
              ${numberWithCommas(state.cash)}
            </span>
          </span>
          <span>
            Wallet space{' '}
            <span className="text-crt-cyan">
              {state.wallet.capacity - state.wallet.amount}
            </span>
          </span>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-white/60 uppercase tracking-wider">
            Buy
          </p>
          <TradeStepper
            assetName={asset.name}
            max={maxBuy}
            maxLabel="Max"
            actionLabel="Buy"
            actionCy={`${assetKey}BuyButton`}
            cyPrefix={assetKey}
            onAction={handleBuy}
            disabled={maxBuy <= 0}
            disabledReason={buyDisabledReason}
          />
        </div>

        {asset.wallet > 0 && (
          <div className="space-y-1 border-t border-white/10 pt-4">
            <p className="text-xs text-white/60 uppercase tracking-wider">
              Sell — holding{' '}
              <span className="text-crt-cyan">×{asset.wallet}</span> at
              avg ${numberWithCommas(asset.averageCost)}{' '}
              <span
                className={cn(
                  positionPct >= 0 ? 'text-crt-green' : 'text-crt-red',
                )}
              >
                {positionPct >= 0 ? '+' : ''}
                {positionPct.toFixed(1)}%
              </span>
            </p>
            <TradeStepper
              assetName={asset.name}
              max={asset.wallet}
              maxLabel="All"
              actionLabel="Sell"
              actionCy={`${assetKey}SellButton`}
              cyPrefix={`${assetKey}Sell`}
              onAction={handleSell}
              disabled={asset.wallet === 0}
            />
          </div>
        )}

        <button
          className="btn btn-primary w-full py-2"
          onClick={onClose}
          id="tradeModalClose"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default TradeModal;
