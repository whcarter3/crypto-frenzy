const Log = ({ log }) => {
  return (
    <div className="bg-black rounded-sm border-2 border-crt-yellow p-4 box-shadow-crt">
      <h3 className="text-lg font-semibold text-slate-300 mb-3 drop-shadow-crt">
        Activity Log
      </h3>
      <ul className="space-y-2 max-h-64 overflow-y-auto text-sm">
        {log.map((msg, idx) => {
          return (
            <li
              key={idx}
              className="text-slate-400 border-l-2 border-slate-600 pl-3 py-1"
            >
              {msg}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Log;
