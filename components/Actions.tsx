import { Dispatch } from 'react';
import { Action, State } from '../lib/types';
import { numberWithCommas } from '../helpers/utils';
import { payDebt } from '../lib/debt';
import { increaseWalletCapacity } from '../lib/wallet';
import { advanceDay } from '../lib/advanceDay';
import { useNotification } from '../lib/NotificationContext';

const Actions = ({
  dispatch,
  state,
}: {
  dispatch: Dispatch<Action>;
  state: State;
}) => {
  const { showNotification } = useNotification();
  const canPayDebt = state.cash <= state.debt || state.debt === 0;
  const cashLessThanWalletExpansionCost =
    state.cash <= state.wallet.expansionCost;
  const isGameOver = state.currentDay >= state.days;

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                className={`btn ${
                  cashLessThanWalletExpansionCost
                    ? 'btn-disabled'
                    : 'btn-success'
                }`}
                onClick={() =>
                  increaseWalletCapacity(state, dispatch)
                }
                id="expandWallet"
                disabled={cashLessThanWalletExpansionCost}
              >
                Buy
              </button>
              <p
                className={`text-sm ${
                  cashLessThanWalletExpansionCost
                    ? 'text-slate-500'
                    : 'text-slate-300'
                }`}
              >
                Wallet Capacity +{state.wallet.increase}: $
                {numberWithCommas(state.wallet.expansionCost)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                className={`btn ${
                  canPayDebt ? 'btn-disabled' : 'btn-success'
                }`}
                onClick={() => payDebt(dispatch, state)}
                disabled={canPayDebt}
                id="payDebt"
              >
                Pay
              </button>
              <p
                className={`text-sm ${
                  canPayDebt ? 'text-slate-500' : 'text-slate-300'
                }`}
              >
                Pay debt: ${numberWithCommas(state.debt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <button
          className={`btn ${
            isGameOver ? 'btn-disabled' : 'btn-primary'
          } flex-1 py-3 text-lg`}
          id="advDay"
          onClick={() =>
            advanceDay(state, dispatch, showNotification)
          }
          disabled={isGameOver}
        >
          {state.currentDay === state.days
            ? 'Game Over!'
            : 'Advance Day'}
        </button>
        <button
          className="btn btn-danger flex-1 py-3 text-lg"
          onClick={() => dispatch({ type: 'TOGGLE_MODAL' })}
          id="newGame"
        >
          New Game
        </button>
      </div>
    </div>
  );
};

export default Actions;
