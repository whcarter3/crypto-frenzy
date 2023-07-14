type priceMovement = "crash" | "moon"

const southAmericanCountries = [
  "Argentina",
  "Bolivia",
  "Brazil",
  "Chile",
  "Colombia",
  "Ecuador",
  "Guyana",
  "Paraguay",
  "Peru",
  "Suriname",
  "Uruguay",
  "Venezuela",
]

export const priceMovementEvent = (
  asset: string,
  crashOrMoon: priceMovement
) => {
  const moonEvents = [
    `Elon Musk sent a tweet saying only "${asset.toUpperCase()}". It's going to the moon!`,
    `${
      southAmericanCountries[
        Math.floor(Math.random() * southAmericanCountries.length)
      ]
    } has adopted ${asset} as their national currency! Sell high!`,
    `${asset} has reached meme status. All time highs!`,
    `Goldman Sachs has announced they are investing in ${asset}! Ride this wave!`,
    `A tanker carrying 1 million ${asset} wallets has sunk off the coast of Madagascar! Prices skyrocket!`,
    `Epic Games has announced that they will accept ${asset} as payment for Fortnite skins! Default dance your way to the bank!`,
    `The US government has announced that they will be backing the US Dollar with ${asset}! USA! USA! USA!`,
    `The World Series of Poker's main prize is now 1 million ${asset}! All in!`,
    `A glitch in ${asset}'s code deleted half of the supply! Prices soar!`,
    `Marty McFly has traveled back in time and bought $1 million of ${asset}! Don't miss out!`,
    `A reddit thread on r/wallstreetbets about ${asset} has gone viral! Sell high!`,
    `Apes figured out how to use ${asset} to buy bananas! Prices are apeeling!`,
    `The NBA has announced that they will be paying players in ${asset}! Scores and prices are up!`,
    `For no particular technical or news event, ${asset} has gone parabolic!`,
  ]

  const crashEvents = [
    `Mark Zuckerberg has announced that he will purchase the rights to ${asset} for Facebook! Prices plummet!`,
    `A russian hacker has stolen 1 million ${asset} wallets! Prices plummet!`,
    `A popular exchange has been hacked! ${asset}'s value plummets!`,
    `The FTC has announced that they will be investigating ${asset} for fraud! Buy low!`,
    `${asset} has been banned in China! Get in now!`,
    `${asset} has been proven to accelerate global warming. Temperatures rise, prices drop!`,
    `Aliens are are abducting everyone who owns ${asset}! Wait till they leave and buy!`,
    `AI gains sentience and sabotages the ${asset} network! Catch the bottom!`,
    `${
      southAmericanCountries[
        Math.floor(Math.random() * southAmericanCountries.length)
      ]
    } is backing out of ${asset}! Back the truck up and dump your money in!`,
    `Kim Jong Un has announced that he will be using ${asset} to fund his nuclear program! The world sells it off to stop his plans!`,
    `A top senator sells off all their holdings of ${asset}! Prices plummet!`,
    `Elon Musk tweeted only "${asset.toUpperCase()}", but misspelled! Crash!`,
    `A submarine full of billionaires blew up near the sub-ocean internet lines and crashed the ${asset} network! Buy low!`,
  ]

  return crashOrMoon === "crash"
    ? `📉😲 ${crashEvents[Math.floor(Math.random() * crashEvents.length)]}`
    : `🚀🌝 ${moonEvents[Math.floor(Math.random() * moonEvents.length)]}`
}
