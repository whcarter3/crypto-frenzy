const Log = ({ log }) => {
  return (
    <div className="panel-crt rounded-lg p-4">
      <h3 className="text-sm font-semibold text-crt-cyan mb-3 tracking-wide">
        ACTIVITY LOG
      </h3>
      <ul className="space-y-1.5 h-48 overflow-y-auto text-sm text-white/90">
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
  );
};

export default Log;
