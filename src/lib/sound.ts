export type SoundType = 'move' | 'capture' | 'check' | 'gameOver' | 'promote' | 'click';

class SoundSynthesizer {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  play(type: SoundType, enabled = true) {
    if (!enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      switch (type) {
        case 'move': {
          // Soft wooden board tap (percussive triangle + lowpass burst)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(140, now);
          osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(350, now);

          gain.gain.setValueAtTime(0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.1);
          break;
        }

        case 'capture': {
          // Crisp sharp strike + wooden knock
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);

          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.14);
          break;
        }

        case 'check': {
          // Warning dual chime
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.type = 'sine';
          osc2.type = 'sine';
          osc1.frequency.setValueAtTime(587.33, now); // D5
          osc2.frequency.setValueAtTime(880, now + 0.07); // A5

          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);

          osc1.start(now);
          osc1.stop(now + 0.25);
          osc2.start(now + 0.07);
          osc2.stop(now + 0.45);
          break;
        }

        case 'gameOver': {
          // Rich celebratory chord
          [440, 554.37, 659.25, 880].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + i * 0.06);

            gain.gain.setValueAtTime(0.2, now + i * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.8);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now + i * 0.06);
            osc.stop(now + i * 0.06 + 0.85);
          });
          break;
        }

        case 'promote': {
          // Bright ascending fanfare
          [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.07);

            gain.gain.setValueAtTime(0.25, now + idx * 0.07);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.35);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now + idx * 0.07);
            osc.stop(now + idx * 0.07 + 0.4);
          });
          break;
        }

        case 'click': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, now);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.05);
          break;
        }
      }
    } catch {
      // Audio is an enhancement; never crash game on audio failure
    }
  }
}

export const soundManager = new SoundSynthesizer();
