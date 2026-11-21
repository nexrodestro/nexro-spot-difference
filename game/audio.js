// LANTERN HARBOR — synthesized sound effects (WebAudio, no audio files).
// The AudioContext is created lazily on the first user gesture so the
// game never throws before interaction, and every call is a no-op while
// muted or before the context exists (screenshot mode stays silent).

'use strict';

const SFX = {
  ctx: null,
  muted: false,

  ensure() {
    if (!this.ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        this.ctx = new AC();
      } catch (e) {
        return null;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },

  // One oscillator note with a short exponential decay envelope.
  tone(freq, at, dur, type, vol) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    const t = ctx.currentTime + (at || 0);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol || 0.18, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  },

  // Two-note find chime: bright E5 then A5.
  chime() {
    this.tone(659.25, 0, 0.22, 'sine', 0.2);
    this.tone(880, 0.09, 0.32, 'sine', 0.2);
  },

  // Soft low thud for a wrong click.
  thud() {
    this.tone(110, 0, 0.18, 'triangle', 0.22);
    this.tone(82.4, 0.02, 0.2, 'sine', 0.16);
  },

  // Rising shimmer for a hint.
  shimmer() {
    this.tone(523.25, 0, 0.16, 'sine', 0.12);
    this.tone(659.25, 0.07, 0.16, 'sine', 0.12);
    this.tone(783.99, 0.14, 0.24, 'sine', 0.12);
  },

  // Level-win arpeggio: C5 E5 G5 C6.
  win() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => this.tone(f, i * 0.11, 0.3, 'sine', 0.18));
  },

  // Short UI tick / blip for buttons.
  tick() {
    this.tone(440, 0, 0.06, 'square', 0.06);
  },

  blip() {
    this.tone(587.33, 0, 0.09, 'sine', 0.12);
  },
};

window.SFX = SFX;
