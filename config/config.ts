//CONFIG OBJECT ================================================
//low ranges are generally 1/2 of lowest mid, and high ranges are generally 2x the highest mid
export let config = {
  wallet: {
    startingCapacity: 100,
    increase: 100,
    cost: 50000,
    percentIncrease: 0.25,
  },
  cash: 2000,
  debt: 2000,
  interestRate: 0.2,
  days: 30,
  assets: {
    bitcoin: {
      assetName: "Bitcoin",
      symbol: "BTC",
      range: {
        low: [3500, 4550],
        mid: [9000, 65000],
        high: [105000, 125000],
        moon: [300000, 700000],
      },
    },
    ethereum: {
      assetName: "Ethereum",
      symbol: "ETH",
      range: {
        low: [175, 350],
        mid: [700, 4800],
        high: [10000, 12500],
        moon: [45000, 99999],
      },
    },
    litecoin: {
      assetName: "Litecoin",
      symbol: "LTC",
      range: {
        low: [20, 45],
        mid: [90, 630],
        high: [1200, 1500],
        moon: [4500, 8500],
      },
    },
    solana: {
      assetName: "Solana",
      symbol: "SOL",
      range: {
        low: [1, 5],
        mid: [20, 110],
        high: [200, 580],
        moon: [1000, 3000],
      },
    },
  },
}

export default config
