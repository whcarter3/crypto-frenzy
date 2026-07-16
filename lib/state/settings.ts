/**
 * App preferences — deliberately separate from game State: they're
 * device-level, not part of a run, so they don't belong in the seeded
 * save file or the engine's replayable state.
 */

export type Settings = {
  /** Sound effects on/off */
  sound: boolean;
  /** CRT visual effects (scanlines, glow) on/off */
  crt: boolean;
};

const SETTINGS_KEY = 'cryptoFrenzySettings';

export const defaultSettings: Settings = {
  sound: true,
  crt: true,
};

export const loadSettings = (): Settings => {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw);
    // Merge over defaults so newly added settings pick up their default
    return { ...defaultSettings, ...parsed };
  } catch {
    return defaultSettings;
  }
};

export const saveSettings = (settings: Settings): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // storage unavailable — settings just won't persist
  }
};
