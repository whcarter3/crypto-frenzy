import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen text-crt-yellow bg-crt-bg crt-scanlines flex items-center">
      <Head>
        <title>Crypto Frenzy</title>
        <meta
          name="description"
          content="Retro-styled crypto trading sim."
        />
        <link rel="icon" href="/favicon1.ico" />
      </Head>

      <main className="container mx-auto px-6 md:px-8 py-10 max-w-4xl">
        <div className="bg-black rounded-sm border border-crt-yellow box-shadow-crt p-8 space-y-8">
          <header className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-emerald-400 to-purple-500 bg-clip-text text-transparent text-glow-crt">
                Crypto Frenzy
              </h1>
              <p className="mt-3 text-sm md:text-base text-slate-300 max-w-xl">
                A retro-styled crypto trading sim. Borrow cash, buy
                volatile coins, and try to pay back your debt before
                time runs out.
              </p>
            </div>
            <span className="text-4xl md:text-5xl">🚀</span>
          </header>

          <section className="grid md:grid-cols-2 gap-6 text-sm md:text-base text-slate-300">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-crt-amber">
                Your Mission
              </h2>
              <p>
                Survive the full run of days with more net worth than
                you started. Prices swing wildly every day, and your
                debt interest never sleeps.
              </p>
              <p>
                Stack profits, expand your wallet, and time your
                exits. Diamond hands, but don&apos;t get liquidated.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-crt-cyan">
                How to Play
              </h2>
              <ul className="space-y-1">
                <li>
                  • Click{' '}
                  <span className="text-crt-green">Advance Day</span>{' '}
                  to move time forward.
                </li>
                <li>• Buy low, sell high across multiple assets.</li>
                <li>• Watch your cash, debt, and wallet capacity.</li>
                <li>• Hit a new high score before the final day.</li>
              </ul>
            </div>
          </section>

          <div className="pt-4 flex flex-col sm:flex-row gap-4 items-center">
            <Link
              href="/game"
              className="btn btn-primary flex-1 py-3 text-center text-lg"
            >
              Start Game
            </Link>
            <p className="text-xs md:text-sm text-slate-500 text-center sm:text-left">
              Tip: you can change difficulty and see full rules once
              the game loads.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
