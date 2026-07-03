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
npm run dev        # Vite dev server on http://localhost:3000
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

The game is a fully client-side Vite + React SPA — no server, no API.
Game logic lives in `lib/` (a pure, deterministic reducer engine), UI in
`components/`, routes in `pages/`.

Runs are seeded: append `?seed=<number>` to `/game` for a deterministic run
(the E2E suite pins `?seed=42`; sharing a seed reproduces the same market).

## Testing

E2E tests run with Cypress against a production build:

```bash
npm run build                      # outputs to dist/
npx serve -s dist -l 3000          # serve the build (SPA fallback)
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
