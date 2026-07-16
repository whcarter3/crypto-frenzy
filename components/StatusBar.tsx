import { Dispatch } from 'react';
import { Action, State } from '../lib/types';
import { numberWithCommas } from '../helpers/utils';
import { playSound } from '../lib/sound';
import { cn } from '../lib/cn';

/**
 * The run's vitals plus its core verb, always in view. Replaces the old
 * bottom-of-page chips: cash was literally invisible after buying on
 * mobile, and End Day — the action the whole game revolves around — was
 * the smallest control on screen.
 */
const StatusBar = ({
  dispatch,
  state,
}: {
  dispatch: Dispatch<Action>;
  state: State;
}) => {
  const canPayDebt = state.cash <= state.debt || state.debt === 0;
  const isGameOver = state.currentDay >= state.days;
  const daysLeft = state.days - state.currentDay;

  return (
    <div
      // z below the modal overlays (z-10) and toasts (z-50)
      className="sticky top-0 z-[5] bg-crt-bg/95 backdrop-blur-sm border-b border-white/10 px-4 py-2"
      data-cy="statusBar"
    >
      <div className="flex items-center justify-between gap-x-4 gap-y-2 flex-wrap">
        <div className="flex items-center gap-x-5 gap-y-1 flex-wrap min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span
              className="text-xl font-bold text-crt-green"
              data-cy="cash"
            >
              ${numberWithCommas(state.cash)}
            </span>
            <span className="text-xs text-white/60 uppercase tracking-wider">
              Cash
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="flex items-baseline gap-1.5">
              <span
                className="text-xl font-bold text-crt-red"
                data-cy="debt"
              >
                ${numberWithCommas(state.debt)}
              </span>
              <span className="text-xs text-white/60 uppercase tracking-wider">
                Debt
              </span>
            </span>
            <button
              className={cn(
                'btn px-2 py-1 text-xs',
                canPayDebt && 'btn-disabled',
                !canPayDebt && 'btn-primary',
              )}
              onClick={() => {
                dispatch({ type: 'PAY_DEBT' });
                playSound('pay');
              }}
              disabled={canPayDebt}
              id="payDebt"
              title={
                canPayDebt
                  ? 'You need more cash than debt to pay it off in full'
                  : 'Pay off your full debt'
              }
            >
              Pay
            </button>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span
              className={cn(
                'text-xl font-bold',
                daysLeft > 3 && 'text-crt-cyan',
                daysLeft <= 3 && 'text-crt-yellow',
              )}
              data-cy="days left"
            >
              {daysLeft}
            </span>
            <span className="text-xs text-white/60 uppercase tracking-wider">
              {daysLeft === 1 ? 'Day left' : 'Days left'}
            </span>
          </div>
        </div>

        <button
          className={cn(
            'btn px-6 py-2 shrink-0',
            isGameOver && 'btn-disabled',
            !isGameOver && 'btn-primary',
          )}
          onClick={() => {
            dispatch({ type: 'ADVANCE_DAY' });
            playSound('advance');
          }}
          disabled={isGameOver}
          id="advDay"
          title={
            isGameOver
              ? 'The run is over'
              : 'End the day: prices re-roll and debt compounds'
          }
        >
          End Day ▸
        </button>
      </div>
    </div>
  );
};

export default StatusBar;
