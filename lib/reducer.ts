import { Action, State } from '../lib/types';
import { addTimestamp } from '../helpers/utils';
import { initialState } from './state/initialState';

/**
 * The reducer function for updating the game state based on dispatched actions.
 * @param {State} state - The current game state.
 * @param {Action} action - The dispatched action.
 * @returns {State} The updated game state.
 */
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'INIT':
      const initHighScoreKey =
        state.mode === 'Easy'
          ? 'highScoreEasy'
          : state.mode === 'Hard'
            ? 'highScoreHard'
            : 'highScore';
      const savedHighScore = localStorage.getItem(initHighScoreKey);
      return {
        ...initialState,
        mode: state.mode, // Preserve the current mode
        highScore: savedHighScore ? parseInt(savedHighScore) : null,
      };
    case 'SET_EASY_MODE':
      const savedHighScoreEasy =
        localStorage.getItem('highScoreEasy');
      return {
        ...initialState,
        mode: 'Easy',
        highScore: savedHighScoreEasy
          ? parseInt(savedHighScoreEasy)
          : null,
        days: 60,
        interestRate: 0.1,
        debt: 2000,
        cash: 1500,
        lowRangePriceChance: 7,
        highRangePriceChance: 92,
        wallet: {
          ...state.wallet,
          capacity: 200,
          level: 1,
          expansionCost: 25000,
        },
      };
    case 'SET_HARD_MODE':
      const savedHighScoreHard =
        localStorage.getItem('highScoreHard');
      return {
        ...initialState,
        mode: 'Hard',
        highScore: savedHighScoreHard
          ? parseInt(savedHighScoreHard)
          : null,
        days: 20,
        interestRate: 0.3,
        debt: 4000,
        cash: 2000,
        lowRangePriceChance: 3,
        highRangePriceChance: 96,
        wallet: {
          ...state.wallet,
          capacity: 50,
          level: 0,
          expansionCost: 75000,
        },
      };
    case 'SET_TEST_MODE':
      return {
        ...initialState,
        mode: 'Test',
        cash: 1000000,
      };
    case 'ADVANCE_DAY':
      return { ...state, currentDay: state.currentDay + 1 };
    case 'EXPAND_WALLET':
      return {
        ...state,
        cash: state.cash - state.wallet.expansionCost,
        wallet: {
          ...state.wallet,
          level: state.wallet.level + 1,
          capacity: state.wallet.capacity * 2,
          expansionCost: state.wallet.expansionCost * 2,
        },
      };
    case 'SET_ASSET_PRICE':
      const { setAssetName, setAssetPrice } = action.payload;
      return {
        ...state,
        assets: {
          ...state.assets,
          [setAssetName]: {
            ...state.assets[setAssetName],
            price: setAssetPrice,
          },
        },
      };
    case 'BUY_ASSET':
      const { buyAssetName, buyAmount, buyTotalCost, buyLogMessage } =
        action.payload;
      return {
        ...state,
        cash: state.cash - buyTotalCost,
        wallet: {
          ...state.wallet,
          amount: state.wallet.amount + buyAmount,
        },
        assets: {
          ...state.assets,
          [buyAssetName]: {
            ...state.assets[buyAssetName],
            wallet: state.assets[buyAssetName].wallet + buyAmount,
            totalCost:
              state.assets[buyAssetName].totalCost + buyTotalCost,
          },
        },
        log: [addTimestamp(buyLogMessage), ...state.log],
      };
    case 'SELL_ASSET':
      const {
        sellAssetName,
        sellAmount,
        sellTotalCost,
        sellLogMessage,
      } = action.payload;
      const remainingWallet =
        state.assets[sellAssetName].wallet - sellAmount;
      return {
        ...state,
        cash: state.cash + sellTotalCost,
        wallet: {
          ...state.wallet,
          amount: state.wallet.amount - sellAmount,
        },
        assets: {
          ...state.assets,
          [sellAssetName]: {
            ...state.assets[sellAssetName],
            wallet: remainingWallet,
            totalCost:
              remainingWallet === 0
                ? 0
                : state.assets[sellAssetName].totalCost -
                  sellAmount * state.assets[sellAssetName].averageCost,
            averageCost:
              remainingWallet === 0
                ? 0
                : state.assets[sellAssetName].averageCost,
          },
        },
        log: [addTimestamp(sellLogMessage), ...state.log],
      };
    case 'SET_AVG_COST':
      const { avgCostAssetName } = action.payload;
      return {
        ...state,
        assets: {
          ...state.assets,
          [avgCostAssetName]: {
            ...state.assets[avgCostAssetName],
            averageCost: Math.floor(
              state.assets[avgCostAssetName].totalCost /
                state.assets[avgCostAssetName].wallet,
            ),
          },
        },
      };
    case 'SET_LOG':
      return {
        ...state,
        log: [...action.payload.map(addTimestamp), ...state.log],
      };
    case 'SET_HIGH_SCORE':
      const saveHighScoreKey =
        state.mode === 'Easy'
          ? 'highScoreEasy'
          : state.mode === 'Hard'
            ? 'highScoreHard'
            : 'highScore';
      if (state.mode !== 'Test') {
        localStorage.setItem(
          saveHighScoreKey,
          action.payload.toString(),
        );
      }
      return { ...state, highScore: action.payload };
    case 'PAY_DEBT':
      return {
        ...state,
        cash: state.cash - state.debt,
        debt: 0,
      };
    case 'INCREASE_DEBT':
      return {
        ...state,
        debt: Math.floor(
          state.debt + state.debt * state.interestRate,
        ),
      };
    case 'TOGGLE_MODAL':
      return {
        ...state,
        modalOpen: !state.modalOpen,
      };
    case 'CHANGE_MODE':
      return {
        ...state,
        mode: action.payload,
      };
    default:
      console.log('No action type found');
      return state;
  }
};
