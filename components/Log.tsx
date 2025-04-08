const Log = ({ log }) => {
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
      <h3 className="text-lg font-semibold text-slate-300 mb-3">
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
