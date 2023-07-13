//CONFIG OBJECT ================================================
//low ranges are generally 1/2 of lowest mid, and high ranges are generally 2x the highest mid
export let config = {
  wallet: {
    startingCapacity: 100,
    increase: 100,
    cost: 1500,
    percentIncreace: 0.25,
  },
  cash: 50000,
  debt: 2500,
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
      },
    },
    ethereum: {
      assetName: "Ethereum",
      symbol: "ETH",
      range: {
        low: [175, 350],
        mid: [700, 4800],
        high: [10000, 12500],
      },
    },
    litecoin: {
      assetName: "Litecoin",
      symbol: "LTC",
      range: {
        low: [20, 45],
        mid: [90, 630],
        high: [1200, 1500],
      },
    },
    solana: {
      assetName: "Solana",
      symbol: "SOL",
      range: {
        low: [1, 10],
        mid: [11, 110],
        high: [200, 300],
      },
    },
  },
}

export default config
