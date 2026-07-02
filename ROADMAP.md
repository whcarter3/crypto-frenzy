# Crypto Frenzy — Release Roadmap

Goal: take the current prototype (playable core loop, live at cryptofrenzy.live) to a
releasable **v1.0 webapp**, then a **downloadable desktop build** via the existing Tauri
scaffold, then optional retention features (leaderboards, daily runs).

## Where the game stands today

**Working:** core trade loop (buy max / sell all), 5 coins with low/mid/high/moon price
bands, compounding debt, wallet capacity upgrades, event flavor text, per-mode high
scores in localStorage, Cypress E2E suite running in GitHub Actions, static export
deployed on Vercel, Tauri 2 scaffold that builds.

**Missing or broken (found in code):**

- **No run persistence** — a page refresh loses the entire run. Landing page says
  "Persistence module: WIP".
- **No real game-over screen** — `advanceDay` dispatches `TOGGLE_MODAL` at game end, but
  the `GameMode` modal is commented out of `pages/game.tsx`, so the run just… stops,
  with only a toast notification.
- **Difficulty modes are dark-launched** — Easy/Hard logic is fully implemented in
  `lib/reducer.ts` but the selector modal is commented out; Normal only.
- **Buy is all-in only, sell is all-out only** — `lib/buySell.ts` always buys
  `calculateMaxShares` and sells the full position. No quantity control.
- **No settings, no sound, no help/tutorial** — all stubbed "SOON" on the landing page.
- **Mobile layout is broken** — `/game` uses fixed `w-1/4` / `w-1/2` panels.
- **Identity crisis** — `package.json` name `crypto-wars` v0.9.0, Tauri product
  `crypto-wars` v0.1.0 titled "Crypto Wars", site branded "Crypto Frenzy", landing page
  hardcodes "BUILD 0.1.0".
- **Tauri config is unshippable as-is** — identifier is `com.tauri.dev` (signing/stores
  require a real one), default icons, `fullscreen: true`.
- **Housekeeping** — README is create-next-app boilerplate; `cypress` is in
  `dependencies` instead of `devDependencies`; `eslint-config-next` is v12 against
  Next 13; no LICENSE; leftover `public/vercel.svg`; no unit tests (E2E only); all
  randomness is bare `Math.random()` (blocks seeded/daily runs and deterministic tests).

---

## Phase 0 — Housekeeping ✅ (done)

Cheap, do-first cleanup so everything after sits on a clean base.

- [x] Pick the name (**Crypto Frenzy**) and apply it everywhere:
      `package.json`, `tauri.conf.json` (`productName`, window title), landing page.
      Also fixed the Tauri `identifier` (`live.cryptofrenzy.app`) ahead of Phase 3.
- [x] Single source of truth for version; the landing page reads it from
      `package.json` via `NEXT_PUBLIC_APP_VERSION`, Tauri via `"version": "../package.json"`.
- [x] Move `cypress` to `devDependencies`; align `eslint-config-next` with Next 13.
- [x] Rewrite README for the actual game (what it is, how to run, how to test).
- [x] Add LICENSE; remove `public/vercel.svg`; favicon.ico + favicon.svg.

## Phase 1 — Core game completeness (the real table stakes)

This is the bulk of the work. Everything here applies to both web and desktop.

**1a. Persistence & run lifecycle ✅ (done)**
- [x] Auto-save game state to localStorage on every state change
      (`lib/state/persistence.ts`, versioned save file).
- [x] Restore on load; "Resume run / New run" choice on the landing page.
- [x] Real **game-over screen**: final score, run stats (best trade, peak net worth,
      trades made), high-score callout, "Play again" / difficulty select
      (`components/GameOver.tsx`). Also fixed: game over previously never fired
      (the Adv Day button disabled itself on the final day), and finishing a run
      with a lower score used to overwrite the saved high score.
- [x] Re-enable the difficulty modal (start flow cleaned up in `GameMode.tsx`).

**1b. Trading UX**
- [ ] Quantity controls for buy/sell (input + Max button) instead of forced all-in/all-out.
- [ ] Confirm/feedback affordances: disable states that explain themselves, tooltips.
- [ ] Optional could-have: partial debt payments (currently pay-in-full only).

**1c. Presentation & feel**
- [ ] Sound effects (buy, sell, day tick, moonshot, game over) + music toggle; mute
      persisted in settings. Web Audio or howler.
- [ ] Settings panel: sound, **CRT effects toggle** (scanline flicker is an
      accessibility issue — also respect `prefers-reduced-motion`), reset high scores.
- [ ] In-game "How to play" (the landing page copy is 80% of it already).
- [ ] Responsive pass so `/game` works on phones/tablets (or an explicit
      desktop-only gate for v1 — decision below).
- [ ] Accessibility pass: keyboard navigation, `aria-live` on the event log, don't
      rely on color alone for profit/loss.

**1d. Engineering hardening**
- [ ] Extract randomness behind a seedable RNG (one injection point). Enables unit
      tests now, daily-challenge/replay verification later.
- [ ] Unit tests for the economy: reducer actions, cost-basis math, debt compounding,
      price banding. (Cypress covers flows; the money math deserves fast tests.)
- [ ] Keep the E2E suite green through all of the above.

## Phase 2 — Web release (v1.0 on cryptofrenzy.live)

- [ ] **PWA**: manifest + service worker + icons. The game is fully client-side, so
      installable + offline is nearly free and makes the web build feel like a real game.
- [ ] SEO/social: OG image, meta tags, proper title/description per page.
- [ ] Error tracking (Sentry) — you currently have zero visibility into player crashes.
- [ ] Analytics events beyond page views: run started/finished, mode, score
      (Vercel Analytics custom events or Plausible).
- [ ] Privacy page (required once you have analytics) + Credits page (IBM Plex Mono OFL
      attribution already lives in the repo).
- [ ] Balance/playtest pass — get 5–10 people through full runs on all three modes.
- [ ] Tag **v1.0.0**, announce.

## Phase 3 — Desktop release (Tauri)

- [ ] Fix `tauri.conf.json`: real `identifier` (e.g. `live.cryptofrenzy.app`), product
      name, window defaults (windowed, sensible min size), real icons from a source
      logo (`tauri icon` generates the whole set).
- [ ] Release CI: `tauri-action` GitHub workflow building macOS (universal), Windows,
      Linux on tag push → GitHub Releases.
- [ ] Auto-updates via `tauri-plugin-updater` (worth doing before first release so
      update channel exists from day one).
- [ ] **Signing decision** (see below): macOS Developer ID + notarization ($99/yr);
      Windows cert or ship unsigned with SmartScreen caveat.
- [ ] Distribute: GitHub Releases + **itch.io** first (no signing gate, built-in
      audience for small games, optional pay-what-you-want). Steam later if traction
      ($100 fee, store page, review process).

## Phase 4 — Retention & depth (could-haves, post-1.0)

Roughly in order of value-for-effort:

1. **Daily challenge** — same seed for everyone each day (needs the Phase 1 RNG work;
   no backend needed for the seed itself, just date-derived).
2. **Global leaderboard** — needs a tiny backend (decision below). Client-submitted
   scores are spoofable; acceptable for casual play, or verify by replaying the
   seeded action log server-side.
3. **Run history & stats** — local, cheap, makes single-player sticky.
4. **Achievements** — local first ("paid off debt by day 5", "held a moonshot").
5. **Content depth** — more coins (unlock by level?), events that act on the *player*
   (wallet hacked, exchange freeze — Dopewars-style), bank/staking for idle cash,
   shorting, price-history sparklines in the asset table.

---

## Decisions to make

| Decision | Options | Lean |
|---|---|---|
| Mobile support in v1 | Full responsive vs. desktop-only gate | Responsive — it's a web game, half your traffic will be phones |
| Backend for leaderboards | None (local only) vs. serverless (Vercel KV/Postgres, Supabase) | Ship v1.0 with no backend; add serverless leaderboard in Phase 4 |
| macOS signing | $99/yr Apple Developer vs. unsigned (users must right-click-open) | Pay it if desktop is serious; skip for itch.io-only |
| Windows signing | Cert (~$200+/yr) vs. unsigned (SmartScreen warning) | Ship unsigned initially; revisit on traction |
| Monetization | Free / itch pay-what-you-want / Steam paid | Free web + PWYW itch is the natural fit |
| Steam | Now vs. later | Later — only after itch.io validates demand |

## Suggested sequencing

Phases 0–1 are one continuous stretch of work (0 is an afternoon; 1 is the meat —
call it 2–4 weekends). Phase 2 is a weekend. Phase 3 is a weekend plus signing
paperwork latency. Phase 4 is open-ended, one feature at a time.

Each checklist item above is roughly one PR. Phase 1a (persistence + game-over screen)
is the single highest-impact chunk — it's the difference between a demo and a game.
