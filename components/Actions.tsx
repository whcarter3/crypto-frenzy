import { Dispatch } from 'react';
import { Action, State } from '../lib/types';
import Chip from './Chip';

const Actions = ({
  dispatch,
  state,
}: {
  dispatch: Dispatch<Action>;
  state: State;
}) => {
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
            id: 'payDebt',
            action: () => dispatch({ type: 'PAY_DEBT' }),
          }}
        />
        <Chip
          figure={`${state.days - state.currentDay}`}
          label="Days Left"
          color="cyan"
          button={{
            bool: isGameOver,
            label: 'Adv Day',
            id: 'advDay',
            action: () => dispatch({ type: 'ADVANCE_DAY' }),
          }}
        />
      </div>
    </div>
  );
};

export default Actions;
