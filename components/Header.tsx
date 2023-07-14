import config from "../config/config"
import { numberWithCommas } from "../helpers/utils"
import HeaderInfo from "./HeaderInfo"

const Header = ({ state }) => {
  const headerItems = [
    {
      label: "Day",
      value: `${state.currentDay}/${config.days}`,
    },
    {
      label: "Cash",
      value: `$${numberWithCommas(state.cash)}`,
    },
    {
      label: "Debt",
      value: `$${numberWithCommas(state.debt)}`,
    },
    {
      label: "Wallet",
      value: `${state.walletAmount}/${state.walletCapacity}`,
    },
  ]

  return (
    <>
      <h2>Crypto Frenzy 🚀</h2>

      <div className="mt-5">
        {headerItems.map((item) => (
          <HeaderInfo key={item.label} label={item.label} value={item.value} />
        ))}
        {state.highScore && (
          <HeaderInfo
            label="High Score"
            value={`$${numberWithCommas(state.highScore)}`}
          />
        )}
      </div>
    </>
  )
}

export default Header
