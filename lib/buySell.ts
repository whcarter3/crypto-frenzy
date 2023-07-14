import { Dispatch } from "react"
import { State } from "../lib/types"
import { calculateMaxShares, numberWithCommas } from "../helpers/utils"
import { AlertMessages, showAlert } from "../helpers/alerts"

const buyAsset = (
  assetName: string,
  assetPrice: number,
  assetWallet: number,
  walletActionType: string,
  state: State,
  dispatch: Dispatch<any>
) => {
  const maxShares = calculateMaxShares(
    assetPrice,
    state.walletAmount,
    state.walletCapacity,
    state.cash
  )
  const totalCost = maxShares * assetPrice
  const logMsg = `You have bought ${maxShares} ${assetName} at $${numberWithCommas(
    assetPrice
  )} for $${numberWithCommas(totalCost)}`

  if (totalCost > state.cash) {
    showAlert(AlertMessages.NEED_CASH)
  } else {
    dispatch({ type: "SET_CASH", payload: state.cash - totalCost })
    dispatch({ type: walletActionType, payload: assetWallet + maxShares })
    dispatch({
      type: "SET_WALLET_AMOUNT",
      payload: state.walletAmount + maxShares,
    })
    dispatch({ type: "SET_LOG", payload: logMsg })
  }
}

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

  switch (e.target.id) {
    case "bitcoinBuy":
      buyAsset(
        "Bitcoin",
        state.bitcoinPrice,
        state.bitcoinWallet,
        "SET_BITCOIN_WALLET",
        state,
        dispatch
      )
      break
    case "ethereumBuy":
      buyAsset(
        "Ethereum",
        state.ethereumPrice,
        state.ethereumWallet,
        "SET_ETHEREUM_WALLET",
        state,
        dispatch
      )
      break
    case "litecoinBuy":
      buyAsset(
        "Litecoin",
        state.litecoinPrice,
        state.litecoinWallet,
        "SET_LITECOIN_WALLET",
        state,
        dispatch
      )
      break
    case "solanaBuy":
      buyAsset(
        "Solana",
        state.solanaPrice,
        state.solanaWallet,
        "SET_SOLANA_WALLET",
        state,
        dispatch
      )
      break
    default:
      alert("You have bought something you can't. What the heck?!")
      break
  }
}

const sellAsset = (
  assetName: string,
  assetPrice: number,
  assetWallet: number,
  walletActionType: string,
  state: State,
  dispatch: Dispatch<any>
) => {
  const salePrice = assetPrice * assetWallet
  const logMsg = `You have sold ${assetWallet} ${assetName} at $${numberWithCommas(
    assetPrice
  )} for $${numberWithCommas(salePrice)}`

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

export const handleSell = (e, state: State, dispatch: Dispatch<any>) => {
  if (state.currentDay === 0) {
    showAlert(AlertMessages.NEED_START)
    return
  }

  switch (e.target.id) {
    case "bitcoinSell":
      sellAsset(
        "Bitcoin",
        state.bitcoinPrice,
        state.bitcoinWallet,
        "SET_BITCOIN_WALLET",
        state,
        dispatch
      )
      break
    case "ethereumSell":
      sellAsset(
        "Ethereum",
        state.ethereumPrice,
        state.ethereumWallet,
        "SET_ETHEREUM_WALLET",
        state,
        dispatch
      )
      break
    case "litecoinSell":
      sellAsset(
        "Litecoin",
        state.litecoinPrice,
        state.litecoinWallet,
        "SET_LITECOIN_WALLET",
        state,
        dispatch
      )
      break
    case "solanaSell":
      sellAsset(
        "Solana",
        state.solanaPrice,
        state.solanaWallet,
        "SET_SOLANA_WALLET",
        state,
        dispatch
      )
      break
    default:
      alert("somehow you sold something you don't have")
      break
  }
}
