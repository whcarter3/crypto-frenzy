import React from "react";
import config from "../config/config";
import { numberWithCommas } from "../helpers/utils";

const Table = ({
    bitcoinPrice, 
    bitcoinWallet, 
    ethereumPrice, 
    ethereumWallet, 
    litecoinPrice,
    litecoinWallet,
    solanaPrice,
    solanaWallet,
    handleBuy,
    handleSell
  }) => {

  return (
    <div className='max-w-md'>
      <table className='mt-5 w-full table-auto border-collapse'> 
        <thead>
          <tr>
            <th>Asset</th>
            <th>Price</th>
            <th>Action</th>
            <th>Wallet</th>
          </tr>
        </thead>
        <tbody className='bg-slate-800'>
          {
            Object.keys(config.assets).map((asset) => {
              let price;
              let wallet;
              switch(asset){
                case "bitcoin":
                  price = bitcoinPrice;
                  wallet = bitcoinWallet;
                  break;
                case "ethereum":
                  price = ethereumPrice;
                  wallet = ethereumWallet;
                  break;
                case "litecoin":
                  price = litecoinPrice;
                  wallet = litecoinWallet;
                  break;
                case "solana": 
                  price = solanaPrice;
                  wallet = solanaWallet;
                  break;
                default:
                  return;
              }
              return (
                <tr key={asset}>
                  <td>{config.assets[asset].assetName}</td>
                  <td>${numberWithCommas(price)}</td>
                  <td>
                    <button className="rounded-full bg-blue-700 px-3 py-1 mr-4" onClick={handleBuy} id={`${asset}Buy`}>Buy</button>
                    <button className="rounded-full bg-green-500 px-3 py-1" onClick={handleSell} id={`${asset}Sell`}>Sell</button>
                  </td>
                  <td>{wallet}</td>
                </tr>
              )
            })
          }
        </tbody>
      </table>
    </div>
  )

}

export default Table;