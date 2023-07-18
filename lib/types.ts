import { type } from "os"

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
 * @typedef {Object} Wallet
 * @property {number} amount - The amount of cash in the player's wallet.
 * @property {number} capacity - The maximum capacity of the player's wallet.
 * @property {number} increase - The amount by which the player's wallet capacity increases.
 * @property {number} expansionCost - The cost to expand the player's wallet capacity.
 * @property {number} percentIncrease - The percentage increase in the player's wallet capacity.
 */
export type Wallet = {
  amount: number
  capacity: number
  increase: number
  expansionCost: number
  percentIncrease: number
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
 * @property {Object.<string, Asset>} assets - The assets in the game, keyed by symbol.
 * @property {Wallet} wallet - The player's wallet.
 */
export type State = {
  days: number
  currentDay: number
  cash: number
  debt: number
  interestRate: number
  log: string[]
  highScore?: number | null
  assets: {
    [key: string]: Asset
  }
  wallet: Wallet
}

/**
 * Represents an action that can be dispatched to update the game state.
 * @typedef {Object} Action
 * @property {string} type - The type of the action.
 * @property {Object} payload - The payload of the action.
 * @property {string} payload.buyAssetName - The name of the asset being bought.
 * @property {number} payload.buyAmount - The amount of the asset being bought.
 * @property {number} payload.buyTotalCost - The total cost of the asset being bought.
 * @property {string} payload.buyLogMessage - The log message for the asset being bought.
 * @property {string} payload.sellAssetName - The name of the asset being sold.
 * @property {number} payload.sellAmount - The amount of the asset being sold.
 * @property {number} payload.sellTotalCost - The total cost of the asset being sold.
 * @property {string} payload.sellLogMessage - The log message for the asset being sold.
 * @property {string} payload.setAssetName - The name of the asset being updated.
 * @property {number} payload.setAssetPrice - The new price of the asset being updated.
 * @property {string} payload.avgCostAssetName - The name of the asset for which to set the average cost.
 * @property {number} payload.highScore - The new high score.
 */
export type Action =
  | {
      type: "INIT"
    }
  | {
      type: "SET_EASY_MODE"
    }
  | {
      type: "ADVANCE_DAY"
    }
  | {
      type: "EXPAND_WALLET"
    }
  | {
      type: "SET_ASSET_PRICE"
      payload: {
        setAssetName: string
        setAssetPrice: number
      }
    }
  | {
      type: "BUY_ASSET"
      payload: {
        buyAssetName: string
        buyAmount: number
        buyTotalCost: number
        buyLogMessage: string
      }
    }
  | {
      type: "SELL_ASSET"
      payload: {
        sellAssetName: string
        sellAmount: number
        sellTotalCost: number
        sellLogMessage: string
      }
    }
  | {
      type: "SET_AVG_COST"
      payload: {
        avgCostAssetName: string
      }
    }
  | {
      type: "SET_LOG"
      payload: string[]
    }
  | {
      type: "SET_HIGH_SCORE"
      payload: number
    }
  | {
      type: "PAY_DEBT"
    }
  | {
      type: "INCREASE_DEBT"
    }
