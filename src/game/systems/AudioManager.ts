/**
 * AudioManager — Procedural audio synthesis using Web Audio API
 * Zero external files needed. All sounds generated from oscillators + noise.
 */

class AudioManagerSingleton {
  private ctx: AudioContext | null = null
  private masterGain!: GainNode
  private droneOsc: OscillatorNode | null = null
  private droneGain: GainNode | null = null
  private heartbeatInterval: number | null = null
  private initialized = false

  /** Lazily create AudioContext on first user gesture */
  init() {
    if (this.initialized) return
    this.ctx = new AudioContext()
    this.masterGain = this.ctx.createGain()
    this.masterGain.gain.value = 0.6
    this.masterGain.connect(this.ctx.destination)
    this.initialized = true
  }

  private ensureCtx(): AudioContext {
    if (!this.ctx) this.init()
    return this.ctx!
  }

  // ─── JUMP SOUND ──────────────────────────────────────────
  playJump() {
    const ctx = this.ensureCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(280, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(560, ctx.currentTime + 0.08)
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)
    osc.connect(gain).connect(this.masterGain)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.12)
  }

  // ─── LAND SOUND ──────────────────────────────────────────
  playLand() {
    const ctx = this.ensureCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(120, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1)
    gain.gain.setValueAtTime(0.18, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
    osc.connect(gain).connect(this.masterGain)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.15)
  }

  // ─── DEATH SOUND ─────────────────────────────────────────
  playDeath() {
    const ctx = this.ensureCtx()
    // Bass crunch
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(180, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.3)
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)

    // Distortion
    const dist = ctx.createWaveShaper()
    const curve = new Float32Array(256)
    for (let i = 0; i < 256; i++) {
      const x = (i * 2) / 256 - 1
      curve[i] = (Math.PI + 200) * x / (Math.PI + 200 * Math.abs(x))
    }
    dist.curve = curve
    osc.connect(dist).connect(gain).connect(this.masterGain)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.35)

    // Noise burst
    this.playNoiseHit(0.12, 0.2)
  }

  // ─── WALL SLIDE SOUND ────────────────────────────────────
  private wallSlideSource: AudioBufferSourceNode | null = null
  private wallSlideGain: GainNode | null = null

  startWallSlide() {
    if (this.wallSlideSource) return
    const ctx = this.ensureCtx()
    const bufferSize = ctx.sampleRate * 0.5
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1

    this.wallSlideSource = ctx.createBufferSource()
    this.wallSlideSource.buffer = buffer
    this.wallSlideSource.loop = true

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 800
    filter.Q.value = 2

    this.wallSlideGain = ctx.createGain()
    this.wallSlideGain.gain.value = 0.06

    this.wallSlideSource.connect(filter).connect(this.wallSlideGain).connect(this.masterGain)
    this.wallSlideSource.start()
  }

  stopWallSlide() {
    if (this.wallSlideSource) {
      this.wallSlideSource.stop()
      this.wallSlideSource = null
      this.wallSlideGain = null
    }
  }

  // ─── SPIKE HIT ───────────────────────────────────────────
  playSpikeHit() {
    const ctx = this.ensureCtx()
    // Harsh dissonant chord
    const freqs = [220, 277, 370]
    freqs.forEach(f => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.value = f
      gain.gain.setValueAtTime(0.08, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18)
      osc.connect(gain).connect(this.masterGain)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.18)
    })
  }

  // ─── GLITCH SOUND ────────────────────────────────────────
  playGlitch() {
    const ctx = this.ensureCtx()
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      const t = ctx.currentTime + i * 0.06
      osc.frequency.setValueAtTime(100 + Math.random() * 2000, t)
      osc.frequency.setValueAtTime(50 + Math.random() * 1500, t + 0.03)
      gain.gain.setValueAtTime(0.08, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06)
      osc.connect(gain).connect(this.masterGain)
      osc.start(t)
      osc.stop(t + 0.06)
    }
  }

  // ─── CHECKPOINT SOUND ────────────────────────────────────
  playCheckpoint() {
    const ctx = this.ensureCtx()
    const notes = [523, 659, 784] // C5, E5, G5 arpeggio
    notes.forEach((f, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      const t = ctx.currentTime + i * 0.1
      osc.frequency.value = f
      gain.gain.setValueAtTime(0.12, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2)
      osc.connect(gain).connect(this.masterGain)
      osc.start(t)
      osc.stop(t + 0.2)
    })
  }

  // ─── FAKE CRASH SOUND ────────────────────────────────────
  playFakeCrash() {
    const ctx = this.ensureCtx()
    // Static burst
    const bufferSize = ctx.sampleRate * 0.8
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.max(0, 1 - i / bufferSize)
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer
    const gain = ctx.createGain()
    gain.gain.value = 0.25
    source.connect(gain).connect(this.masterGain)
    source.start()
  }

  // ─── AMBIENT DRONE ───────────────────────────────────────
  startDrone() {
    const ctx = this.ensureCtx()
    if (this.droneOsc) return

    this.droneOsc = ctx.createOscillator()
    this.droneOsc.type = 'sawtooth'
    this.droneOsc.frequency.value = 55

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 200
    filter.Q.value = 5

    // Slow LFO to modulate filter
    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()
    lfo.frequency.value = 0.15
    lfoGain.gain.value = 80
    lfo.connect(lfoGain).connect(filter.frequency)
    lfo.start()

    this.droneGain = ctx.createGain()
    this.droneGain.gain.value = 0.07

    this.droneOsc.connect(filter).connect(this.droneGain).connect(this.masterGain)
    this.droneOsc.start()
  }

  stopDrone() {
    if (this.droneOsc) {
      this.droneOsc.stop()
      this.droneOsc = null
      this.droneGain = null
    }
  }

  // ─── HEARTBEAT ───────────────────────────────────────────
  startHeartbeat(bpm = 60) {
    this.stopHeartbeat()
    const interval = 60000 / bpm
    this.heartbeatInterval = window.setInterval(() => {
      this.playHeartbeatPulse()
    }, interval)
  }

  updateHeartbeatRate(deaths: number) {
    // Speed up heartbeat as deaths increase (60 → 140 bpm)
    const bpm = Math.min(140, 60 + deaths * 3)
    this.startHeartbeat(bpm)
  }

  stopHeartbeat() {
    if (this.heartbeatInterval !== null) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  private playHeartbeatPulse() {
    const ctx = this.ensureCtx()
    // Double-beat (lub-dub)
    const beats = [0, 0.12]
    beats.forEach(offset => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      const t = ctx.currentTime + offset
      osc.frequency.setValueAtTime(50, t)
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.08)
      gain.gain.setValueAtTime(0.2, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1)
      osc.connect(gain).connect(this.masterGain)
      osc.start(t)
      osc.stop(t + 0.1)
    })
  }

  // ─── NOISE UTILITY ───────────────────────────────────────
  private playNoiseHit(volume = 0.1, duration = 0.15) {
    const ctx = this.ensureCtx()
    const bufferSize = Math.floor(ctx.sampleRate * duration)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer
    const gain = ctx.createGain()
    gain.gain.value = volume
    source.connect(gain).connect(this.masterGain)
    source.start()
  }

  // ─── VICTORY STING ───────────────────────────────────────
  playVictory() {
    const ctx = this.ensureCtx()
    const notes = [523, 659, 784, 1047] // C5 E5 G5 C6
    notes.forEach((f, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      const t = ctx.currentTime + i * 0.15
      osc.frequency.value = f
      gain.gain.setValueAtTime(0.15, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4)
      osc.connect(gain).connect(this.masterGain)
      osc.start(t)
      osc.stop(t + 0.4)
    })
  }

  // ─── UI CLICK ────────────────────────────────────────────
  playClick() {
    const ctx = this.ensureCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 1200
    gain.gain.setValueAtTime(0.06, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04)
    osc.connect(gain).connect(this.masterGain)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.04)
  }

  // ─── PLATFORM COLLAPSE ──────────────────────────────────
  playCollapse() {
    const ctx = this.ensureCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(300, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.4)
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    osc.connect(gain).connect(this.masterGain)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.4)
    this.playNoiseHit(0.08, 0.3)
  }
}

// Singleton export
export const audioManager = new AudioManagerSingleton()
