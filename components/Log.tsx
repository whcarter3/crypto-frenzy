const SEPARATOR = /^=+ End of Day (\d+) =+$/;
const TRADE = /^\[Day \d+\]/;

/**
 * The activity feed, with a visual hierarchy instead of a wall of
 * identical lines (1f C3): market events read bright, your own trades
 * read quiet, day boundaries are thin markers instead of `====` walls
 * (and empty days collapse into one marker instead of stacking two).
 *
 * Height: phones get a fixed slice; on desktop the panel is sized by
 * the --log-h variable so the drag divider in Game can resize it (E4)
 * instead of capping it at three lines above dead space (E3).
 */
const Log = ({ log }: { log: string[] }) => {
  // Entries are prepended (newest first) and never reordered or
  // removed, so keying from the end of the array gives each message a
  // stable identity. Index-based keys would make React mutate every
  // existing <li>'s text on each update instead of inserting one new
  // node — with aria-live that would re-announce the whole log on
  // every day advance.
  const items: { key: number; msg: string }[] = log.map(
    (msg, idx) => ({ key: log.length - 1 - idx, msg }),
  );

  // Collapse runs of day separators (an eventless day stacks two in a
  // row): keep only the first of each run — newest first, so that's
  // the latest day boundary.
  const visible = items.filter(
    ({ msg }, idx) =>
      !(
        SEPARATOR.test(msg) &&
        idx > 0 &&
        SEPARATOR.test(items[idx - 1].msg)
      ),
  );

  const lineClass = (msg: string): string => {
    if (msg.includes('MOONSHOT'))
      return 'border-l-2 border-crt-green/60 pl-3 py-0.5 text-crt-green';
    if (msg.startsWith('🚀'))
      return 'border-l-2 border-crt-green/50 pl-3 py-0.5';
    if (msg.startsWith('📉'))
      return 'border-l-2 border-crt-red/50 pl-3 py-0.5';
    if (TRADE.test(msg))
      return 'border-l-2 border-white/15 pl-3 py-0.5 text-white/60';
    return 'border-l-2 border-crt-cyan/50 pl-3 py-0.5';
  };

  return (
    <>
      <h2 className="text-sm text-white/60 font-semibold tracking-widest uppercase">
        Activity
      </h2>
      <div className="panel-crt rounded-lg p-4">
        <ul
          className="space-y-1.5 text-sm h-[15vh] lg:h-[var(--log-h,40vh)] overflow-y-auto text-white/90"
          aria-live="polite"
          aria-atomic="false"
          aria-label="Activity log"
          tabIndex={0}
        >
          {visible.map(({ key, msg }) => {
            const day = msg.match(SEPARATOR);
            return day ? (
              <li
                key={key}
                className="text-crt-cyan/40 text-xs uppercase tracking-widest text-center py-1"
              >
                — end of day {day[1]} —
              </li>
            ) : (
              <li key={key} className={lineClass(msg)}>
                {msg}
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
};

export default Log;
