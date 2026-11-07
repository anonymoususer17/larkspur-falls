// Slow, dreamy generative pad. Starts on first user gesture.
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let filter: BiquadFilterNode | null = null;
let timer: number | undefined;
let enabled = true;

const CHORDS = [
  [41, 53, 57, 60, 64], // Fmaj7
  [40, 52, 55, 59, 62], // Em7
  [38, 50, 53, 57, 64], // Dm9
  [45, 52, 57, 60, 64], // Am
];
const MELODY = [64, 67, 69, 72, 76, 74, 71];

const hz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

function impulse(c: AudioContext, seconds = 3.5) {
  const len = c.sampleRate * seconds;
  const buf = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
  }
  return buf;
}

function voice(freq: number, start: number, dur: number, type: OscillatorType, vol: number, detune = 0) {
  if (!ctx || !filter) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  o.detune.value = detune;
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(vol, start + dur * 0.35);
  g.gain.linearRampToValueAtTime(0, start + dur);
  o.connect(g).connect(filter);
  o.start(start);
  o.stop(start + dur + 0.1);
}

let step = 0;
function tick() {
  if (!ctx) return;
  const t = ctx.currentTime + 0.05;
  const chord = CHORDS[step % CHORDS.length];
  const dur = 10;
  chord.forEach((n, i) => {
    const v = i === 0 ? 0.09 : 0.035;
    voice(hz(n), t, dur, i === 0 ? 'sine' : 'sawtooth', v, -6);
    if (i > 0) voice(hz(n), t, dur, 'triangle', v, 7);
  });
  // sparse bell melody
  for (let k = 0; k < 3; k++) {
    if (Math.random() < 0.55) {
      const n = MELODY[Math.floor(Math.random() * MELODY.length)];
      voice(hz(n), t + 1.5 + k * 2.6, 3.2, 'sine', 0.05);
      voice(hz(n + 12), t + 1.5 + k * 2.6, 2, 'sine', 0.012);
    }
  }
  step++;
}

export function startAudio() {
  if (!enabled) return;
  if (ctx) { void ctx.resume(); return; }
  try {
    ctx = new AudioContext();
  } catch { return; }
  master = ctx.createGain();
  master.gain.value = 0;
  master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 4);
  filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 1100;
  filter.Q.value = 0.6;
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.05;
  lfoGain.gain.value = 400;
  lfo.connect(lfoGain).connect(filter.frequency);
  lfo.start();
  const verb = ctx.createConvolver();
  verb.buffer = impulse(ctx);
  const wet = ctx.createGain(); wet.gain.value = 0.7;
  const dry = ctx.createGain(); dry.gain.value = 0.45;
  filter.connect(verb).connect(wet).connect(master);
  filter.connect(dry).connect(master);
  master.connect(ctx.destination);
  tick();
  timer = window.setInterval(tick, 8000);
}

export function setNight(night: boolean) {
  if (filter && ctx) filter.frequency.linearRampToValueAtTime(night ? 650 : 1100, ctx.currentTime + 3);
}

export function toggleAudio(): boolean {
  enabled = !enabled;
  if (!enabled && ctx) {
    void ctx.suspend();
  } else if (enabled) {
    startAudio();
  }
  return enabled;
}
export const audioOn = () => enabled;
export function stopAudio() { if (timer) clearInterval(timer); }

// ---------------------------------------------------------------- UI sfx
function blip(freqs: number[], dur: number, type: OscillatorType, vol: number, gap = 0.05) {
  if (!enabled) return;
  if (!ctx) startAudio();
  if (!ctx) return;
  const c = ctx;
  freqs.forEach((f, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    const t = c.currentTime + i * gap;
    o.type = type; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination);
    o.start(t); o.stop(t + dur + 0.05);
  });
}
export const sfx = {
  move: () => blip([880], 0.05, 'square', 0.025),
  select: () => blip([660, 990], 0.09, 'triangle', 0.06),
  back: () => blip([520, 390], 0.08, 'triangle', 0.05),
  page: () => blip([1200], 0.03, 'sine', 0.03),
  rank: () => blip([523, 659, 784, 1047, 1319], 0.5, 'triangle', 0.07, 0.09),
  stat: () => blip([784, 1175], 0.18, 'sine', 0.06, 0.07),
  clue: () => blip([392, 587, 880], 0.35, 'sine', 0.07, 0.11),
  day: () => blip([196, 294], 0.9, 'sine', 0.08, 0.18),
  danger: () => blip([220, 207, 196], 0.4, 'sawtooth', 0.04, 0.12),
};
