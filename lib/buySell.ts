import { Dispatch } from "react"
import { State, Action } from "../lib/types"
import { calculateMaxShares, numberWithCommas } from "../helpers/utils"

/**
 * Buys an asset and updates the game state.
 * @param {string} assetName - The name of the asset to buy.
 * @param {number} assetPrice - The price of the asset to buy.
 * @param {State} state - The current game state.
 * @param {Dispatch<Action>} dispatch - The dispatch function for updating the game state.
 */
export const buyAsset = (
  assetName: string,
  assetPrice: number,
  state: State,
  dispatch: Dispatch<Action>
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

  if (totalCost > state.cash) return

  dispatch({
    type: "BUY_ASSET",
    payload: {
      buyAssetName: assetName,
      buyAmount: buyAmount,
      buyTotalCost: totalCost,
      buyLogMessage: logMsg,
    },
  })
  dispatch({
    type: "SET_AVG_COST",
    payload: {
      avgCostAssetName: assetName,
    },
  })
}

/**
 * Sells an asset and updates the game state.
 * @param {string} assetName - The name of the asset to sell.
 * @param {number} assetPrice - The price of the asset to sell.
 * @param {number} assetWallet - The number of shares of the asset to sell.
 * @param {Dispatch<Action>} dispatch - The dispatch function for updating the game state.
 */
export const sellAsset = (
  assetName: string,
  assetPrice: number,
  assetWallet: number,
  dispatch: Dispatch<Action>
) => {
  const salePrice = assetPrice * assetWallet
  const logMsg = `You have sold ${assetWallet} ${assetName} at $${numberWithCommas(
    assetPrice
  )} for $${numberWithCommas(salePrice)}`

  if (assetWallet === 0) return

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
