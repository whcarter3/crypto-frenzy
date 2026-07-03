/**
 * Represents an asset in the game.
 * @typedef {Object} Asset
 * @property {string} name - The name of the asset.
 * @property {string} symbol - The symbol of the asset.
 * @property {number} wallet - The number of shares of the asset in the player's wallet.
 * @property {boolean} active - Whether the asset is currently active in the game.
 * @property {number} averageCost - The average cost of the asset.
 * @property {number} totalCost - The total cost of the asset.
 * @property {Object} range - The price range of the asset.
 * @property {number[]} range.low - The low price range of the asset.
 * @property {number[]} range.mid - The mid price range of the asset.
 * @property {number[]} range.high - The high price range of the asset.
 * @property {number[]} range.moon - The moon price range of the asset.
 * @property {number} price - The current price of the asset.
 */
export type Asset = {
  name: string
  symbol: string
  wallet: number
  active: boolean
  averageCost: number
  totalCost: number
  range: {
    low: number[]
    mid: number[]
    high: number[]
    moon: number[]
  }
  price: number
}

/**
 * Represents a player's wallet.
 * Each upgrade level doubles capacity and doubles the cost for the next upgrade.
 * @typedef {Object} Wallet
 * @property {number} amount - Current slots used (total asset positions).
 * @property {number} capacity - Maximum capacity (100 * 2^level).
 * @property {number} level - Upgrade level (0 = 100 capacity, 1 = 200, 2 = 400, …).
 * @property {number} expansionCost - Cost for next upgrade (50000 * 2^level).
 */
export type Wallet = {
  amount: number
  capacity: number
  level: number
  expansionCost: number
}

/**
 * Stats tracked over the course of a single run, shown on the game-over screen.
 * @typedef {Object} RunStats
 * @property {number} peakNetWorth - The highest net worth reached during the run.
 * @property {number} totalTrades - Total buys and sells made during the run.
 * @property {number} bestTradeProfit - The largest realized profit from a single sale.
 */
export type RunStats = {
  peakNetWorth: number
  totalTrades: number
  bestTradeProfit: number
}

/**
 * The outcome of a finished run. Null while a run is in progress.
 * @typedef {Object} GameOverSummary
 * @property {number} score - The final score (cash - debt).
 * @property {boolean} newHighScore - Whether the score beat the saved high score.
 */
export type GameOverSummary = {
  score: number
  newHighScore: boolean
}

/**
 * Represents the state of the game.
 * @typedef {Object} State
 * @property {number} days - The total number of days in the game.
 * @property {number} currentDay - The current day of the game.
 * @property {number} cash - The amount of cash the player has.
 * @property {number} debt - The amount of debt the player has.
 * @property {number} interestRate - The current interest rate on the player's debt.
 * @property {string[]} log - The log of events that have occurred in the game.
 * @property {number|null} highScore - The player's high score, if any.
 * @property {boolean} modalOpen - Whether the modal is open.
 * @property {GameOverSummary|null} gameOver - Summary of the finished run, or null mid-run.
 * @property {RunStats} stats - Stats tracked over the current run.
 * @property {Object.<string, Asset>} assets - The assets in the game, keyed by symbol.
 * @property {Wallet} wallet - The player's wallet.
 * @property {number} lowRangePriceChance - The chance of a low range price movement.
 * @property {number} highRangePriceChance - The chance of a high range price movement.
 * @property {"Easy"|"Hard"|"Normal"|"Test"} mode - The game mode.
 */
export type State = {
  days: number
  currentDay: number
  cash: number
  debt: number
  interestRate: number
  log: string[]
  highScore?: number | null
  modalOpen: boolean
  gameOver: GameOverSummary | null
  stats: RunStats
  /** Deterministic PRNG state — see lib/engine/rng.ts */
  rngState: number
  lowRangePriceChance: number
  highRangePriceChance: number
  mode: "Easy" | "Hard" | "Normal" | "Test"
  assets: {
    [key: string]: Asset
  }
  wallet: Wallet
}

/**
 * Player intents the engine understands. One action = one intent; the
 * reducer computes the full transition (prices, debt, logs, stats)
 * internally. Payloads carry values only the outside world knows
 * (which asset, the run seed, localStorage reads).
 */
export type Action =
  | {
      // Reset to a pre-run state (difficulty modal open), keeping mode.
      type: "INIT"
      payload?: {
        highScore: number | null
      }
    }
  | {
      // Highlight a difficulty in the modal.
      type: "CHANGE_MODE"
      payload: "Easy" | "Hard" | "Normal" | "Test"
    }
  | {
      // Begin a run: applies the mode config and seeds the RNG.
      type: "START_RUN"
      payload: {
        mode: "Easy" | "Hard" | "Normal" | "Test"
        seed: number
        highScore: number | null
      }
    }
  | {
      // Advance one day: rolls prices, fires events, compounds debt,
      // and settles the run (gameOver) when the final day is reached.
      type: "ADVANCE_DAY"
    }
  | {
      // Buy as many shares as cash and wallet capacity allow.
      // (amount-limited buys arrive with the Phase 1c trading UX)
      type: "BUY_ASSET"
      payload: {
        assetKey: string
      }
    }
  | {
      // Sell `amount` shares, or the whole position when omitted.
      type: "SELL_ASSET"
      payload: {
        assetKey: string
        amount?: number
      }
    }
  | {
      type: "PAY_DEBT"
    }
  | {
      type: "EXPAND_WALLET"
    }
