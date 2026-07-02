# Crypto Frenzy — Release Roadmap

Goal: take the current prototype (playable core loop, live at cryptofrenzy.live) to a
releasable **v1.0 webapp**, then a **downloadable desktop build** via the existing Tauri
scaffold, then optional retention features (leaderboards, daily runs).

## Where the game stands (post [PR #31](https://github.com/whcarter3/crypto-frenzy/pull/31))

**Working:** core trade loop (buy max / sell all), 5 coins with low/mid/high/moon price
bands, compounding debt, wallet capacity upgrades, event flavor text, difficulty modes
(Easy/Normal/Hard), run persistence with resume-or-new from the landing page, a real
game-over screen with run stats, per-mode high scores, Cypress E2E suite (8 tests) in
GitHub Actions, static export deployed on Vercel, Tauri 2 scaffold that builds.

**Known debt / still missing:**

- **Next.js platform mismatch** — a server-first framework wrapped around a game with
  no server. Prerendering forces the hydration dance in `pages/game.tsx` (the
  `hydrated` flag, restore-in-effect, modal-flash gating), the pages router is aging
  with a CVE-upgrade treadmill (see the pile of Snyk PRs), and CI already tripped once
  on static-export vs `next start`. Decision: **migrate to Vite** (Phase 1b).
- **Game logic is split across dispatch helpers and the reducer** — `advanceDay` fires
  8+ actions per day tick, which is why stats tracking needed the `trackPeakNetWorth`
  wrapper flagged in PR #31 review. Decision: **reducer-as-game-engine refactor**
  (Phase 1b).
- **All randomness is bare `Math.random()`** — blocks seeded/daily runs, replay
  verification, and deterministic tests. Folded into the engine refactor.
- **Buy is all-in only, sell is all-out only** (`lib/buySell.ts`) — no quantity control.
- **No settings, no sound, no in-game help** — stubbed "SOON" on the landing page.
- **Mobile layout is broken** — `/game` uses fixed `w-1/4` / `w-1/2` panels.
- **No unit tests** — E2E only; the money math deserves fast tests (unlocked by the
  engine refactor).
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

## Phase 1b — Replatform (NEXT UP)

Swap the foundation before stacking more features on it. Two PRs, in this order:

**Vite migration** — replace Next.js with Vite + React SPA.
- [ ] Port `pages/` to routes (react-router or equivalent); `next/head` → document
      titles; `next/link` → router links. `lib/` and components are already
      framework-free and should move untouched.
- [ ] Read the save **synchronously** in the `useReducer` lazy initializer — no
      prerender means no hydration mismatch. Delete the `hydrated` flag, the
      restore-in-effect, and the modal-flash gating (resolves PR #31 review comments).
- [ ] Version string via Vite `define`/`import.meta.env` (replaces
      `NEXT_PUBLIC_APP_VERSION`).
- [ ] Update CI (`vite build`, serve `dist/`) and Tauri config
      (`frontendDist`, `devUrl`, beforeDev/BuildCommand).
- [ ] Known tradeoff: landing page loses prerendered HTML (minor SEO hit).
      Mitigate later with a prerender plugin for the landing route if it matters.
- [ ] E2E suite green before and after — it's the migration safety net.

**Engine refactor** — make the reducer the actual game engine.
- [ ] One player intent = one action: `ADVANCE_DAY` computes the entire day transition
      (prices, events, debt, logs) inside the reducer; kill multi-dispatch helpers.
- [ ] Injectable, seedable RNG threaded through the engine — unlocks daily challenges,
      replay verification, and deterministic tests.
- [ ] Run stats tracked inside transitions — removes the `trackPeakNetWorth` wrapper.
- [ ] Unit tests for the economy: reducer transitions, cost-basis math, debt
      compounding, price banding.

## Phase 1c — Trading UX

- [ ] Quantity controls for buy/sell (input + Max button) instead of forced
      all-in/all-out.
- [ ] Confirm/feedback affordances: disable states that explain themselves, tooltips.
- [ ] Optional could-have: partial debt payments (currently pay-in-full only).

## Phase 1d — Presentation & feel

- [ ] Sound effects (buy, sell, day tick, moonshot, game over) + music toggle; mute
      persisted in settings.
- [ ] Settings panel: sound, **CRT effects toggle** (scanline flicker is an
      accessibility issue — also respect `prefers-reduced-motion`), reset high scores.
- [ ] In-game "How to play" (the landing page copy is 80% of it already).
- [ ] Responsive pass so `/game` works on phones/tablets.
- [ ] Accessibility pass: keyboard navigation, `aria-live` on the event log, don't
      rely on color alone for profit/loss.

## Phase 2 — Web release (v1.0 on cryptofrenzy.live)

- [ ] **PWA** via `vite-plugin-pwa`: manifest + service worker + icons. The game is
      fully client-side, so installable + offline is nearly free.
- [ ] SEO/social: OG image, meta tags; revisit landing-page prerender here if organic
      search matters.
- [ ] Error tracking (Sentry) — currently zero visibility into player crashes.
- [ ] Analytics events beyond page views: run started/finished, mode, score.
- [ ] Privacy page (required once you have analytics) + Credits page (IBM Plex Mono
      OFL attribution already lives in the repo).
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

Phase 1b is next and comes as two PRs (Vite migration, then engine refactor) — swap
the foundation before building on it. Phases 1c–1d are the feature meat (2–3
weekends). Phase 2 is a weekend. Phase 3 is a weekend plus signing paperwork latency.
Phase 4 is open-ended, one feature at a time.
