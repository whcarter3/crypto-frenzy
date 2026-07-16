# Crypto Frenzy — Release Roadmap

Goal: take the current prototype (playable core loop, live at cryptofrenzy.live) to a
releasable **v1.0 webapp**, then a **downloadable desktop build** via the existing Tauri
scaffold, then optional retention features (leaderboards, daily runs).

## Where the game stands (post Phase 1e)

**Working:** core trade loop with quantity controls (amount input + Max, empty =
max/all), 5 coins with low/mid/high/moon price bands, compounding debt, wallet
capacity upgrades, event flavor text, difficulty modes (Easy/Normal/Hard), run
persistence with resume-or-new from the landing page, a real game-over screen with
run stats, per-mode high scores, seeded runs via `?seed=` (deterministic E2E, daily-
challenge groundwork). Retro **sound effects** (Web Audio, no assets) with a
**settings panel** (sound + CRT-effects toggles, reset high scores) and an in-game
**How to play**. **Vite + React SPA** (no framework tax), and the reducer is a
**pure, deterministic game engine** — seeded RNG in state, one intent per action,
replayable from a seed + action log. `/game` is responsive (stacks below `lg`) and
passes an automated **cypress-axe** WCAG scan (6 screens/states) with zero
violations, plus a 375px viewport-overflow regression test. 49 Vitest unit tests +
23 Cypress E2E tests, all in CI. Deployed on Vercel; Tauri 2 scaffold builds.

**Known debt / still missing:**

- **UX is rough end-to-end** — responsive ≠ pleasant; comprehensive sweep is
  Phase 1f, next up.
- **Landing page is no longer prerendered** (accepted Vite tradeoff) — revisit with a
  prerender plugin in Phase 2 if organic search matters.
- **Tauri scaffold half-configured** — identifier and product name are fixed, but
  default icons, `fullscreen: true`, and no release pipeline remain (Phase 3).
- **Real-device spot check still worth doing** — mobile layout is guarded by an
  automated 375px Cypress test, but nobody has played a run on an actual phone yet;
  worth a pass on the Vercel preview before v1.0. Sound deserves a real listen too —
  the synthesized bleeps are tested for "plays without errors", not for taste.

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
- [x] Seeded runs surfaced in the UI: optional market-seed input on the start
      screen (pre-filled from `?seed=`), seed shown in-run and on the game-over
      screen with a copyable challenge link. Daily-challenge groundwork.
- [ ] Deferred could-have: partial debt payments — skipped for now; paying
      "as much as you can" changes game balance, revisit with the Phase 2
      balance/playtest pass.

## Phase 1d — Accessibility & responsive ✅ (done)

Accessibility prioritized ahead of presentation polish (decision 2026-07-03) — table
stakes for a public release, cheaper to bake in before more UI lands on top. Folded
the mobile/tablet responsive pass in alongside it (decision 2026-07-03) since both
touch the same layout-heavy components (`AssetTable`, `GameSidebar`, `Game`).

- [x] Keyboard navigation: every control is a native `button`/`input`/`Link` (no
      custom clickable divs); the real gap was `.btn` stripping the focus outline
      with nothing replacing it — added a visible `:focus-visible` ring. Both modals
      got `role="dialog"` + `aria-modal` + `aria-labelledby`.
- [x] `aria-live="polite"` on the activity log. Along the way: its `<li>` keys were
      array indices, but entries are *prepended* — with aria-live that would've made
      screen readers re-announce the whole log on every day advance. Keying from the
      end of the array (stable since entries only ever prepend, never reorder) fixes
      the reconciliation without any new state.
- [x] Labeled the quantity inputs and per-asset Buy/Sell/Max buttons (`aria-label`
      naming the asset — visually redundant, but a screen reader tabbing through 5
      identical "Buy" buttons has no other way to tell them apart); hid decorative
      emoji (`aria-hidden`) from screen readers.
- [x] Color-alone audit: profit/loss already carried +/− signs and ↑/↓ arrows
      everywhere — no changes needed, confirmed rather than assumed.
- [x] `prefers-reduced-motion` respected globally (covers today's notification
      slide-in and the Phase 1e CRT flicker whenever it's wired back up — see below).
- [x] Contrast audit via **cypress-axe** (`color-contrast` is part of axe's default
      WCAG ruleset) instead of manual spot-checks — more rigorous and now a
      permanent CI gate, not a one-time pass. 4 new tests scan the landing page,
      difficulty modal, in-game screen, and game-over screen; started at 4
      violations (an unlabeled hidden test-mode button, a heading-order skip, no
      `<h1>` on the bare game screen, an unfocusable scrollable log) and ended at 0.
- [x] Responsive pass: `Game.tsx`'s sidebar now stacks above the trade area below
      `lg`; the difficulty modal's 3-column button grid did the same (its buttons'
      `white-space: nowrap` was blowing out the whole page on narrow screens — a
      grid track can't shrink below unwrappable content). Found two more real bugs
      while verifying by hand: `GameSidebar`'s holdings table lacked the
      `overflow-x-auto` its sibling `AssetTable` already had, so `table-layout:auto`
      blew out the page instead of scrolling locally; and a lingering `w-1/2` cap on
      the trade column meant even an ordinary 1280px desktop needed to
      horizontal-scroll to reach the Buy button once Phase 1c widened the row —
      widened it to match `Actions` below, which was already full-width.
- [x] Viewport-overflow regression test (`cypress/e2e/responsive.cy.ts`) — a
      correction to an earlier note that called this test "infrastructure
      flakiness": it was flagging a **real bug**. At a true 375px viewport the
      game screen forced ~600px of width (flex items' `min-width: auto` flooring
      them at the tables'/log's intrinsic width, plus a stray `mx-auto` that
      disabled flex stretch and sized the trade column to its content). Manual
      verification had missed it because the un-fixed layout inflated the dev
      preview pane's own layout viewport to match — the environment could never
      show a real phone width until the bug it was hiding was fixed. Cypress's
      viewport was the honest instrument all along. Fixed with `min-w-0` on the
      main flex chain and removing `mx-auto`; the test now guards 375px through
      the full trade flow plus the desktop side-by-side layout.

## Phase 1e — Presentation & feel ✅ (done)

- [x] Sound effects (buy, sell, pay, day tick, moonshot fanfare, game-over jingle,
      last-day warning) — synthesized retro bleeps via Web Audio (`lib/sound.ts`),
      zero assets, on-brand for a CRT terminal. Gated by the sound setting; safe
      no-ops under SSR/tests/blocked-autoplay. Background *music* needs an actual
      track and is deferred to the 1f UX sweep (a bad loop is worse than none).
- [x] Settings panel (`components/Settings.tsx`): sound + CRT-effects toggles,
      persisted in `cryptoFrenzySettings` localStorage (separate from game state —
      device preference, not run state). CRT toggle is one `data-crt` attribute on
      `<html>` + CSS overrides killing scanlines/flicker/glow; layered on the 1d
      `prefers-reduced-motion` support. Reset-high-scores button included (takes
      effect next run — the in-run display keeps the loaded value; UX-sweep nit).
- [x] In-game "How to play" (`components/HowToPlay.tsx`): contract, daily loop,
      market bands, seeds — including the load-bearing tip that unsold holdings
      don't count toward the score. Both modals reachable from the sidebar and
      covered by axe scans + E2E (toggles persist across reload).

## Phase 1f — Comprehensive UX sweep (NEXT UP)

The layout is *responsive* after 1d, but the moment-to-moment experience is rough
(owner verdict 2026-07-03: "the UI is definitely responsive, but the UX is awful").
One dedicated pass over how the game *feels* to play, mobile-first, before release
polish in Phase 2. Candidate items — inventory properly at the start of the phase
by playing full runs on phone + desktop:

- [ ] Mobile information hierarchy: prices/actions likely belong above the sidebar
      stats (currently a full screen of NET WORTH/HOLDINGS before the market is
      visible); the Cash/Debt/Days chips live below the fold entirely.
- [ ] Trade flow friction: buy/sell need less precision on a phone (bigger tap
      targets, maybe a per-asset trade sheet instead of inline inputs).
- [ ] Day-advance pacing and feedback: price changes are instant and silent — no
      sense of what moved since yesterday (deltas, flash-on-change).
- [ ] Log noise vs. signal: separators and flavor events drown the lines that
      matter; consider grouping by day or highlighting events.
- [ ] Oversized numbers (NET WORTH panel) vs. tiny controls; general type scale.
- [ ] Landing page menu stubs (PROFILES/CREDITS "SOON") — ship or cut.
- [ ] Background music (deferred from 1e — needs a real track or a decent loop).

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
| 2026-07-03 | **Fold the mobile/tablet responsive pass into Phase 1d (accessibility)** | Both touch the same layout components; smaller viewports and assistive tech share a lot of the same fixes (focus order, semantic structure) |
| 2026-07-03 | **Insert Phase 1f: comprehensive UX sweep before the Phase 2 release push** | Post-1d verdict: layout is responsive but the experience is rough — a dedicated feel/flow pass beats sprinkling UX fixes across release tasks |

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

Phases 0–1e are shipped. Next is 1f (comprehensive UX sweep — inventory by
playing real runs on phone + desktop, then fix). Phase 2 is a weekend. Phase 3 is a weekend plus signing paperwork
latency. Phase 4 is open-ended, one feature at a time.
