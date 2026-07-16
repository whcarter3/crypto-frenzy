const Log = ({ log }: { log: string[] }) => {
  return (
    <>
      <h2 className="text-2xl text-white/90 font-semibold tracking-wide">
        ACTIVITY
      </h2>
      <div className="panel-crt rounded-lg p-4">
        <ul
          className="space-y-1.5 text-sm h-[15vh] overflow-y-auto text-white/90"
          aria-live="polite"
          aria-atomic="false"
          aria-label="Activity log"
          tabIndex={0}
        >
          {log.map((msg, idx) => (
            // Entries are prepended (newest first) and never reordered
            // or removed, so keying from the end of the array gives each
            // message a stable identity. Index-based keys would make
            // React mutate every existing <li>'s text on each update
            // instead of inserting one new node — with aria-live that
            // would re-announce the whole log on every day advance.
            <li
              key={log.length - 1 - idx}
              className="border-l-2 border-crt-cyan/50 pl-3 py-0.5"
            >
              {msg}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Log;
