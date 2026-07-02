import { State, Wallet } from '../types';

export type ModeConfig = {
  days: number;
  cash: number;
  debt: number;
  interestRate: number;
  lowRangePriceChance: number;
  highRangePriceChance: number;
  wallet: Omit<Wallet, 'amount'>;
};

/**
 * Per-difficulty run settings, applied by START_RUN. Numbers match the
 * pre-refactor SET_EASY_MODE / SET_HARD_MODE / SET_TEST_MODE cases.
 */
export const modeConfigs: Record<State['mode'], ModeConfig> = {
  Easy: {
    days: 60,
    cash: 1500,
    debt: 2000,
    interestRate: 0.1,
    lowRangePriceChance: 7,
    highRangePriceChance: 92,
    wallet: { capacity: 200, level: 1, expansionCost: 25000 },
  },
  Normal: {
    days: 31,
    cash: 2000,
    debt: 2000,
    interestRate: 0.2,
    lowRangePriceChance: 5,
    highRangePriceChance: 94,
    wallet: { capacity: 100, level: 0, expansionCost: 50000 },
  },
  Hard: {
    days: 20,
    cash: 2000,
    debt: 4000,
    interestRate: 0.3,
    lowRangePriceChance: 3,
    highRangePriceChance: 96,
    wallet: { capacity: 50, level: 0, expansionCost: 75000 },
  },
  Test: {
    days: 31,
    cash: 1000000,
    debt: 2000,
    interestRate: 0.2,
    lowRangePriceChance: 5,
    highRangePriceChance: 94,
    wallet: { capacity: 100, level: 0, expansionCost: 50000 },
  },
};
