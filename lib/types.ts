export interface Asset {
  name: string
  symbol: string
  wallet: number
  active: boolean
  averageCost: number
  totalCost: number
  range: {
    low: number[]
    mid: number[]
    high: number[]
    moon: number[]
  }
  price: number
}

export interface Wallet {
  amount: number
  capacity: number
  increase: number
  expansionCost: number
  percentIncrease: number
}

export interface State {
  days: number
  currentDay: number
  cash: number
  debt: number
  interestRate: number
  log: string[]
  highScore?: number | null
  assets: {
    [key: string]: Asset
  }
  wallet: Wallet
}
