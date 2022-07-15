import React from 'react';
import Head from 'next/head';
import config from '../config/config';
import { needCash, needAsset, needStartGame, needWalletSpace } from '../helpers/errors';
import { calculateMaxShares, numberWithCommas, randomizePrice, currentTime } from '../helpers/utils';
import Table from '../components/Table';
import Actions from '../components/Actions';
import Header from '../components/Header';
import Log from '../components/Log';

export default function Home() {

  let startingLogMsg = `- Click Advance Day to start.`;

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
  
  let walletTotal = () => {
    let amount = bitcoinWallet + ethereumWallet + litecoinWallet + solanaWallet;
    console.log("amount", amount);
    setWalletAmount(amount);
  }

  //ADVANCE DAY LOGIC ===================================
  const advanceDay = () => {
    //warning before last day
    if(currentDay === (config.days - 1)) {
      alert("Today is your last day! Better sell all your assets!");
      document.getElementById('advDay').innerText = "End Round";
    }
    //end of game -- alert score -- set high score -- restart
    if(currentDay >= config.days) {
      alert(`This round has been completed. You amassed $${numberWithCommas(cash - debt)}! Click to start a new game.`);
      if(cash > highScore){
        setHighScore(cash);
      }
      document.getElementById('advDay').innerText = "Advance Day";
      init();
    } else {
      if(currentDay === 0) {
        //sets initial prices to randomized value from mid range
        addToLog(`======== Start of Game =========`);
        addToLog(`- You borrowed $${numberWithCommas(config.cash)} at ${config.interestRate * 100}% daily interest`);
        addToLog(`- You have ${config.days} days to make as much money as you can! 💎🙌`)
        setBitcoinPrice(randomizePrice(config.assets.bitcoin.range.mid[0], config.assets.bitcoin.range.mid[1]));
        setEthereumPrice(randomizePrice(config.assets.ethereum.range.mid[0], config.assets.ethereum.range.mid[1]));
        setLitecoinPrice(randomizePrice(config.assets.litecoin.range.mid[0], config.assets.litecoin.range.mid[1]));
        setSolanaPrice(randomizePrice(config.assets.solana.range.mid[0], config.assets.solana.range.mid[1]));
      } else {
        //randomizes prices with chance to hit high/low range
        addToLog(`========= End of Day ${currentDay} =========`)
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
          addToLog(`${currentTime()} - 🐋 A whale has dumped Bitcoin and the price has plummeted!`)
        //mid range
        } else if (coinFlipBTC >=2 && coinFlipBTC <97) {
          setBitcoinPrice(randomizePrice(config.assets.bitcoin.range.mid[0], config.assets.bitcoin.range.mid[1]))
        //high range
        } else {
          setBitcoinPrice(randomizePrice(config.assets.bitcoin.range.high[0], config.assets.bitcoin.range.high[1]))
          addToLog(`${currentTime()} - 🚀🌕 Bitcoin is going to the moon`)
        }
        break;
      case "ETH":
        let coinFlipETH = Math.floor(Math.random() * 100);
        //low range
        if(coinFlipETH < 2) {
          setEthereumPrice(randomizePrice(config.assets.ethereum.range.low[0], config.assets.ethereum.range.low[1]))
          addToLog(`${currentTime()} - 🐋 A whale has dumped Ethereum and the price has plummeted`)
        //mid range
        } else if (coinFlipETH >= 2 && coinFlipETH <97) {
          setEthereumPrice(randomizePrice(config.assets.ethereum.range.mid[0], config.assets.ethereum.range.mid[1]))
        //high range
        } else {
          setEthereumPrice(randomizePrice(config.assets.ethereum.range.high[0], config.assets.ethereum.range.high[1]))
          addToLog(`${currentTime()} - 🚀🌕 Ethereum is going to the moon!`)
        }
        break;
      case "LTC":
        let coinFlipLTC = Math.floor(Math.random() * 100);
        //low range
        if(coinFlipLTC < 2) {
          setLitecoinPrice(randomizePrice(config.assets.litecoin.range.low[0], config.assets.litecoin.range.low[1]))
          addToLog(`${currentTime()} - 🐋 A whale has dumped Litecoin and the price has plummeted!`)
        //mid range
        } else if (coinFlipLTC >=2 && coinFlipLTC <97) {
          setLitecoinPrice(randomizePrice(config.assets.litecoin.range.mid[0], config.assets.litecoin.range.mid[1]))
        //high range
        } else {
          setLitecoinPrice(randomizePrice(config.assets.litecoin.range.high[0], config.assets.litecoin.range.high[1]))
          addToLog(`${currentTime()} - 🚀🌕 Litecoin is going to the moon!`)
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
          addToLog(`${currentTime()} - 🚀🌕 Solana is going to the moon!`)
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
    addToLog(`${currentTime()} - You have increased your wallet capacity to ${walletCapacity}`);
    addToLog(`${currentTime()} - Wallet Expansion cost has increased in price by 25% to ${walletExpansionCost}`);
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
    addToLog(`${currentTime()} - You have paid off your $${numberWithCommas(debt)} debt! 🙌`)
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
    let amt, logMsg, assetPrice, assetWallet, updateAssetWallet;
    switch(e.target.id){
      case "bitcoinBuy":
        assetPrice = bitcoinPrice;
        assetWallet = bitcoinWallet;
        updateAssetWallet = setBitcoinWallet;
        amt = (calculateMaxShares(assetPrice, walletAmount, walletCapacity, cash));
        logMsg = `${currentTime()} - You have bought ${amt} Bitcoin at $${numberWithCommas(assetPrice)} for $${numberWithCommas(amt * assetPrice)}`;
        break;
      case "ethereumBuy":
        assetPrice = ethereumPrice;
        assetWallet = ethereumWallet;
        updateAssetWallet = setEthereumWallet;
        amt = (calculateMaxShares(assetPrice, walletAmount, walletCapacity, cash));
        logMsg = `${currentTime()} - You have bought ${amt} Ethereum at $${numberWithCommas(assetPrice)} for $${numberWithCommas(amt * assetPrice)}`;
        break;
      case "litecoinBuy":
        assetPrice = litecoinPrice;
        assetWallet = litecoinWallet;
        updateAssetWallet = setLitecoinWallet;
        amt = (calculateMaxShares(assetPrice, walletAmount, walletCapacity, cash));
        logMsg = `${currentTime()} - You have bought ${amt} Litecoin at $${numberWithCommas(assetPrice)} for $${numberWithCommas(amt * assetPrice)}`;
        break;
      case "solanaBuy":
        assetPrice = solanaPrice;
        assetWallet = solanaWallet;
        updateAssetWallet = setSolanaWallet;
        amt = (calculateMaxShares(assetPrice, walletAmount, walletCapacity, cash));
        logMsg = `${currentTime()} - You have bought ${amt} Solana at $${numberWithCommas(assetPrice)} for $${numberWithCommas(amt * assetPrice)}`;
        break;
      default:
        alert("You have bought something you can't. What the heck?!");
        break;
    }

    if(assetPrice > cash) {
      needCash()
    } else {
      setCash(cash -= (amt * assetPrice));
      updateAssetWallet(assetWallet += amt);
      setWalletAmount(walletAmount += amt);
      addToLog(logMsg);
    }
  }

  //SELL LOGIC ========================================================
  const handleSell = (e) => {
    if(currentDay === 0) {
      needStartGame();
      return;
    }

    let salePrice, logMsg, assetPrice, assetWallet, updateAssetWallet;
    switch(e.target.id){
      case "bitcoinSell":
        assetPrice = bitcoinPrice;
        assetWallet = bitcoinWallet;
        updateAssetWallet = setBitcoinWallet;
        salePrice = (bitcoinPrice * bitcoinWallet);
        logMsg = `${currentTime()} - You have sold ${bitcoinWallet} Bitcoin at $${numberWithCommas(bitcoinPrice)} for $${numberWithCommas(salePrice)}`;
        break;
      case "ethereumSell":
        assetPrice = ethereumPrice;
        assetWallet = ethereumWallet;
        updateAssetWallet = setEthereumWallet;
        salePrice = (ethereumPrice * ethereumWallet);
        logMsg = `${currentTime()} - You have sold ${ethereumWallet} Ethereum at $${numberWithCommas(ethereumPrice)} for $${numberWithCommas(salePrice)}`;
        break;
      case "litecoinSell":
        assetPrice = litecoinPrice;
        assetWallet = litecoinWallet;
        updateAssetWallet = setLitecoinWallet;
        salePrice = (litecoinPrice * litecoinWallet);
        logMsg = `${currentTime()} - You have sold ${litecoinWallet} Litecoin at $${numberWithCommas(litecoinPrice)} for $${numberWithCommas(salePrice)}`;
        break;
      case "solanaSell":
        assetPrice = solanaPrice;
        assetWallet = solanaWallet;
        updateAssetWallet = setSolanaWallet;
        salePrice = (solanaPrice * solanaWallet);
        logMsg = `${currentTime()} - You have sold ${solanaWallet} Solana at $${numberWithCommas(solanaPrice)} for $${numberWithCommas(salePrice)}`;
        break;
      default:
        alert("somehow you sold something you don't have")
        break;
    }

    if(assetWallet === 0){
      needAsset();
    } else {
      setCash(cash += salePrice)
      setWalletAmount(walletAmount -= assetWallet);
      updateAssetWallet(assetWallet -= assetWallet);
      addToLog(logMsg);
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
        <Header 
          currentDay={currentDay}
          cash={cash}
          debt={debt}
          walletAmount={walletAmount}
          walletCapacity={walletCapacity}
        />

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

        <Actions 
          increaseWalletCapacity={increaseWalletCapacity}
          walletExpansionCost={walletExpansionCost}
          payDebt={payDebt}
          debt={debt}
          advanceDay={advanceDay}
          init={init}
        />

        <Log log={log} />

      </main>
    </div>
  )
}
