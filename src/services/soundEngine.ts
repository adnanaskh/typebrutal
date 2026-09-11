import type { SoundProfile } from '../types';

class SoundEngine {
  private audioCtx: AudioContext | null = null;
  private profile: SoundProfile = 'cherry-blue';
  private volume: number = 0.5;

  private initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  public setProfile(profile: SoundProfile) {
    this.profile = profile;
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  // Play mechanical keypress sound based on selected profile
  public playKeySound(isSpace = false) {
    if (this.profile === 'off' || this.volume <= 0) return;
    this.initContext();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;

      switch (this.profile) {
        case 'cherry-blue':
          this.playCherryBlue(now, isSpace);
          break;
        case 'cherry-brown':
          this.playCherryBrown(now, isSpace);
          break;
        case 'cherry-red':
          this.playCherryRed(now, isSpace);
          break;
        case 'typewriter':
          this.playTypewriter(now, isSpace);
          break;
        case 'synth':
          this.playSynth(now, isSpace);
          break;
      }
    } catch {
      // Audio fallback handling
    }
  }

  // Cherry MX Blue: High crisp click + low keycap bottoming clack
  private playCherryBlue(now: number, isSpace: boolean) {
    if (!this.audioCtx) return;

    const masterGain = this.audioCtx.createGain();
    masterGain.gain.setValueAtTime(this.volume * (isSpace ? 0.9 : 0.7), now);
    masterGain.connect(this.audioCtx.destination);

    // 1. High frequency click
    const clickOsc = this.audioCtx.createOscillator();
    const clickGain = this.audioCtx.createGain();
    clickOsc.type = 'triangle';
    const clickFreq = isSpace ? 1400 : 2200 + (Math.random() * 300 - 150);
    clickOsc.frequency.setValueAtTime(clickFreq, now);
    clickOsc.frequency.exponentialRampToValueAtTime(800, now + 0.015);

    clickGain.gain.setValueAtTime(0.6, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

    clickOsc.connect(clickGain);
    clickGain.connect(masterGain);
    clickOsc.start(now);
    clickOsc.stop(now + 0.02);

    // 2. Plastic Clack Noise Burst
    const bufferSize = this.audioCtx.sampleRate * 0.025;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noiseSource = this.audioCtx.createBufferSource();
    noiseSource.buffer = buffer;

    const noiseFilter = this.audioCtx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(isSpace ? 900 : 1600, now);
    noiseFilter.Q.setValueAtTime(2.5, now);

    const noiseGain = this.audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.5, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noiseSource.start(now);

    // 3. Low bottom-out thud
    const thudOsc = this.audioCtx.createOscillator();
    const thudGain = this.audioCtx.createGain();
    thudOsc.type = 'sine';
    thudOsc.frequency.setValueAtTime(isSpace ? 120 : 180, now);
    thudOsc.frequency.exponentialRampToValueAtTime(40, now + 0.035);

    thudGain.gain.setValueAtTime(0.7, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    thudOsc.connect(thudGain);
    thudGain.connect(masterGain);
    thudOsc.start(now);
    thudOsc.stop(now + 0.04);
  }

  // Cherry MX Brown: Tactile bump + medium clack
  private playCherryBrown(now: number, isSpace: boolean) {
    if (!this.audioCtx) return;

    const masterGain = this.audioCtx.createGain();
    masterGain.gain.setValueAtTime(this.volume * 0.7, now);
    masterGain.connect(this.audioCtx.destination);

    const osc = this.audioCtx.createOscillator();
    const oscGain = this.audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(isSpace ? 280 : 380 + (Math.random() * 40 - 20), now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.03);

    oscGain.gain.setValueAtTime(0.8, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(oscGain);
    oscGain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.04);

    // Light noise
    const bufferSize = this.audioCtx.sampleRate * 0.02;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.4;
    }
    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);
    const nGain = this.audioCtx.createGain();
    nGain.gain.setValueAtTime(0.4, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(masterGain);
    noise.start(now);
  }

  // Cherry MX Red: Smooth linear thock
  private playCherryRed(now: number, isSpace: boolean) {
    if (!this.audioCtx) return;

    const masterGain = this.audioCtx.createGain();
    masterGain.gain.setValueAtTime(this.volume * 0.75, now);
    masterGain.connect(this.audioCtx.destination);

    const thock = this.audioCtx.createOscillator();
    const thockGain = this.audioCtx.createGain();
    thock.type = 'sine';
    thock.frequency.setValueAtTime(isSpace ? 150 : 220 + (Math.random() * 30 - 15), now);
    thock.frequency.exponentialRampToValueAtTime(50, now + 0.04);

    thockGain.gain.setValueAtTime(0.9, now);
    thockGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    thock.connect(thockGain);
    thockGain.connect(masterGain);
    thock.start(now);
    thock.stop(now + 0.05);
  }

  // Retro Typewriter: Heavy mechanical clank
  private playTypewriter(now: number, isSpace: boolean) {
    if (!this.audioCtx) return;

    const masterGain = this.audioCtx.createGain();
    masterGain.gain.setValueAtTime(this.volume * 0.8, now);
    masterGain.connect(this.audioCtx.destination);

    // Metal hit
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(isSpace ? 600 : 900 + (Math.random() * 100 - 50), now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.03);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.05);

    // Spring resonance
    const ring = this.audioCtx.createOscillator();
    const ringGain = this.audioCtx.createGain();
    ring.type = 'sine';
    ring.frequency.setValueAtTime(2400, now);
    ringGain.gain.setValueAtTime(0.15, now);
    ringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    ring.connect(ringGain);
    ringGain.connect(masterGain);
    ring.start(now);
    ring.stop(now + 0.07);
  }

  // Cyber Synth Beep
  private playSynth(now: number, isSpace: boolean) {
    if (!this.audioCtx) return;

    const masterGain = this.audioCtx.createGain();
    masterGain.gain.setValueAtTime(this.volume * 0.45, now);
    masterGain.connect(this.audioCtx.destination);

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'sawtooth';
    const baseFreq = isSpace ? 330 : 440 + (Math.random() * 200);
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, now + 0.04);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  // Tactile Error Clonk
  public playErrorSound() {
    if (this.profile === 'off' || this.volume <= 0) return;
    this.initContext();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(90, now + 0.12);

      gain.gain.setValueAtTime(this.volume * 0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Audio fallback
    }
  }

  // Victory Celebration Fanfare / Bell
  public playSuccessFanfare() {
    if (this.profile === 'off' || this.volume <= 0) return;
    this.initContext();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio

      notes.forEach((freq, idx) => {
        if (!this.audioCtx) return;
        const noteTime = now + idx * 0.08;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0, noteTime);
        gain.gain.linearRampToValueAtTime(this.volume * 0.4, noteTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(noteTime);
        osc.stop(noteTime + 0.4);
      });
    } catch {
      // Audio fallback
    }
  }
}

export const soundEngine = new SoundEngine();
