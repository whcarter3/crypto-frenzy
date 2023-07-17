import { State } from "../lib/types"
import { addToLog } from "../helpers/utils"

export const initialState: State = {
  days: 30,
  currentDay: 0,
  cash: 2000,
  debt: 2000,
  interestRate: 0.2,
  log: ["- Click Advance Day to start."],
  highScore: null,
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
      active: true,
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

export const reducer = (
  state: State,
  action: { type: string; payload?: any }
) => {
  switch (action.type) {
    case "INIT":
      const savedHighScore = localStorage.getItem("highScore")
      return {
        ...initialState,
        highScore: savedHighScore ? parseInt(savedHighScore) : null,
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
    case "SET_CASH":
      return { ...state, cash: action.payload }
    case "SET_WALLET_AMOUNT":
      return { ...state, wallet: { ...state.wallet, amount: action.payload } }
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
          },
        },
        log: [addToLog(buyLogMessage), ...state.log],
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
          },
        },
        log: [addToLog(sellLogMessage), ...state.log],
      }
    case "SET_LOG":
      return { ...state, log: [addToLog(action.payload), ...state.log] }
    case "SET_HIGH_SCORE":
      localStorage.setItem("highScore", state.cash.toString())
      return { ...state, highScore: action.payload }
    case "PAY_DEBT":
      return { ...state, debt: 0 }
    case "INCREASE_DEBT":
      return {
        ...state,
        debt: Math.floor(state.debt + state.debt * state.interestRate),
      }
    default:
      return state
  }
}
