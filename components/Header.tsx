import { numberWithCommas } from '../helpers/utils';
import HeaderInfo from './HeaderInfo';

const Header = ({ state }) => {
  const headerItems = [
    {
      label: 'Day',
      value: `${state.currentDay}/${state.days}`,
      testId: 'day',
    },
    {
      label: 'Cash',
      value: `$${numberWithCommas(state.cash)}`,
      testId: 'cash',
    },
    {
      label: 'Debt',
      value: `$${numberWithCommas(state.debt)}`,
      testId: 'debt',
    },
    {
      label: 'Wallet',
      value: `${state.wallet.amount}/${state.wallet.capacity}`,
      testId: 'wallet',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Crypto Frenzy
        </h1>
        <span className="text-3xl">🚀</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {headerItems.map((item) => (
          <HeaderInfo
            key={item.label}
            label={item.label}
            value={item.value}
            testId={item.testId}
          />
        ))}
      </div>

      {state.highScore && (
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4 rounded-lg border border-slate-700">
          <HeaderInfo
            label="High Score"
            value={`$${numberWithCommas(state.highScore)}`}
            testId="highScore"
            className="text-center"
          />
        </div>
      )}
    </div>
  );
};

export default Header;
