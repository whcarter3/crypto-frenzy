const Log = ({ log }) => {
  return (
    <>
      <p className="text-2xl text-white/90 font-semibold tracking-wide">
        ACTIVITY
      </p>
      <div className="panel-crt rounded-lg p-4">
        <ul className="space-y-1.5 text-sm h-[15vh] overflow-y-auto text-white/90">
          {log.map((msg, idx) => (
            <li
              key={idx}
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
