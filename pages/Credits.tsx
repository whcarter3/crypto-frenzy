import { Link } from 'react-router-dom';
import { usePageTitle } from '../helpers/usePageTitle';

export default function Credits() {
  usePageTitle('Crypto Frenzy – Credits');

  return (
    <div className="min-h-screen text-crt-green bg-crt-bg crt-scanlines flex items-center">
      <main className="container mx-auto px-6 md:px-8 py-10 max-w-4xl">
        <div className="bg-crt-bg/80 rounded-sm border border-crt-cyan box-shadow-crt p-8 space-y-6">
          <header>
            <p className="text-xs text-crt-cyan/70 mb-1">
              [ ARCADE TERMINAL // PERSONNEL FILE ]
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-crt-green text-glow-crt">
              CREDITS
            </h1>
          </header>

          <section className="text-sm text-slate-300 space-y-4">
            <dl className="space-y-3">
              <div>
                <dt className="text-crt-cyan uppercase tracking-wider text-xs">
                  A game by
                </dt>
                <dd>Will Carter</dd>
              </div>
              <div>
                <dt className="text-crt-cyan uppercase tracking-wider text-xs">
                  Typeface
                </dt>
                <dd>
                  IBM Plex Mono, bundled under the{' '}
                  <a
                    href="/IBM_Plex_Mono/OFL.txt"
                    className="text-crt-cyan hover:text-crt-green underline"
                  >
                    SIL Open Font License
                  </a>
                  .
                </dd>
              </div>
              <div>
                <dt className="text-crt-cyan uppercase tracking-wider text-xs">
                  Sound
                </dt>
                <dd>
                  Every bleep synthesized live with the Web Audio API —
                  no recorded assets, the way a hacked CRT would want it.
                </dd>
              </div>
              <div>
                <dt className="text-crt-cyan uppercase tracking-wider text-xs">
                  Built with
                </dt>
                <dd>
                  React + Vite, and an agentic co-developer (Claude
                  Code). The roadmap, decision log, and full history are
                  public on{' '}
                  <a
                    href="https://github.com/whcarter3/crypto-frenzy"
                    className="text-crt-cyan hover:text-crt-green underline"
                  >
                    GitHub
                  </a>
                  .
                </dd>
              </div>
              <div>
                <dt className="text-crt-cyan uppercase tracking-wider text-xs">
                  Lineage
                </dt>
                <dd>
                  In the tradition of Dopewars and every buy-low,
                  sell-high terminal sim that came before it.
                </dd>
              </div>
            </dl>
          </section>

          <div className="pt-2 border-t border-crt-outline">
            <Link
              to="/"
              className="text-xs text-crt-cyan/70 hover:text-crt-cyan"
            >
              &larr; BACK TO TERMINAL
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
