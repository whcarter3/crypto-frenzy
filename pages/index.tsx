import { useReducer } from "react"
import Head from "next/head"
import config from "../config/config"
import { AlertMessages, showAlert } from "../helpers/alerts"
import {
  calculateMaxShares,
  numberWithCommas,
  addToLog,
} from "../helpers/utils"
import Table from "../components/Table"
import Actions from "../components/Actions"
import Header from "../components/Header"
import Log from "../components/Log"
import { randomizePrices, randomizePrice } from "../lib/prices"
import { State } from "../lib/types"

export default function Home() {
  const initialState: State = {
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

  const reducer = (state: State, action) => {
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

  const [state, dispatch] = useReducer(reducer, initialState)

  //ADVANCE DAY LOGIC ===================================
  const advanceDay = () => {
    //warning before last day
    if (state.currentDay === config.days - 1) {
      showAlert(AlertMessages.LAST_DAY)
    }
    //end of game -- alert score -- set high score -- restart
    if (state.currentDay >= config.days) {
      alert(
        `This round has been completed. You amassed $${numberWithCommas(
          state.cash - state.debt
        )}! Try again to beat your high score! 🤑`
      )
      if (state.cash > state.highScore || state.highScore === null) {
        dispatch({ type: "SET_HIGH_SCORE", payload: state.cash })
      }
      dispatch({ type: "INIT" })
    } else {
      if (state.currentDay === 0) {
        //sets initial prices to randomized value from mid range
        dispatch({
          type: "SET_LOG",
          payload: `======== Start of Game =========`,
        })
        dispatch({
          type: "SET_LOG",
          payload: `You borrowed $${numberWithCommas(config.cash)} at ${
            config.interestRate * 100
          }% daily interest`,
        })
        dispatch({
          type: "SET_LOG",
          payload: `You have ${config.days} days to make as much money as you can! 💎🙌`,
        })
        dispatch({ type: "RANDOMIZE_INITIAL_PRICES" })
      } else {
        dispatch({
          type: "SET_LOG",
          payload: `========= End of Day ${state.currentDay} =========`,
        })

        randomizePrices(dispatch)

        dispatch({
          type: "INCREASE_DEBT",
        })
      }
      //increase day
      dispatch({ type: "ADVANCE_DAY" })
    }
  }

  //BUY LOGIC ===============================
  const handleBuy = (e) => {
    //error checks =====
    if (state.currentDay === 0) {
      showAlert(AlertMessages.NEED_START)
      return
    }
    if (state.walletAmount >= state.walletCapacity) {
      showAlert(AlertMessages.NEED_WALLET)
      return
    }
    // =================
    let amt, logMsg, assetPrice, assetWallet, walletActionType
    switch (e.target.id) {
      case "bitcoinBuy":
        assetPrice = state.bitcoinPrice
        assetWallet = state.bitcoinWallet
        walletActionType = "SET_BITCOIN_WALLET"
        amt = calculateMaxShares(
          assetPrice,
          state.walletAmount,
          state.walletCapacity,
          state.cash
        )
        logMsg = `You have bought ${amt} Bitcoin at $${numberWithCommas(
          assetPrice
        )} for $${numberWithCommas(amt * assetPrice)}`
        break
      case "ethereumBuy":
        assetPrice = state.ethereumPrice
        assetWallet = state.ethereumWallet
        walletActionType = "SET_ETHEREUM_WALLET"
        amt = calculateMaxShares(
          assetPrice,
          state.walletAmount,
          state.walletCapacity,
          state.cash
        )
        logMsg = `You have bought ${amt} Ethereum at $${numberWithCommas(
          assetPrice
        )} for $${numberWithCommas(amt * assetPrice)}`
        break
      case "litecoinBuy":
        assetPrice = state.litecoinPrice
        assetWallet = state.litecoinWallet
        walletActionType = "SET_LITECOIN_WALLET"
        amt = calculateMaxShares(
          assetPrice,
          state.walletAmount,
          state.walletCapacity,
          state.cash
        )
        logMsg = ` You have bought ${amt} Litecoin at $${numberWithCommas(
          assetPrice
        )} for $${numberWithCommas(amt * assetPrice)}`
        break
      case "solanaBuy":
        assetPrice = state.solanaPrice
        assetWallet = state.solanaWallet
        walletActionType = "SET_SOLANA_WALLET"
        amt = calculateMaxShares(
          assetPrice,
          state.walletAmount,
          state.walletCapacity,
          state.cash
        )
        logMsg = `You have bought ${amt} Solana at $${numberWithCommas(
          assetPrice
        )} for $${numberWithCommas(amt * assetPrice)}`
        break
      default:
        alert("You have bought something you can't. What the heck?!")
        break
    }

    if (assetPrice > state.cash) {
      showAlert(AlertMessages.NEED_CASH)
    } else {
      dispatch({ type: "SET_CASH", payload: state.cash - amt * assetPrice })
      dispatch({ type: walletActionType, payload: assetWallet + amt })
      dispatch({
        type: "SET_WALLET_AMOUNT",
        payload: state.walletAmount + amt,
      })
      dispatch({ type: "SET_LOG", payload: logMsg })
    }
  }

  //SELL LOGIC ========================================================
  const handleSell = (e) => {
    if (state.currentDay === 0) {
      showAlert(AlertMessages.NEED_START)
      return
    }

    let salePrice, logMsg, assetPrice, assetWallet, walletActionType
    switch (e.target.id) {
      case "bitcoinSell":
        assetPrice = state.bitcoinPrice
        assetWallet = state.bitcoinWallet
        walletActionType = "SET_BITCOIN_WALLET"
        salePrice = state.bitcoinPrice * state.bitcoinWallet
        logMsg = `You have sold ${
          state.bitcoinWallet
        } Bitcoin at $${numberWithCommas(
          state.bitcoinPrice
        )} for $${numberWithCommas(salePrice)}`
        break
      case "ethereumSell":
        assetPrice = state.ethereumPrice
        assetWallet = state.ethereumWallet
        walletActionType = "SET_ETHEREUM_WALLET"
        salePrice = state.ethereumPrice * state.ethereumWallet
        logMsg = `You have sold ${
          state.ethereumWallet
        } Ethereum at $${numberWithCommas(
          state.ethereumPrice
        )} for $${numberWithCommas(salePrice)}`
        break
      case "litecoinSell":
        assetPrice = state.litecoinPrice
        assetWallet = state.litecoinWallet
        walletActionType = "SET_LITECOIN_WALLET"
        salePrice = state.litecoinPrice * state.litecoinWallet
        logMsg = `You have sold ${
          state.litecoinWallet
        } Litecoin at $${numberWithCommas(
          state.litecoinPrice
        )} for $${numberWithCommas(salePrice)}`
        break
      case "solanaSell":
        assetPrice = state.solanaPrice
        assetWallet = state.solanaWallet
        walletActionType = "SET_SOLANA_WALLET"
        salePrice = state.solanaPrice * state.solanaWallet
        logMsg = `You have sold ${
          state.solanaWallet
        } Solana at $${numberWithCommas(
          state.solanaPrice
        )} for $${numberWithCommas(salePrice)}`
        break
      default:
        alert("somehow you sold something you don't have")
        break
    }

    if (assetWallet === 0) {
      showAlert(AlertMessages.NEED_ASSET)
    } else {
      dispatch({ type: "SET_CASH", payload: state.cash + salePrice })
      dispatch({
        type: "SET_WALLET_AMOUNT",
        payload: state.walletAmount - assetWallet,
      })
      dispatch({ type: walletActionType, payload: 0 })
      dispatch({ type: "SET_LOG", payload: logMsg })
    }
  }

  //PRESENTATION COMPONENTS =============================
  return (
    <div className="container mx-auto mt-5">
      <Head>
        <title>Crypto Frenzy</title>
        <meta name="description" content="A crypto buying and selling game." />
        <link rel="icon" href="/favicon1.ico" />
      </Head>

      <main className="prose px-5">
        <Header state={state} />

        <Table handleBuy={handleBuy} handleSell={handleSell} state={state} />

        <Actions
          advanceDay={advanceDay}
          init={() => dispatch({ type: "INIT" })}
          dispatch={dispatch}
          state={state}
        />

        <Log log={state.log} />
      </main>
    </div>
  )
}
