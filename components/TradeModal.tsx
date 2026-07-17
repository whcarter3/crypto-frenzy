import { Dispatch, ReactNode, useState } from 'react';
import { State, Action } from '../lib/types';
import { calculateMaxShares, numberWithCommas } from '../helpers/utils';
import { cn } from '../lib/cn';
import { playSound } from '../lib/sound';
import TradeStepper, { useTradeQuantity } from './TradeStepper';

export type TradeSide = 'buy' | 'sell';

/**
 * The per-asset trade surface (owner design, 2026-07-17): tap a market
 * row to trade. Reads like a receipt (owner notes, 2026-07-17): asset
 * and price up top, then your stats stacked left-aligned (cash, wallet
 * space, holding), Buy | Sell tabs, the quantity playground, and one
 * live total — cost for buys, proceeds for sells — right above the
 * execute button; the rest of the arithmetic is the player's.
 * Market rows open Buy, holdings rows open Sell.
 * Every slot renders on both tabs (blank space over layout jumps), and
 * executing a trade closes the modal immediately — the updated table
 * row is the feedback.
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
        ? 'Ins. funds'
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

  // Live receipt totals, driven by the steppers
  const cost = buy.quantity * asset.price;
  const proceeds = sell.quantity * asset.price;

  const handleBuy = () => {
    if (buy.quantity <= 0) return;
    dispatch({
      type: 'BUY_ASSET',
      payload: { assetKey, amount: buy.quantity },
    });
    playSound('buy');
    onClose();
  };

  const handleSell = () => {
    if (sell.quantity <= 0) return;
    dispatch({
      type: 'SELL_ASSET',
      payload: { assetKey, amount: sell.quantity },
    });
    playSound('sell');
    onClose();
  };

  const row = (
    label: string,
    value: ReactNode,
    cy?: string,
  ) => (
    <div className="flex justify-between gap-4" data-cy={cy}>
      <span className="text-white/50">{label}</span>
      <span className="text-white/90">{value}</span>
    </div>
  );

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

  const reason =
    side === 'buy'
      ? maxBuy <= 0
        ? buyDisabledReason
        : undefined
      : asset.wallet === 0
        ? 'Nothing held yet'
        : undefined;

  return (
    <div
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-10 flex items-center justify-center p-4 md:p-8"
      data-cy="tradeModal"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <div
        className="relative bg-black w-full max-w-md rounded-sm border border-crt-yellow box-shadow-crt px-6 pb-6 pt-4 space-y-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tradeModalTitle"
        tabIndex={0}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 px-2 py-1 text-lg text-white/50 hover:text-white"
          id="tradeModalClose"
          aria-label="Close trade panel"
        >
          ✕
        </button>

        <div className="flex items-baseline justify-between gap-3 flex-wrap pr-8">
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

        {/* Your stats, stacked receipt-style — extra breathing room
            below the price so asset info and player info read as two
            distinct groups */}
        <div className="pt-3 text-xs uppercase tracking-wider space-y-1.5">
          {row(
            'Cash',
            <span className="text-crt-green">
              ${numberWithCommas(state.cash)}
            </span>,
          )}
          {row(
            'Wallet space',
            <span className="text-crt-cyan">
              {state.wallet.capacity - state.wallet.amount}
            </span>,
          )}
          {row(
            'Holding',
            asset.wallet > 0 ? (
              <span data-cy="tradeModalPosition">
                <span className="text-crt-cyan">×{asset.wallet}</span>{' '}
                @ ${numberWithCommas(asset.averageCost)}
                {/* E2: suppress the green "+0.0%" right after a buy */}
                {Math.abs(positionPct) >= 0.05 && (
                  <span
                    className={cn(
                      'ml-1',
                      positionPct > 0
                        ? 'text-crt-green'
                        : 'text-crt-red',
                    )}
                  >
                    {positionPct > 0 ? '+' : ''}
                    {positionPct.toFixed(1)}%
                  </span>
                )}
              </span>
            ) : (
              <span className="text-white/40">—</span>
            ),
          )}
        </div>

        <div
          role="tablist"
          aria-label={`Trade ${asset.name}`}
          className="flex gap-2"
        >
          {tab('buy', 'Buy')}
          {tab('sell', 'Sell')}
        </div>

        <div id="tradePanel" role="tabpanel" className="space-y-2">
          {side === 'buy' ? (
            <TradeStepper
              assetName={asset.name}
              maxLabel="Max"
              cyPrefix={assetKey}
              control={buy}
              disabled={maxBuy <= 0}
            />
          ) : (
            <TradeStepper
              assetName={asset.name}
              maxLabel="All"
              cyPrefix={`${assetKey}Sell`}
              control={sell}
              disabled={asset.wallet === 0}
            />
          )}
          {/* Fixed-height slot: present even when empty so the modal
              doesn't jump when a reason appears */}
          <p className="h-4 text-xs text-white/50 text-right">
            {reason}
          </p>
        </div>

        {/* The receipt total: what this trade moves, priced live from
            the stepper — one line, the player does their own math */}
        <div className="text-xs uppercase tracking-wider border-t border-white/10 pt-3">
          {side === 'buy'
            ? row(
                'Cost',
                cost > 0 ? (
                  `−$${numberWithCommas(cost)}`
                ) : (
                  <span className="text-white/40">—</span>
                ),
                'tradeCost',
              )
            : row(
                'Proceeds',
                proceeds > 0 ? (
                  <span className="text-crt-green">
                    +${numberWithCommas(proceeds)}
                  </span>
                ) : (
                  <span className="text-white/40">—</span>
                ),
                'tradeProceeds',
              )}
        </div>

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
