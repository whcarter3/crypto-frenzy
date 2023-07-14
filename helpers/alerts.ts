export enum AlertMessages {
  NEED_CASH = "You do not have enough cash to purchase this asset",
  NEED_ASSET = "You do not have any of this asset to sell",
  NEED_START = "Please click Advance Day to start the game",
  NEED_WALLET = "You do not have enough wallet space to purchase this asset",
  NEED_DEBT = "You have already paid off your debt!",
  NEED_DEBT_CASH = "You do not have enough cash to pay off this debt",
  LAST_DAY = "Today is your last day! Better sell all your assets! And make sure to finish round to save your high score!",
}

export const showAlert = (msg: AlertMessages): void => {
  alert(msg)
}
