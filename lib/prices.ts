import { priceMovementEvent } from "./priceEvents"
import { Dispatch } from "react"
import { Asset, State, Action } from "./types"

/**
 * Generates a random price within a given range.
 *
 * @param {number} max - The maximum price value.
 * @param {number} min - The minimum price value.
 * @returns {number} - The random price value.
 */
export const randomizePrice = (max: number, min: number): number => {
  return Math.floor(Math.random() * (max - min) + min)
}

/**
 * Randomizes the price of a given asset and updates the game state.
 * @param {Asset} asset - The asset to randomize the price for.
 * @param {number} lowRangeThreshHold - The lower threshold for the randomization range.
 * @param {number} highRangeThreshHold - The upper threshold for the randomization range.
 * @param {Dispatch<Action>} dispatch - The dispatch function for updating the game state.
 */
const randomizeAssetPrice = (
  asset: Asset,
  lowRangeThreshHold: number,
  highRangeThreshHold: number,
  dispatch: Dispatch<Action>
) => {
  let coinFlip = Math.floor(Math.random() * 100)
  let assetName = asset.name.toLowerCase()
  let assetRange = asset.range
  console.log("asset.range", assetRange)

  if (coinFlip < lowRangeThreshHold) {
    dispatch({
      type: "SET_LOG",
      payload: priceMovementEvent(asset.name, "crash"),
    })
    dispatch({
      type: `SET_ASSET_PRICE`,
      payload: {
        setAssetName: assetName,
        setAssetPrice: randomizePrice(asset.range.low[0], asset.range.low[1]),
      },
    })
  } else if (coinFlip >= lowRangeThreshHold && coinFlip < highRangeThreshHold) {
    dispatch({
      type: `SET_ASSET_PRICE`,
      payload: {
        setAssetName: assetName,
        setAssetPrice: randomizePrice(asset.range.mid[0], asset.range.mid[1]),
      },
    })
  } else if (coinFlip >= 98) {
    dispatch({
      type: "SET_LOG",
      payload: [`🚀🚀🚀 OMG A ${assetName.toUpperCase()} MOONSHOT! 🚀🚀🚀`],
    })
    dispatch({
      type: `SET_ASSET_PRICE`,
      payload: {
        setAssetName: assetName,
        setAssetPrice: randomizePrice(asset.range.moon[0], asset.range.moon[1]),
      },
    })
  } else {
    dispatch({
      type: "SET_LOG",
      payload: priceMovementEvent(assetName, "moon"),
    })
    dispatch({
      type: `SET_ASSET_PRICE`,
      payload: {
        setAssetName: assetName,
        setAssetPrice: randomizePrice(asset.range.high[0], asset.range.high[1]),
      },
    })
  }
}

/**
 * Randomizes the prices of all active assets in the game state and updates the game state.
 * @param {State} state - The current game state.
 * @param {Dispatch<Action>} dispatch - The dispatch function for updating the game state.
 */
export const randomizePrices = (
  state: State,
  dispatch: Dispatch<Action>
): void => {
  for (const assetKey in state.assets) {
    const asset = state.assets[assetKey]
    if (!asset.active) continue
    randomizeAssetPrice(
      asset,
      state.lowRangePercent,
      state.highRangePercent,
      dispatch
    )
  }
}
