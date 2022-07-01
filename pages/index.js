import React from 'react';
import Head from 'next/head';

export default function Home() {

  //CONFIG OBJECT ================================================
  //low ranges are generally 1/2 of lowest mid, and high ranges are generally 2x the highest mid
  const config = {
    wallet: {
      startingCapacity: 100,
      increase: 100,
      cost: 50000,
      percentIncreace: .25
    },
    cash: 1500,
    debt: 2500,
    interestRate: .20,
    days: 30,
    assets: {
      bitcoin: {
        assetName: "Bitcoin",
        symbol: "BTC",
        range: {
          low:[3500,4550],
          mid: [9000,65000],
          high:[105000, 125000]
        }
      },
      ethereum: {
        assetName: "Ethereum",
        symbol: "ETH",
        range: {
          low:[175,350],
          mid: [700,4800],
          high:[10000, 12500]
        }
      },
      litecoin: {
        assetName: "Litecoin",
        symbol: "LTC",
        range: {
          low:[20,45],
          mid: [90,630],
          high:[1200, 1500]
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
    },
  }

  let startingLogMsg = `- You borrowed ${config.cash} at ${config.interestRate * 100}% daily interest\n- Click Advance Day to start.\n- You have ${config.days} days to make as much money as you can! 💎🙌\n`;

  //GAME STATE ================================================
  const [bitcoinPrice, setBitcoinPrice]     = React.useState(0);
  const [ethereumPrice, setEthereumPrice]   = React.useState(0);
  const [litecoinPrice, setLitecoinPrice]   = React.useState(0);
  const [solanaPrice, setSolanaPrice]       = React.useState(0);
  const [currentDay, setCurrentDay]         = React.useState(0);
  const [cash, setCash]                     = React.useState(config.cash);
  const [walletCapacity, setWalletCapacity] = React.useState(config.wallet.startingCapacity);
  const [walletAmount, setWalletAmount]     = React.useState(0);
  const [bitcoinWallet, setBitcoinWallet]   = React.useState(0);
  const [ethereumWallet, setEthereumWallet] = React.useState(0);
  const [litecoinWallet, setLitecoinWallet] = React.useState(0);
  const [solanaWallet, setSolanaWallet]     = React.useState(0);
  const [log, setLog]                       = React.useState([startingLogMsg]);
  const [highScore, setHighScore]           = React.useState(0);
  const [walletExpansionCost, setWalletExpansionCost] = React.useState(config.wallet.cost);
  const [debt, setDebt]                     = React.useState(config.debt);

  //INIT FUNCTION =====================================
  function init () {
    setCurrentDay(0);
    setBitcoinPrice(0);
    setEthereumPrice(0);
    setLitecoinPrice(0);
    setSolanaPrice(0);
    setWalletAmount(0);
    setWalletCapacity(config.wallet.startingCapacity);
    setCash(config.cash);
    setBitcoinWallet(0);
    setEthereumWallet(0);
    setLitecoinWallet(0);
    setSolanaWallet(0);
    setWalletExpansionCost(config.wallet.increase);
    setDebt(config.debt);
    setLog([startingLogMsg]);
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

  //UTIL FUNCTIONS =====================================
  const calculateMaxShares = (assetPrice, walletAmount, walletCapacity, cash) => {
    let shares = Math.floor( cash / assetPrice );
    //ensure shares don't exceed wallet capacity, else return max shares
    return shares + walletAmount >= walletCapacity ? walletCapacity - walletAmount : shares;
  }

  const numberWithCommas = (str) => {
    return str.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  const walletTotal = () => {
    let amount = bitcoinWallet + ethereumWallet + litecoinWallet + solanaWallet;
    setWalletAmount(amount);
  }

  const randomizePrice = (max, min) => {
    return Math.floor(Math.random() * (max - min) + min);
  }

  const addToLog = (str) => {
    setLog(arr => [str, ...arr]);
  }

  const currentTime = () => {
    return new Date().toLocaleTimeString();
  }

  // GAME LOGIC ========================================
  const advanceDay = () => {
    if(currentDay === (config.days - 1)) {
      alert("Today is your last day! Better sell all your assets!")
    }
    if(currentDay >= config.days) {
      alert(`This round has been completed. You amassed $${numberWithCommas(cash - debt)}! Click to start a new game.`);
      if(cash > highScore){
        setHighScore(cash);
      }
      init();
    } else {
      if(currentDay === 0) {
        addToLog(`======== Start of Game =========\n`);
        setBitcoinPrice(randomizePrice(config.assets.bitcoin.range.mid[0], config.assets.bitcoin.range.mid[1]));
        setEthereumPrice(randomizePrice(config.assets.ethereum.range.mid[0], config.assets.ethereum.range.mid[1]));
        setLitecoinPrice(randomizePrice(config.assets.litecoin.range.mid[0], config.assets.litecoin.range.mid[1]));
        setSolanaPrice(randomizePrice(config.assets.solana.range.mid[0], config.assets.solana.range.mid[1]));
      } else {
        addToLog(`========= End of Day ${currentDay} =========\n`)
        randomizePriceVariance("BTC");
        randomizePriceVariance("ETH");
        randomizePriceVariance("LTC");
        randomizePriceVariance("SOL");
        setDebt(Math.floor(debt += (debt * config.interestRate)));
      }
      
      setCurrentDay(currentDay += 1);
    }
  }

  //Randomize each coin's price with a low% chance to be in the high or low range, and high% chance to be in mid range
  const randomizePriceVariance = (asset) => {
    switch(asset){
      case "BTC":
        //rand # between 0 - 99 which allows whole # %s for price ranges
        let coinFlipBTC = Math.floor(Math.random() * 100);
        //low range
        if(coinFlipBTC < 2) {
          setBitcoinPrice(randomizePrice(config.assets.bitcoin.range.low[0], config.assets.bitcoin.range.low[1]))
          addToLog(`${currentTime()} - 🐋 A whale has dumped Bitcoin and the price has plummeted!\n`)
        //mid range
        } else if (coinFlipBTC >=2 && coinFlipBTC <97) {
          setBitcoinPrice(randomizePrice(config.assets.bitcoin.range.mid[0], config.assets.bitcoin.range.mid[1]))
        //high range
        } else {
          setBitcoinPrice(randomizePrice(config.assets.bitcoin.range.high[0], config.assets.bitcoin.range.high[1]))
          addToLog(`${currentTime()} - 🚀🌕 Bitcoin is going to the moon!\n`)
        }
        break;
      case "ETH":
        let coinFlipETH = Math.floor(Math.random() * 100);
        //low range
        if(coinFlipETH < 2) {
          setEthereumPrice(randomizePrice(config.assets.ethereum.range.low[0], config.assets.ethereum.range.low[1]))
          addToLog(`${currentTime()} - 🐋 A whale has dumped Ethereum and the price has plummeted!\n`)
        //mid range
        } else if (coinFlipETH >= 2 && coinFlipETH <97) {
          setEthereumPrice(randomizePrice(config.assets.ethereum.range.mid[0], config.assets.ethereum.range.mid[1]))
        //high range
        } else {
          setEthereumPrice(randomizePrice(config.assets.ethereum.range.high[0], config.assets.ethereum.range.high[1]))
          addToLog(`${currentTime()} - 🚀🌕 Ethereum is going to the moon!\n`)
        }
        break;
      case "LTC":
        let coinFlipLTC = Math.floor(Math.random() * 100);
        //low range
        if(coinFlipLTC < 2) {
          setLitecoinPrice(randomizePrice(config.assets.litecoin.range.low[0], config.assets.litecoin.range.low[1]))
          addToLog(`${currentTime()} - 🐋 A whale has dumped Litecoin and the price has plummeted!\n`)
        //mid range
        } else if (coinFlipLTC >=2 && coinFlipLTC <97) {
          setLitecoinPrice(randomizePrice(config.assets.litecoin.range.mid[0], config.assets.litecoin.range.mid[1]))
        //high range
        } else {
          setLitecoinPrice(randomizePrice(config.assets.litecoin.range.high[0], config.assets.litecoin.range.high[1]))
          addToLog(`${currentTime()} - 🚀🌕 Litecoin is going to the moon!\n`)
        }
        break;
      case "SOL":
        let coinFlipSOL = Math.floor(Math.random() * 100);
        //low range
        if(coinFlipSOL < 10) {
          setSolanaPrice(randomizePrice(config.assets.solana.range.low[0], config.assets.solana.range.low[1]))
        //mid range
        } else if (coinFlipSOL >=10 && coinFlipSOL <97) {
          setSolanaPrice(randomizePrice(config.assets.solana.range.mid[0], config.assets.solana.range.mid[1]))
        //high range
        } else {
          setSolanaPrice(randomizePrice(config.assets.solana.range.high[0], config.assets.solana.range.high[1]))
          addToLog(`${new Date().toLocaleTimeString()} - 🚀🌕 Solana is going to the moon!\n`)
        }
        break;
      default:
        alert('you\'re changing the price of something that doesn\'t exist');
    }
  }

  //WALLET EXPANSION LOGIC ====================
  const increaseWalletCapacity = () => {
    if(currentDay == 0) {
      needStartGame();
      return;
    }
    if(cash < walletExpansionCost){
      alert("You do not have enough cash to expand your wallet");
      return;
    } 
    setWalletCapacity(walletCapacity += config.wallet.increase);
    setCash(cash -= walletExpansionCost);
    //increase wallet expansion cost by 25% after each purchase
    setWalletExpansionCost(walletExpansionCost += (walletExpansionCost * config.wallet.percentIncreace))
    addToLog(`${currentTime()} - You have increased your wallet capacity to ${walletCapacity}\n`);
    addToLog(`${currentTime()} - Wallet Expansion cost has increased in price by 25% to ${walletExpansionCost}\n`);
  }

  const payDebt = () => {
    if(currentDay == 0) {
      needStartGame();
      return;
    }
    if(debt === 0){
      alert("You've already paid off your debt!");
      return;
    }
    if(cash < debt){
      alert("You do not have enough cash to pay off your debt")
      return;
    }
    addToLog(`${currentTime()} - You have paid off your $${numberWithCommas(debt)} debt! 🙌\n`)
    setCash(cash -= debt);
    setDebt(0);
  }

  //BUY LOGIC ===============================
  const handleBuy = (e) => {
    if(currentDay === 0){
      needStartGame();
      return;
    }
    if(walletAmount >= walletCapacity){
      needWalletSpace();
      return;
    }
    switch(e.target.id){
      case "bitcoinBuy":
        if(bitcoinPrice > cash) {
          needCash();
        } else {
          let amt = (calculateMaxShares(bitcoinPrice, walletAmount, walletCapacity, cash));
          let log = `${currentTime()} - You have bought ${amt} Bitcoin at $${numberWithCommas(bitcoinPrice)} \n`;
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
          let log = `${currentTime()} - You have bought ${amt} Ethereum at $${numberWithCommas(ethereumPrice)} \n`;
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
          let log = `${currentTime()} - You have bought ${amt} Litecoin at $${numberWithCommas(litecoinPrice)} \n`;
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
          let log = `${currentTime()} - You have bought ${amt} Solana at $${numberWithCommas(solanaPrice)} \n`;
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

  //SELL LOGIC ========================================================
  const handleSell = (e) => {
    if(currentDay === 0) {
      needStartGame();
      return;
    }
    switch(e.target.id){
      case "bitcoinSell":
        if(bitcoinWallet === 0){
          needAsset();
        } else {
          let salePrice = (bitcoinPrice * bitcoinWallet);
          let log = `${currentTime()} - You have sold ${bitcoinWallet} Bitcoin at $${numberWithCommas(bitcoinPrice)} for $${numberWithCommas(salePrice)}\n`;
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
          let log = `${currentTime()} - You have sold ${ethereumWallet} Ethereum at ${ethereumPrice} for $${numberWithCommas(salePrice)}\n`;
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
          let log = `${currentTime()} - You have sold ${litecoinWallet} Litecoin at $${numberWithCommas(litecoinPrice)} for $${numberWithCommas(salePrice)}\n`;
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
          let log = `${currentTime()} - You have sold ${solanaWallet} Solana at $${numberWithCommas(solanaPrice)} for $${numberWithCommas(salePrice)}\n`;
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

  //PRESENTATION COMPONENTS =============================
  return (
    <div className="container mx-auto mt-5">
      <Head>
        <title>Crypto Frenzy</title>
        <meta name="description" content="A crypto buying and selling game." />
        <link rel="icon" href="/favicon1.ico" />
      </Head>

      <main className="prose px-5">
        <h1>Crypto Frenzy 🚀</h1>

        <p className='mt-5'><span className='font-bold'>Day:</span> {currentDay}/30</p>
        <p><span className='font-bold'>Cash:</span> ${numberWithCommas(cash)}</p>
        <p><span className='font-bold'>Debt:</span> ${numberWithCommas(debt)}</p>
        <p><span className='font-bold'>Wallet:</span> {walletAmount}/{walletCapacity} </p>

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
              <tr>
                <td>{config.assets.bitcoin.assetName}</td>
                <td>${numberWithCommas(bitcoinPrice)}</td>
                <td>
                  <button className="rounded-full bg-blue-700 px-3 py-1 mr-4" onClick={handleBuy} id="bitcoinBuy">Buy</button>
                  <button className="rounded-full bg-green-500 px-3 py-1" onClick={handleSell} id="bitcoinSell">Sell</button>
                </td>
                <td>{bitcoinWallet}</td>
              </tr>
              <tr>
                <td>{config.assets.ethereum.assetName}</td>
                <td>${numberWithCommas(ethereumPrice)}</td>
                <td>
                  <button className="rounded-full bg-blue-700 px-3 py-1 mr-5" onClick={handleBuy} id="ethereumBuy">Buy</button>
                  <button className="rounded-full bg-green-500 px-3 py-1" onClick={handleSell} id="ethereumSell">Sell</button>
                </td>
                <td>{ethereumWallet}</td>
              </tr>
              <tr>
                <td>{config.assets.litecoin.assetName}</td>
                <td>${numberWithCommas(litecoinPrice)}</td>
                <td>
                  <button className="rounded-full bg-blue-700 px-3 py-1 mr-5" onClick={handleBuy} id="litecoinBuy">Buy</button>
                  <button className="rounded-full bg-green-500 px-3 py-1" onClick={handleSell} id="litecoinSell">Sell</button>
                </td>
                <td>{litecoinWallet}</td>
              </tr>
              <tr>
                <td>{config.assets.solana.assetName}</td>
                <td>${numberWithCommas(solanaPrice)}</td>
                <td>
                  <button className="rounded-full bg-blue-700 px-3 py-1 mr-5" onClick={handleBuy} id="solanaBuy">Buy</button>
                  <button className="rounded-full bg-green-500 px-3 py-1" onClick={handleSell} id="solanaSell">Sell</button>
                </td>
                <td>{solanaWallet}</td>
              </tr>
            </tbody>
          </table>
        </div>
        

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

        <div></div>
        <button className='bg-blue-700 px-6 py-4 rounded-full mt-8 mr-5' onClick={advanceDay}>Advance Day</button>
        <button className='bg-red-700 px-6 py-4 rounded-full' onClick={init}>New Game</button>

        <div className='max-w-md'>
          <ul className='border border-sky-600 mt-8 max-h-56 w-full p-4 overflow-auto inline-block text-xs'>
            <li>{log}</li>
          </ul>
        </div>

        <h3 className='mt-5'>High Score (Session): ${numberWithCommas(highScore)}</h3>

      </main>
    </div>
  )
}
