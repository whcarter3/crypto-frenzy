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

          {/* Copy review (owner-approved, 2026-07-17): the instruction
              blocks are gone — YOUR CONTRACT, TERMINAL OPS, and the
              difficulty blurb described things the game teaches by
              playing. The route stays: a desktop game needs its start
              screen. What remains is the pitch and the one fact play
              can't teach (your run survives a reboot). */}
          <section className="text-xs md:text-sm text-slate-300 border-t border-crt-outline pt-6 mt-2 space-y-2">
            <h2 className="text-crt-cyan font-semibold">
              SYSTEM STATUS
            </h2>
            <p>
              Runs auto-save to the local archives — safe to reboot.
            </p>
            <p className="text-slate-500">
              Persistence module:{' '}
              <span className="text-crt-green">ONLINE</span>
            </p>
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

          {/* Meta pages live off the landing screen, out of the game's
              way — same principle as the settings-menu move in 1f G5 */}
          <footer className="flex gap-4 justify-center text-xs text-crt-cyan/60 border-t border-crt-outline pt-4">
            <Link to="/privacy" className="hover:text-crt-cyan">
              PRIVACY
            </Link>
            <span aria-hidden="true">{'//'}</span>
            <Link to="/credits" className="hover:text-crt-cyan">
              CREDITS
            </Link>
            <span aria-hidden="true">{'//'}</span>
            {/* Tip jar, in the only voice an arcade cabinet has. Kept
                out of the gameplay loop on purpose — same principle as
                the 1f G5 meta move. */}
            <a
              href="https://buymeacoffee.com/zzayphod"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-crt-cyan"
              aria-label="Insert coin — buy the developer a coffee"
            >
              INSERT COIN
            </a>
          </footer>
        </div>
      </main>
    </div>
  );
}
