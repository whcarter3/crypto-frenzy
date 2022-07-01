//UTIL FUNCTIONS =====================================
export const calculateMaxShares = (assetPrice, walletAmount, walletCapacity, cash) => {
  let shares = Math.floor( cash / assetPrice );
  //ensure shares don't exceed wallet capacity, else return max shares
  return shares + walletAmount >= walletCapacity ? walletCapacity - walletAmount : shares;
}

export const numberWithCommas = (str) => {
  return str.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export const randomizePrice = (max, min) => {
  return Math.floor(Math.random() * (max - min) + min);
}

export const currentTime = () => {
  return new Date().toLocaleTimeString();
}