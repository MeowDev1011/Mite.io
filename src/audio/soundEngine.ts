// Optimized Low-CPU Web Audio Sound Engine for Mite.io
// Zero-crossing envelope ramps + strict polyphony & rate-limiting to eliminate mobile speaker popping ("poporopo") and CPU spikes.

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmTimer: number | null = null;
  private isBgmPlaying: boolean = false;

  // Rate-limiting timestamps (ms) & polyphony cap to protect mobile CPU and DAC
  private lastEatProteinMs: number = 0;
  private lastEatRbcMs: number = 0;
  private lastSplitMs: number = 0;
  private lastEjectMs: number = 0;
  private lastAlertMs: number = 0;
  private activeVoiceCount: number = 0;
  private readonly MAX_VOICES = 5;

  constructor() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!this.ctx) return;
        if (document.hidden && this.ctx.state === 'running') {
          this.ctx.suspend().catch(() => {});
        } else if (!document.hidden && !this.isMuted && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
      });
    }
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended' && !this.isMuted) {
      this.ctx.resume().catch(() => {});
    }
  }

  // Helper to play a clean, pop-free envelope tone with automatic node cleanup
  private playTone(
    freqStart: number,
    freqEnd: number,
    durationSec: number,
    peakGain: number,
    type: OscillatorType = 'sine',
    delaySec: number = 0
  ) {
    if (this.isMuted) return;
    if (this.activeVoiceCount >= this.MAX_VOICES) return;
    this.initContext();
    if (!this.ctx || this.ctx.state !== 'running') return;

    try {
      const now = this.ctx.currentTime + delaySec;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(120, freqStart), now);
      if (freqEnd !== freqStart) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(120, freqEnd), now + durationSec);
      }

      // Soft attack from 0.0001 prevents speaker cone click/pop ("poporopo") on phones
      const attack = Math.min(0.012, durationSec * 0.25);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(peakGain, now + attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      this.activeVoiceCount++;
      osc.onended = () => {
        this.activeVoiceCount = Math.max(0, this.activeVoiceCount - 1);
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {}
      };

      osc.start(now);
      osc.stop(now + durationSec + 0.01);
    } catch {}
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ctx) {
      if (muted && this.ctx.state === 'running') {
        this.ctx.suspend().catch(() => {});
      } else if (!muted && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  // Throttled soft absorption chime for small proteins (no rapid popping)
  public playEatProtein(massFraction: number = 0.5) {
    const nowMs = performance.now();
    if (nowMs - this.lastEatProteinMs < 130) return;
    this.lastEatProteinMs = nowMs;

    const baseFreq = 520 + (1 - Math.min(massFraction, 1)) * 280;
    this.playTone(baseFreq, baseFreq * 1.35, 0.065, 0.045, 'sine');
  }

  public playCollect() {
    this.playEatRedBloodCell();
  }

  public playEatRedBloodCell() {
    const nowMs = performance.now();
    if (nowMs - this.lastEatRbcMs < 150) return;
    this.lastEatRbcMs = nowMs;

    this.playTone(340, 220, 0.12, 0.075, 'triangle');
  }

  public playSplit() {
    const nowMs = performance.now();
    if (nowMs - this.lastSplitMs < 180) return;
    this.lastSplitMs = nowMs;

    this.playTone(460, 180, 0.14, 0.09, 'sine');
  }

  public playEjectSpore() {
    const nowMs = performance.now();
    if (nowMs - this.lastEjectMs < 120) return;
    this.lastEjectMs = nowMs;

    this.playTone(620, 340, 0.075, 0.055, 'sine');
  }

  public playAntibodyAlert() {
    const nowMs = performance.now();
    if (nowMs - this.lastAlertMs < 900) return;
    this.lastAlertMs = nowMs;

    this.playTone(780, 920, 0.15, 0.07, 'triangle');
  }

  public playAntibodyRupture() {
    this.playTone(260, 130, 0.24, 0.12, 'triangle');
  }

  public playLevelUp() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      this.playTone(freq, freq, 0.18, 0.07, 'sine', idx * 0.075);
    });
  }

  public playKillMicrobe() {
    this.playTone(360, 520, 0.18, 0.1, 'triangle');
  }

  public playAchievement() {
    const chords = [523.25, 659.25, 783.99, 1046.5];
    chords.forEach((freq, idx) => {
      this.playTone(freq, freq, 0.25, 0.08, 'triangle', idx * 0.08);
    });
  }

  public playMitosisSquish() {
    this.playSplit();
  }

  public playSecretDiscovery() {
    [880, 1108.73, 1318.51].forEach((freq, i) => {
      this.playTone(freq, freq, 0.35, 0.07, 'sine', i * 0.1);
    });
  }

  // Heartbeat disabled on mobile speakers to eliminate low-frequency popping ("poporopo")
  public startHeartbeat() {
    // Intentionally no-op: sub-bass 35Hz-55Hz pulses cause phone speaker popping and CPU drain
  }

  public stopHeartbeat() {}

  public playConquestFanfare() {
    const chord = [329.63, 392.0, 523.25, 659.25];
    chord.forEach((freq, idx) => {
      this.playTone(freq, freq, 0.4, 0.08, 'triangle', idx * 0.09);
    });
  }

  // Ultra-lightweight ambient chime (no continuous background oscillators)
  public startBGM() {
    if (this.isBgmPlaying) return;
    this.isBgmPlaying = true;
    const scale = [261.63, 293.66, 329.63, 392.0, 440, 523.25];
    let step = 0;

    this.bgmTimer = window.setInterval(() => {
      if (this.isMuted || !this.isBgmPlaying || document.hidden) return;
      const noteFreq = scale[step % scale.length];
      step = (step + 1) % scale.length;
      this.playTone(noteFreq, noteFreq, 0.9, 0.014, 'sine');
    }, 3200);
  }

  public stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

export const soundEngine = new SoundEngine();
