import { useState } from 'react';
import { Link } from 'react-router-dom';
import { hasSave, clearSave } from '../lib/state/persistence';
import { usePageTitle } from '../helpers/usePageTitle';

export default function Home() {
  usePageTitle('Crypto Frenzy');

  // No prerender, so localStorage is readable on first render
  const [saveExists] = useState(() => hasSave());

  return (
    <div className="min-h-screen text-crt-green bg-crt-bg crt-scanlines flex items-center">
      <main className="container mx-auto px-6 md:px-8 py-10 max-w-4xl">
        <div className="bg-crt-bg/80 rounded-sm border border-crt-cyan box-shadow-crt p-8 space-y-8">
          <header className="flex items-start justify-between gap-6">
            <div>
              <p className="text-xs text-crt-cyan/70 mb-1">
                [ ARCADE TERMINAL // BUILD {__APP_VERSION__} ]
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-crt-green text-glow-crt">
                CRYPTO FRENZY
              </h1>
              <p className="mt-3 text-sm md:text-base text-slate-300 max-w-xl">
                A retro trading sim running on a hacked CRT terminal.
                Borrow dirty money, ride volatile coins, and clear
                your debt before the corp shuts you down.
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="text-4xl md:text-5xl" aria-hidden="true">
                🚀
              </span>
              <span className="text-xs text-crt-cyan/70">
                NETLINK STATUS:{' '}
                <span className="text-crt-green">ONLINE</span>
              </span>
            </div>
          </header>

          <section className="grid md:grid-cols-2 gap-6 text-sm md:text-base text-slate-300">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-crt-green">
                YOUR CONTRACT
              </h2>
              <p>
                Survive the full run of days with more net worth than
                you started. Prices desync every cycle and compound
                interest hunts you in the dark.
              </p>
              <p>
                Stack profits, expand your wallet, and time your
                exits. Diamond hands… but one bad tick and you&apos;re
                liquidated.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-crt-cyan">
                TERMINAL OPS
              </h2>
              <ul className="space-y-1">
                <li>
                  • Click{' '}
                  <span className="text-crt-green">Advance Day</span>{' '}
                  to move time forward.
                </li>
                <li>• Buy low, sell high across hostile markets.</li>
                <li>
                  • Watch cash, debt, and wallet capacity like a hawk.
                </li>
                <li>
                  • Push a new high score before the final cycle
                  closes.
                </li>
              </ul>
            </div>
          </section>

          <section className="grid md:grid-cols-3 gap-4 text-xs md:text-sm text-slate-300 border-t border-crt-outline pt-6 mt-2">
            <div className="space-y-2">
              <h3 className="text-crt-cyan font-semibold">
                MAIN MENU
              </h3>
              <ul className="space-y-1">
                <li>▶ START RUN</li>
                <li className="text-slate-500">▢ PROFILES (SOON)</li>
                <li className="text-slate-500">▢ SETTINGS (SOON)</li>
                <li className="text-slate-500">▢ CREDITS (SOON)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="text-crt-cyan font-semibold">
                DIFFICULTY (IN-GAME)
              </h3>
              <p>
                Select Easy, Normal, or Hard when the run boots. Each
                mode adjusts days, starting cash, and how fast your
                debt mutates.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-crt-cyan font-semibold">
                SYSTEM STATUS
              </h3>
              <p>
                Save data lives in local corp archives — your run
                survives a reboot of this browser.
              </p>
              <p className="text-slate-500">
                Persistence module:{' '}
                <span className="text-crt-green">ONLINE</span>
              </p>
            </div>
          </section>

          <div className="pt-6 flex flex-col sm:flex-row gap-4 items-center">
            {saveExists ? (
              <>
                <Link
                  to="/game"
                  className="btn btn-primary flex-1 py-3 text-center text-lg"
                  id="resumeRun"
                >
                  RESUME RUN
                </Link>
                <Link
                  to="/game"
                  onClick={() => clearSave()}
                  className="btn btn-danger flex-1 py-3 text-center text-lg"
                  id="newRun"
                >
                  NEW RUN
                </Link>
              </>
            ) : (
              <Link
                to="/game"
                className="btn btn-primary flex-1 py-3 text-center text-lg"
                id="startRun"
              >
                START RUN
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
