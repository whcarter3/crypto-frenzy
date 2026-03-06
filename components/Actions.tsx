import { Dispatch } from 'react';
import { Action, State } from '../lib/types';
import { numberWithCommas } from '../helpers/utils';
import { cn } from '../lib/cn';
import { payDebt } from '../lib/debt';
import { advanceDay } from '../lib/advanceDay';
import { useNotification } from '../lib/NotificationContext';
import Chip from './Chip';

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
      <div className="flex sm:flex-row gap-3">
        <Chip
          figure={`${state.cash}`}
          label="Cash"
          color="green"
          currency
        />
        <Chip
          figure={`${state.debt}`}
          label="Debt"
          color="red"
          currency
          button={{
            bool: canPayDebt,
            label: 'Pay',
            action: () => payDebt(dispatch, state),
          }}
        />
        <Chip
          figure={`${state.days - state.currentDay}`}
          label="Days Left"
          color="cyan"
          button={{
            bool: isGameOver,
            label: 'Adv Day',
            action: () =>
              advanceDay(state, dispatch, showNotification),
          }}
        />
      </div>
    </div>
  );
};

export default Actions;
