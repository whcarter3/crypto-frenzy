import { Dispatch, useState } from 'react';
import { State, Action } from '../lib/types';
import { calculateMaxShares, numberWithCommas } from '../helpers/utils';
import { cn } from '../lib/cn';
import { playSound } from '../lib/sound';
import TradeStepper, { useTradeQuantity } from './TradeStepper';

export type TradeSide = 'buy' | 'sell';

/**
 * The per-asset trade surface (owner design, 2026-07-17): tap a market
 * row to trade. Third playtest iteration (2026-07-16): the combined
 * buy+sell layout made you "look all over the place to parse what to
 * do", so the modal is now tabbed — one side at a time, reading top to
 * bottom as info → playground → execute. Market rows open the Buy tab,
 * holdings rows open Sell. Both tabs' amounts survive switching, and
 * the modal stays open after a trade so the updated position is the
 * feedback.
 */
const TradeModal = ({
  assetKey,
  state,
  dispatch,
  initialSide = 'buy',
  onClose,
}: {
  assetKey: string;
  state: State;
  dispatch: Dispatch<Action>;
  initialSide?: TradeSide;
  onClose: () => void;
}) => {
  const asset = state.assets[assetKey];
  const maxBuy =
    asset && asset.price > 0
      ? calculateMaxShares(
          asset.price,
          state.wallet.amount,
          state.wallet.capacity,
          state.cash,
        )
      : 0;

  // Hooks before the null-guard return — hook order must not depend
  // on whether the asset exists.
  const buy = useTradeQuantity(maxBuy);
  const sell = useTradeQuantity(asset ? asset.wallet : 0);
  const [side, setSide] = useState<TradeSide>(initialSide);
  if (!asset) return null;

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

  const handleBuy = () => {
    if (buy.quantity <= 0) return;
    dispatch({
      type: 'BUY_ASSET',
      payload: { assetKey, amount: buy.quantity },
    });
    playSound('buy');
  };

  const handleSell = () => {
    if (sell.quantity <= 0) return;
    dispatch({
      type: 'SELL_ASSET',
      payload: { assetKey, amount: sell.quantity },
    });
    playSound('sell');
  };

  const tab = (tabSide: TradeSide, label: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={side === tabSide}
      aria-controls="tradePanel"
      onClick={() => setSide(tabSide)}
      className={cn(
        'flex-1 py-2 text-sm font-semibold uppercase tracking-wider border rounded-sm',
        side === tabSide
          ? 'text-crt-green border-crt-green bg-crt-transparentGreen'
          : 'text-white/40 border-white/20 hover:text-white/70',
      )}
      data-cy={`${assetKey}${label}Tab`}
    >
      {label}
    </button>
  );

  return (
    <div
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-10 flex items-center justify-center p-4 md:p-8"
      data-cy="tradeModal"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <div
        className="relative bg-black w-full max-w-md rounded-sm border border-crt-yellow box-shadow-crt p-6 space-y-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tradeModalTitle"
        tabIndex={0}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 btn px-2.5 py-1 text-sm text-white/70"
          id="tradeModalClose"
          aria-label="Close trade panel"
        >
          ✕
        </button>

        {/* Info: everything you need to know, in one block up top */}
        <div className="space-y-2 pr-10">
          <div className="flex items-baseline justify-between gap-3 flex-wrap">
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
                  {dayPct > 0 ? '▲' : '▼'}{' '}
                  {Math.abs(dayPct).toFixed(1)}%
                </span>
              )}
            </span>
          </div>
          <div className="text-xs text-white/60 uppercase tracking-wider space-y-1">
            <div className="flex justify-between">
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
            {asset.wallet > 0 && (
              <div data-cy="tradeModalPosition">
                Holding{' '}
                <span className="text-crt-cyan">×{asset.wallet}</span>{' '}
                at avg ${numberWithCommas(asset.averageCost)}{' '}
                <span
                  className={cn(
                    positionPct >= 0
                      ? 'text-crt-green'
                      : 'text-crt-red',
                  )}
                >
                  {positionPct >= 0 ? '+' : ''}
                  {positionPct.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>

        <div
          role="tablist"
          aria-label={`Trade ${asset.name}`}
          className="flex gap-2"
        >
          {tab('buy', 'Buy')}
          {tab('sell', 'Sell')}
        </div>

        {/* Playground: the active side's amount, nothing else */}
        <div id="tradePanel" role="tabpanel">
          {side === 'buy' ? (
            <TradeStepper
              assetName={asset.name}
              maxLabel="Max"
              cyPrefix={assetKey}
              control={buy}
              disabled={maxBuy <= 0}
              disabledReason={buyDisabledReason}
            />
          ) : (
            <TradeStepper
              assetName={asset.name}
              maxLabel="All"
              cyPrefix={`${assetKey}Sell`}
              control={sell}
              disabled={asset.wallet === 0}
              disabledReason={
                asset.wallet === 0 ? 'Nothing held yet' : undefined
              }
            />
          )}
        </div>

        {/* Execute: one full-width commit for the active side */}
        {side === 'buy' ? (
          <button
            className={cn(
              'btn w-full py-3',
              buy.quantity > 0 && maxBuy > 0
                ? 'btn-primary'
                : 'btn-disabled',
            )}
            onClick={handleBuy}
            disabled={buy.quantity <= 0 || maxBuy <= 0}
            data-cy={`${assetKey}BuyButton`}
            aria-label={`Buy ${asset.name}`}
          >
            Buy
            {buy.quantity > 0 &&
              ` ×${numberWithCommas(buy.quantity)}`}
          </button>
        ) : (
          <button
            className={cn(
              'btn w-full py-3',
              sell.quantity > 0 && asset.wallet > 0
                ? 'btn-primary'
                : 'btn-disabled',
            )}
            onClick={handleSell}
            disabled={sell.quantity <= 0 || asset.wallet === 0}
            data-cy={`${assetKey}SellButton`}
            aria-label={`Sell ${asset.name}`}
          >
            Sell
            {asset.wallet > 0 &&
              sell.quantity > 0 &&
              ` ×${numberWithCommas(sell.quantity)}`}
          </button>
        )}
      </div>
    </div>
  );
};

export default TradeModal;
