export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }
  init() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
  tone(freq, type, dur, vol = 0.15, delay = 0) {
    if (!this.enabled) return;
    this.init();
    try {
      const t = this.ctx.currentTime + delay;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g);
      g.connect(this.ctx.destination);
      o.start(t);
      o.stop(t + dur);
    } catch (e) {
      /* Web Audio may be blocked until a user gesture */
    }
  }
  click() {
    this.tone(500, 'sine', 0.06, 0.06);
  }
  collect() {
    this.tone(880, 'sine', 0.22, 0.18);
    this.tone(1320, 'triangle', 0.28, 0.2, 0.07);
  }
  launch() {
    if (!this.enabled) return;
    this.init();
    try {
      const t = this.ctx.currentTime;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(160, t);
      o.frequency.exponentialRampToValueAtTime(680, t + 0.35);
      g.gain.setValueAtTime(0.12, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      o.connect(g);
      g.connect(this.ctx.destination);
      o.start(t);
      o.stop(t + 0.35);
    } catch (e) {
      /* ignore */
    }
  }
  hit() {
    this.tone(110, 'sawtooth', 0.4, 0.22);
  }
  win() {
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) =>
      this.tone(f, 'triangle', 0.45, 0.2, i * 0.09)
    );
  }
}

export const sound = new SoundEngine();

export const vibrate = (ms) => {
  if (navigator.vibrate) {
    try {
      navigator.vibrate(ms);
    } catch (e) {
      /* ignore */
    }
  }
};
