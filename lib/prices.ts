import { priceMovementEvent } from "./priceEvents"
import { Asset, State } from "./types"
import { Rng } from "./engine/rng"

/**
 * Generates a random price within a given range.
 * (Args are historically (max, min) = (range[0], range[1]) — the inverted
 * span still lands inside the band, so it's preserved for balance parity.)
 *
 * @param {Rng} rng - The run's deterministic RNG.
 * @param {number} max - The maximum price value.
 * @param {number} min - The minimum price value.
 * @returns {number} - The random price value.
 */
export const randomizePrice = (
  rng: Rng,
  max: number,
  min: number
): number => {
  return Math.floor(rng.random() * (max - min) + min)
}

/**
 * Rolls one asset's daily price band and price.
 * @returns The new price plus any crash/moon/moonshot event messages.
 */
const rollAssetPrice = (
  asset: Asset,
  lowRangeThreshHold: number,
  highRangeThreshHold: number,
  rng: Rng
): { price: number; eventLogs: string[] } => {
  const percentRoll = Math.floor(rng.random() * 100)
  const assetName = asset.name.toLowerCase()

  if (percentRoll < lowRangeThreshHold) {
    return {
      price: randomizePrice(rng, asset.range.low[0], asset.range.low[1]),
      eventLogs: priceMovementEvent(asset.name, "crash", rng),
    }
  }
  if (percentRoll >= lowRangeThreshHold && percentRoll < highRangeThreshHold) {
    return {
      price: randomizePrice(rng, asset.range.mid[0], asset.range.mid[1]),
      eventLogs: [],
    }
  }
  if (percentRoll >= 98) {
    return {
      price: randomizePrice(rng, asset.range.moon[0], asset.range.moon[1]),
      eventLogs: [`🚀🚀🚀 OMG A ${assetName.toUpperCase()} MOONSHOT! 🚀🚀🚀`],
    }
  }
  return {
    price: randomizePrice(rng, asset.range.high[0], asset.range.high[1]),
    eventLogs: priceMovementEvent(assetName, "moon", rng),
  }
}

/**
 * Rolls new prices for all active assets. Pure: takes the current assets
 * and an rng, returns the updated assets plus event log messages.
 *
 * @param {State['assets']} assets - The current assets keyed by name.
 * @param {number} lowRangeThreshHold - Chance of a crash-range price.
 * @param {number} highRangeThreshHold - Upper threshold of the mid range.
 * @param {Rng} rng - The run's deterministic RNG.
 */
export const rollDailyPrices = (
  assets: State["assets"],
  lowRangeThreshHold: number,
  highRangeThreshHold: number,
  rng: Rng
): { assets: State["assets"]; eventLogs: string[] } => {
  const nextAssets: State["assets"] = {}
  const eventLogs: string[] = []

  for (const assetKey in assets) {
    const asset = assets[assetKey]
    if (!asset.active) {
      nextAssets[assetKey] = asset
      continue
    }
    const { price, eventLogs: logs } = rollAssetPrice(
      asset,
      lowRangeThreshHold,
      highRangeThreshHold,
      rng
    )
    nextAssets[assetKey] = { ...asset, price }
    eventLogs.unshift(...logs)
  }

  return { assets: nextAssets, eventLogs }
}
