import { State } from "../lib/types"
import { config } from "../config/config"
import { randomizePrice } from "../lib/prices"
import { addToLog } from "../helpers/utils"

export const initialState: State = {
  bitcoinPrice: 0,
  ethereumPrice: 0,
  litecoinPrice: 0,
  solanaPrice: 0,
  currentDay: 0,
  cash: config.cash,
  walletCapacity: config.wallet.startingCapacity,
  walletAmount: 0,
  bitcoinWallet: 0,
  ethereumWallet: 0,
  litecoinWallet: 0,
  solanaWallet: 0,
  log: ["- Click Advance Day to start."],
  walletExpansionCost: config.wallet.cost,
  debt: config.debt,
  highScore: null,
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
    case "RANDOMIZE_INITIAL_PRICES":
      return {
        ...state,
        bitcoinPrice: randomizePrice(
          config.assets.bitcoin.range.mid[0],
          config.assets.bitcoin.range.mid[1]
        ),
        ethereumPrice: randomizePrice(
          config.assets.ethereum.range.mid[0],
          config.assets.ethereum.range.mid[1]
        ),
        litecoinPrice: randomizePrice(
          config.assets.litecoin.range.mid[0],
          config.assets.litecoin.range.mid[1]
        ),
        solanaPrice: randomizePrice(
          config.assets.solana.range.mid[0],
          config.assets.solana.range.mid[1]
        ),
      }
    case "EXPAND_WALLET":
      return {
        ...state,
        walletCapacity: state.walletCapacity + config.wallet.increase,
        cash: state.cash - state.walletExpansionCost,
        walletExpansionCost: Math.floor(
          state.walletExpansionCost +
            state.walletExpansionCost * config.wallet.percentIncrease
        ),
      }
    case "SET_BITCOIN_PRICE":
      return { ...state, bitcoinPrice: action.payload }
    case "SET_ETHEREUM_PRICE":
      return { ...state, ethereumPrice: action.payload }
    case "SET_LITECOIN_PRICE":
      return { ...state, litecoinPrice: action.payload }
    case "SET_SOLANA_PRICE":
      return { ...state, solanaPrice: action.payload }
    case "SET_CASH":
      return { ...state, cash: action.payload }
    case "SET_WALLET_AMOUNT":
      return { ...state, walletAmount: action.payload }
    case "SET_BITCOIN_WALLET":
      return { ...state, bitcoinWallet: action.payload }
    case "SET_ETHEREUM_WALLET":
      return { ...state, ethereumWallet: action.payload }
    case "SET_LITECOIN_WALLET":
      return { ...state, litecoinWallet: action.payload }
    case "SET_SOLANA_WALLET":
      return { ...state, solanaWallet: action.payload }
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
        debt: Math.floor(state.debt + state.debt * config.interestRate),
      }
    default:
      return state
  }
}
