import { Dispatch } from "react"
import { State } from "../lib/types"
import { calculateMaxShares, numberWithCommas } from "../helpers/utils"
import { AlertMessages, showAlert } from "../helpers/alerts"

export const handleBuy = (e, state: State, dispatch: Dispatch<any>) => {
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
export const handleSell = (e, state: State, dispatch: Dispatch<any>) => {
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
