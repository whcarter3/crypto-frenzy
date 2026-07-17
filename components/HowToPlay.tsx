const HowToPlay = ({ onClose }: { onClose: () => void }) => {
  return (
    <div
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-10 flex items-center justify-center p-4 md:p-8"
      data-cy="howToPlayScreen"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <div
        className="bg-black w-full max-w-2xl max-h-[85vh] rounded-sm border border-crt-yellow box-shadow-crt p-6 md:p-8 space-y-5 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="howToPlayTitle"
        tabIndex={0}
      >
        <h1
          id="howToPlayTitle"
          className="text-2xl font-bold text-slate-300 text-glow-crt"
        >
          How to play
        </h1>

        <section className="space-y-2 text-slate-300 text-sm leading-relaxed">
          <h2 className="text-crt-green text-base font-semibold">
            Your contract
          </h2>
          <p>
            You start in debt, with a little cash and a wallet that only
            holds so many coins. Survive the run and finish with as much
            money as you can.
          </p>
          <p className="text-crt-yellow">
            Your score is cash minus debt — coins still in your wallet
            when the run ends count for nothing. Sell before the final
            day, and pay off the loan.
          </p>
        </section>

        <section className="space-y-2 text-slate-300 text-sm leading-relaxed">
          <h2 className="text-crt-cyan text-base font-semibold">
            Each day
          </h2>
          <ul className="space-y-1 list-disc list-inside">
            <li>
              <span className="text-crt-green">Adv Day</span> re-rolls
              every price and compounds your debt.
            </li>
            <li>
              Buy low, sell high. Set an amount with −/+ or type it —
              <span className="text-crt-green"> Max</span> fills the
              most you can afford,{' '}
              <span className="text-crt-green">All</span> sells the
              whole position.
            </li>
            <li>
              <span className="text-crt-green">Pay</span> clears your
              debt in full once you have more cash than debt — interest
              is brutal, don&apos;t sit on it.
            </li>
            <li>
              Expand your wallet when capacity pinches — each upgrade
              doubles it, and doubles the next upgrade&apos;s price.
            </li>
          </ul>
        </section>

        <section className="space-y-2 text-slate-300 text-sm leading-relaxed">
          <h2 className="text-crt-cyan text-base font-semibold">
            The market
          </h2>
          <p>
            Prices swing between crash, normal, and hot ranges — and once
            in a while a coin <span className="text-crt-green">moons</span>.
            Watch the activity feed: news events tell you when something
            crashed or took off.
          </p>
        </section>

        <section className="space-y-2 text-slate-300 text-sm leading-relaxed">
          <h2 className="text-crt-cyan text-base font-semibold">
            Seeds
          </h2>
          <p>
            Every run has a market seed. The same seed always produces
            the same prices and events — copy the seed link from the
            sidebar or game-over screen to race a friend on the exact
            same market.
          </p>
        </section>

        <button
          className="btn btn-primary w-full py-3"
          onClick={onClose}
          id="howToPlayClose"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default HowToPlay;
