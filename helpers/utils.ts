/**
 * Calculates the maximum number of shares that can be purchased with a given amount of cash.
 *
 * @param {number} assetPrice - The current price of the asset.
 * @param {number} walletAmount - The current number of shares in the wallet.
 * @param {number} walletCapacity - The maximum number of shares that can be held in the wallet.
 * @param {number} cash - The amount of cash available to purchase shares.
 * @returns {number} - The maximum number of shares that can be purchased.
 */
export const calculateMaxShares = (
  assetPrice: number,
  walletAmount: number,
  walletCapacity: number,
  cash: number
): number => {
  let shares = Math.floor(cash / assetPrice)
  //ensure shares don't exceed wallet capacity, else return max shares
  return shares + walletAmount >= walletCapacity
    ? walletCapacity - walletAmount
    : shares
}

/**
 * Adds commas to a string representation of a number to improve readability.
 *
 * @param {number} num - The number to format.
 * @returns {string} - The formatted string with commas.
 */
export const numberWithCommas = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

/**
 * Returns the current time as a formatted string.
 *
 * @returns {string} - The current time as a formatted string.
 */
export const currentTime = (): string => {
  return new Date().toLocaleTimeString()
}

/**
 * Adds a message to the application log with a timestamp.
 *
 * @param {string} message - The message to add to the log.
 * @returns {string} - The formatted log message with a timestamp.
 */
// HELPER FUNCTIONS ===================================
export const addTimestamp = (message: string): string =>
  `${currentTime()} - ${message}`
