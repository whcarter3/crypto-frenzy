import React from 'react';
import Head from 'next/head';
import config from '../config/config';
import { needCash, needAsset, needStartGame, needWalletSpace } from '../helpers/errors';
import { calculateMaxShares, numberWithCommas, walletTotal, randomizePrice, addToLog, currentTime } from '../helpers/utils';
import Table from '../components/Table';

export default function Home() {

  let startingLogMsg = `- Click Advance Day to start.\n- You borrowed $${numberWithCommas(config.cash)} at ${config.interestRate * 100}% daily interest\n- You have ${config.days} days to make as much money as you can! 💎🙌\n`;

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

  //NEW GAME INIT FUNCTION =====================================
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
    setWalletExpansionCost(config.wallet.cost);
    setDebt(config.debt);
    setLog([startingLogMsg]);
  }

  // HELPER FUNCTIONS ===================================
  const addToLog = (str) => {
    setLog(arr => [str, ...arr]);
  }
  
  const walletTotal = () => {
    let amount = bitcoinWallet + ethereumWallet + litecoinWallet + solanaWallet;
    setWalletAmount(amount);
  }

  //ADVANCE DAY LOGIC ===================================
  const advanceDay = () => {
    //warning before last day
    if(currentDay === (config.days - 1)) {
      alert("Today is your last day! Better sell all your assets!")
    }
    //end of game -- alert score -- set high score -- restart
    if(currentDay >= config.days) {
      alert(`This round has been completed. You amassed $${numberWithCommas(cash - debt)}! Click to start a new game.`);
      if(cash > highScore){
        setHighScore(cash);
      }
      init();
    } else {
      if(currentDay === 0) {
        //sets initial prices to randomized value from mid range
        addToLog(`======== Start of Game =========\n`);
        setBitcoinPrice(randomizePrice(config.assets.bitcoin.range.mid[0], config.assets.bitcoin.range.mid[1]));
        setEthereumPrice(randomizePrice(config.assets.ethereum.range.mid[0], config.assets.ethereum.range.mid[1]));
        setLitecoinPrice(randomizePrice(config.assets.litecoin.range.mid[0], config.assets.litecoin.range.mid[1]));
        setSolanaPrice(randomizePrice(config.assets.solana.range.mid[0], config.assets.solana.range.mid[1]));
      } else {
        //randomizes prices with chance to hit high/low range
        addToLog(`========= End of Day ${currentDay} =========\n`)
        randomizePriceVariance("BTC");
        randomizePriceVariance("ETH");
        randomizePriceVariance("LTC");
        randomizePriceVariance("SOL");
        //increase date based on daily %
        setDebt(Math.floor(debt += (debt * config.interestRate)));
      }
      //increase day
      setCurrentDay(currentDay += 1);
    }
  }

  //RANDOMIZE PRICE LOGIC =====================================
  //bell curve chance to hit low/mid/high range
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
    //error checks =====
    if(currentDay == 0) {
      needStartGame();
      return;
    }
    if(cash < walletExpansionCost){
      alert("You do not have enough cash to expand your wallet");
      return;
    }
    // =================
    setWalletCapacity(walletCapacity += config.wallet.increase);
    setCash(cash -= walletExpansionCost);
    //increase wallet expansion cost by 25% after each purchase
    setWalletExpansionCost(Math.floor(walletExpansionCost += (walletExpansionCost * config.wallet.percentIncreace)));
    addToLog(`${currentTime()} - You have increased your wallet capacity to ${walletCapacity}\n`);
    addToLog(`${currentTime()} - Wallet Expansion cost has increased in price by 25% to ${walletExpansionCost}\n`);
  }

  const payDebt = () => {
    //error checks =====
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
    // =================
    addToLog(`${currentTime()} - You have paid off your $${numberWithCommas(debt)} debt! 🙌\n`)
    setCash(cash -= debt);
    setDebt(0);
  }

  //BUY LOGIC ===============================
  const handleBuy = (e) => {
    //error checks =====
    if(currentDay === 0){
      needStartGame();
      return;
    }
    if(walletAmount >= walletCapacity){
      needWalletSpace();
      return;
    }
    // =================
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

        <Table 
          handleBuy={handleBuy} 
          handleSell={handleSell}
          bitcoinPrice={bitcoinPrice}
          bitcoinWallet={bitcoinWallet}
          ethereumPrice={ethereumPrice}
          ethereumWallet={ethereumWallet}
          litecoinPrice={litecoinPrice}
          litecoinWallet={litecoinWallet}
          solanaPrice={solanaPrice}
          solanaWallet={solanaWallet}
        />
        

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
