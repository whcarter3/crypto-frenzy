import React from 'react';
import Head from 'next/head';
import Button from '../components/Button.tsx';

export default function Home() {

  //GAME STATE ================================================
  const [bitcoinPrice, setBitcoinPrice]     = React.useState(0);
  const [ethereumPrice, setEthereumPrice]   = React.useState(0);
  const [litecoinPrice, setLitecoinPrice]   = React.useState(0);
  const [solanaPrice, setSolanaPrice]       = React.useState(0);
  const [currentDay, setCurrentDay]         = React.useState(0);
  const [cash, setCash]                     = React.useState(1500);
  const [walletCapacity, setWalletCapacity] = React.useState(100);
  const [walletAmount, setWalletAmount]     = React.useState(0);
  const [bitcoinWallet, setBitcoinWallet]   = React.useState(0);
  const [ethereumWallet, setEthereumWallet] = React.useState(0);
  const [litecoinWallet, setLitecoinWallet] = React.useState(0);
  const [solanaWallet, setSolanaWallet]     = React.useState(0)

  //STATIC DATA ================================================
  const assets = {
    bitcoin: {
      assetName: "Bitcoin",
      symbol: "BTC",
      min: 12000,
      max: 65000
    },
    ethereum: {
      assetName: "Ethereum",
      symbol: "ETH",
      min: 250,
      max: 6500
    },
    litecoin: {
      assetName: "Litecoin",
      symbol: "LTC",
      min: 65,
      max: 650,
    },
    solana: {
      assetName: "Solana",
      symbol: "SOL",
      min: 5,
      max: 250
    }
  }

  //INIT FUNCTION =====================================
  function init () {
    setCurrentDay(0);
    setBitcoinPrice(0);
    setEthereumPrice(0);
    setLitecoinPrice(0);
    setSolanaPrice(0);
    setWalletAmount(0);
    setWalletCapacity(100);
    setCash(1500);
    setBitcoinWallet(0);
    setEthereumWallet(0);
    setLitecoinWallet(0);
    setSolanaWallet(0);
  }

  // GAME LOGIC ========================================
  const advanceDay = () => {
    if(currentDay === 29) {
      alert("Today is your last day! Better sell all your assets!")
    }
    if(currentDay >= 30) {
      alert(`This round has been completed. You amassed $${numberWithCommas(cash)}. Click to start a new game`);
      init();
    } else {
      setCurrentDay(currentDay + 1);
      setBitcoinPrice(randomizePrice(assets.bitcoin.max, assets.bitcoin.min));
      setEthereumPrice(randomizePrice(assets.ethereum.max, assets.ethereum.min));
      setLitecoinPrice(randomizePrice(assets.litecoin.max, assets.litecoin.min));
      setSolanaPrice(randomizePrice(assets.solana.max, assets.solana.min));
    }
  }

  const walletTotal = () => {
    let amount = bitcoinWallet + ethereumWallet + litecoinWallet + solanaWallet;
    setWalletAmount(amount);
  }

  const randomizePrice = (max, min) => {
    return Math.floor(Math.random() * (max - min) + min);
  }
  
  const calculateMaxShares = (assetPrice, walletAmount, walletCapacity, cash) => {
    let shares = Math.floor( cash / assetPrice );

    return shares >= walletCapacity ? walletCapacity - walletAmount : shares;
  }

  const numberWithCommas = (str) => {
    return str.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  const increaseWalletCapacity = () => {
    if(cash < 100000){
      alert("You do not have enough cash to expand your wallet");
    } else {
      setWalletCapacity(walletCapacity += 100);
      setCash(cash -= 100000);
    }
  }

  //BUY LOGIC ===============================
  const handleBuy = (e) => {
    if(currentDay === 0){
      needStartGame();
    } else if(walletAmount >= walletCapacity){
      needWalletSpace();
    } else {
      switch(e.target.id){
        case "bitcoinBuy":
          if(bitcoinPrice > cash) {
            needCash();
          } else {
            let amt = (calculateMaxShares(bitcoinPrice, walletAmount, walletCapacity, cash));
            setCash(cash - (amt * bitcoinPrice));
            setBitcoinWallet(bitcoinWallet += amt);
            walletTotal();
          }
          break;
        case "ethereumBuy":
          if(ethereumPrice > cash) {
            needCash();
          } else {
            let amt = (calculateMaxShares(ethereumPrice, walletAmount, walletCapacity, cash));
            setCash(cash - (amt * ethereumPrice));
            setEthereumWallet(ethereumWallet += amt);
            walletTotal();
          }
          break;
        case "litecoinBuy":
          if(litecoinPrice > cash) {
            needCash();
          } else {
            let amt = (calculateMaxShares(litecoinPrice, walletAmount, walletCapacity, cash));
            setCash(cash - (amt * litecoinPrice));
            setLitecoinWallet(litecoinWallet += amt);
            walletTotal();
          }
          break;
        case "solanaBuy":
          if(solanaPrice > cash) {
            needCash();
          } else {
            let amt = (calculateMaxShares(solanaPrice, walletAmount, walletCapacity, cash));
            setCash(cash -= (amt * solanaPrice));
            setSolanaWallet(solanaWallet += amt);
            walletTotal();
          }
          break;
        default:
          alert("You have bought something you can't. What the heck?!");
          break;
      }
    }
  }

  //SELL LOGIC ========================================================
  const handleSell = (e) => {
    if(currentDay === 0) {
      needStartGame();
    } else {
      switch(e.target.id){
        case "bitcoinSell":
          if(bitcoinWallet === 0){
            needAsset();
          } else {
            setCash(cash + (bitcoinPrice * bitcoinWallet))
            setBitcoinWallet(bitcoinWallet -= bitcoinWallet);
            walletTotal();
          }
          break;
        case "ethereumSell":
          if(ethereumWallet === 0) {
            needAsset()
          } else {
            setCash(cash + (ethereumPrice * ethereumWallet))
            setEthereumWallet(ethereumWallet -= ethereumWallet);
            walletTotal();
          }
          break;
        case "litecoinSell":
          if(litecoinWallet === 0) {
            needAsset();
          } else {
            setCash(cash + (litecoinPrice * litecoinWallet))
            setLitecoinWallet(litecoinWallet -= litecoinWallet);
            walletTotal();
          }
          break;
        case "solanaSell":
          if(solanaWallet == 0) {
            needAsset()
          } else {
            setCash(cash + (solanaPrice * solanaWallet))
            setSolanaWallet(solanaWallet -= solanaWallet);
            walletTotal();
          }
          break;
        default:
          alert("somehow you sold something you don't have")
          break;
      }
    }
  }

  //ERROR HANDLING  ===================================
  const needCash = () => {
    alert("You do not have enough cash to purchase this asset");
  }

  const needAsset = () => {
    alert("You do not have any of this asset to sell");
  }

  const needStartGame = () => {
    alert("Please click Advance Day to start the game");
  }

  const needWalletSpace = () => {
    alert("You do not have enough wallet space to purchase this asset");
  }

  //PRESENTATION COMPONENTS =============================
  return (
    <div className="container mx-auto mt-10">
      <Head>
        <title>Crypto Wars</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="prose px-10">
        <h1>Crypto Wars</h1>

        <p className='mt-5'>Day: {currentDay}</p>
        <p>Cash: ${numberWithCommas(cash)}</p>
        <p>Wallet: {walletAmount}/{walletCapacity} </p>

        <table className='table-auto mt-5'> 
          <thead>
            <tr>
              <th>Asset</th>
              <th>Price</th>
              <th>Action</th>
              <th>Wallet</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{assets.bitcoin.assetName}</td>
              <td>${numberWithCommas(bitcoinPrice)}</td>
              <td>
                <button className="rounded-full bg-blue-400 px-3 py-1" onClick={handleBuy} id="bitcoinBuy">Buy</button>
                <button className="rounded-full bg-green-400 px-3 py-1" onClick={handleSell} id="bitcoinSell">Sell</button>
              </td>
              <td>{bitcoinWallet}</td>
            </tr>
            <tr>
              <td>{assets.ethereum.assetName}</td>
              <td>${numberWithCommas(ethereumPrice)}</td>
              <td>
                <button className="rounded-full bg-blue-400 px-3 py-1" onClick={handleBuy} id="ethereumBuy">Buy</button>
                <button className="rounded-full bg-green-400 px-3 py-1" onClick={handleSell} id="ethereumSell">Sell</button>
              </td>
              <td>{ethereumWallet}</td>
            </tr>
            <tr>
              <td>{assets.litecoin.assetName}</td>
              <td>${numberWithCommas(litecoinPrice)}</td>
              <td>
                <button className="rounded-full bg-blue-400 px-3 py-1" onClick={handleBuy} id="litecoinBuy">Buy</button>
                <button className="rounded-full bg-green-400 px-3 py-1" onClick={handleSell} id="litecoinSell">Sell</button>
              </td>
              <td>{litecoinWallet}</td>
            </tr>
            <tr>
              <td>{assets.solana.assetName}</td>
              <td>${numberWithCommas(solanaPrice)}</td>
              <td>
                <button className="rounded-full bg-blue-400 px-3 py-1" onClick={handleBuy} id="solanaBuy">Buy</button>
                <button className="rounded-full bg-green-400 px-3 py-1" onClick={handleSell} id="solanaSell">Sell</button>
              </td>
              <td>{solanaWallet}</td>
            </tr>
          </tbody>
        </table>

        <div className='mt-5 flex items-center'>
          <p className='mr-5'>Wallet Size (+100): $100,000</p>
          <button className='bg-green-500 px-3 py-1 rounded-full' onClick={increaseWalletCapacity}>Buy</button>
        </div>

        <button className='bg-blue-500 px-6 py-4 rounded-full mt-10' onClick={advanceDay}>Advance Day</button>
        <button className='bg-red-500 px-6 py-4 rounded-full' onClick={init}>New Game</button>

      </main>
    </div>
  )
}
