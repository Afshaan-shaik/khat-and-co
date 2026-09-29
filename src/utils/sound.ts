/**
 * Sound synthesis engine using Web Audio API.
 * Synthesizes paper rustle, wax seal snap, scratch writing, and seal thump.
 * No external audio files required.
 */

let audioCtx: AudioContext | null = null;
let soundEnabled = false;
const listeners = new Set<(enabled: boolean) => void>();

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  }
  return audioCtx;
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
  if (soundEnabled) {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
    sfx.rustle();
  }
  listeners.forEach((l) => l(soundEnabled));
}

export function toggleSound(): boolean {
  const next = !soundEnabled;
  setSoundEnabled(next);
  return next;
}

export function subscribeSound(callback: (enabled: boolean) => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function noise(dur: number, freq: number, gain: number, q: number = 1): void {
  const a = getAudioContext();
  if (!a || !soundEnabled) return;
  try {
    const n = Math.floor(a.sampleRate * dur);
    const buf = a.createBuffer(1, Math.max(n, 1), a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) {
      d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    }
    const src = a.createBufferSource();
    src.buffer = buf;
    const f = a.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = freq;
    f.Q.value = q;
    const g = a.createGain();
    g.gain.value = gain;
    src.connect(f);
    f.connect(g);
    g.connect(a.destination);
    src.start();
  } catch (e) {
    // Ignore audio playback errors if user hasn't interacted
  }
}

export const sfx = {
  rustle(): void {
    [0, 90, 190, 300].forEach((t, i) =>
      setTimeout(() => noise(0.22, 2600 + i * 380, 0.16, 0.9), t)
    );
  },
  snap(): void {
    noise(0.09, 1800, 0.4, 2);
  },
  scratch(): void {
    noise(0.05, 4200, 0.05, 1.4);
  },
  thump(): void {
    const a = getAudioContext();
    if (!a || !soundEnabled) return;
    try {
      const o = a.createOscillator();
      const g = a.createGain();
      const t = a.currentTime;
      o.frequency.setValueAtTime(150, t);
      o.frequency.exponentialRampToValueAtTime(48, t + 0.18);
      g.gain.setValueAtTime(0.5, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
      o.connect(g);
      g.connect(a.destination);
      o.start(t);
      o.stop(t + 0.26);
      noise(0.05, 600, 0.25, 1);
    } catch (e) {
      // Ignore
    }
  }
};
