export interface State {
  bitcoinPrice: number
  ethereumPrice: number
  litecoinPrice: number
  solanaPrice: number
  currentDay: number
  cash: number
  walletCapacity: number
  walletAmount: number
  bitcoinWallet: number
  ethereumWallet: number
  litecoinWallet: number
  solanaWallet: number
  log: string[]
  walletExpansionCost: number
  debt: number
  highScore?: number | null
}
