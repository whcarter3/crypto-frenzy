import { Action, State } from "../lib/types"
import { addTimestamp } from "../helpers/utils"

export const initialState: State = {
  days: 30,
  currentDay: 0,
  debt: 3000,
  cash: 2000,
  interestRate: 0.2,
  log: ["- Click Advance Day to start."],
  highScore: null,
  modalOpen: true,
  mode: "Normal",
  lowRangePriceChance: 5,
  highRangePriceChance: 94,
  wallet: {
    amount: 0,
    capacity: 100,
    increase: 100,
    expansionCost: 50000,
    percentIncrease: 0.25,
  },
  assets: {
    bitcoin: {
      name: "Bitcoin",
      symbol: "BTC",
      wallet: 0,
      averageCost: 0,
      totalCost: 0,
      active: true,
      range: {
        low: [3500, 4550],
        mid: [9000, 65000],
        high: [105000, 125000],
        moon: [300000, 700000],
      },
      price: 0,
    },
    ethereum: {
      name: "Ethereum",
      symbol: "ETH",
      wallet: 0,
      averageCost: 0,
      totalCost: 0,
      active: true,
      range: {
        low: [175, 350],
        mid: [700, 4800],
        high: [10000, 12500],
        moon: [45000, 99999],
      },
      price: 0,
    },
    litecoin: {
      name: "Litecoin",
      symbol: "LTC",
      wallet: 0,
      averageCost: 0,
      totalCost: 0,
      active: true,
      range: {
        low: [20, 45],
        mid: [90, 630],
        high: [1200, 1500],
        moon: [4500, 8500],
      },
      price: 0,
    },
    solana: {
      name: "Solana",
      symbol: "SOL",
      wallet: 0,
      averageCost: 0,
      totalCost: 0,
      active: true,
      range: {
        low: [1, 5],
        mid: [20, 110],
        high: [200, 580],
        moon: [1000, 3000],
      },
      price: 0,
    },
    cardano: {
      name: "Cardano",
      symbol: "ADA",
      wallet: 0,
      averageCost: 0,
      totalCost: 0,
      active: false,
      range: {
        low: [1, 3],
        mid: [5, 25],
        high: [35, 75],
        moon: [150, 250],
      },
      price: 0,
    },
  },
}

/**
 * The reducer function for updating the game state based on dispatched actions.
 * @param {State} state - The current game state.
 * @param {Action} action - The dispatched action.
 * @returns {State} The updated game state.
 */
export const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "INIT":
      const savedHighScore = localStorage.getItem("highScore")
      return {
        ...initialState,
        highScore: savedHighScore ? parseInt(savedHighScore) : null,
      }
    case "SET_EASY_MODE":
      const savedHighScoreEasy = localStorage.getItem("highScoreEasy")
      return {
        ...initialState,
        highScore: savedHighScoreEasy ? parseInt(savedHighScoreEasy) : null,
        days: 60,
        interestRate: 0.1,
        debt: 2000,
        cash: 1500,
        lowRangePriceChance: 7,
        highRangePriceChance: 92,
        wallet: {
          ...state.wallet,
          capacity: 200,
          expansionCost: 25000,
          increase: 200,
          percentIncrease: 0.15,
        },
      }
    case "SET_HARD_MODE":
      const savedHighScoreHard = localStorage.getItem("highScoreHard")
      return {
        ...initialState,
        highScore: savedHighScoreHard ? parseInt(savedHighScoreHard) : null,
        days: 20,
        interestRate: 0.3,
        debt: 4000,
        cash: 2000,
        lowRangePriceChance: 3,
        highRangePriceChance: 96,
        wallet: {
          ...state.wallet,
          capacity: 50,
          expansionCost: 75000,
          increase: 50,
          percentIncrease: 0.35,
        },
      }
    case "ADVANCE_DAY":
      return { ...state, currentDay: state.currentDay + 1 }
    case "EXPAND_WALLET":
      return {
        ...state,
        cash: state.cash - state.wallet.expansionCost,
        wallet: {
          ...state.wallet,
          capacity: state.wallet.capacity + state.wallet.increase,
          expansionCost: Math.floor(
            state.wallet.expansionCost +
              state.wallet.expansionCost * state.wallet.percentIncrease
          ),
        },
      }
    case "SET_ASSET_PRICE":
      const { setAssetName, setAssetPrice } = action.payload
      return {
        ...state,
        assets: {
          ...state.assets,
          [setAssetName]: {
            ...state.assets[setAssetName],
            price: setAssetPrice,
          },
        },
      }
    case "BUY_ASSET":
      const { buyAssetName, buyAmount, buyTotalCost, buyLogMessage } =
        action.payload
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
            totalCost: state.assets[buyAssetName].totalCost + buyTotalCost,
          },
        },
        log: [addTimestamp(buyLogMessage), ...state.log],
      }
    case "SELL_ASSET":
      const { sellAssetName, sellAmount, sellTotalCost, sellLogMessage } =
        action.payload
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
            wallet: state.assets[sellAssetName].wallet - sellAmount,
            totalCost: 0,
            averageCost: 0,
          },
        },
        log: [addTimestamp(sellLogMessage), ...state.log],
      }
    case "SET_AVG_COST":
      const { avgCostAssetName } = action.payload
      return {
        ...state,
        assets: {
          ...state.assets,
          [avgCostAssetName]: {
            ...state.assets[avgCostAssetName],
            averageCost: Math.floor(
              state.assets[avgCostAssetName].totalCost /
                state.assets[avgCostAssetName].wallet
            ),
          },
        },
      }
    case "SET_LOG":
      return {
        ...state,
        log: [...action.payload.map(addTimestamp), ...state.log],
      }
    case "SET_HIGH_SCORE":
      localStorage.setItem("highScore", state.cash.toString())
      return { ...state, highScore: action.payload }
    case "PAY_DEBT":
      return {
        ...state,
        cash: state.cash - state.debt,
        debt: 0,
      }
    case "INCREASE_DEBT":
      return {
        ...state,
        debt: Math.floor(state.debt + state.debt * state.interestRate),
      }
    case "TOGGLE_MODAL":
      return {
        ...state,
        modalOpen: !state.modalOpen,
      }
    case "CHANGE_MODE":
      return {
        ...state,
        mode: action.payload,
      }
    default:
      console.log("No action type found")
      return state
  }
}
