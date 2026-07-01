import { Dispatch } from 'react';
import Link from 'next/link';
import { Action, State } from '../lib/types';
import { formatMoney, getModeEmoji } from '../helpers/utils';
import { cn } from '../lib/cn';
import { clearSave } from '../lib/state/persistence';

const GameOver = ({
  state,
  dispatch,
}: {
  state: State;
  dispatch: Dispatch<Action>;
}) => {
  if (!state.gameOver) return null;

  const { score, newHighScore } = state.gameOver;
  const { peakNetWorth, totalTrades, bestTradeProfit } = state.stats;

  const handlePlayAgain = () => {
    clearSave();
    // INIT resets the run and reopens the difficulty modal
    dispatch({ type: 'INIT' });
  };

  const stats = [
    { label: 'Peak Net Worth', value: formatMoney(peakNetWorth) },
    { label: 'Trades Made', value: `${totalTrades}` },
    { label: 'Best Trade', value: formatMoney(bestTradeProfit) },
  ];

  return (
    <div
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-10 flex items-center justify-center p-4 md:p-8"
      data-cy="gameOverScreen"
    >
      <div className="bg-black w-full max-w-2xl rounded-sm border border-crt-yellow box-shadow-crt p-6 md:p-8 space-y-6 overflow-y-auto">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-300 text-glow-crt">
            RUN COMPLETE
          </h1>
          <span className="text-3xl">
            {getModeEmoji(state.mode)}
          </span>
        </div>

        <div className="text-center space-y-2 py-4">
          <p className="text-sm text-white/70 uppercase tracking-wider">
            Final Score — {state.mode} Mode
          </p>
          <p
            className={cn(
              'text-5xl md:text-6xl font-bold',
              score >= 0 && 'text-crt-green',
              score < 0 && 'text-crt-red',
            )}
            data-cy="finalScore"
          >
            {formatMoney(score)}
          </p>
          {newHighScore ? (
            <p className="text-lg font-semibold text-crt-yellow text-glow-crt">
              🏆 NEW HIGH SCORE!
            </p>
          ) : (
            state.highScore != null && (
              <p className="text-sm text-white/70">
                High score: {formatMoney(state.highScore)}
              </p>
            )
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="panel-crt rounded-lg p-3 space-y-1"
            >
              <p className="text-lg font-bold text-crt-cyan">
                {stat.value}
              </p>
              <p className="text-xs text-white/70 uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            className="btn btn-primary flex-1 py-3 text-lg"
            onClick={handlePlayAgain}
            id="playAgain"
          >
            Play Again
          </button>
          <Link
            href="/"
            className="btn flex-1 py-3 text-lg text-center"
            id="mainMenu"
          >
            Main Menu
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GameOver;
