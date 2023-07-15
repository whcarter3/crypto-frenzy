import config from "../config/config"
import { priceMovementEvent } from "./priceEvents"
// import { randomizePrice } from "../helpers/utils"
import { Dispatch } from "react"

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

//RANDOMIZE PRICE LOGIC =====================================
//bell curve chance to hit low/mid/high range
const randomizeAssetPrice = (
  asset: {
    assetName: string
    range: { low: number[]; mid: number[]; high: number[]; moon: number[] }
  },
  lowRangeThreshHold: number,
  highRangeThreshHold: number,
  dispatch: Dispatch<any>
) => {
  let coinFlip = Math.floor(Math.random() * 100)

  if (coinFlip < lowRangeThreshHold) {
    dispatch({
      type: "SET_LOG",
      payload: priceMovementEvent(asset.assetName, "crash"),
    })
    dispatch({
      type: `SET_${asset.assetName.toUpperCase()}_PRICE`,
      payload: randomizePrice(asset.range.low[0], asset.range.low[1]),
    })
  } else if (coinFlip >= lowRangeThreshHold && coinFlip < highRangeThreshHold) {
    dispatch({
      type: `SET_${asset.assetName.toUpperCase()}_PRICE`,
      payload: randomizePrice(asset.range.mid[0], asset.range.mid[1]),
    })
  } else if (coinFlip >= 98) {
    dispatch({
      type: "SET_LOG",
      payload: `🚀🚀🚀 OMG A ${asset.assetName.toUpperCase()} MOONSHOT! 🚀🚀🚀`,
    })
    dispatch({
      type: `SET_${asset.assetName.toUpperCase()}_PRICE`,
      payload: randomizePrice(asset.range.moon[0], asset.range.moon[1]),
    })
  } else {
    dispatch({
      type: "SET_LOG",
      payload: priceMovementEvent(asset.assetName, "moon"),
    })
    dispatch({
      type: `SET_${asset.assetName.toUpperCase()}_PRICE`,
      payload: randomizePrice(asset.range.high[0], asset.range.high[1]),
    })
  }
}

export const randomizePrices = (dispatch: Dispatch<any>): void => {
  for (const assetKey in config.assets) {
    const asset = config.assets[assetKey]
    asset.assetName === "Solana"
      ? randomizeAssetPrice(asset, 7, 96, dispatch)
      : randomizeAssetPrice(asset, 2, 96, dispatch)
  }
}
