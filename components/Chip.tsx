import { numberWithCommas } from '../helpers/utils';
import { cn } from '../lib/cn';

function Chip({
  figure,
  label,
  color = 'cyan',
  button,
  currency = false,
  className,
  dataCy,
}: {
  figure: string;
  label: string;
  color?: 'red' | 'green' | 'cyan';
  currency?: boolean;
  button?: {
    bool: boolean;
    label: string;
    action: () => void;
    id?: string;
  };
  className?: string;
  dataCy?: string;
}) {
  return (
    <div
      className={cn(
        'chip-crt rounded p-3 flex justify-end flex-1 text-right items-center',
        button && 'gap-8',
        className,
      )}
    >
      <div>
        <p
          className={cn('text-5xl font-bold', `text-crt-${color}`)}
          data-cy={dataCy ?? label.toLowerCase()}
        >
          {currency ? `$${numberWithCommas(figure)}` : figure}
        </p>
        <p className="text-base text-white/70 uppercase tracking-wider">
          {label}
        </p>
      </div>

      {button && (
        <button
          className={cn(
            'btn justify-self-start',
            button.bool && 'btn-disabled',
            !button.bool && 'btn-primary',
          )}
          onClick={button.action}
          disabled={button.bool}
          id={button.id ?? button.label.toLowerCase().replace(/\s+/g, '-')}
        >
          {button.label}
        </button>
      )}
    </div>
  );
}

export default Chip;
