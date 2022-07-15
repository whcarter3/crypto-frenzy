import { numberWithCommas } from "../helpers/utils";

const Header = 
({
  currentDay,
  cash,
  debt,
  walletAmount,
  walletCapacity
}) => {
  return (
    <>
      <h2>Crypto Frenzy 🚀</h2>

      <p className='mt-5'><span className='font-bold'>Day:</span> {currentDay}/30</p>
      <p><span className='font-bold'>Cash:</span> ${numberWithCommas(cash)}</p>
      <p><span className='font-bold'>Debt:</span> ${numberWithCommas(debt)}</p>
      <p><span className='font-bold'>Wallet:</span> {walletAmount}/{walletCapacity} </p>
    </>
  )
}

export default Header;