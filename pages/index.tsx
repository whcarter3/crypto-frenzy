import { useState } from "react"
import Head from "next/head"
import config from "../config/config"
import { AlertMessages, showAlert } from "../helpers/alerts"
import {
  calculateMaxShares,
  numberWithCommas,
  randomizePrice,
  currentTime,
  addToLog,
} from "../helpers/utils"
import { needAsset } from "../helpers/stateCheck"
import type { Wallet } from "../lib/types"
import Table from "../components/Table"
import Actions from "../components/Actions"
import Header from "../components/Header"
import Log from "../components/Log"

export default function Home() {
  let startingLogMsg = `- Click Advance Day to start.`

  //GAME STATE ================================================
  const [bitcoinPrice, setBitcoinPrice] = useState(0)
  const [ethereumPrice, setEthereumPrice] = useState(0)
  const [litecoinPrice, setLitecoinPrice] = useState(0)
  const [solanaPrice, setSolanaPrice] = useState(0)
  const [currentDay, setCurrentDay] = useState(0)
  const [cash, setCash] = useState(config.cash)
  const [log, setLog] = useState([startingLogMsg])
  const [highScore, setHighScore] = useState(0)
  const [wallet, setWallet] = useState<Wallet>({
    capacity: config.wallet.startingCapacity,
    amount: 0,
    bitcoin: 0,
    ethereum: 0,
    litecoin: 0,
    solana: 0,
    expansionCost: config.wallet.cost,
  })
  const [debt, setDebt] = useState(config.debt)

  //NEW GAME INIT FUNCTION =====================================
  function init() {
    setCurrentDay(0)
    setBitcoinPrice(0)
    setEthereumPrice(0)
    setLitecoinPrice(0)
    setSolanaPrice(0)
    setCash(config.cash)
    setWallet({
      capacity: config.wallet.startingCapacity,
      amount: 0,
      bitcoin: 0,
      ethereum: 0,
      litecoin: 0,
      solana: 0,
      expansionCost: config.wallet.cost,
    })
    setDebt(config.debt)
    setLog([startingLogMsg])
  }

  //ADVANCE DAY LOGIC ===================================
  const advanceDay = () => {
    //warning before last day
    if (currentDay === config.days - 1) {
      showAlert(AlertMessages.LAST_DAY)
    }
    //end of game -- alert score -- set high score -- restart
    if (currentDay >= config.days) {
      alert(
        `This round has been completed. You amassed $${numberWithCommas(
          cash - debt
        )}! Click to start a new game.`
      )
      if (cash > highScore) {
        setHighScore(cash)
      }
      init()
    } else {
      if (currentDay === 0) {
        //sets initial prices to randomized value from mid range
        addToLog(`======== Start of Game =========`, setLog)
        addToLog(
          `- You borrowed $${numberWithCommas(config.cash)} at ${
            config.interestRate * 100
          }% daily interest`,
          setLog
        )
        addToLog(
          `- You have ${config.days} days to make as much money as you can! 💎🙌`,
          setLog
        )
        setBitcoinPrice(
          randomizePrice(
            config.assets.bitcoin.range.mid[0],
            config.assets.bitcoin.range.mid[1]
          )
        )
        setEthereumPrice(
          randomizePrice(
            config.assets.ethereum.range.mid[0],
            config.assets.ethereum.range.mid[1]
          )
        )
        setLitecoinPrice(
          randomizePrice(
            config.assets.litecoin.range.mid[0],
            config.assets.litecoin.range.mid[1]
          )
        )
        setSolanaPrice(
          randomizePrice(
            config.assets.solana.range.mid[0],
            config.assets.solana.range.mid[1]
          )
        )
      } else {
        //randomizes prices with chance to hit high/low range
        addToLog(`========= End of Day ${currentDay} =========`, setLog)
        randomizePriceVariance("BTC")
        randomizePriceVariance("ETH")
        randomizePriceVariance("LTC")
        randomizePriceVariance("SOL")
        //increase date based on daily %
        setDebt(Math.floor(debt + debt * config.interestRate))
      }
      //increase day
      setCurrentDay(currentDay + 1)
    }
  }

  //RANDOMIZE PRICE LOGIC =====================================
  //bell curve chance to hit low/mid/high range
  const randomizePriceVariance = (asset) => {
    switch (asset) {
      case "BTC":
        //rand # between 0 - 99 which allows whole # %s for price ranges
        let coinFlipBTC = Math.floor(Math.random() * 100)
        //low range
        if (coinFlipBTC < 2) {
          setBitcoinPrice(
            randomizePrice(
              config.assets.bitcoin.range.low[0],
              config.assets.bitcoin.range.low[1]
            )
          )
          addToLog(
            `${currentTime()} - 🐋 A whale has dumped Bitcoin and the price has plummeted!`,
            setLog
          )
          //mid range
        } else if (coinFlipBTC >= 2 && coinFlipBTC < 97) {
          setBitcoinPrice(
            randomizePrice(
              config.assets.bitcoin.range.mid[0],
              config.assets.bitcoin.range.mid[1]
            )
          )
          //high range
        } else {
          setBitcoinPrice(
            randomizePrice(
              config.assets.bitcoin.range.high[0],
              config.assets.bitcoin.range.high[1]
            )
          )
          addToLog(
            `${currentTime()} - 🚀🌕 Bitcoin is going to the moon`,
            setLog
          )
        }
        break
      case "ETH":
        let coinFlipETH = Math.floor(Math.random() * 100)
        //low range
        if (coinFlipETH < 2) {
          setEthereumPrice(
            randomizePrice(
              config.assets.ethereum.range.low[0],
              config.assets.ethereum.range.low[1]
            )
          )
          addToLog(
            `${currentTime()} - 🐋 A whale has dumped Ethereum and the price has plummeted`,
            setLog
          )
          //mid range
        } else if (coinFlipETH >= 2 && coinFlipETH < 97) {
          setEthereumPrice(
            randomizePrice(
              config.assets.ethereum.range.mid[0],
              config.assets.ethereum.range.mid[1]
            )
          )
          //high range
        } else {
          setEthereumPrice(
            randomizePrice(
              config.assets.ethereum.range.high[0],
              config.assets.ethereum.range.high[1]
            )
          )
          addToLog(
            `${currentTime()} - 🚀🌕 Ethereum is going to the moon!`,
            setLog
          )
        }
        break
      case "LTC":
        let coinFlipLTC = Math.floor(Math.random() * 100)
        //low range
        if (coinFlipLTC < 2) {
          setLitecoinPrice(
            randomizePrice(
              config.assets.litecoin.range.low[0],
              config.assets.litecoin.range.low[1]
            )
          )
          addToLog(
            `${currentTime()} - 🐋 A whale has dumped Litecoin and the price has plummeted!`,
            setLog
          )
          //mid range
        } else if (coinFlipLTC >= 2 && coinFlipLTC < 97) {
          setLitecoinPrice(
            randomizePrice(
              config.assets.litecoin.range.mid[0],
              config.assets.litecoin.range.mid[1]
            )
          )
          //high range
        } else {
          setLitecoinPrice(
            randomizePrice(
              config.assets.litecoin.range.high[0],
              config.assets.litecoin.range.high[1]
            )
          )
          addToLog(
            `${currentTime()} - 🚀🌕 Litecoin is going to the moon!`,
            setLog
          )
        }
        break
      case "SOL":
        let coinFlipSOL = Math.floor(Math.random() * 100)
        //low range
        if (coinFlipSOL < 10) {
          setSolanaPrice(
            randomizePrice(
              config.assets.solana.range.low[0],
              config.assets.solana.range.low[1]
            )
          )
          //mid range
        } else if (coinFlipSOL >= 10 && coinFlipSOL < 97) {
          setSolanaPrice(
            randomizePrice(
              config.assets.solana.range.mid[0],
              config.assets.solana.range.mid[1]
            )
          )
          //high range
        } else {
          setSolanaPrice(
            randomizePrice(
              config.assets.solana.range.high[0],
              config.assets.solana.range.high[1]
            )
          )
          addToLog(
            `${currentTime()} - 🚀🌕 Solana is going to the moon!`,
            setLog
          )
        }
        break
      default:
        alert("you're changing the price of something that doesn't exist")
    }
  }

  //WALLET EXPANSION LOGIC ====================
  const increaseWalletCapacity = () => {
    //error checks =====
    if (currentDay == 0) {
      showAlert(AlertMessages.NEED_START)
      return
    }
    if (cash < wallet.expansionCost) {
      alert("You do not have enough cash to expand your wallet")
      return
    }
    // =================
    setWallet((prevWallet) => ({
      ...prevWallet,
      capacity: prevWallet.capacity + config.wallet.increase,
    }))
    setCash(cash - wallet.expansionCost)
    //increase wallet expansion cost by 25% after each purchase
    setWallet((prevWallet) => ({
      ...prevWallet,
      expansionCost: Math.floor(
        prevWallet.expansionCost +
          prevWallet.expansionCost * config.wallet.percentIncreace
      ),
    }))
    addToLog(
      `${currentTime()} - You have increased your wallet capacity to ${
        wallet.capacity
      }`,
      setLog
    )
    addToLog(
      `${currentTime()} - Wallet Expansion cost has increased in price by 25% to $${numberWithCommas(
        wallet.expansionCost
      )}`,
      setLog
    )
  }

  const needCashCheck = (price) => {
    if (price > cash) {
      showAlert(AlertMessages.NEED_CASH)
      return
    }
  }

  const makePurchase = (amt, assetPrice) => {
    setCash(cash - amt * assetPrice)
  }

  //BUY LOGIC ===============================
  const handleBuy = (e) => {
    //error checks =====
    if (currentDay === 0) {
      showAlert(AlertMessages.NEED_START)
      return
    }
    if (wallet.amount >= wallet.capacity) {
      showAlert(AlertMessages.NEED_WALLET)
      return
    }
    // =================
    let amt: number
    switch (e.target.id) {
      case "bitcoinBuy":
        needCashCheck(bitcoinPrice)
        amt = calculateMaxShares(
          bitcoinPrice,
          wallet.amount,
          wallet.capacity,
          cash
        )
        setWallet((prevWallet) => ({
          ...prevWallet,
          bitcoin: prevWallet.bitcoin + amt,
          amount: prevWallet.amount + amt,
        }))
        makePurchase(amt, bitcoinPrice)
        addToLog(
          `${currentTime()} - You have bought ${amt} Bitcoin at $${numberWithCommas(
            bitcoinPrice
          )} for $${numberWithCommas(amt * bitcoinPrice)}`,
          setLog
        )
        break
      case "ethereumBuy":
        needCashCheck(ethereumPrice)
        amt = calculateMaxShares(
          ethereumPrice,
          wallet.amount,
          wallet.capacity,
          cash
        )
        setWallet((prevWallet) => ({
          ...prevWallet,
          ethereum: prevWallet.ethereum + amt,
          amount: prevWallet.amount + amt,
        }))
        makePurchase(amt, ethereumPrice)
        addToLog(
          `${currentTime()} - You have bought ${amt} Ethereum at $${numberWithCommas(
            ethereumPrice
          )} for $${numberWithCommas(amt * ethereumPrice)}`,
          setLog
        )
        break
      case "litecoinBuy":
        needCashCheck(litecoinPrice)
        amt = calculateMaxShares(
          litecoinPrice,
          wallet.amount,
          wallet.capacity,
          cash
        )
        setWallet((prevWallet) => ({
          ...prevWallet,
          litecoin: prevWallet.litecoin + amt,
          amount: prevWallet.amount + amt,
        }))
        makePurchase(amt, litecoinPrice)
        addToLog(
          `${currentTime()} - You have bought ${amt} Litecoin at $${numberWithCommas(
            litecoinPrice
          )} for $${numberWithCommas(amt * litecoinPrice)}`,
          setLog
        )
        break
      case "solanaBuy":
        needCashCheck(solanaPrice)
        amt = calculateMaxShares(
          solanaPrice,
          wallet.amount,
          wallet.capacity,
          cash
        )
        setWallet((prevWallet) => ({
          ...prevWallet,
          solana: prevWallet.solana + amt,
          amount: prevWallet.amount + amt,
        }))
        makePurchase(amt, solanaPrice)
        addToLog(
          `${currentTime()} - You have bought ${amt} Solana at $${numberWithCommas(
            solanaPrice
          )} for $${numberWithCommas(amt * solanaPrice)}`,
          setLog
        )
        break
      default:
        alert("You have bought something you can't. What the heck?!")
        break
    }
  }

  //SELL LOGIC ========================================================
  const handleSell = (e) => {
    if (currentDay === 0) {
      showAlert(AlertMessages.NEED_START)
      return
    }

    let salePrice
    switch (e.target.id) {
      case "bitcoinSell":
        needAsset(wallet, "bitcoin")
        setWallet((prevWallet) => ({
          ...prevWallet,
          bitcoin: prevWallet.amount - prevWallet.bitcoin,
          amount: prevWallet.amount - prevWallet.bitcoin,
        }))
        salePrice = bitcoinPrice * wallet.bitcoin
        setCash(cash + salePrice)
        addToLog(
          `${currentTime()} - You have sold ${
            wallet.bitcoin
          } Bitcoin at $${numberWithCommas(
            bitcoinPrice
          )} for $${numberWithCommas(salePrice)}`,
          setLog
        )
        break
      case "ethereumSell":
        needAsset(wallet, "ethereum")
        setWallet((prevWallet) => ({
          ...prevWallet,
          ethereum: prevWallet.amount - prevWallet.ethereum,
          amount: prevWallet.amount - prevWallet.ethereum,
        }))
        salePrice = ethereumPrice * wallet.ethereum
        setCash(cash + salePrice)
        addToLog(
          `${currentTime()} - You have sold ${
            wallet.ethereum
          } Ethereum at $${numberWithCommas(
            ethereumPrice
          )} for $${numberWithCommas(salePrice)}`,
          setLog
        )
        break
      case "litecoinSell":
        needAsset(wallet, "litecoin")
        setWallet((prevWallet) => ({
          ...prevWallet,
          litecoin: prevWallet.amount - prevWallet.litecoin,
          amount: prevWallet.amount - prevWallet.litecoin,
        }))
        salePrice = litecoinPrice * wallet.litecoin
        setCash(cash + salePrice)
        addToLog(
          `${currentTime()} - You have sold ${
            wallet.litecoin
          } Litecoin at $${numberWithCommas(
            litecoinPrice
          )} for $${numberWithCommas(salePrice)}`,
          setLog
        )
        break
      case "solanaSell":
        needAsset(wallet, "solana")
        setWallet((prevWallet) => ({
          ...prevWallet,
          solana: prevWallet.amount - prevWallet.solana,
          amount: prevWallet.amount - prevWallet.solana,
        }))
        salePrice = solanaPrice * wallet.solana
        setCash(cash + salePrice)
        addToLog(
          `${currentTime()} - You have sold ${
            wallet.solana
          } Solana at $${numberWithCommas(solanaPrice)} for $${numberWithCommas(
            salePrice
          )}`,
          setLog
        )
        break
      default:
        alert("somehow you sold something you don't have")
        break
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
          walletAmount={wallet.amount}
          walletCapacity={wallet.capacity}
        />

        <Table
          handleBuy={handleBuy}
          handleSell={handleSell}
          bitcoinPrice={bitcoinPrice}
          bitcoinWallet={wallet.bitcoin}
          ethereumPrice={ethereumPrice}
          ethereumWallet={wallet.ethereum}
          litecoinPrice={litecoinPrice}
          litecoinWallet={wallet.litecoin}
          solanaPrice={solanaPrice}
          solanaWallet={wallet.solana}
        />

        <Actions
          increaseWalletCapacity={increaseWalletCapacity}
          walletExpansionCost={wallet.expansionCost}
          debt={debt}
          advanceDay={advanceDay}
          init={init}
          currentDay={currentDay}
          setLog={setLog}
          setDebt={setDebt}
          cash={cash}
          setCash={setCash}
        />

        <Log log={log} />
      </main>
    </div>
  )
}
