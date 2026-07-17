import { State } from '../lib/types';

/**
 * Calculates the maximum number of shares that can be purchased with a given amount of cash.
 *
 * @param {number} assetPrice The current price of the asset.
 * @param {number} walletAmount The current number of shares in the wallet.
 * @param {number} walletCapacity The maximum number of shares that can be held in the wallet.
 * @param {number} cash The amount of cash available to purchase shares.
 * @returns {number} The maximum number of shares that can be purchased.
 */
export const calculateMaxShares = (
  assetPrice: number,
  walletAmount: number,
  walletCapacity: number,
  cash: number,
): number => {
  const shares = Math.floor(cash / assetPrice);
  //ensure shares don't exceed wallet capacity, else return max shares
  return shares + walletAmount >= walletCapacity
    ? walletCapacity - walletAmount
    : shares;
};

/**
 * Adds commas to a string representation of a number to improve readability.
 *
 * @param {number | string} num The number to format.
 * @returns {string} The formatted string with commas.
 */
export const numberWithCommas = (num: number | string): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Normalizes a typed trade quantity: invalid or negative input becomes
 * 0, anything above the cap becomes the cap. Powers the trade stepper's
 * clamp-on-blur behavior.
 *
 * @param {string} raw The raw input string.
 * @param {number} max The largest allowed quantity.
 * @returns {number} The normalized quantity in [0, max].
 */
export const normalizeQuantity = (raw: string, max: number): number => {
  const parsed = parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.min(parsed, Math.max(0, max));
};

/**
 * Computes the player's net worth: cash minus debt plus the market
 * value of all active holdings.
 *
 * @param {State} state The current game state.
 * @returns {number} The player's net worth.
 */
export const computeNetWorth = (state: State): number => {
  const assetsValue = Object.values(state.assets).reduce(
    (total, asset) => {
      if (!asset.active) return total;
      return total + asset.price * asset.wallet;
    },
    0,
  );
  return assetsValue + state.cash - state.debt;
};

/**
 * Formats a dollar amount, keeping the minus sign in front of the $.
 *
 * @param {number} amount The dollar amount to format.
 * @returns {string} The formatted amount, e.g. "-$1,500".
 */
export const formatMoney = (amount: number): string =>
  amount < 0
    ? `-$${numberWithCommas(Math.abs(amount))}`
    : `$${numberWithCommas(amount)}`;

/**
 * Builds a shareable URL that replays the exact same market.
 *
 * @param {number} seed The run's seed.
 * @returns {string} An absolute /game URL pinned to the seed.
 */
export const seedShareUrl = (seed: number): string =>
  `${window.location.origin}/game?seed=${seed}`;

/**
 * Gets the emoji for a game mode, used in score displays.
 *
 * @param {State['mode']} mode The game mode.
 * @returns {string} The emoji for the mode.
 */
export const getModeEmoji = (mode: State['mode']): string => {
  switch (mode) {
    case 'Easy':
      return '🌱';
    case 'Hard':
      return '🔥';
    case 'Normal':
      return '⚡';
    default:
      return '';
  }
};
