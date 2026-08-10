# Crypto Frenzy — Release Roadmap

Goal: take the current prototype (playable core loop, now live at **cryptofrenzy.win**;
formerly cryptofrenzy.live) to a releasable **v1.0 webapp**, then a **downloadable
desktop build** via the existing Tauri scaffold, then optional retention features
(leaderboards, daily runs).

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

## Phase 1f — Comprehensive UX sweep ✅ (done — PRs #39, #40, #41, #42, + close-out PR)

The layout is *responsive* after 1d, but the moment-to-moment experience is rough
(owner verdict 2026-07-03: "the UI is definitely responsive, but the UX is awful").
One dedicated pass over how the game *feels* to play, mobile-first, before release
polish in Phase 2.

**Inventory (2026-07-16, from playing full runs at phone + desktop widths):**

*A. Run-start dead state — the worst first impression in the game*
- [x] A1: Day 1 is a fake day: every price is $0, every Buy disabled, and the fix
      is knowing to press a button ("Click Advance Day to start") that lives below
      the fold. `START_RUN` should roll day-1 prices immediately — no limbo state.
      (Engine change; deterministic; also removes the days-left off-by-one feel.)

*B. Information hierarchy*
- [x] B1: Cash/Debt/Days chips sit at the very bottom, far from decisions — after
      buying, **cash isn't visible anywhere on the mobile screen**. Promote to a
      compact status bar near the market (pinned/top on mobile).
- [x] B2: NET WORTH panel is the largest element in the game and screams alarming
      red for any negative value — even right after a fair-value buy when −$X is
      just the debt. Now a stat row: green when up, calm neutral when down (no
      colored panels).
- [x] B3: Mobile stacking order: a full screen of portfolio stats preceded the
      market. Market + actions now come first on phones, portfolio second — and
      the sidebar holdings panel doesn't render below `md` at all (the market
      table already carries dot/avg/qty and its rows open the trade modal on
      Sell; the panel was pure duplication).
- [x] B4: NEW GAME (destructive!) is the most prominent button on screen, no
      confirm. Demote + confirm.
- [x] B5: Adv Day — the game's core verb — is the smallest control, buried in the
      corner. Make it the primary button, in the status bar.

*C. Market feedback (game feel)*
- [x] C1: **Price movement is invisible.** BTC can drop 61% in a tick with zero
      visual change; deltas only exist vs. your own avg cost. Track previous
      price in the engine, show day-over-day Δ%+arrow per row; ties the news
      events to visible moves.
- [x] C2: AVG. PRICE column shows $0 for coins you don't hold — render “—”.
- [x] C3: Log noise: `====` separators (including two adjacent for empty days)
      drowned signal; no visual hierarchy between trades and market events.
      Presentation-only fix (save format untouched): market events read
      bright (moonshots green, crashes red-edged), your own trades read
      quiet, day boundaries are thin centered markers and empty-day
      duplicates collapse to one.

*F. PR-2 scope from the owner's phone playtest (2026-07-17): the build is
"pretty good so far" — two related items remain:*
- [x] F1: **Trade stepper** replacing the bare amount input:
      `(0) (−) [n] (+) (Max|All) (BUY|SELL)`. Editable number, clamped on blur
      to [0, max affordable / held]; action disabled at 0; explicit quantity
      retires the invisible "empty = max" convention from 1c. Custom −/+
      buttons also remove the native number-input spinners (the gray steppers
      visible on the phone playtest screenshots).
- [x] F2: **Tap-to-trade modal, slim table everywhere** — the mobile table
      scrolls horizontally (owner: "pretty annoying"), and the stepper widens
      the action cluster further. First cut was asset cards below `sm`; the
      owner's playtest rejected them ("the asset table makes more sense to
      see everything together") in favor of pushing buy/sell into a modal
      opened by tapping an asset row — at every viewport, not just mobile.
      The market table drops its trade controls (fits a phone with no
      sideways scroll, enforced by a dedicated E2E assertion), rows become
      tap targets, and the TradeModal unifies buy + sell with price/Δ/
      position/cash context. Holdings rows in the sidebar open it too.
      Iterated twice more on playtests (2026-07-16): the combined
      buy+sell layout — even with execute buttons grouped at the bottom —
      still read as "look all over the place to parse what to do", so the
      modal is now **tabbed Buy | Sell**: one info block up top (price, Δ,
      cash, space, position), one stepper playground in the middle, one
      full-width execute at the bottom. Market rows open the Buy tab,
      holdings rows open Sell; both tabs' amounts survive switching;
      executing a trade closes the modal immediately — the updated table
      row is the feedback. Done replaced by a ✕ dismiss in the corner,
      clear button is a ✕ icon, AVG. PRICE header shortened to AVG.

*G. Post-close-out polish playtest (owner notes, 2026-07-17)*
- [x] G1: Trade modal reads like a receipt: player stats stacked left-aligned
      (cash / wallet space / holding) with more air under the asset price, and
      live totals above the execute button — Cost + Cash-after on Buy,
      Proceeds + Gain on Sell — so the decision is priced before committing.
      All slots render on both tabs (blank space beats layout jumps); top
      padding trimmed; ✕ dismiss borderless.
- [x] G2: Stepper regrouped to `(Max)  (−)(+)  [n]` — the clear-to-zero ✕
      button cut (typing 0 does the same job).
- [x] G3: "Need $X cash" → "Ins. funds".
- [x] G4: AVG column cut from the market table — cost basis lives in the
      holdings panel and the trade modal; the market table is about the market.
- [x] G5: Meta out of the gameplay loop: How to play, Abandon run (tap-again
      confirm intact) moved into the settings menu behind a single ⚙ icon;
      high score + seed + gear grouped bottom-left of the sidebar, as far from
      the game as possible.
- [x] G6: End Day gets a player-style skip icon (▸|); "reddit thread" → "post".
- [x] G7 (round 2): receipt trimmed to one line — Cost on Buy, Proceeds on
      Sell; the cash-after/gain arithmetic is the player's to do.
- [x] G8 (round 2): every finished day in the activity log folds into a
      collapsible `<details>` group under its "end of day" header (entry
      count shown); today's entries stay streaming in the aria-live list.
      Eventless days render as a plain marker.
- [x] G9 (round 2): End Day's skip icon drawn as an inline SVG instead of
      two kerned text characters; settings toggles aligned (CRT label loses
      its parenthetical), How to play grouped with the other buttons below
      the divider; the sidebar gear is borderless and bigger.
- [x] G10 (round 3): Reset high scores moved above How to play in the
      settings menu and de-glowed (quiet red, not a headline CTA); the
      empty-state high-score line trimmed to "No high score yet".

*D. Controls polish*
- [x] D1: "max" placeholder next to a "MAX" button reads as a stutter — pick one.
- [x] D2: Sell input clips its own placeholder ("al]") — width vs 16px font.
- [x] D3: Disabled buttons explain themselves via `title` only — invisible on
      touch. Trade rows now show inline reasons ("Need $X cash", "Wallet full");
      the StatusBar Pay button still relies on title (minor, revisit if flagged).

*E. Odds & ends*
- [x] E1: Empty high-score state renders a stray "—" + "SET A RECORD THIS RUN!"
      widow.
- [x] E2: "+0.0%" in green immediately after every buy — noise. Near-zero
      position deltas (<0.05%) now render nothing, in the holdings rows and
      the trade modal both.
- [x] E3: Desktop: log capped at ~3 lines while half the screen was dead
      space. Default desktop log height is now 40vh, resizable (E4).
- [x] E4: Resizeable sections on desktop (owner request 2026-07-17) — drag
      dividers between sidebar / content and log / market (pointer drag +
      arrow keys, `role="separator"` with value semantics). Sizes persist
      in settings, not game state.
- [x] E5: Removed the invisible 1×1 `#testMode` button from the difficulty modal.
      It shipped to production, was keyboard-focusable, and announced "Enable test
      mode" to screen readers; a leftover Cypress hook from PR #5 that the E2E
      rewrite orphaned — nothing references it anymore. The `Test` entry in
      `lib/state/modes.ts` stays: unit tests and the reducer's high-score gating
      use it, and DEV-gating it would break the `Record<State['mode'], …>`
      contract and crash restored old Test-mode saves.
- [x] Landing page menu stubs (PROFILES/CREDITS "SOON") — cut; Credits returns
      as a real page in Phase 2 (font attribution).
- [x] Background music: sparse generative chiptune loop, synthesized with Web
      Audio like the SFX (no assets). Off by default — it's a taste thing —
      with a Settings toggle; when pre-enabled it starts on the first
      interaction (autoplay policy).

## Phase 2 — Web release (v1.0 on cryptofrenzy.win)

- [x] **Branding / copy / theme review** (owner, 2026-07-17) — done. 258
      strings inventoried (17 test-coupled), owner reviewed a side-by-side
      proposal and ruled on six open calls. Outcomes: voice rule is *flavor
      outside, utility inside* (CRT-noir at arrival/exit, plain in the game,
      meme-ticker stays a character); one term per concept (run, day, End
      Day, holdings — table column now HELD, coins, cash, debt, market seed,
      **Max on both tabs**, score vs net worth kept distinct); How to play cut
      from four sections to two (only the score rule and Pay rule — the two
      things play can't teach); difficulty modal rewritten noir (option A) and
      its **Easy blurb factual bug fixed** (claimed "higher starting cash";
      Easy starts with less); **landing route stays as the start screen**
      (owner: a desktop game needs one) but its instruction blocks (YOUR
      CONTRACT / TERMINAL OPS / difficulty blurb) are cut per the original
      proposal — what remains is the pitch, the save-persistence fact, and
      the CTAs; "Ins. funds"
      and the dirty-money tagline kept; orphaned AlertMessages deleted;
      emoji pairs spaced in the log; pre-run "Click Advance Day" log line cut
      (day 1 starts rolled). Zero spec churn — all asserted substrings
      preserved.
- [x] **PWA** via `vite-plugin-pwa`: manifest + autoUpdate service worker +
      icons (192/512/512-maskable, rasterized from favicon.svg via qlmanage).
      Whole build precaches (offline play free); og.png excluded from the
      precache; SPA navigateFallback for deep links. Known footgun: a SW
      registered from a preview build on :3000 can serve stale content to a
      later `vite dev` on the same port — DevTools → Application → Service
      Workers → Unregister if local dev acts haunted.
- [x] SEO/social: OG/Twitter/theme-color/canonical meta in index.html (copy
      locked by the copy review) + a 1200×630 CRT-styled og.png. The card is
      generated by a committed tool spec (cypress/tools/og.cy.ts renders
      og-source.html via Cypress's own file server — NOT the game server,
      whose SPA fallback rewrites standalone pages into the app; regen
      instructions in the file). Landing-page prerender: still deferred,
      revisit if organic search matters.
- [ ] Error tracking (Sentry) — **deferred to post-1.0** (owner ship call
      2026-08-10): needs a Sentry account/DSN only the owner can create.
      Zero-crash-visibility risk accepted for launch; first post-launch task.
- [x] Analytics events beyond page views: `run_started` (mode, seeded?) fires
      from the difficulty modal's Start Run, `run_finished` (mode, score,
      newHighScore) from the game-over effect. `lib/analytics.ts` wraps
      `track()` behind the same `__VERCEL__` gate as the `<Analytics />`
      component — off Vercel it no-ops instead of warning. Engine stays pure:
      events fire from the UI layer, never the reducer.
- [x] Privacy page (`/privacy` — no accounts, saves in localStorage, cookieless
      anonymous analytics incl. the two gameplay events) + Credits page
      (`/credits` — IBM Plex Mono OFL attribution, Web Audio sound note,
      Dopewars lineage, agentic-development credit). Linked from a new
      landing-page footer; flavor-outside voice rule applied.
- [x] Save-file schema + migrations (PR #34 review): saves are validated with
      zod (`lib/state/saveSchema.ts`) and older versions migrate forward
      stepwise instead of being discarded — v1 (pre-engine) derives a pure
      rngState and gets the seed-0 "unknown" sentinel; v2 gains previousPrice.
      Review discovery: SAVE_VERSION 2 spans TWO shapes in the wild (`seed`
      landed mid-version without a bump) — the migration defaults it, and the
      schema header documents the rule: a new required State field means a
      version bump + one migration entry; same-version additions must be
      schema-optional with their default from the initialState spread. A
      compile-time guard pins StateSchema to the State type so the schema
      can't silently fall behind. Future-version saves load as null (an old
      build never mangles a newer save). Junk `?seed=` URLs (coerce to 0) now
      read as "no seed" so they can't false-match migrated pre-seed saves or
      torch a resumable run. Historical fixtures are frozen literals
      transcribed from git, not derived from the present shape.
- [x] Balance/playtest pass — closed by owner call (2026-08-10): the 1f/G-series
      owner playtests (phone + desktop, all modes) stand in for the formal
      5–10-person pass; wider feedback arrives post-launch via analytics +
      the announcement post.
- [ ] Tag **v1.0.0**, announce — version bumped to 1.0.0 in the ship PR; tag
      `v1.0.0` on main after merge. Announcement: owner's agentic-development
      blog post links the game.
- [x] Domain: **cryptofrenzy.win** purchased (Cloudflare, 2026-08-10). Canonical
      + OG/Twitter URLs, README, og.png card art, and the Tauri identifier
      (`win.cryptofrenzy.app` — safe to change, no desktop build shipped)
      all moved off cryptofrenzy.live.

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
| 2026-07-16 | **Trade via per-asset modal at every viewport; market table stays slim and read-only** | Owner playtest rejected mobile-only asset cards ("the asset table makes more sense to see everything together"); one trade surface everywhere beats two viewport-forked layouts, and pulling controls out of the table is what lets it fit a phone without sideways scroll |
| 2026-08-10 | **Ship domain is cryptofrenzy.win** (purchased on Cloudflare); .live redirects | Owner call; a game about winning ends in .win. Tauri identifier follows (`win.cryptofrenzy.app`) while it's still free to change — no desktop build has shipped |
| 2026-08-10 | **Ship v1.0 without Sentry; owner playtests stand in for the formal balance pass** | Sentry needs an owner-created account/DSN (post-launch task #1); the 1f/G-series playtests covered all modes on real devices, and analytics events now measure balance at scale |

## Decisions still open

| Decision | Options | Lean |
|---|---|---|
| Mobile support in v1 | Full responsive vs. desktop-only gate | Responsive — it's a web game, half your traffic will be phones |
| Trade entry points (owner, 2026-07-16) | Row tap → tabbed modal (current) vs. per-row Buy/Sell buttons → single-purpose modals | Ship tabs, playtest; row buttons re-add controls the slim table just shed (mobile width), and owner suspects they'd fracture the experience |
| ~~Sidebar holdings panel on mobile~~ | Keep vs. drop (market table already shows dot/avg/qty) | **Resolved 2026-07-17 (1f PR 3): dropped below `md`** — pure duplication of the table |
| Backend for leaderboards | None (local only) vs. serverless (Vercel KV/Postgres, Supabase) | Ship v1.0 with no backend; add serverless leaderboard in Phase 4 |
| macOS signing | $99/yr Apple Developer vs. unsigned (users must right-click-open) | Pay it if desktop is serious; skip for itch.io-only |
| Windows signing | Cert (~$200+/yr) vs. unsigned (SmartScreen warning) | Ship unsigned initially; revisit on traction |
| Monetization | Free / itch pay-what-you-want / Steam paid | Free web + PWYW itch is the natural fit |
| Steam | Now vs. later | Later — only after itch.io validates demand |

## Suggested sequencing

Phases 0–1f are shipped. Next is Phase 2 (web release). Historical note — 1f ran as: inventory by
playing real runs on phone + desktop, then fix). Phase 2 is a weekend. Phase 3 is a weekend plus signing paperwork
latency. Phase 4 is open-ended, one feature at a time.
