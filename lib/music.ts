/**
 * Background music: a sparse, generative chiptune loop synthesized with
 * the Web Audio API — same no-assets approach as lib/sound.ts, and the
 * same side-effect-layer contract: the SettingsProvider flips it on and
 * off, everything no-ops when audio is unavailable.
 *
 * Browsers block audio until a user gesture. Toggling the setting IS a
 * gesture, so that path just works; when music is already enabled on
 * page load, a one-time pointer/key listener starts it on the first
 * interaction instead.
 */

let enabled = false;
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let schedulerId: ReturnType<typeof setInterval> | null = null;
let nextStepTime = 0;
let step = 0;

const TEMPO = 92; // bpm
const STEP = 60 / TEMPO / 2; // eighth notes
const LOOKAHEAD_MS = 120;
const SCHEDULE_AHEAD = 0.4; // seconds

// A minor pentatonic, low register — moody terminal hum, not a jingle
const BASS = [110, 110, 0, 110, 0, 130.81, 110, 0]; // A2 riff w/ C3
const LEAD = [
  0, 220, 261.63, 0, 329.63, 0, 293.66, 220, 0, 0, 261.63, 0, 220, 0,
  0, 0,
]; // A3/C4/E4/D4 phrase over two bars

const getContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  const AC =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;
  if (!ctx) {
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.018;
    master.connect(ctx.destination);
  }
  return ctx;
};

const voice = (
  audio: AudioContext,
  freq: number,
  time: number,
  duration: number,
  type: OscillatorType,
  volume: number,
) => {
  if (!master || freq <= 0) return;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, time);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
  osc.connect(gain);
  gain.connect(master);
  osc.start(time);
  osc.stop(time + duration);
};

const scheduleSteps = (audio: AudioContext) => {
  while (nextStepTime < audio.currentTime + SCHEDULE_AHEAD) {
    voice(
      audio,
      BASS[step % BASS.length],
      nextStepTime,
      STEP * 0.9,
      'triangle',
      1,
    );
    voice(
      audio,
      LEAD[step % LEAD.length],
      nextStepTime,
      STEP * 1.6,
      'square',
      0.35,
    );
    nextStepTime += STEP;
    step += 1;
  }
};

const start = () => {
  const audio = getContext();
  if (!audio || schedulerId !== null) return;
  const begin = () => {
    if (schedulerId !== null || !enabled) return;
    nextStepTime = audio.currentTime + 0.05;
    step = 0;
    schedulerId = setInterval(
      () => scheduleSteps(audio),
      LOOKAHEAD_MS,
    );
  };
  if (audio.state === 'suspended') {
    // No gesture yet (music was enabled on a previous visit): arm a
    // one-time listener and start on the first interaction.
    void audio.resume().then(() => {
      if (audio.state === 'running') begin();
    });
    const onGesture = () => {
      window.removeEventListener('pointerdown', onGesture);
      window.removeEventListener('keydown', onGesture);
      void audio.resume().then(begin);
    };
    window.addEventListener('pointerdown', onGesture);
    window.addEventListener('keydown', onGesture);
  } else {
    begin();
  }
};

const stop = () => {
  if (schedulerId !== null) {
    clearInterval(schedulerId);
    schedulerId = null;
  }
};

export const setMusicEnabled = (on: boolean): void => {
  enabled = on;
  try {
    if (on) start();
    else stop();
  } catch {
    // music is best-effort, never break the game over it
  }
};
