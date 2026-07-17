import { useState } from 'react';
import { cn } from '../lib/cn';
import { normalizeQuantity } from '../helpers/utils';

/**
 * The trade control: (0) (−) [n] (+) (Max) (BUY).
 *
 * Owner-specified design (2026-07-17): explicit, editable quantity with
 * big tap targets, clamped to [0, max]; the action disables at 0. This
 * retires the old "empty input = max" convention — a default you
 * couldn't discover by looking — and replaces the native number-input
 * spinners with themed buttons.
 */
const TradeStepper = ({
  assetName,
  max,
  maxLabel,
  actionLabel,
  actionCy,
  onAction,
  disabled,
  disabledReason,
  cyPrefix,
}: {
  assetName: string;
  /** Largest executable quantity right now (affordable / held) */
  max: number;
  /** Label for the fill-to-max button: "Max" for buys, "All" for sells */
  maxLabel: string;
  actionLabel: string;
  /** Full data-cy for the action button, e.g. "solanaBuyButton" */
  actionCy: string;
  onAction: (quantity: number) => void;
  disabled: boolean;
  /** Shown inline when the row is disabled — hover titles don't exist on touch */
  disabledReason?: string;
  /** data-cy prefix for the input and step buttons, e.g. "solana" or "solanaSell" */
  cyPrefix: string;
}) => {
  const [raw, setRaw] = useState(() => String(Math.min(1, max)));

  // Re-clamp whenever the ceiling moves (prices roll, cash changes,
  // position shrinks) so the shown quantity is always executable.
  // State-adjustment-during-render pattern — no effect, no extra paint.
  const [prevMax, setPrevMax] = useState(max);
  if (prevMax !== max) {
    setPrevMax(max);
    setRaw((current) =>
      // Coming back from unbuyable (mounted at price 0 behind the
      // difficulty modal, or wallet was full): restart at the sensible
      // default of 1 instead of a stuck, action-disabling 0.
      prevMax <= 0 && max > 0
        ? '1'
        : String(normalizeQuantity(current, max)),
    );
  }

  const quantity = normalizeQuantity(raw, max);
  const setQuantity = (next: number) =>
    setRaw(String(normalizeQuantity(String(next), max)));

  const stepButton = (
    label: string,
    onClick: () => void,
    stepDisabled: boolean,
    cy: string,
    ariaLabel: string,
  ) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || stepDisabled}
      className="btn px-2 py-1 text-xs bg-black text-crt-cyan border-crt-cyan/50 disabled:opacity-40 disabled:cursor-not-allowed"
      data-cy={cy}
      aria-label={ariaLabel}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 justify-end flex-wrap">
        {stepButton(
          '0',
          () => setQuantity(0),
          quantity === 0,
          `${cyPrefix}Zero`,
          `Clear ${assetName} amount`,
        )}
        {stepButton(
          '−',
          () => setQuantity(quantity - 1),
          quantity <= 0,
          `${cyPrefix}Minus`,
          `Decrease ${assetName} amount`,
        )}
        <input
          type="number"
          min={0}
          max={max}
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          onBlur={() => setRaw(String(quantity))}
          disabled={disabled}
          inputMode="numeric"
          className="w-14 bg-black/40 border border-white/20 rounded px-1.5 py-1 text-sm text-center text-white/90 disabled:opacity-40"
          data-cy={`${cyPrefix}AmountInput`}
          aria-label={`Amount of ${assetName}`}
        />
        {stepButton(
          '+',
          () => setQuantity(quantity + 1),
          quantity >= max,
          `${cyPrefix}Plus`,
          `Increase ${assetName} amount`,
        )}
        {stepButton(
          maxLabel,
          () => setQuantity(max),
          quantity >= max,
          `${cyPrefix}MaxButton`,
          `Set ${assetName} amount to ${maxLabel.toLowerCase()}`,
        )}
        <button
          className={cn(
            'btn px-3 py-1',
            !disabled && quantity > 0 && 'btn-primary',
            (disabled || quantity === 0) && 'btn-disabled',
          )}
          onClick={() => {
            if (quantity > 0) onAction(quantity);
          }}
          disabled={disabled || quantity === 0}
          data-cy={actionCy}
          aria-label={`${actionLabel} ${assetName}`}
        >
          {actionLabel}
        </button>
      </div>
      {disabled && disabledReason && (
        <p className="text-xs text-white/50 text-right">
          {disabledReason}
        </p>
      )}
    </div>
  );
};

export default TradeStepper;
