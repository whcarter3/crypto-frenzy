import { z } from 'zod';
import { State } from '../types';
import { seedRng } from '../engine/rng';

/**
 * Save-file schema + forward migrations (Phase 2, PR #34 review).
 *
 * Before this, SAVE_VERSION was bump-and-discard: any shape change
 * threw away every player's mid-run save. Now a save from any older
 * version is migrated forward one step at a time (1→2→2→3→…) and then
 * validated against the real schema — only genuinely corrupt data is
 * discarded. When the State shape changes next, follow the recipe:
 *
 *   1. Bump CURRENT_SAVE_VERSION.
 *   2. Add ONE migration entry for the previous version.
 *   3. Add the new field to StateSchema and a frozen fixture test.
 *
 * NEVER add a required field to StateSchema without a version bump:
 * same-version saves in the wild won't have it, validation would
 * reject them, and every live run would be wiped — exactly what
 * happened inside v2 when `seed` landed without a bump (see
 * migration 2). A field added same-version must be `.optional()`
 * here, with its default supplied by loadGame's initialState spread.
 *
 * Loose objects on purpose: a save written by a slightly newer build
 * at the same version (extra fields, no bump) must survive load +
 * resave instead of being stripped or rejected.
 */

export const CURRENT_SAVE_VERSION = 3;

const finite = z.number().finite();

const AssetSchema = z.looseObject({
  name: z.string(),
  symbol: z.string(),
  wallet: finite,
  active: z.boolean(),
  averageCost: finite,
  totalCost: finite,
  range: z.looseObject({
    low: z.array(finite),
    mid: z.array(finite),
    high: z.array(finite),
    moon: z.array(finite),
  }),
  price: finite,
  previousPrice: finite,
});

const WalletSchema = z.looseObject({
  amount: finite,
  capacity: finite,
  level: finite,
  expansionCost: finite,
});

const RunStatsSchema = z.looseObject({
  peakNetWorth: finite,
  totalTrades: finite,
  bestTradeProfit: finite,
});

const GameOverSchema = z.looseObject({
  score: finite,
  newHighScore: z.boolean(),
});

export const StateSchema = z.looseObject({
  days: finite,
  currentDay: finite,
  cash: finite,
  debt: finite,
  interestRate: finite,
  log: z.array(z.string()),
  highScore: finite.nullable().optional(),
  modalOpen: z.boolean(),
  // .default(null): zod 4 infers bare .nullable() properties as
  // optional, which the compile-time guard below rejects against
  // State's required `gameOver`. The default is also the truth —
  // loadGame forces gameOver to null on restore regardless.
  gameOver: GameOverSchema.nullable().default(null),
  stats: RunStatsSchema,
  seed: finite,
  rngState: finite,
  lowRangePriceChance: finite,
  highRangePriceChance: finite,
  mode: z.enum(['Easy', 'Hard', 'Normal', 'Test']),
  assets: z.record(z.string(), AssetSchema),
  wallet: WalletSchema,
});

export const SaveFileSchema = z.looseObject({
  version: z.number().int().min(1),
  savedAt: z.string(),
  // validated by StateSchema only AFTER migrations run
  state: z.unknown(),
});

export type SaveFile = z.infer<typeof SaveFileSchema>;

/** Loose pre-migration shape — just enough structure to transform. */
type AnyRecord = Record<string, unknown>;

const isRecord = (v: unknown): v is AnyRecord =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * v1 saves predate the deterministic engine: no seed, no rngState.
 * The run itself is fully resumable — it just never had a shareable
 * seed. seed: 0 is the established "pre-run/unknown" sentinel (the
 * sidebar hides the seed display for 0), and the rng state is derived
 * from the save's own numbers so migration is pure: the same save
 * always migrates to the same state.
 */
const deriveRngState = (state: AnyRecord): number => {
  const day = typeof state.currentDay === 'number' ? state.currentDay : 0;
  const cash = typeof state.cash === 'number' ? state.cash : 0;
  const debt = typeof state.debt === 'number' ? state.debt : 0;
  const mixed = seedRng(
    Math.imul(day + 1, 2654435761) ^ Math.imul(cash + 1, 40503) ^ debt,
  );
  return mixed === 0 ? 1 : mixed;
};

/**
 * Migrations keyed by the version they migrate FROM. Each returns the
 * state shaped as the NEXT version expects. Pure functions of the
 * save — no Date, no Math.random — so a save migrates identically
 * every time it's loaded.
 */
const migrations: Record<number, (state: unknown) => unknown> = {
  // v1 → v2: engine refactor introduced seed + rngState.
  1: (state) => {
    if (!isRecord(state)) return state;
    return {
      ...state,
      seed: typeof state.seed === 'number' ? state.seed : 0,
      rngState:
        typeof state.rngState === 'number'
          ? state.rngState
          : deriveRngState(state),
    };
  },
  // v2 → v3: assets gained previousPrice (day-over-day deltas).
  // 0 is the established "no yesterday" sentinel — deltas stay hidden
  // until the next roll, exactly like day 1 of a fresh run.
  //
  // seed is defaulted here too: SAVE_VERSION 2 spans two shapes in
  // the wild — the engine refactor (dee581f) added rngState, and the
  // seed UI (PR #35) added `seed` later WITHOUT a version bump. An
  // early-v2 save is a real run with a real rngState that simply
  // predates shareable seeds, so it gets the same "unknown" sentinel
  // as v1.
  2: (state) => {
    if (!isRecord(state) || !isRecord(state.assets)) return state;
    const assets: AnyRecord = {};
    for (const [key, asset] of Object.entries(state.assets)) {
      assets[key] = isRecord(asset)
        ? { previousPrice: 0, ...asset }
        : asset;
    }
    return {
      ...state,
      assets,
      seed: typeof state.seed === 'number' ? state.seed : 0,
    };
  },
};

/**
 * Walk a save forward to CURRENT_SAVE_VERSION and validate it.
 * Returns the validated State, or null when the save is corrupt, from
 * an unknown future version (a newer build's save is left for that
 * build to read — never mangled by an older one), or missing a
 * migration step.
 */
export const migrateAndValidate = (file: unknown): State | null => {
  const envelope = SaveFileSchema.safeParse(file);
  if (!envelope.success) return null;

  let { version } = envelope.data;
  let state: unknown = envelope.data.state;
  if (version > CURRENT_SAVE_VERSION) return null;

  while (version < CURRENT_SAVE_VERSION) {
    const migrate = migrations[version];
    if (!migrate) return null;
    state = migrate(state);
    version += 1;
  }

  const parsed = StateSchema.safeParse(state);
  // No cast: returning parsed.data against the State | null signature
  // IS the compile-time drift guard — if a required State field is
  // ever missing from StateSchema, this return stops compiling, so
  // the schema can't silently fall behind the type. (The reverse —
  // schema stricter than State — fails loudly in the fixture tests.)
  return parsed.success ? parsed.data : null;
};
