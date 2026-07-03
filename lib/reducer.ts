import { Action, State } from './types';
import {
  calculateMaxShares,
  computeNetWorth,
  numberWithCommas,
} from '../helpers/utils';
import { initialState } from './state/initialState';
import { modeConfigs } from './state/modes';
import { createRng, seedRng } from './engine/rng';
import { rollDailyPrices } from './prices';

/**
 * Raises stats.peakNetWorth when the given state's net worth sets a new
 * run high. Called explicitly by the actions that can move net worth.
 */
const updatePeakNetWorth = (state: State): State => {
  const netWorth = computeNetWorth(state);
  if (netWorth <= state.stats.peakNetWorth) return state;
  return {
    ...state,
    stats: { ...state.stats, peakNetWorth: netWorth },
  };
};

const dayStamp = (state: State): string => `[Day ${state.currentDay}]`;

/**
 * The game engine. A pure function: the entire day/trade/debt transition
 * is computed here from (state, action) alone — randomness comes from
 * state.rngState (see lib/engine/rng.ts) and side effects (localStorage,
 * notifications) live in components. Given a seed and an action list,
 * a whole run can be replayed deterministically.
 */
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'INIT':
      return {
        ...initialState,
        mode: state.mode, // Preserve the current mode
        highScore: action.payload?.highScore ?? null,
      };

    case 'CHANGE_MODE':
      return {
        ...state,
        mode: action.payload,
      };

    case 'START_RUN': {
      const { mode, seed, highScore } = action.payload;
      const config = modeConfigs[mode];
      return {
        ...initialState,
        mode,
        modalOpen: false,
        highScore,
        rngState: seedRng(seed),
        days: config.days,
        cash: config.cash,
        debt: config.debt,
        interestRate: config.interestRate,
        lowRangePriceChance: config.lowRangePriceChance,
        highRangePriceChance: config.highRangePriceChance,
        wallet: { amount: 0, ...config.wallet },
        log: [
          '- Click Advance Day to start.',
          `You have ${config.days - 1} days to make as much money as you can! 💎🙌`,
          `You borrowed $${numberWithCommas(config.cash)} at ${
            config.interestRate * 100
          }% daily interest.`,
        ],
      };
    }

    case 'ADVANCE_DAY': {
      if (state.gameOver || state.currentDay >= state.days) return state;

      const newDay = state.currentDay + 1;

      if (newDay >= state.days) {
        // Final day reached — settle the run. Unsold holdings don't
        // count toward the score. The high score is persisted to
        // localStorage by an effect watching gameOver.
        const score = state.cash - state.debt;
        const newHighScore =
          state.mode !== 'Test' && score > (state.highScore ?? 0);
        return {
          ...state,
          currentDay: newDay,
          gameOver: { score, newHighScore },
          highScore: newHighScore ? score : state.highScore,
          modalOpen: false,
        };
      }

      const rng = createRng(state.rngState);
      const { assets, eventLogs } = rollDailyPrices(
        state.assets,
        state.lowRangePriceChance,
        state.highRangePriceChance,
        rng,
      );

      return updatePeakNetWorth({
        ...state,
        currentDay: newDay,
        assets,
        debt: Math.floor(state.debt + state.debt * state.interestRate),
        rngState: rng.state(),
        log: [
          ...eventLogs,
          `========= End of Day ${state.currentDay} =========`,
          ...state.log,
        ],
      });
    }

    case 'BUY_ASSET': {
      const { assetKey, amount: requested } = action.payload;
      const asset = state.assets[assetKey];
      if (!asset || !asset.active || asset.price <= 0) return state;

      const maxShares = calculateMaxShares(
        asset.price,
        state.wallet.amount,
        state.wallet.capacity,
        state.cash,
      );
      const amount = Math.min(requested ?? maxShares, maxShares);
      if (amount <= 0) return state;

      const totalCost = amount * asset.price;
      const newTotalCost = asset.totalCost + totalCost;
      const newWallet = asset.wallet + amount;

      return updatePeakNetWorth({
        ...state,
        cash: state.cash - totalCost,
        stats: {
          ...state.stats,
          totalTrades: state.stats.totalTrades + 1,
        },
        wallet: {
          ...state.wallet,
          amount: state.wallet.amount + amount,
        },
        assets: {
          ...state.assets,
          [assetKey]: {
            ...asset,
            wallet: newWallet,
            totalCost: newTotalCost,
            averageCost: Math.floor(newTotalCost / newWallet),
          },
        },
        log: [
          `${dayStamp(state)} Bought ${amount} ${
            asset.name
          } at $${numberWithCommas(asset.price)} for $${numberWithCommas(
            totalCost,
          )}`,
          ...state.log,
        ],
      });
    }

    case 'SELL_ASSET': {
      const { assetKey, amount: requested } = action.payload;
      const asset = state.assets[assetKey];
      if (!asset || asset.wallet <= 0) return state;

      const amount = Math.min(requested ?? asset.wallet, asset.wallet);
      if (amount <= 0) return state;

      const proceeds = amount * asset.price;
      const remaining = asset.wallet - amount;
      const tradeProfit = proceeds - amount * asset.averageCost;

      return updatePeakNetWorth({
        ...state,
        cash: state.cash + proceeds,
        stats: {
          ...state.stats,
          totalTrades: state.stats.totalTrades + 1,
          bestTradeProfit: Math.max(
            state.stats.bestTradeProfit,
            tradeProfit,
          ),
        },
        wallet: {
          ...state.wallet,
          amount: state.wallet.amount - amount,
        },
        assets: {
          ...state.assets,
          [assetKey]: {
            ...asset,
            wallet: remaining,
            totalCost:
              remaining === 0
                ? 0
                : asset.totalCost - amount * asset.averageCost,
            averageCost: remaining === 0 ? 0 : asset.averageCost,
          },
        },
        log: [
          `${dayStamp(state)} Sold ${amount} ${
            asset.name
          } at $${numberWithCommas(asset.price)} for $${numberWithCommas(
            proceeds,
          )}`,
          ...state.log,
        ],
      });
    }

    case 'PAY_DEBT': {
      if (state.debt === 0 || state.cash < state.debt) return state;
      return {
        ...state,
        cash: state.cash - state.debt,
        debt: 0,
        log: [
          `${dayStamp(state)} You have paid off your $${numberWithCommas(
            state.debt,
          )} debt! 🙌`,
          ...state.log,
        ],
      };
    }

    case 'EXPAND_WALLET': {
      if (state.cash < state.wallet.expansionCost) return state;
      const nextCapacity = state.wallet.capacity * 2;
      const nextCost = state.wallet.expansionCost * 2;
      return {
        ...state,
        cash: state.cash - state.wallet.expansionCost,
        wallet: {
          ...state.wallet,
          level: state.wallet.level + 1,
          capacity: nextCapacity,
          expansionCost: nextCost,
        },
        log: [
          `${dayStamp(state)} Wallet upgraded to Level ${
            state.wallet.level + 1
          }: capacity ${nextCapacity}.`,
          `Next upgrade: $${numberWithCommas(nextCost)} → ${
            nextCapacity * 2
          } capacity.`,
          ...state.log,
        ],
      };
    }

    default:
      return state;
  }
};
