import { numberWithCommas } from '../helpers/utils';
import HeaderInfo from './HeaderInfo';
import { State } from '../lib/types';

type Trend = 'up' | 'down' | 'neutral';

interface HeaderItem {
  label: string;
  value: string;
  testId: string;
  trend: Trend;
  description: string;
}

const Header = ({ state }: { state: State }) => {
  const getDaysTrend = (): Trend => {
    if (state.currentDay === 0) return 'neutral';
    return state.currentDay >= state.days * 0.75 ? 'down' : 'neutral';
  };

  const getCashTrend = (): Trend => {
    if (state.cash === 0) return 'neutral';
    return state.cash > state.debt ? 'up' : 'down';
  };

  const getDebtTrend = (): Trend => {
    if (state.debt === 0) return 'neutral';
    return state.debt > state.cash ? 'down' : 'up';
  };

  const getWalletTrend = (): Trend => {
    if (state.wallet.amount === 0) return 'neutral';
    return state.wallet.amount === state.wallet.capacity
      ? 'down'
      : 'up';
  };

  const headerItems: HeaderItem[] = [
    {
      label: 'Day',
      value: `${state.currentDay}/${state.days}`,
      testId: 'day',
      trend: getDaysTrend(),
      description: `${state.days - state.currentDay} days remaining`,
    },
    {
      label: 'Cash',
      value: `$${numberWithCommas(state.cash)}`,
      testId: 'cash',
      trend: getCashTrend(),
      description:
        state.cash > state.debt
          ? 'Cash exceeds debt'
          : 'Cash below debt',
    },
    {
      label: 'Debt',
      value: `$${numberWithCommas(state.debt)}`,
      testId: 'debt',
      trend: getDebtTrend(),
      description: `${state.mode} mode: ${
        state.mode === 'Easy'
          ? '10%'
          : state.mode === 'Normal'
          ? '20%'
          : '30%'
      } daily interest`,
    },
    {
      label: 'Wallet',
      value: `${state.wallet.amount}/${state.wallet.capacity}`,
      testId: 'wallet',
      trend: getWalletTrend(),
      description: `${
        state.wallet.capacity - state.wallet.amount
      } slots available`,
    },
  ];

  const getNetWorth = (): number => {
    const assetsValue = Object.values(state.assets).reduce(
      (total, asset) => {
        if (!asset.active) return total;
        return total + asset.price * asset.wallet;
      },
      0
    );
    return assetsValue + state.cash - state.debt;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Crypto Frenzy
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-400">
            {state.mode} Mode
          </span>
          <span className="text-3xl">🚀</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {headerItems.map((item) => (
          <HeaderInfo key={item.label} {...item} />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {state.highScore && (
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4 rounded-lg border border-slate-700">
            <HeaderInfo
              label="High Score"
              value={`$${numberWithCommas(state.highScore)}`}
              testId="highScore"
              trend={
                getNetWorth() > state.highScore ? 'up' : 'neutral'
              }
              description="Your best performance so far"
            />
          </div>
        )}
        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 p-4 rounded-lg border border-slate-700">
          <HeaderInfo
            label="Net Worth"
            value={`$${numberWithCommas(getNetWorth())}`}
            testId="netWorth"
            trend={getNetWorth() > 0 ? 'up' : 'down'}
            description="Total assets value + cash - debt"
          />
        </div>
      </div>
    </div>
  );
};

export default Header;
