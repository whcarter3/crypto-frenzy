import { useReducer } from "react"
import Head from "next/head"
import config from "../config/config"
import { AlertMessages, showAlert } from "../helpers/alerts"
import {
  calculateMaxShares,
  numberWithCommas,
  randomizePrice,
  currentTime,
  addToLog,
} from "../helpers/utils"
import Table from "../components/Table"
import Actions from "../components/Actions"
import Header from "../components/Header"
import Log from "../components/Log"

interface State {
  bitcoinPrice: number
  ethereumPrice: number
  litecoinPrice: number
  solanaPrice: number
  currentDay: number
  cash: number
  walletCapacity: number
  walletAmount: number
  bitcoinWallet: number
  ethereumWallet: number
  litecoinWallet: number
  solanaWallet: number
  log: string[]
  highScore: number
  walletExpansionCost: number
  debt: number
}

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
    highScore: 0,
    log: ["- Click Advance Day to start."],
    walletExpansionCost: config.wallet.cost,
    debt: config.debt,
  }

  const reducer = (state: State, action) => {
    switch (action.type) {
      case "INIT":
        return { ...initialState, highScore: state.highScore }
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
      case "SET_WALLET_CAPACITY":
        return { ...state, walletCapacity: action.payload }
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
        return { ...state, highScore: action.payload }
      case "SET_WALLET_EXPANSION_COST":
        return { ...state, walletExpansionCost: action.payload }
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
        )}! Click to start a new game.`
      )
      if (state.cash > state.highScore) {
        console.log("high score set")
        dispatch({ type: "SET_HIGH_SCORE", payload: state.cash })
      }
      dispatch({ type: "INIT" })
    } else {
      if (state.currentDay === 0) {
        //sets initial prices to randomized value from mid range
        dispatch({
          type: "SET_LOG",
          payload: addToLog(`======== Start of Game =========`),
        })
        dispatch({
          type: "SET_LOG",
          payload: addToLog(
            `- You borrowed $${numberWithCommas(config.cash)} at ${
              config.interestRate * 100
            }% daily interest`
          ),
        })
        dispatch({
          type: "SET_LOG",
          payload: `- You have ${config.days} days to make as much money as you can! 💎🙌`,
        })
        dispatch({ type: "RANDOMIZE_INITIAL_PRICES" })
      } else {
        //randomizes prices with chance to hit high/low range
        dispatch({
          type: "SET_LOG",
          payload: `========= End of Day ${state.currentDay} =========`,
        })
        for (const assetKey in config.assets) {
          const asset = config.assets[assetKey]
          if (asset.assetName === "Solana") {
            randomizeAssetPrice(asset, 10, 97)
          }
          randomizeAssetPrice(asset, 2, 97)
        }
        //increase date based on daily %
        dispatch({
          type: "INCREASE_DEBT",
        })
      }
      //increase day
      dispatch({ type: "ADVANCE_DAY" })
    }
  }

  //RANDOMIZE PRICE LOGIC =====================================
  //bell curve chance to hit low/mid/high range
  const randomizeAssetPrice = (
    asset,
    lowRangeThreshHold,
    highRangeThreshHold
  ) => {
    let coinFlip = Math.floor(Math.random() * 100)

    if (coinFlip < lowRangeThreshHold) {
      dispatch({
        type: "SET_LOG",
        payload: `🐋 A whale has dumped ${asset.assetName} and the price has plummeted!`,
      })
      dispatch({
        type: `SET_${asset.assetName.toUpperCase()}_PRICE`,
        payload: randomizePrice(asset.range.low[0], asset.range.low[1]),
      })
    } else if (
      coinFlip >= lowRangeThreshHold &&
      coinFlip < highRangeThreshHold
    ) {
      dispatch({
        type: `SET_${asset.assetName.toUpperCase()}_PRICE`,
        payload: randomizePrice(asset.range.mid[0], asset.range.mid[1]),
      })
    } else {
      dispatch({
        type: "SET_LOG",
        payload: `🚀🌕 ${asset.assetName} is going to the moon!`,
      })
      dispatch({
        type: `SET_${asset.assetName.toUpperCase()}_PRICE`,
        payload: randomizePrice(asset.range.high[0], asset.range.high[1]),
      })
    }
  }

  //WALLET EXPANSION LOGIC ====================
  const increaseWalletCapacity = () => {
    //error checks =====
    if (state.currentDay == 0) {
      showAlert(AlertMessages.NEED_START)
      return
    }
    if (state.cash < state.walletExpansionCost) {
      alert("You do not have enough cash to expand your wallet")
      return
    }
    // =================
    dispatch({
      type: "SET_WALLET_CAPACITY",
      payload: state.walletCapacity + config.wallet.increase,
    })
    dispatch({
      type: "SET_CASH",
      payload: state.cash - state.walletExpansionCost,
    })
    //increase wallet expansion cost by 25% after each purchase
    dispatch({
      type: "SET_WALLET_EXPANSION_COST",
      payload: Math.floor(
        state.walletExpansionCost +
          state.walletExpansionCost * config.wallet.percentIncreace
      ),
    })
    dispatch({
      type: "SET_LOG",
      payload: `You have increased your wallet capacity to ${state.walletCapacity}`,
    })
    dispatch({
      type: "SET_LOG",
      payload: `Wallet Expansion cost has increased in price by 25% to ${state.walletExpansionCost}`,
    })
  }

  const payDebt = () => {
    //error checks =====
    if (state.currentDay == 0) {
      showAlert(AlertMessages.NEED_START)
      return
    }
    if (state.debt === 0) {
      showAlert(AlertMessages.NEED_DEBT)
      return
    }
    if (state.cash < state.debt) {
      showAlert(AlertMessages.NEED_DEBT_CASH)
      return
    }
    // =================
    dispatch({
      type: "SET_LOG",
      payload: `You have paid off your $${numberWithCommas(
        state.debt
      )} debt! 🙌`,
    })
    dispatch({ type: "SET_CASH", payload: state.cash - state.debt })
    dispatch({ type: "PAY_DEBT" })
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
      dispatch(logMsg)
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
        <Header
          currentDay={state.currentDay}
          cash={state.cash}
          debt={state.debt}
          walletAmount={state.walletAmount}
          walletCapacity={state.walletCapacity}
          highScore={state.highScore}
        />

        <Table
          handleBuy={handleBuy}
          handleSell={handleSell}
          bitcoinPrice={state.bitcoinPrice}
          bitcoinWallet={state.bitcoinWallet}
          ethereumPrice={state.ethereumPrice}
          ethereumWallet={state.ethereumWallet}
          litecoinPrice={state.litecoinPrice}
          litecoinWallet={state.litecoinWallet}
          solanaPrice={state.solanaPrice}
          solanaWallet={state.solanaWallet}
          cash={state.cash}
        />

        <Actions
          increaseWalletCapacity={increaseWalletCapacity}
          walletExpansionCost={state.walletExpansionCost}
          debt={state.debt}
          advanceDay={advanceDay}
          init={() => dispatch({ type: "INIT" })}
          currentDay={state.currentDay}
          payDebt={payDebt}
          cash={state.cash}
        />

        <Log log={state.log} />
      </main>
    </div>
  )
}
