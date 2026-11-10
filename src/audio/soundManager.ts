/**
 * Web Audio API Retro 8-bit Chiptune Sound Engine
 * Generates dynamic music and sound effects without external audio assets.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  // Music state
  private currentTrack: 'none' | 'normal' | 'urgent' | 'gameover' = 'none';
  private musicInterval: number | null = null;
  private midoriInterval: number | null = null;
  private noteStep: number = 0;
  private midoriStep: number = 0;
  private isMidoriActive: boolean = false;

  constructor() {
    // AudioContext will be lazily created on user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      this.masterGain.gain.value = this.isMuted ? 0 : 0.6;
      this.musicGain.gain.value = 0.35;
      this.sfxGain.gain.value = 0.7;

      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.6, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Play a single synthesized tone
  private playTone(
    freq: number,
    type: OscillatorType,
    duration: number,
    volume: number = 0.5,
    destination: GainNode | null = this.sfxGain,
    glideTo?: number
  ) {
    this.initContext();
    if (!this.ctx || !destination || this.isMuted) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      if (glideTo) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(1, glideTo), this.ctx.currentTime + duration);
      }

      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio node cleanup on failure
    }
  }

  // Noise generator for percussion & splashes
  private playNoise(duration: number, volume: number = 0.3, isLowpass: boolean = false) {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    try {
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      if (isLowpass) {
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, this.ctx.currentTime);
        noise.connect(filter);
        filter.connect(gain);
      } else {
        noise.connect(gain);
      }

      gain.connect(this.sfxGain);
      noise.start();
    } catch {
      // Ignore audio interruption
    }
  }

  /* ---------------- SOUND EFFECTS ---------------- */

  // Catch trash (AC-05) - Crisp double retro coin chime
  public playCatchTrash() {
    this.playTone(587.33, 'square', 0.08, 0.4); // D5
    setTimeout(() => {
      this.playTone(880.0, 'square', 0.12, 0.45); // A5
    }, 50);
  }

  // Catch raindrop (AC-26) - Crisp water crystal drop chime
  public playCatchRaindrop() {
    this.playTone(1046.5, 'sine', 0.06, 0.4, this.sfxGain, 1318.5); // C6 -> E6
    setTimeout(() => {
      this.playTone(1567.98, 'triangle', 0.15, 0.45); // G6
    }, 60);
  }

  // Trash splash into river (AC-08) - Deep splash noise
  public playSplash() {
    this.playNoise(0.25, 0.4, true);
    this.playTone(180, 'triangle', 0.18, 0.35, this.sfxGain, 60);
  }

  // Midori Invincible miss dissipation (AC-23) - Sparkling magical pop
  public playDissipate() {
    this.playTone(1200, 'square', 0.08, 0.3, this.sfxGain, 400);
    setTimeout(() => {
      this.playTone(800, 'sine', 0.1, 0.25, this.sfxGain, 2000);
    }, 40);
  }

  // Midori Transformation Fanfare (AC-17) - 1 second rising powerup arpeggio
  public playTransform() {
    const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, idx) => {
      setTimeout(() => {
        this.playTone(f, 'square', 0.18, 0.5);
      }, idx * 110);
    });
  }

  // Water quality warning buzzer (AC-29)
  public playPollutionAlert() {
    this.playTone(220, 'sawtooth', 0.2, 0.4, this.sfxGain, 180);
    setTimeout(() => {
      this.playTone(196, 'sawtooth', 0.25, 0.4, this.sfxGain, 150);
    }, 150);
  }

  // UI click / select
  public playClick() {
    this.playTone(440, 'triangle', 0.04, 0.3);
  }

  // Game over defeat sound (AC-35)
  public playGameOver() {
    const notes = [392.0, 369.99, 349.23, 329.63, 293.66, 246.94, 220.0];
    notes.forEach((f, idx) => {
      setTimeout(() => {
        this.playTone(f, 'sawtooth', 0.22, 0.45);
      }, idx * 160);
    });
    setTimeout(() => {
      this.playNoise(0.5, 0.4, true);
    }, notes.length * 160);
  }

  /* ---------------- RETRO CHIPTUNE BGM ---------------- */

  // Stop current music loops
  public stopMusic() {
    if (this.musicInterval !== null) {
      window.clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    if (this.midoriInterval !== null) {
      window.clearInterval(this.midoriInterval);
      this.midoriInterval = null;
    }
    this.currentTrack = 'none';
    this.isMidoriActive = false;
  }

  // Normal upbeat 8-bit melody (C Major / G Pentatonic bounce)
  public playNormalBGM() {
    if (this.currentTrack === 'normal') return;
    this.stopMusic();
    this.initContext();
    this.currentTrack = 'normal';

    const melody = [
      523.25, 0, 523.25, 0, 659.25, 783.99, 0, 523.25,
      440.0, 0, 523.25, 0, 392.0, 0, 440.0, 0,
      329.63, 0, 392.0, 0, 440.0, 0, 392.0, 0,
      293.66, 0, 329.63, 0, 261.63, 0, 0, 0,
    ];
    const bass = [
      130.81, 130.81, 196.0, 196.0, 164.81, 164.81, 196.0, 196.0,
      110.0, 110.0, 146.83, 146.83, 98.0, 98.0, 130.81, 130.81,
    ];

    const tempoMs = 135;
    this.noteStep = 0;

    this.musicInterval = window.setInterval(() => {
      if (this.isMuted) return;

      const mNote = melody[this.noteStep % melody.length];
      if (mNote > 0) {
        this.playTone(mNote, 'square', 0.1, 0.22, this.musicGain);
      }

      if (this.noteStep % 2 === 0) {
        const bNote = bass[(Math.floor(this.noteStep / 2)) % bass.length];
        this.playTone(bNote, 'triangle', 0.18, 0.35, this.musicGain);
      }

      // Gentle retro snare / hihat on offbeats
      if (this.noteStep % 4 === 2) {
        this.playNoise(0.04, 0.08, false);
      }

      this.noteStep++;
    }, tempoMs);
  }

  // Urgent Grey Pollution BGM (Tense Minor Driving 160BPM)
  public playUrgentBGM() {
    if (this.currentTrack === 'urgent') return;
    this.stopMusic();
    this.initContext();
    this.currentTrack = 'urgent';

    const melody = [
      440.0, 440.0, 493.88, 523.25, 440.0, 415.3, 440.0, 587.33,
      523.25, 493.88, 440.0, 392.0, 415.3, 0, 440.0, 0,
    ];
    const bass = [
      110.0, 110.0, 110.0, 110.0, 103.83, 103.83, 103.83, 103.83,
      98.0, 98.0, 98.0, 98.0, 103.83, 103.83, 110.0, 110.0,
    ];

    const tempoMs = 100; // Accelerated tempo
    this.noteStep = 0;

    this.musicInterval = window.setInterval(() => {
      if (this.isMuted) return;

      const mNote = melody[this.noteStep % melody.length];
      if (mNote > 0) {
        this.playTone(mNote, 'sawtooth', 0.07, 0.25, this.musicGain);
      }

      if (this.noteStep % 2 === 0) {
        const bNote = bass[(Math.floor(this.noteStep / 2)) % bass.length];
        this.playTone(bNote, 'triangle', 0.14, 0.4, this.musicGain);
      }

      // Rapid hihat ticks
      if (this.noteStep % 2 === 1) {
        this.playNoise(0.03, 0.09, false);
      }

      this.noteStep++;
    }, tempoMs);
  }

  // Midori Invincible Euphoric Layer (AC-19, AC-39):
  // Superimposed on top of base BGM without cutting background music!
  public startMidoriLayer() {
    if (this.isMidoriActive) return;
    this.isMidoriActive = true;
    this.initContext();

    const arpeggios = [
      523.25, 659.25, 783.99, 1046.5, 1318.5, 1046.5, 783.99, 659.25,
      587.33, 739.99, 880.0, 1174.66, 1479.98, 1174.66, 880.0, 739.99,
    ];

    this.midoriStep = 0;
    this.midoriInterval = window.setInterval(() => {
      if (this.isMuted || !this.isMidoriActive) return;
      const note = arpeggios[this.midoriStep % arpeggios.length];
      this.playTone(note, 'sine', 0.06, 0.35, this.sfxGain);
      this.midoriStep++;
    }, 70); // Very fast, sparkling 16th-note arpeggio
  }

  public stopMidoriLayer() {
    this.isMidoriActive = false;
    if (this.midoriInterval !== null) {
      window.clearInterval(this.midoriInterval);
      this.midoriInterval = null;
    }
  }
}

export const sound = new SoundManager();
