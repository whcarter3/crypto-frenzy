# Crypto Frenzy 🚀

A retro CRT-styled crypto trading sim. Borrow dirty money, ride volatile coins, and
clear your debt before the days run out — buy low, sell high, and don't let the
compounding interest eat you alive.

**Play it live:** [cryptofrenzy.live](https://cryptofrenzy.live)

## How it works

- You start in debt, with a little cash and a wallet that only holds so many coins.
- Each **Advance Day** re-rolls prices across five coins (BTC, ETH, LTC, SOL, DOGE),
  fires market events (moonshots, crashes), and compounds your debt.
- Buy low, sell high, expand your wallet, pay off the loan shark.
- When the run ends, your score is `cash − debt`. High scores are saved per difficulty.

## Development

Requires Node 24 (see `.node-version`).

```bash
npm install
npm run dev        # dev server on http://localhost:3000
npm run lint       # eslint
```

The game is a fully client-side Next.js app (`output: 'export'`) — no server, no API.
Game logic lives in `lib/` (reducer, prices, buy/sell, debt), UI in `components/`,
pages in `pages/`.

## Testing

E2E tests run with Cypress against a static build:

```bash
npm run build                      # outputs to out/
npx serve out -l 3000              # serve the static export
npm test                           # cypress run (in another shell)
```

CI runs the same suite on every PR via GitHub Actions.

## Desktop build (Tauri)

A [Tauri 2](https://tauri.app) scaffold lives in `src-tauri/` (requires the Rust
toolchain):

```bash
npx tauri dev      # run desktop app against the dev server
npx tauri build    # bundle a release build from the static export
```

## Roadmap

See [ROADMAP.md](./ROADMAP.md) for the path to v1.0 (web) and the downloadable
desktop release.

## License

[MIT](./LICENSE). IBM Plex Mono is bundled under the
[SIL Open Font License](./public/IBM_Plex_Mono/OFL.txt).
