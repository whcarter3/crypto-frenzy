import { Dispatch } from 'react';
import { Action, State } from '../lib/types';
import { numberWithCommas } from '../helpers/utils';
import { payDebt } from '../lib/debt';
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
  const isGameOver = state.currentDay >= state.days;

  return (
    <div className="space-y-4">
      <div className="panel-crt rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-4">
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
            <span className="text-sm text-white/80">
              Debt: ${numberWithCommas(state.debt)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
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
          onClick={() => dispatch({ type: 'INIT' })}
          id="newGame"
        >
          New Game
        </button>
      </div>
    </div>
  );
};

export default Actions;
