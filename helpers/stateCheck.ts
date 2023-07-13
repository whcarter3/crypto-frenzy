import type { Wallet } from "../lib/types"
import { showAlert, AlertMessages } from "./alerts"

export const needAsset = (wallet: Wallet, asset: string) => {
  if (wallet[asset] === 0) {
    showAlert(AlertMessages.NEED_ASSET)
    return
  }
}
