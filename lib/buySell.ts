import { Dispatch } from "react"
import { State } from "../lib/types"
import { calculateMaxShares, numberWithCommas } from "../helpers/utils"
import { AlertMessages, showAlert } from "../helpers/alerts"

export const buyAsset = (
  assetName: string,
  assetPrice: number,
  state: State,
  dispatch: Dispatch<any>
) => {
  const buyAmount = calculateMaxShares(
    assetPrice,
    state.wallet.amount,
    state.wallet.capacity,
    state.cash
  )
  const totalCost = buyAmount * assetPrice
  const logMsg = `You have bought ${buyAmount} ${assetName} at $${numberWithCommas(
    assetPrice
  )} for $${numberWithCommas(totalCost)}`

  if (totalCost > state.cash) {
    showAlert(AlertMessages.NEED_CASH)
  } else {
    dispatch({
      type: "BUY_ASSET",
      payload: {
        buyAssetName: assetName,
        buyAmount: buyAmount,
        buyTotalCost: totalCost,
        buyLogMessage: logMsg,
      },
    })
  }
}

export const sellAsset = (
  assetName: string,
  assetPrice: number,
  assetWallet: number,
  dispatch: Dispatch<any>
) => {
  const salePrice = assetPrice * assetWallet
  const logMsg = `You have sold ${assetWallet} ${assetName} at $${numberWithCommas(
    assetPrice
  )} for $${numberWithCommas(salePrice)}`

  if (assetWallet === 0) {
    showAlert(AlertMessages.NEED_ASSET)
  } else {
    dispatch({
      type: "SELL_ASSET",
      payload: {
        sellAssetName: assetName,
        sellAmount: assetWallet,
        sellTotalCost: salePrice,
        sellLogMessage: logMsg,
      },
    })
  }
}
