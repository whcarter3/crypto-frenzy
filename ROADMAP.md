# Crypto Frenzy — Release Roadmap

Goal: take the current prototype (playable core loop, live at cryptofrenzy.live) to a
releasable **v1.0 webapp**, then a **downloadable desktop build** via the existing Tauri
scaffold, then optional retention features (leaderboards, daily runs).

## Where the game stands (post Phase 1c)

**Working:** core trade loop with quantity controls (amount input + Max, empty =
max/all), 5 coins with low/mid/high/moon price bands, compounding debt, wallet
capacity upgrades, event flavor text, difficulty modes (Easy/Normal/Hard), run
persistence with resume-or-new from the landing page, a real game-over screen with
run stats, per-mode high scores, seeded runs via `?seed=` (deterministic E2E, daily-
challenge groundwork). **Vite + React SPA** (no framework tax), and the reducer is a
**pure, deterministic game engine** — seeded RNG in state, one intent per action,
replayable from a seed + action log. 43 Vitest unit tests + 10 Cypress E2E tests,
both in CI. Deployed on Vercel; Tauri 2 scaffold builds.

**Known debt / still missing:**

- **Accessibility gaps** — keyboard nav, screen-reader support, reduced-motion,
  contrast (Phase 1d, next up).
- **No settings, no sound, no in-game help** — stubbed "SOON" on the landing page.
- **Mobile layout is broken** — `/game` uses fixed `w-1/4` / `w-1/2` panels.
- **Landing page is no longer prerendered** (accepted Vite tradeoff) — revisit with a
  prerender plugin in Phase 2 if organic search matters.
- **Tauri scaffold half-configured** — identifier and product name are fixed, but
  default icons, `fullscreen: true`, and no release pipeline remain (Phase 3).

---

## Phase 0 — Housekeeping ✅ (shipped in PR #31)

- [x] One name everywhere: **Crypto Frenzy** (`package.json`, `tauri.conf.json`
      productName + window title, landing page). Tauri `identifier` fixed
      (`live.cryptofrenzy.app`) ahead of Phase 3.
- [x] Single version source: landing page reads `package.json` via
      `NEXT_PUBLIC_APP_VERSION`; Tauri via `"version": "../package.json"`.
- [x] `cypress` → `devDependencies`; `eslint-config-next` aligned; `root: true`.
- [x] README rewritten; MIT LICENSE; `vercel.svg` removed; favicon.ico + favicon.svg.

## Phase 1a — Persistence & run lifecycle ✅ (shipped in PR #31)

- [x] Versioned localStorage autosave (`lib/state/persistence.ts`); restore on load;
      "Resume run / New run" on the landing page.
- [x] Real game-over screen with final score, high-score callout, and run stats
      (`components/GameOver.tsx`). Fixed along the way: game over previously never
      fired, and a losing run could clobber the saved high score.
- [x] Difficulty modal re-enabled with a cleaned-up start flow.

## Phase 1b — Replatform ✅ (done)

Swap the foundation before stacking more features on it. Two PRs, in this order:

**Vite migration ✅ (shipped in PR #33)** — replaced Next.js with Vite + React SPA.
- [x] Ported `pages/` to react-router routes; `next/head` → `usePageTitle`;
      `next/link` → router links. `lib/` and components moved untouched.
- [x] Save reads **synchronously** in the `useReducer` lazy initializer; the
      `hydrated` flag, restore-in-effect, and modal-flash gating are gone
      (resolved PR #31 review comments).
- [x] Version string via Vite `define` (`__APP_VERSION__`).
- [x] CI serves `dist/` with SPA fallback; Tauri `frontendDist` → `../dist`;
      `vercel.json` rewrites for deep links. Found in flight: Vercel Analytics
      only works on Vercel — now gated behind a `__VERCEL__` build flag.
- [x] Known tradeoff accepted: landing page lost prerendered HTML (minor SEO
      hit). Mitigate later with a prerender plugin if it matters.
- [x] E2E suite stayed green through the swap (8/8).

**Engine refactor ✅** — the reducer is now the actual game engine.
- [x] One player intent = one action (`START_RUN`, `ADVANCE_DAY`, `BUY_ASSET`,
      `SELL_ASSET`, `PAY_DEBT`, `EXPAND_WALLET`); `ADVANCE_DAY` computes the whole
      day inside the reducer. `advanceDay`/`buySell`/`debt`/`wallet` dispatch
      helpers deleted. `SELL_ASSET` already accepts an optional `amount` for 1c.
- [x] Deterministic seedable RNG (`lib/engine/rng.ts`, mulberry32) with its state
      in game State — a seed + action log replays a whole run. Timestamps left
      the log (now day-stamped) so the engine is fully pure.
- [x] Run stats tracked inside transitions — `trackPeakNetWorth` wrapper removed.
- [x] 40 Vitest unit tests: rng determinism, mode configs, debt compounding,
      price banding, buy/sell cost basis, settle + high-score logic, save
      validation. New `unit-tests` CI job. Save format bumped to v2 (old
      autosaves are discarded once, high scores unaffected).

## Phase 1c — Trading UX ✅ (done)

- [x] Quantity controls for buy/sell: per-row amount input + Max button, where
      **empty = max/all** so the old one-click flow is unchanged. Engine `BUY_ASSET`
      takes an optional clamped `amount` to match `SELL_ASSET`.
- [x] Confirm/feedback affordances: tooltips on buy/sell/Max/inputs and on the
      Pay/Adv Day/wallet-upgrade chips explaining disabled states.
- [ ] Deferred could-have: partial debt payments — skipped for now; paying
      "as much as you can" changes game balance, revisit with the Phase 2
      balance/playtest pass.

## Phase 1d — Accessibility (NEXT UP)

Prioritized ahead of presentation polish (decision 2026-07-03) — table stakes for a
public release, and cheaper to bake in before more UI lands on top.

- [ ] Keyboard navigation: every control reachable and operable by keyboard, visible
      focus states, sensible tab order through the trade table.
- [ ] `aria-live` on the activity log so screen readers announce market events and
      trades; label the quantity inputs and icon-ish buttons properly.
- [ ] Don't rely on color alone: profit/loss and price direction get a symbol/text
      alongside the green/red (partially there via ↑/↓ indicators — audit the rest).
- [ ] Respect `prefers-reduced-motion`: automatically disable the CRT scanline
      flicker/glow animation (the full manual settings toggle arrives in 1e).
- [ ] Contrast audit on the CRT palette (dim white-on-black text, disabled states).

## Phase 1e — Presentation & feel

- [ ] Sound effects (buy, sell, day tick, moonshot, game over) + music toggle; mute
      persisted in settings.
- [ ] Settings panel: sound, **CRT effects toggle** (manual override on top of the
      1d `prefers-reduced-motion` support), reset high scores.
- [ ] In-game "How to play" (the landing page copy is 80% of it already).
- [ ] Responsive pass so `/game` works on phones/tablets.

## Phase 2 — Web release (v1.0 on cryptofrenzy.live)

- [ ] **PWA** via `vite-plugin-pwa`: manifest + service worker + icons. The game is
      fully client-side, so installable + offline is nearly free.
- [ ] SEO/social: OG image, meta tags; revisit landing-page prerender here if organic
      search matters.
- [ ] Error tracking (Sentry) — currently zero visibility into player crashes.
- [ ] Analytics events beyond page views: run started/finished, mode, score.
- [ ] Privacy page (required once you have analytics) + Credits page (IBM Plex Mono
      OFL attribution already lives in the repo).
- [ ] Save-file schema + migrations (PR #34 review): validate saves against a real
      schema (e.g. zod) and migrate old versions forward instead of discarding them.
      Pre-1.0 the manual `SAVE_VERSION` bump-and-discard is intentional; this lands
      before v1.0 ships, once real players have runs worth preserving.
- [ ] Balance/playtest pass — get 5–10 people through full runs on all three modes.
- [ ] Tag **v1.0.0**, announce.

## Phase 3 — Desktop release (Tauri)

- [ ] Finish `tauri.conf.json`: window defaults (windowed, sensible min size), real
      icons from a source logo (`tauri icon` generates the whole set).
- [ ] Release CI: `tauri-action` GitHub workflow building macOS (universal), Windows,
      Linux on tag push → GitHub Releases.
- [ ] Auto-updates via `tauri-plugin-updater` (worth doing before first release so the
      update channel exists from day one).
- [ ] **Signing decision** (see below): macOS Developer ID + notarization ($99/yr);
      Windows cert or ship unsigned with SmartScreen caveat.
- [ ] Distribute: GitHub Releases + **itch.io** first (no signing gate, built-in
      audience for small games, optional pay-what-you-want). Steam later if traction.

## Phase 4 — Retention & depth (could-haves, post-1.0)

Roughly in order of value-for-effort:

1. **Daily challenge** — same seed for everyone each day (the Phase 1b RNG work makes
   the seed date-derived; no backend needed).
2. **Global leaderboard** — needs a tiny backend (decision below). Client-submitted
   scores are spoofable; acceptable for casual play, or verify by replaying the seeded
   action log server-side (also unlocked by the engine refactor).
3. **Run history & stats** — local, cheap, makes single-player sticky.
4. **Achievements** — local first ("paid off debt by day 5", "held a moonshot").
5. **Content depth** — more coins (unlock by level?), events that act on the *player*
   (wallet hacked, exchange freeze — Dopewars-style), bank/staking for idle cash,
   shorting, price-history sparklines in the asset table.

---

## Architecture decisions log

| Date | Decision | Why |
|---|---|---|
| 2026-07-01 | Persist runs as a versioned JSON save file | Format ports unchanged to Tauri (disk) and any future backend |
| 2026-07-02 | **Drop Next.js for Vite + React SPA** | Server-first framework on a client-only game: hydration tax, CVE/upgrade treadmill, CI friction; Vite is Tauri's native pairing |
| 2026-07-02 | **Reducer-as-game-engine, single-intent actions, seedable RNG** | Multi-dispatch helpers forced wrapper-reducer stats tracking (PR #31 review); engine design unlocks unit tests, daily seeds, replay verification |

## Decisions still open

| Decision | Options | Lean |
|---|---|---|
| Mobile support in v1 | Full responsive vs. desktop-only gate | Responsive — it's a web game, half your traffic will be phones |
| Backend for leaderboards | None (local only) vs. serverless (Vercel KV/Postgres, Supabase) | Ship v1.0 with no backend; add serverless leaderboard in Phase 4 |
| macOS signing | $99/yr Apple Developer vs. unsigned (users must right-click-open) | Pay it if desktop is serious; skip for itch.io-only |
| Windows signing | Cert (~$200+/yr) vs. unsigned (SmartScreen warning) | Ship unsigned initially; revisit on traction |
| Monetization | Free / itch pay-what-you-want / Steam paid | Free web + PWYW itch is the natural fit |
| Steam | Now vs. later | Later — only after itch.io validates demand |

## Suggested sequencing

Phases 0–1c are shipped. Next is 1d (accessibility — one focused PR), then 1e
(presentation & feel — likely two PRs: settings+sound, then responsive pass).
Phase 2 is a weekend. Phase 3 is a weekend plus signing paperwork latency.
Phase 4 is open-ended, one feature at a time.
