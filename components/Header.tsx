import { numberWithCommas } from "../helpers/utils"
import HeaderInfo from "./HeaderInfo"

const Header = ({ state }) => {
  const headerItems = [
    {
      label: "Day",
      value: `${state.currentDay}/${state.days}`,
      testId: "day",
    },
    {
      label: "Cash",
      value: `$${numberWithCommas(state.cash)}`,
      testId: "cash",
    },
    {
      label: "Debt",
      value: `$${numberWithCommas(state.debt)}`,
      testId: "debt",
    },
    {
      label: "Wallet",
      value: `${state.wallet.amount}/${state.wallet.capacity}`,
      testId: "wallet",
    },
  ]

  return (
    <>
      <h2>Crypto Frenzy 🚀</h2>

      <div className="mt-5 flex">
        {headerItems.map((item) => (
          <HeaderInfo
            key={item.label}
            label={item.label}
            value={item.value}
            testId={item.testId}
          />
        ))}
        {state.highScore && (
          <HeaderInfo
            label="High Score"
            value={`$${numberWithCommas(state.highScore)}`}
            testId="highScore"
          />
        )}
      </div>
    </>
  )
}

export default Header
