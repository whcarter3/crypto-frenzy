const SEPARATOR = /^=+ End of Day (\d+) =+$/;
const TRADE = /^\[Day \d+\]/;

type Entry = { key: number; msg: string };

/**
 * The activity feed. Today's entries stream into an aria-live list;
 * every finished day folds into a collapsible <details> group under
 * its "end of day" header (owner note, 2026-07-17) — history is one
 * tap away instead of a wall of text. Market events read bright,
 * moonshots green, crashes red-edged, your own trades quiet.
 *
 * Height: phones get a fixed slice; on desktop the panel is sized by
 * the --log-h variable so the drag divider in Game can resize it.
 */
const Log = ({ log }: { log: string[] }) => {
  // Entries are prepended (newest first) and never reordered or
  // removed, so keying from the end of the array gives each message a
  // stable identity — in the live region, index keys would re-announce
  // the whole list on every update.
  const entries: Entry[] = log.map((msg, idx) => ({
    key: log.length - 1 - idx,
    msg,
  }));

  // Group: everything above the first separator is today; each
  // separator starts the (finished) day it names, holding the entries
  // that follow it in the array.
  const today: Entry[] = [];
  const days: { day: string; key: number; items: Entry[] }[] = [];
  for (const entry of entries) {
    const match = entry.msg.match(SEPARATOR);
    if (match) {
      days.push({ day: match[1], key: entry.key, items: [] });
    } else if (days.length > 0) {
      days[days.length - 1].items.push(entry);
    } else {
      today.push(entry);
    }
  }

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

  const renderItems = (items: Entry[]) =>
    items.map(({ key, msg }) => (
      <li key={key} className={lineClass(msg)}>
        {msg}
      </li>
    ));

  return (
    <>
      <h2 className="text-sm text-white/60 font-semibold tracking-widest uppercase">
        Activity
      </h2>
      <div className="panel-crt rounded-lg p-4">
        <div
          className="h-[15vh] lg:h-[var(--log-h,40vh)] overflow-y-auto space-y-1.5 text-sm text-white/90"
          role="region"
          aria-label="Activity log"
          tabIndex={0}
        >
          <ul
            className="space-y-1.5"
            aria-live="polite"
            aria-atomic="false"
            aria-label="Latest events"
          >
            {renderItems(today)}
            {/* Screen-reader-only day boundary: the visual markers
                moved out of this live region into the fold headers
                below, which silenced End Day entirely on eventless
                days (live regions announce additions; the fold is a
                removal). The newest marker rides along here — keyed
                by its log entry, so each day announces exactly once. */}
            {days.length > 0 && (
              <li key={days[0].key} className="sr-only">
                End of day {days[0].day}
              </li>
            )}
          </ul>
          {days.map(({ day, key, items }) =>
            items.length > 0 ? (
              <details key={key} className="group">
                {/* /70 resting, not /40: this is an interactive
                    control now and the dimmer tint fell below WCAG
                    contrast — which the axe gate can't catch here
                    (the CRT overlay makes axe mark contrast checks
                    incomplete rather than failed) */}
                <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer text-crt-cyan/70 hover:text-crt-cyan text-xs uppercase tracking-widest text-center py-1 select-none">
                  <span
                    className="inline-block mr-1.5 transition-transform group-open:rotate-90"
                    aria-hidden="true"
                  >
                    ▸
                  </span>
                  end of day {day} · {items.length}
                  <span className="sr-only"> entries</span>
                </summary>
                <ul className="space-y-1.5 pt-1">
                  {renderItems(items)}
                </ul>
              </details>
            ) : (
              // A day where nothing happened: just the marker
              <p
                key={key}
                className="text-crt-cyan/60 text-xs uppercase tracking-widest text-center py-1"
              >
                — end of day {day} —
              </p>
            ),
          )}
        </div>
      </div>
    </>
  );
};

export default Log;
