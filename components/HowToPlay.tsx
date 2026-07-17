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

        {/* Two sections, not four (copy review, 2026-07-17): only the
            rules play can't teach — the score rule and Pay's
            all-or-nothing — plus the non-discoverable seed. Everything
            else is taught by the UI at point of use. */}
        <section className="space-y-2 text-slate-300 text-sm leading-relaxed">
          <h2 className="text-crt-green text-base font-semibold">
            Your contract
          </h2>
          <p>
            You start in debt. Trade coins, grow your cash, settle up
            before the run ends.
          </p>
          <p className="text-crt-yellow">
            {/* "cash minus debt" is asserted by settings.cy.ts */}
            Your score is cash minus debt — coins still held when the
            run ends count for nothing. Sell out and clear your debt
            before the close.
          </p>
        </section>

        <section className="space-y-2 text-slate-300 text-sm leading-relaxed">
          <h2 className="text-crt-cyan text-base font-semibold">
            Each day
          </h2>
          <ul className="space-y-1 list-disc list-inside">
            <li>
              Tap a coin to trade.{' '}
              <span className="text-crt-green">Max</span> fills the
              most you can buy — or sell.
            </li>
            <li>
              <span className="text-crt-green">Pay</span> clears your
              debt in full once you have more cash than debt — interest
              is brutal, don&apos;t sit on it.
            </li>
            <li>
              Same market seed, same market — copy the link from the
              sidebar to race a friend.
            </li>
          </ul>
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
