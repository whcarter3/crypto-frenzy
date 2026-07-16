/**
 * Retro sound effects, synthesized with the Web Audio API — no audio
 * assets, which suits both the CRT-terminal aesthetic and the bundle.
 *
 * The module is a side-effect layer, deliberately outside the pure
 * engine: components fire sounds from event handlers/effects, and the
 * SettingsProvider flips `enabled`. Everything no-ops safely when
 * audio is unavailable (SSR, tests, autoplay-blocked contexts).
 */

type SoundName =
  | 'buy'
  | 'sell'
  | 'pay'
  | 'advance'
  | 'moonshot'
  | 'gameOver'
  | 'warning';

let enabled = true;
let ctx: AudioContext | null = null;

export const setSoundEnabled = (on: boolean): void => {
  enabled = on;
};

const getContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  const AC =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;
  // Lazy singleton: browsers only allow audio after a user gesture, and
  // every sound here is triggered by a click, so creation/resume is safe.
  if (!ctx) ctx = new AC();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
};

/** One decaying square-wave note, `start` seconds from now. */
const note = (
  audio: AudioContext,
  freq: number,
  start: number,
  duration: number,
  type: OscillatorType = 'square',
  volume = 0.03,
) => {
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  const t = audio.currentTime + start;
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(t);
  osc.stop(t + duration);
};

// Note frequencies (Hz)
const C4 = 261.63;
const E4 = 329.63;
const G4 = 392.0;
const C5 = 523.25;
const E5 = 659.25;
const G5 = 783.99;
const C6 = 1046.5;

export const playSound = (name: SoundName): void => {
  if (!enabled) return;
  const audio = getContext();
  if (!audio) return;
  try {
    switch (name) {
      case 'buy':
        note(audio, C5, 0, 0.08);
        note(audio, E5, 0.07, 0.1);
        break;
      case 'sell':
        note(audio, E5, 0, 0.08);
        note(audio, C5, 0.07, 0.1);
        break;
      case 'pay':
        note(audio, G5, 0, 0.09);
        note(audio, C6, 0.08, 0.14);
        break;
      case 'advance':
        note(audio, 880, 0, 0.05, 'triangle', 0.025);
        break;
      case 'moonshot':
        note(audio, C5, 0, 0.09);
        note(audio, E5, 0.08, 0.09);
        note(audio, G5, 0.16, 0.09);
        note(audio, C6, 0.24, 0.22);
        break;
      case 'gameOver':
        note(audio, G4, 0, 0.16, 'sawtooth');
        note(audio, E4, 0.15, 0.16, 'sawtooth');
        note(audio, C4, 0.3, 0.35, 'sawtooth');
        break;
      case 'warning':
        note(audio, 220, 0, 0.15, 'square', 0.035);
        note(audio, 185, 0.16, 0.2, 'square', 0.035);
        break;
    }
  } catch {
    // audio is best-effort, never break the game over it
  }
};
