const HeaderInfo = ({
  label,
  value,
  testId,
  className,
}: {
  label: string;
  value: string;
  testId: string;
  className?: string;
}) => (
  <div
    data-cy={testId}
    className={`bg-slate-800/50 p-3 rounded-lg border border-slate-700 ${
      className || ''
    }`}
  >
    <p className="text-sm text-slate-400">{label}</p>
    <p className="text-lg font-semibold text-slate-200">{value}</p>
  </div>
);

export default HeaderInfo;
