import { numberWithCommas } from "../helpers/utils"

const Header = ({ state }) => {
  return (
    <>
      <h2>Crypto Frenzy 🚀</h2>

      <p className="mt-5">
        <span className="font-bold">Day:</span> {state.currentDay}/30
      </p>
      <p>
        <span className="font-bold">Cash:</span> ${numberWithCommas(state.cash)}
      </p>
      <p>
        <span className="font-bold">Debt:</span> ${numberWithCommas(state.debt)}
      </p>
      <p>
        <span className="font-bold">Wallet:</span> {state.walletAmount}/
        {state.walletCapacity}
      </p>
      {state.highScore && (
        <p>
          <span className="font-bold">High Score:</span> $
          {numberWithCommas(state.highScore)}
        </p>
      )}
    </>
  )
}

export default Header
