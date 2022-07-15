import config from "../config/config";
import { numberWithCommas } from "../helpers/utils";

const Actions = ({
  increaseWalletCapacity,
  walletExpansionCost,
  payDebt,
  debt,
  advanceDay,
  init
}) => {
  return (
    <>
      <div className='mt-5 flex flex-col max-w-xs'>
        <div className='flex w-full items-center'>
          <button className='bg-green-500 px-3 py-1 mr-5 rounded-full' onClick={increaseWalletCapacity}>Buy</button>
          <p>Wallet Size (+{config.wallet.increase}): ${numberWithCommas(walletExpansionCost)}</p>
        </div>
        <div className='flex w-full items-center mt-3'>
          <button className='bg-green-500 px-3 py-1 mr-5 rounded-full' onClick={payDebt}>Pay</button>
          <p>Pay debt: ${numberWithCommas(debt)}</p>
        </div>
      </div>

    <button className='bg-blue-700 px-6 py-4 rounded-full mt-8 mr-5' id="advDay" onClick={advanceDay}>Advance Day</button>
    <button className='bg-red-700 px-6 py-4 rounded-full' onClick={init}>New Game</button>
    </>
  )
}

export default Actions;