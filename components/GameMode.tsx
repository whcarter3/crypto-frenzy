import { Dispatch, useState } from 'react';
import { Action, State } from '../lib/types';
import { cn } from '../lib/cn';
import { clearSave } from '../lib/state/persistence';
import { loadHighScore } from '../lib/state/highScores';
import { trackEvent } from '../lib/analytics';

type GameMode = 'Easy' | 'Normal' | 'Hard' | 'Test';

const modeDescriptions = {
  Easy: {
    title: 'Beginner Friendly',
    // The old blurb claimed "higher starting cash" — Easy actually
    // starts with LESS cash than Normal ($1,500 vs $2,000); its edge
    // is days and interest (copy review, 2026-07-17)
    description: 'More days, gentler interest. Room to learn.',
    features: [
      '60 days',
      '10% debt interest',
      '$2,000 initial debt',
      '$1,500 starting cash',
    ],
  },
  Normal: {
    title: 'Balanced Challenge',
    description: 'The standard contract.',
    features: [
      '20% debt interest',
      '30 days',
      '$2,000 initial debt',
      '$2,000 starting cash',
    ],
  },
  Hard: {
    title: 'Expert Mode',
    description: 'Steep interest, short clock. For closers.',
    features: [
      '30% debt interest',
      '20 days',
      '$4,000 initial debt',
      '$2,000 starting cash',
    ],
  },
};

const GameMode = ({
  dispatch,
  state,
}: {
  dispatch: Dispatch<Action>;
  state: State;
}) => {
  // Pre-fill the seed from a ?seed= URL param (shareable runs); the
  // player can override it or leave it empty for a random market.
  const [seedInput, setSeedInput] = useState(
    () => new URLSearchParams(window.location.search).get('seed') ?? '',
  );

  const handleStart = () => {
    clearSave(); // starting a new run invalidates any old autosave
    const parsed = Number(seedInput);
    const seed =
      seedInput.trim() !== '' && Number.isFinite(parsed) && parsed > 0
        ? parsed
        : Date.now() >>> 0;
    trackEvent('run_started', {
      mode: state.mode,
      // whether the player brought a seed (shared/challenge link),
      // not the seed itself
      seeded: seedInput.trim() !== '',
    });
    dispatch({
      type: 'START_RUN',
      payload: {
        mode: state.mode,
        seed,
        highScore: loadHighScore(state.mode),
      },
    });
  };

  const modes: { name: GameMode }[] = [
    { name: 'Easy' },
    { name: 'Normal' },
    { name: 'Hard' },
  ];

  const currentMode = state.mode;

  const getModeButtonClasses = (modeName: GameMode, isSelected: boolean) =>
    cn(
      'btn',
      modeName === 'Easy' &&
        (isSelected
          ? 'bg-green-500/20 text-green-400 border-green-500/50 ring-2 ring-green-500/50 ring-offset-2 ring-offset-slate-800'
          : 'bg-slate-700/50 text-slate-300 border-slate-600 hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/30'),
      modeName === 'Normal' &&
        (isSelected
          ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 ring-2 ring-amber-500/50 ring-offset-2 ring-offset-slate-800'
          : 'bg-slate-700/50 text-slate-300 border-slate-600 hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/30'),
      modeName === 'Hard' &&
        (isSelected
          ? 'bg-purple-500/20 text-purple-400 border-purple-500/50 ring-2 ring-purple-500/50 ring-offset-2 ring-offset-slate-800'
          : 'bg-slate-700/50 text-slate-300 border-slate-600 hover:bg-purple-500/10 hover:text-purple-400 hover:border-purple-500/30'),
    );

  const getModeTitleClasses = (modeName: GameMode) =>
    cn(
      'font-semibold mb-2',
      modeName === 'Easy' && 'text-green-400',
      modeName === 'Normal' && 'text-amber-400',
      modeName === 'Hard' && 'text-purple-400',
      modeName === 'Test' && 'text-slate-400',
    );

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-10 flex items-center justify-center p-4 md:p-8">
      <div
        className="bg-black w-full max-w-3xl max-h-[600px] rounded-sm border border-crt-yellow box-shadow-crt p-6 md:p-8 space-y-6 md:space-y-8 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gameModeTitle"
        tabIndex={0}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h1
              id="gameModeTitle"
              className="text-2xl md:text-3xl font-bold text-slate-300 text-glow-crt"
            >
              Crypto Frenzy
            </h1>
            <span className="text-3xl" aria-hidden="true">
              🚀
            </span>
          </div>

          <p className="text-slate-300 leading-relaxed">
            Borrowed cash. Compounding debt. A market with no mercy.
            Make your money before the clock runs out.
          </p>
        </div>

        <div className="space-y-4">
          <h2
            className="text-slate-300 text-lg font-medium"
            id="difficultyMode"
          >
            Choose your difficulty:{' '}
            <span className="text-blue-400">{state.mode}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            {modes.map((mode) => {
              const isSelected = state.mode === mode.name;
              return (
                <button
                  key={mode.name}
                  className={getModeButtonClasses(mode.name, isSelected)}
                  onClick={() =>
                    dispatch({
                      type: 'CHANGE_MODE',
                      payload: mode.name,
                    })
                  }
                  id={`${mode.name.toLowerCase()}Mode`}
                >
                  {mode.name}
                </button>
              );
            })}
          </div>

          {modeDescriptions[currentMode] && (
            <div className="mt-6 bg-black rounded-sm border border-crt-yellow box-shadow-crt p-4">
              <h3 className={getModeTitleClasses(currentMode)}>
                {modeDescriptions[currentMode].title}
              </h3>
              <p className="text-slate-300 mb-4">
                {modeDescriptions[currentMode].description}
              </p>
              <ul className="space-y-2">
                {modeDescriptions[currentMode].features.map(
                  (feature, index) => (
                    <li
                      key={index}
                      className="flex items-center text-slate-300"
                    >
                      <span className="mr-2">•</span>
                      {feature}
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="flex items-stretch gap-3">
          <input
            id="seedInput"
            type="number"
            min={1}
            value={seedInput}
            onChange={(e) => setSeedInput(e.target.value)}
            placeholder="seed: random"
            aria-label="Market seed (optional) — same seed, same market"
            className="w-36 shrink-0 bg-black/40 border border-white/20 rounded px-3 text-sm text-white/90 placeholder:text-white/40"
            data-cy="seedInput"
            title="Same seed = same market. Share one to race a friend."
          />
          <button
            className="btn btn-primary flex-1 py-3 text-lg"
            onClick={handleStart}
            id="startGame"
          >
            Start Run
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameMode;
