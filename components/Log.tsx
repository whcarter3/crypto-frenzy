const Log = ({ log }) => {
  return (
    <div className="max-w-md">
      <ul className="border border-sky-600 bg-slate-800 rounded mt-8 max-h-56 w-full p-4 overflow-auto inline-block text-xs">
        {log.map((msg, idx) => {
          return <li key={idx}>{msg}</li>
        })}
      </ul>
    </div>
  )
}

export default Log
