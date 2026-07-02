/**
 * Deterministic PRNG (mulberry32) whose state lives in game State.
 *
 * The reducer must stay pure — same (state, action) in, same state out —
 * so randomness is derived from an explicit rngState number instead of
 * Math.random(). This makes runs reproducible from a seed (daily
 * challenges, replay verification) and keeps React StrictMode's
 * double-invocation from desyncing the game.
 */

export type RngState = number;

/** Normalizes any number (e.g. Date.now()) into a valid 32-bit rng state. */
export const seedRng = (seed: number): RngState => seed >>> 0;

/**
 * One mulberry32 step.
 * @returns a float in [0, 1) and the advanced rng state.
 */
export const nextRandom = (state: RngState): [number, RngState] => {
  const advanced = (state + 0x6d2b79f5) >>> 0;
  let t = advanced;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return [value, advanced];
};

/**
 * Wraps an rng state in a Math.random()-like interface for threading
 * through a computation. Mutation is local to the wrapper — callers
 * read the final state back with .state() and store it in game State.
 */
export const createRng = (initial: RngState) => {
  let current = initial;
  return {
    random(): number {
      const [value, next] = nextRandom(current);
      current = next;
      return value;
    },
    state(): RngState {
      return current;
    },
  };
};

export type Rng = ReturnType<typeof createRng>;
