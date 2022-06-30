import React from 'react';
import Head from 'next/head';

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
  const [log, setLog]                       = React.useState([`Click Advance Day to start this round. \nYou have 30 days to make as much money as you can! 💎🙌\n`])


  //STATIC DATA ================================================
  const assets = {
    bitcoin: {
      assetName: "Bitcoin",
      symbol: "BTC",
      range: {
        low:[3500,4550],
        mid: [9000,40000],
        high:[85000, 105000]
      }
    },
    ethereum: {
      assetName: "Ethereum",
      symbol: "ETH",
      range: {
        low:[175,350],
        mid: [700,4800],
        high:[8000, 11000]
      }
    },
    litecoin: {
      assetName: "Litecoin",
      symbol: "LTC",
      range: {
        low:[20,45],
        mid: [90,360],
        high:[1000, 2200]
      }
    },
    solana: {
      assetName: "Solana",
      symbol: "SOL",
      range: {
        low:[1,10],
        mid: [11,110],
        high:[200, 300]
      }
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
    setLog([`Click Advance Day to start this round. \nYou have 30 days to make as much money as you can! 💎🙌\n`]);
    addToLog('')
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
      if(currentDay === 0) {
        addToLog(`======== Start of Game =========\n`);
        setBitcoinPrice(randomizePrice(assets.bitcoin.range.mid[0], assets.bitcoin.range.mid[1]));
        setEthereumPrice(randomizePrice(assets.ethereum.range.mid[0], assets.ethereum.range.mid[1]));
        setLitecoinPrice(randomizePrice(assets.litecoin.range.mid[0], assets.litecoin.range.mid[1]));
        setSolanaPrice(randomizePrice(assets.solana.range.mid[0], assets.solana.range.mid[1]));
      } else {
        addToLog(`========= End of Day ${currentDay} =========\n`)
        randomizePriceVariance("BTC");
        randomizePriceVariance("ETH");
        randomizePriceVariance("LTC");
        randomizePriceVariance("SOL");
      }
      
      setCurrentDay(currentDay + 1);
    }
  }

  const walletTotal = () => {
    let amount = bitcoinWallet + ethereumWallet + litecoinWallet + solanaWallet;
    setWalletAmount(amount);
  }

  const randomizePrice = (max, min) => {
    return Math.floor(Math.random() * (max - min) + min);
  }

  const randomizePriceVariance = (asset) => {
    switch(asset){
      case "BTC":
        let coinFlipBTC = Math.floor(Math.random() * 100);
        if(coinFlipBTC < 2) {
          setBitcoinPrice(randomizePrice(assets.bitcoin.range.low[0], assets.bitcoin.range.low[1]))
          addToLog("🐋 A whale has dumped Bitcoin and the price has plummeted! 🐋\n")
        } else if (coinFlipBTC >=2 && coinFlipBTC <97) {
          setBitcoinPrice(randomizePrice(assets.bitcoin.range.mid[0], assets.bitcoin.range.mid[1]))
        } else {
          setBitcoinPrice(randomizePrice(assets.bitcoin.range.high[0], assets.bitcoin.range.high[1]))
          addToLog("🚀🌕 Bitcoin is going to the moon!\n")
        }
        break;
      case "ETH":
        let coinFlipETH = Math.floor(Math.random() * 100);
        if(coinFlipETH < 2) {
          setEthereumPrice(randomizePrice(assets.ethereum.range.low[0], assets.ethereum.range.low[1]))
          addToLog("🐋 A whale has dumped Ethereum and the price has plummeted! 🐋\n")
        } else if (coinFlipETH >= 2 && coinFlipETH <97) {
          setEthereumPrice(randomizePrice(assets.ethereum.range.mid[0], assets.ethereum.range.mid[1]))
        } else {
          setEthereumPrice(randomizePrice(assets.ethereum.range.high[0], assets.ethereum.range.high[1]))
          addToLog("🚀🌕 Ethereum is going to the moon!\n")
        }
        break;
      case "LTC":
        let coinFlipLTC = Math.floor(Math.random() * 100);
        if(coinFlipLTC < 2) {
          setLitecoinPrice(randomizePrice(assets.litecoin.range.low[0], assets.litecoin.range.low[1]))
          addToLog("🐋 A whale has dumped Litecoin and the price has plummeted! 🐋\n")
        } else if (coinFlipLTC >=2 && coinFlipLTC <97) {
          setLitecoinPrice(randomizePrice(assets.litecoin.range.mid[0], assets.litecoin.range.mid[1]))
        } else {
          setLitecoinPrice(randomizePrice(assets.litecoin.range.high[0], assets.litecoin.range.high[1]))
          addToLog("🚀🌕 Litecoin is going to the moon!\n")
        }
        break;
      case "SOL":
        let coinFlipSOL = Math.floor(Math.random() * 100);
        if(coinFlipSOL < 20) {
          setSolanaPrice(randomizePrice(assets.solana.range.low[0], assets.solana.range.low[1]))
        } else if (coinFlipSOL >=20 && coinFlipSOL <97) {
          setSolanaPrice(randomizePrice(assets.solana.range.mid[0], assets.solana.range.mid[1]))
        } else {
          setSolanaPrice(randomizePrice(assets.solana.range.high[0], assets.solana.range.high[1]))
          addToLog("🚀🌕 Solana is going to the moon!")
        }
        break;
      default:
        alert('you\'re changing the price of something that doesn\'t exist');
    }
  }
  
  const calculateMaxShares = (assetPrice, walletAmount, walletCapacity, cash) => {
    let shares = Math.floor( cash / assetPrice );

    return shares + walletAmount >= walletCapacity ? walletCapacity - walletAmount : shares;
  }

  const numberWithCommas = (str) => {
    return str.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  const increaseWalletCapacity = () => {
    if(currentDay == 0) {
      needStartGame();
      return;
    }
    if(cash < 100000){
      alert("You do not have enough cash to expand your wallet");
    } else {
      setWalletCapacity(walletCapacity += 100);
      setCash(cash -= 100000);
      let log = `${new Date().toLocaleTimeString()} - You have increased your wallet capacity to ${walletCapacity}\n`
      addToLog(log);
    }
  }

  const addToLog = (str) => {
    setLog(arr => [str, ...arr]);
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
            let log = `${new Date().toLocaleTimeString()} - You have bought ${amt} Bitcoin at $${numberWithCommas(bitcoinPrice)} \n`;
            setCash(cash - (amt * bitcoinPrice));
            setBitcoinWallet(bitcoinWallet += amt);
            walletTotal();
            addToLog(log);
          }
          break;
        case "ethereumBuy":
          if(ethereumPrice > cash) {
            needCash();
          } else {
            let amt = (calculateMaxShares(ethereumPrice, walletAmount, walletCapacity, cash));
            let log = `${new Date().toLocaleTimeString()} - You have bought ${amt} Ethereum at $${numberWithCommas(ethereumPrice)} \n`;
            setCash(cash - (amt * ethereumPrice));
            setEthereumWallet(ethereumWallet += amt);
            walletTotal();
            addToLog(log);
          }
          break;
        case "litecoinBuy":
          if(litecoinPrice > cash) {
            needCash();
          } else {
            let amt = (calculateMaxShares(litecoinPrice, walletAmount, walletCapacity, cash));
            let log = `${new Date().toLocaleTimeString()} - You have bought ${amt} Litecoin at $${numberWithCommas(litecoinPrice)} \n`;
            setCash(cash - (amt * litecoinPrice));
            setLitecoinWallet(litecoinWallet += amt);
            walletTotal();
            addToLog(log);
          }
          break;
        case "solanaBuy":
          if(solanaPrice > cash) {
            needCash();
          } else {
            let amt = (calculateMaxShares(solanaPrice, walletAmount, walletCapacity, cash));
            let log = `${new Date().toLocaleTimeString()} - You have bought ${amt} Solana at $${numberWithCommas(solanaPrice)} \n`;
            setCash(cash -= (amt * solanaPrice));
            setSolanaWallet(solanaWallet += amt);
            walletTotal();
            addToLog(log);
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
            let salePrice = (bitcoinPrice * bitcoinWallet);
            let log = `${new Date().toLocaleTimeString()} - You have sold ${bitcoinWallet} Bitcoin at $${numberWithCommas(bitcoinPrice)} for $${numberWithCommas(salePrice)}\n`;
            setCash(cash + (salePrice))
            setBitcoinWallet(bitcoinWallet -= bitcoinWallet);
            walletTotal();
            addToLog(log);
          }
          break;
        case "ethereumSell":
          if(ethereumWallet === 0) {
            needAsset()
          } else {
            let salePrice = (ethereumPrice * ethereumWallet);
            let log = `${new Date().toLocaleTimeString()} - You have sold ${ethereumWallet} Ethereum at ${ethereumPrice} for $${numberWithCommas(salePrice)}\n`;
            setCash(cash + (salePrice))
            setEthereumWallet(ethereumWallet -= ethereumWallet);
            walletTotal();
            addToLog(log);
          }
          break;
        case "litecoinSell":
          if(litecoinWallet === 0) {
            needAsset();
          } else {
            let salePrice = (litecoinPrice * litecoinWallet);
            let log = `${new Date().toLocaleTimeString()} - You have sold ${litecoinWallet} Litecoin at $${numberWithCommas(litecoinPrice)} for $${numberWithCommas(salePrice)}\n`;
            setCash(cash + (litecoinPrice * litecoinWallet))
            setLitecoinWallet(litecoinWallet -= litecoinWallet);
            walletTotal();
            addToLog(log);
          }
          break;
        case "solanaSell":
          if(solanaWallet == 0) {
            needAsset()
          } else {
            let salePrice = (solanaPrice * solanaWallet);
            let log = `${new Date().toLocaleTimeString()} - You have sold ${solanaWallet} Solana at $${numberWithCommas(solanaPrice)} for $${numberWithCommas(salePrice)}\n`;
            setCash(cash + (solanaPrice * solanaWallet))
            setSolanaWallet(solanaWallet -= solanaWallet);
            walletTotal();
            addToLog(log);
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
        <title>Crypto Frenzy</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon1.ico" />
      </Head>

      <main className="prose px-10">
        <h1>Crypto Frenzy</h1>

        <p className='mt-5'>Day: {currentDay}/30</p>
        <p>Cash: ${numberWithCommas(cash)}</p>
        <p>Wallet: {walletAmount}/{walletCapacity} </p>

        <div className='w-96'>
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
              <tr>
                <td>{assets.bitcoin.assetName}</td>
                <td>${numberWithCommas(bitcoinPrice)}</td>
                <td>
                  <button className="rounded-full bg-blue-700 px-3 py-1" onClick={handleBuy} id="bitcoinBuy">Buy</button>
                  <button className="rounded-full bg-green-500 px-3 py-1" onClick={handleSell} id="bitcoinSell">Sell</button>
                </td>
                <td>{bitcoinWallet}</td>
              </tr>
              <tr>
                <td>{assets.ethereum.assetName}</td>
                <td>${numberWithCommas(ethereumPrice)}</td>
                <td>
                  <button className="rounded-full bg-blue-700 px-3 py-1" onClick={handleBuy} id="ethereumBuy">Buy</button>
                  <button className="rounded-full bg-green-500 px-3 py-1" onClick={handleSell} id="ethereumSell">Sell</button>
                </td>
                <td>{ethereumWallet}</td>
              </tr>
              <tr>
                <td>{assets.litecoin.assetName}</td>
                <td>${numberWithCommas(litecoinPrice)}</td>
                <td>
                  <button className="rounded-full bg-blue-700 px-3 py-1" onClick={handleBuy} id="litecoinBuy">Buy</button>
                  <button className="rounded-full bg-green-500 px-3 py-1" onClick={handleSell} id="litecoinSell">Sell</button>
                </td>
                <td>{litecoinWallet}</td>
              </tr>
              <tr>
                <td>{assets.solana.assetName}</td>
                <td>${numberWithCommas(solanaPrice)}</td>
                <td>
                  <button className="rounded-full bg-blue-700 px-3 py-1" onClick={handleBuy} id="solanaBuy">Buy</button>
                  <button className="rounded-full bg-green-500 px-3 py-1" onClick={handleSell} id="solanaSell">Sell</button>
                </td>
                <td>{solanaWallet}</td>
              </tr>
            </tbody>
          </table>
        </div>
        

        <div className='mt-5 flex items-center'>
          <p className='mr-5'>Wallet Size (+100): $100,000</p>
          <button className='bg-green-500 px-3 py-1 rounded-full' onClick={increaseWalletCapacity}>Buy</button>
        </div>

        <button className='bg-blue-700 px-6 py-4 rounded-full mt-10' onClick={advanceDay}>Advance Day</button>
        <button className='bg-red-700 px-6 py-4 rounded-full' onClick={init}>New Game</button>

        <div>
          <ul className='border border-sky-600 mt-10 max-h-56 w-auto p-4 overflow-auto inline-block text-xs'>
            <li>{log}</li>
          </ul>
        </div>

      </main>
    </div>
  )
}
