import { Link } from 'react-router-dom';
import { usePageTitle } from '../helpers/usePageTitle';

/* Voice rule: flavor outside, utility inside — arrival/exit pages get
   the CRT-noir framing, but privacy facts themselves stay plain. */
export default function Privacy() {
  usePageTitle('Crypto Frenzy – Privacy');

  return (
    <div className="min-h-screen text-crt-green bg-crt-bg crt-scanlines flex items-center">
      <main className="container mx-auto px-6 md:px-8 py-10 max-w-4xl">
        <div className="bg-crt-bg/80 rounded-sm border border-crt-cyan box-shadow-crt p-8 space-y-6">
          <header>
            <p className="text-xs text-crt-cyan/70 mb-1">
              [ ARCADE TERMINAL // SURVEILLANCE DISCLOSURE ]
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-crt-green text-glow-crt">
              PRIVACY
            </h1>
          </header>

          <section className="text-sm text-slate-300 space-y-4">
            <p>
              The corp watches the market, not you. Here is everything
              this game knows, in plain language:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <span className="text-crt-cyan">No accounts, no personal
                data.</span>{' '}
                There is nothing to sign up for and nothing to leak.
              </li>
              <li>
                <span className="text-crt-cyan">Your runs stay on your
                device.</span>{' '}
                Saves, settings, and high scores live in your
                browser&apos;s localStorage. Clearing your browser data
                deletes them; we never see them.
              </li>
              <li>
                <span className="text-crt-cyan">Anonymous analytics.</span>{' '}
                Hosting is on Vercel, and Vercel Web Analytics counts
                page views plus three gameplay facts: a run started
                (difficulty, whether it used a shared seed) and a run
                finished (difficulty, final score). It is cookieless,
                aggregated, and not tied to you. No ads, no cross-site
                tracking, nothing sold to anyone.
              </li>
              <li>
                <span className="text-crt-cyan">Seed links carry only the
                seed.</span>{' '}
                Sharing a challenge link shares a market, not a player.
              </li>
            </ul>
            <p className="text-slate-500">
              Questions? Open an issue on{' '}
              <a
                href="https://github.com/whcarter3/crypto-frenzy"
                className="text-crt-cyan hover:text-crt-green underline"
              >
                GitHub
              </a>
              .
            </p>
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
