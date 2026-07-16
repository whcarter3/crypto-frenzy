import { describe, expect, it } from 'vitest';
import { reducer } from './reducer';
import { initialState } from './state/initialState';
import { modeConfigs } from './state/modes';
import { State } from './types';

const startRun = (
  mode: State['mode'] = 'Normal',
  seed = 42,
  highScore: number | null = null,
): State =>
  reducer(initialState, {
    type: 'START_RUN',
    payload: { mode, seed, highScore },
  });

const advance = (state: State): State =>
  reducer(state, { type: 'ADVANCE_DAY' });

const advanceTimes = (state: State, times: number): State => {
  let next = state;
  for (let i = 0; i < times; i++) next = advance(next);
  return next;
};

/** Builds a mid-run state with explicit overrides for targeted cases. */
const craft = (overrides: Partial<State>): State => ({
  ...startRun(),
  ...overrides,
});

describe('START_RUN', () => {
  it('applies the mode config and closes the modal', () => {
    for (const mode of ['Easy', 'Normal', 'Hard', 'Test'] as const) {
      const config = modeConfigs[mode];
      const state = startRun(mode);
      expect(state.mode).toBe(mode);
      expect(state.cash).toBe(config.cash);
      expect(state.debt).toBe(config.debt);
      expect(state.days).toBe(config.days);
      expect(state.interestRate).toBe(config.interestRate);
      expect(state.wallet).toEqual({ amount: 0, ...config.wallet });
      expect(state.modalOpen).toBe(false);
      expect(state.gameOver).toBeNull();
      expect(state.currentDay).toBe(1);
    }
  });

  it('stores the seed and loads the given high score', () => {
    const state = startRun('Normal', 1234, 9999);
    expect(state.seed).toBe(1234);
    expect(state.highScore).toBe(9999);
    // the day-1 price roll consumes rng steps, so rngState has advanced
    expect(state.rngState).not.toBe(1234);
  });

  it('stores huge seeds in their wrapped form so the display matches the rng', () => {
    const state = startRun('Normal', 2 ** 32 + 7);
    expect(state.seed).toBe(7);
  });

  it('opens day 1 with real prices — no dead pre-game state', () => {
    const state = startRun();
    for (const asset of Object.values(state.assets)) {
      expect(asset.price).toBeGreaterThan(0);
      expect(asset.price).toBeGreaterThanOrEqual(asset.range.low[0]);
      expect(asset.price).toBeLessThanOrEqual(asset.range.moon[1]);
      expect(asset.previousPrice).toBe(0); // nothing to delta against yet
    }
  });

  it('rolls identical day-1 markets from identical seeds', () => {
    expect(startRun('Normal', 777).assets).toEqual(
      startRun('Normal', 777).assets,
    );
  });
});

describe('ADVANCE_DAY', () => {
  it('increments the day and compounds debt', () => {
    const state = advance(startRun());
    expect(state.currentDay).toBe(2);
    expect(state.debt).toBe(Math.floor(2000 + 2000 * 0.2)); // 2400
  });

  it('rolls prices for every active asset within its bands', () => {
    // Different seeds exercise different price bands
    for (let seed = 0; seed < 50; seed++) {
      const state = advance(startRun('Normal', seed));
      for (const asset of Object.values(state.assets)) {
        expect(asset.price).toBeGreaterThan(0);
        expect(asset.price).toBeGreaterThanOrEqual(asset.range.low[0]);
        expect(asset.price).toBeLessThanOrEqual(asset.range.moon[1]);
      }
    }
  });

  it("tracks yesterday's price for the day-over-day delta", () => {
    const day1 = startRun();
    const day2 = advance(day1);
    for (const key of Object.keys(day2.assets)) {
      expect(day2.assets[key].previousPrice).toBe(day1.assets[key].price);
    }
  });

  it('is deterministic: same seed, same run', () => {
    const runA = advanceTimes(startRun('Normal', 777), 10);
    const runB = advanceTimes(startRun('Normal', 777), 10);
    expect(runA).toEqual(runB);
  });

  it('is pure: advancing the same state twice gives the same result', () => {
    const state = advanceTimes(startRun(), 3);
    expect(advance(state)).toEqual(advance(state));
  });

  it('settles the run when the final day is reached', () => {
    // Hard mode: 20 days, so the 19th advance settles the run
    const state = advanceTimes(startRun('Hard'), 19);
    expect(state.gameOver).not.toBeNull();
    expect(state.currentDay).toBe(20);
    expect(state.gameOver!.score).toBeLessThan(0); // unpaid compounding debt
    expect(state.gameOver!.newHighScore).toBe(false);
  });

  it('records a new high score when the run beats the record', () => {
    const nearEnd = craft({ currentDay: 30, cash: 5000, debt: 0 });
    const settled = advance(nearEnd);
    expect(settled.gameOver).toEqual({ score: 5000, newHighScore: true });
    expect(settled.highScore).toBe(5000);
  });

  it('does not beat an existing higher record', () => {
    const nearEnd = craft({
      currentDay: 30,
      cash: 5000,
      debt: 0,
      highScore: 6000,
    });
    const settled = advance(nearEnd);
    expect(settled.gameOver).toEqual({ score: 5000, newHighScore: false });
    expect(settled.highScore).toBe(6000);
  });

  it('never records high scores in Test mode', () => {
    const nearEnd = {
      ...startRun('Test'),
      currentDay: 30,
      cash: 5000000,
      debt: 0,
    };
    const settled = advance(nearEnd);
    expect(settled.gameOver!.newHighScore).toBe(false);
  });

  it('is a no-op after the run is over', () => {
    const settled = advanceTimes(startRun('Hard'), 19);
    expect(advance(settled)).toBe(settled);
  });
});

describe('BUY_ASSET', () => {
  it('buys the max affordable shares and sets the cost basis', () => {
    const state = advance(startRun());
    const price = state.assets.solana.price;
    const bought = reducer(state, {
      type: 'BUY_ASSET',
      payload: { assetKey: 'solana' },
    });
    const expectedAmount = Math.min(
      Math.floor(state.cash / price),
      state.wallet.capacity,
    );
    expect(bought.assets.solana.wallet).toBe(expectedAmount);
    expect(bought.assets.solana.averageCost).toBe(price);
    expect(bought.cash).toBe(state.cash - expectedAmount * price);
    expect(bought.wallet.amount).toBe(expectedAmount);
    expect(bought.stats.totalTrades).toBe(1);
  });

  it('clamps the purchase to remaining wallet capacity', () => {
    const base = advance(startRun());
    const state: State = {
      ...base,
      cash: 10_000_000,
      wallet: { ...base.wallet, amount: 95, capacity: 100 },
    };
    const bought = reducer(state, {
      type: 'BUY_ASSET',
      payload: { assetKey: 'solana' },
    });
    expect(bought.wallet.amount).toBe(100);
    expect(bought.assets.solana.wallet).toBe(5);
  });

  it('is a no-op for unknown assets or zero-price assets', () => {
    const state = startRun();
    expect(
      reducer(state, { type: 'BUY_ASSET', payload: { assetKey: 'nope' } }),
    ).toBe(state);
    const zeroPriced: State = {
      ...state,
      assets: {
        ...state.assets,
        solana: { ...state.assets.solana, price: 0 },
      },
    };
    expect(
      reducer(zeroPriced, {
        type: 'BUY_ASSET',
        payload: { assetKey: 'solana' },
      }),
    ).toBe(zeroPriced);
  });

  it('buys a specific amount when requested', () => {
    const state = advance(startRun());
    const price = state.assets.solana.price;
    const bought = reducer(state, {
      type: 'BUY_ASSET',
      payload: { assetKey: 'solana', amount: 2 },
    });
    expect(bought.assets.solana.wallet).toBe(2);
    expect(bought.cash).toBe(state.cash - 2 * price);
    expect(bought.wallet.amount).toBe(2);
  });

  it('clamps a requested amount to the max affordable', () => {
    const state = advance(startRun());
    const price = state.assets.solana.price;
    const maxShares = Math.min(
      Math.floor(state.cash / price),
      state.wallet.capacity,
    );
    const bought = reducer(state, {
      type: 'BUY_ASSET',
      payload: { assetKey: 'solana', amount: 999999 },
    });
    expect(bought.assets.solana.wallet).toBe(maxShares);
  });

  it('is a no-op for a zero or negative requested amount', () => {
    const state = advance(startRun());
    expect(
      reducer(state, {
        type: 'BUY_ASSET',
        payload: { assetKey: 'solana', amount: 0 },
      }),
    ).toBe(state);
    expect(
      reducer(state, {
        type: 'BUY_ASSET',
        payload: { assetKey: 'solana', amount: -5 },
      }),
    ).toBe(state);
  });
});

describe('SELL_ASSET', () => {
  const withPosition = (price: number): State => {
    const base = advance(startRun());
    return {
      ...base,
      cash: 0,
      wallet: { ...base.wallet, amount: 5 },
      assets: {
        ...base.assets,
        solana: {
          ...base.assets.solana,
          wallet: 5,
          averageCost: 10,
          totalCost: 50,
          price,
        },
      },
    };
  };

  it('sells the whole position by default and resets the cost basis', () => {
    const state = withPosition(20);
    const sold = reducer(state, {
      type: 'SELL_ASSET',
      payload: { assetKey: 'solana' },
    });
    expect(sold.cash).toBe(100);
    expect(sold.assets.solana.wallet).toBe(0);
    expect(sold.assets.solana.totalCost).toBe(0);
    expect(sold.assets.solana.averageCost).toBe(0);
    expect(sold.wallet.amount).toBe(0);
    expect(sold.stats.bestTradeProfit).toBe(50); // 100 - 5*10
  });

  it('supports partial sales, keeping the average cost', () => {
    const state = withPosition(20);
    const sold = reducer(state, {
      type: 'SELL_ASSET',
      payload: { assetKey: 'solana', amount: 2 },
    });
    expect(sold.cash).toBe(40);
    expect(sold.assets.solana.wallet).toBe(3);
    expect(sold.assets.solana.averageCost).toBe(10);
    expect(sold.assets.solana.totalCost).toBe(30);
    expect(sold.stats.bestTradeProfit).toBe(20); // 40 - 2*10
  });

  it('tracks peak net worth through profitable sales', () => {
    const state = { ...withPosition(100), debt: 0 };
    const sold = reducer(state, {
      type: 'SELL_ASSET',
      payload: { assetKey: 'solana' },
    });
    expect(sold.stats.peakNetWorth).toBe(500); // 5 shares * $100, debt-free
  });

  it('is a no-op with nothing to sell', () => {
    const state = advance(startRun());
    expect(
      reducer(state, { type: 'SELL_ASSET', payload: { assetKey: 'solana' } }),
    ).toBe(state);
  });
});

describe('PAY_DEBT', () => {
  it('pays the debt in full', () => {
    const state = craft({ cash: 3000, debt: 2000 });
    const paid = reducer(state, { type: 'PAY_DEBT' });
    expect(paid.cash).toBe(1000);
    expect(paid.debt).toBe(0);
  });

  it('is a no-op without enough cash or without debt', () => {
    const poor = craft({ cash: 1000, debt: 2000 });
    expect(reducer(poor, { type: 'PAY_DEBT' })).toBe(poor);
    const free = craft({ cash: 1000, debt: 0 });
    expect(reducer(free, { type: 'PAY_DEBT' })).toBe(free);
  });
});

describe('EXPAND_WALLET', () => {
  it('doubles capacity and the next cost', () => {
    const state = craft({ cash: 60000 });
    const expanded = reducer(state, { type: 'EXPAND_WALLET' });
    expect(expanded.cash).toBe(10000);
    expect(expanded.wallet.level).toBe(1);
    expect(expanded.wallet.capacity).toBe(200);
    expect(expanded.wallet.expansionCost).toBe(100000);
  });

  it('is a no-op when unaffordable', () => {
    const state = craft({ cash: 100 });
    expect(reducer(state, { type: 'EXPAND_WALLET' })).toBe(state);
  });
});

describe('INIT / CHANGE_MODE', () => {
  it('INIT resets the run but keeps the mode and given high score', () => {
    const midRun = advanceTimes(startRun('Hard'), 5);
    const reset = reducer(midRun, {
      type: 'INIT',
      payload: { highScore: 123 },
    });
    expect(reset).toEqual({
      ...initialState,
      mode: 'Hard',
      highScore: 123,
    });
    expect(reset.modalOpen).toBe(true);
  });

  it('CHANGE_MODE only switches the mode', () => {
    const state = reducer(initialState, {
      type: 'CHANGE_MODE',
      payload: 'Easy',
    });
    expect(state).toEqual({ ...initialState, mode: 'Easy' });
  });
});

describe('full-run replay', () => {
  it('an identical action log replays to an identical state', () => {
    const play = (): State => {
      let s = startRun('Normal', 20260702);
      s = advance(s);
      s = reducer(s, { type: 'BUY_ASSET', payload: { assetKey: 'bitcoin' } });
      s = advanceTimes(s, 3);
      s = reducer(s, { type: 'SELL_ASSET', payload: { assetKey: 'bitcoin' } });
      s = reducer(s, { type: 'PAY_DEBT' });
      s = advanceTimes(s, 26);
      return s;
    };
    const runA = play();
    const runB = play();
    expect(runA).toEqual(runB);
    expect(runA.gameOver).not.toBeNull();
  });
});
