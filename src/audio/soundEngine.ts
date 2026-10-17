// Procedural Web Audio Sound Engine for Mite.io
// Synthesizes organic cellular sounds, heartbeats, pops, splits and antibody sirens.

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private heartbeatTimer: number | null = null;
  private heartbeatPhase: number = 0;
  private bgmTimer: number | null = null;
  private bgmMasterGain: GainNode | null = null;
  private bgmPadOsc1: OscillatorNode | null = null;
  private bgmPadOsc2: OscillatorNode | null = null;
  private isBgmPlaying: boolean = false;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.bgmMasterGain && this.ctx) {
      this.bgmMasterGain.gain.setValueAtTime(muted ? 0 : 0.055, this.ctx.currentTime);
    }
    if (!muted && !this.isBgmPlaying) {
      this.startBGM();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  // Soft absorption pop for small proteins
  public playEatProtein(massFraction: number = 0.5) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      const now = this.ctx.currentTime;
      const baseFreq = 480 + (1 - Math.min(massFraction, 1)) * 360;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.6, now + 0.06);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // Audio context policy protection
    }
  }

  // Rich juicy sound when devouring a red blood cell
  public playEatRedBloodCell() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const subOsc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.18);

      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(130, now);
      subOsc.frequency.exponentialRampToValueAtTime(70, now + 0.18);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);

      osc.connect(gain);
      subOsc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      subOsc.start(now);
      osc.stop(now + 0.19);
      subOsc.stop(now + 0.19);
    } catch {}
  }

  // High-speed cell split swoosh impulse
  public playSplit() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.16);

      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch {}
  }

  // Ejecting small spore mass
  public playEjectSpore() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {}
  }

  // Antibody alert sonar ping / siren
  public playAntibodyAlert() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1046, now + 0.08);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch {}
  }

  // Membrane puncture / shred explosion when colliding with antibody
  public playAntibodyRupture() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Low impact thud
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(160, now);
      osc1.frequency.exponentialRampToValueAtTime(40, now + 0.35);

      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.35);
    } catch {}
  }

  // Level up / perk milestone chime
  public playLevelUp() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + idx * 0.07;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.12, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + 0.22);
      });
    } catch {}
  }

  // Devour enemy organism
  public playKillMicrobe() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(500, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.25);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {}
  }

  // Achievement unlocked triumphant chime
  public playAchievement() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const chords = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C5, E5, G5, C6, E6
      const now = this.ctx.currentTime;

      chords.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + idx * 0.08;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.18, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + 0.35);
      });
    } catch {}
  }

  // Squishy mitosis / cell division sound
  public playMitosisSquish() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.06);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.18);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch {}
  }

  // Secret discovery ethereal harmonic chime
  public playSecretDiscovery() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [880, 1108.73, 1318.51, 1760].forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = now + i * 0.1;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.14, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.6);
      });
    } catch {}
  }

  // Start subtle vascular pulse heartbeat loop
  public startHeartbeat() {
    if (this.heartbeatTimer) return;
    this.heartbeatTimer = window.setInterval(() => {
      if (this.isMuted) return;
      this.initContext();
      if (!this.ctx) return;

      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Lub-dub heart cadence
        const isLub = this.heartbeatPhase % 2 === 0;
        this.heartbeatPhase++;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(isLub ? 55 : 45, now);
        osc.frequency.exponentialRampToValueAtTime(isLub ? 35 : 28, now + 0.12);

        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.12);
      } catch {}
    }, 1200);
  }

  public stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // Triumphant harmonic fanfare when conquering an anatomical territory/organ
  public playConquestFanfare() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Majestic cellular arpeggio in triumphant harmonic sequence
      const chord = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C Major epic resonance
      chord.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const subOsc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const noteTime = now + idx * 0.08;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(freq * 0.5, noteTime);

        gain.gain.setValueAtTime(0.18, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 1.2);

        osc.connect(gain);
        subOsc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(noteTime);
        subOsc.start(noteTime);
        osc.stop(noteTime + 1.25);
        subOsc.stop(noteTime + 1.25);
      });
    } catch {}
  }

  // Procedural Generative Ambient Biological Background Music
  // Hypnotic, immersive cellular soundscape with deep resonant drone and crystalline pentatonic chimes
  public startBGM() {
    if (this.isBgmPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      this.isBgmPlaying = true;
      const now = this.ctx.currentTime;

      // Master BGM Gain node
      this.bgmMasterGain = this.ctx.createGain();
      this.bgmMasterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.055, now);
      this.bgmMasterGain.connect(this.ctx.destination);

      // Low-pass filter to keep sound warm, soft, non-fatiguing
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(420, now);
      filter.connect(this.bgmMasterGain);

      // Ambient Pad Osc 1 (Sub-bass organic warmth: A1 55Hz)
      this.bgmPadOsc1 = this.ctx.createOscillator();
      this.bgmPadOsc1.type = 'sine';
      this.bgmPadOsc1.frequency.setValueAtTime(55, now);
      this.bgmPadOsc1.connect(filter);
      this.bgmPadOsc1.start(now);

      // Ambient Pad Osc 2 (Detuned fifth: E2 82.4Hz)
      this.bgmPadOsc2 = this.ctx.createOscillator();
      this.bgmPadOsc2.type = 'triangle';
      this.bgmPadOsc2.frequency.setValueAtTime(82.4, now);
      this.bgmPadOsc2.connect(filter);
      this.bgmPadOsc2.start(now);

      // Generative Ambient Melody Sequencer (soft micro-chimes)
      const scale = [220, 261.63, 293.66, 329.63, 392.0, 440, 523.25, 587.33]; // A minor pentatonic / dorian
      let step = 0;

      this.bgmTimer = window.setInterval(() => {
        if (this.isMuted || !this.ctx || !this.isBgmPlaying) return;

        try {
          const t = this.ctx.currentTime;
          const noteFreq = scale[step % scale.length];
          step = (step + (Math.random() > 0.4 ? 1 : 2)) % scale.length;

          const chimeOsc = this.ctx.createOscillator();
          const chimeGain = this.ctx.createGain();

          chimeOsc.type = 'sine';
          chimeOsc.frequency.setValueAtTime(noteFreq, t);

          chimeGain.gain.setValueAtTime(0.025, t);
          chimeGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);

          chimeOsc.connect(chimeGain);
          if (this.bgmMasterGain) {
            chimeGain.connect(this.bgmMasterGain);
          }

          chimeOsc.start(t);
          chimeOsc.stop(t + 1.85);
        } catch {}
      }, 1600);
    } catch {}
  }

  public stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
    if (this.bgmPadOsc1) {
      try {
        this.bgmPadOsc1.stop();
        this.bgmPadOsc1.disconnect();
      } catch {}
      this.bgmPadOsc1 = null;
    }
    if (this.bgmPadOsc2) {
      try {
        this.bgmPadOsc2.stop();
        this.bgmPadOsc2.disconnect();
      } catch {}
      this.bgmPadOsc2 = null;
    }
  }
}

export const soundEngine = new SoundEngine();
