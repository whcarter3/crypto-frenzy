import { AlertMessages, showAlert } from "../helpers/alerts"
import { currentTime, addToLog, numberWithCommas } from "../helpers/utils"

export const payDebt = (
  currentDay: number,
  setLog: React.Dispatch<React.SetStateAction<string[]>>,
  debt: number,
  setDebt: React.Dispatch<React.SetStateAction<number>>,
  cash: number,
  setCash: React.Dispatch<React.SetStateAction<number>>
) => {
  //error checks =====
  if (currentDay == 0) {
    showAlert(AlertMessages.NEED_START)
    return
  }
  if (debt === 0) {
    showAlert(AlertMessages.NEED_DEBT)
    return
  }
  if (cash < debt) {
    showAlert(AlertMessages.NEED_DEBT_CASH)
    return
  }
  // =================
  addToLog(
    `${currentTime()} - You have paid off your $${numberWithCommas(
      debt
    )} debt! 🙌`,
    setLog
  )
  setCash(cash - debt)
  setDebt(0)
}
