import { cn } from '../lib/cn';

const HeaderInfo = ({
  label,
  value,
  testId,
  className,
  trend,
  description,
}: {
  label: string;
  value: string;
  testId: string;
  className?: string;
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
}) => (
  <div
    data-cy={testId}
    className={cn(
      'bg-black p-3 rounded-sm border border-crt-yellow box-shadow-crt',
      className,
    )}
    title={description}
  >
    <p className="text-sm text-slate-400 mb-1">{label}</p>
    <div className="flex items-center gap-2">
      <p className="text-lg font-semibold text-slate-200">{value}</p>
      {trend && (
        <span
          className={cn(
            'text-sm',
            trend === 'up' && 'text-green-400',
            trend === 'down' && 'text-red-400',
            trend === 'neutral' && 'text-slate-400',
          )}
        >
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '•'}
        </span>
      )}
    </div>
  </div>
);

export default HeaderInfo;
