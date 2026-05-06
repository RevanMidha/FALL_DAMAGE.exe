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

  // ─── SEQUENCER ───────────────────────────────────────────
  private seqInterval: number | null = null
  private seqStep = 0

  startSequencer(tempo = 140) {
    this.stopSequencer()
    const ctx = this.ensureCtx()
    const intervalMs = (60000 / tempo) / 4 // 16th notes
    
    // Minor pentatonic bass line
    const sequence = [41.20, 0, 49.00, 0, 41.20, 0, 55.00, 49.00, 41.20, 41.20, 0, 61.74, 0, 49.00, 55.00, 0]
    
    this.seqInterval = window.setInterval(() => {
      const freq = sequence[this.seqStep % sequence.length]
      this.seqStep++
      
      if (freq > 0) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const filter = ctx.createBiquadFilter()
        
        osc.type = 'square'
        osc.frequency.value = freq
        
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(800, ctx.currentTime)
        filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1)
        
        gain.gain.setValueAtTime(0.12, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
        
        osc.connect(filter).connect(gain).connect(this.masterGain)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.15)
      }
    }, intervalMs)
  }

  stopSequencer() {
    if (this.seqInterval !== null) {
      clearInterval(this.seqInterval)
      this.seqInterval = null
    }
  }

  // ─── SHEPARD TONE (FINALE PHASE TENSION) ─────────────────
  private shepardOscs: { osc: OscillatorNode, gain: GainNode }[] = []
  private shepardInterval: number | null = null

  startShepardTone() {
    this.stopShepardTone()
    const ctx = this.ensureCtx()
    
    // Create 4 overlapping oscillators an octave apart
    const baseFreqs = [55, 110, 220, 440]
    
    baseFreqs.forEach((freq) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      
      // We will modulate these over time
      osc.frequency.value = freq
      gain.gain.value = 0
      
      osc.connect(gain).connect(this.masterGain)
      osc.start()
      this.shepardOscs.push({ osc, gain })
    })

    let t = 0
    this.shepardInterval = window.setInterval(() => {
      t += 0.05
      this.shepardOscs.forEach((obj, _i) => {
        // Shepard tone formula: frequency rises exponentially, amplitude is a bell curve over log(f)
        const cycle = (t + (_i / this.shepardOscs.length)) % 1
        const f = 55 * Math.pow(2, cycle * 4) // Sweep across 4 octaves
        
        // Bell curve envelope peaking in the middle of the range
        const amplitude = 0.08 * Math.exp(-Math.pow(cycle - 0.5, 2) / 0.05)
        
        obj.osc.frequency.setTargetAtTime(f, ctx.currentTime, 0.05)
        obj.gain.gain.setTargetAtTime(amplitude, ctx.currentTime, 0.05)
      })
    }, 50)
  }

  stopShepardTone() {
    if (this.shepardInterval !== null) {
      clearInterval(this.shepardInterval)
      this.shepardInterval = null
    }
    this.shepardOscs.forEach(obj => {
      obj.osc.stop()
      obj.osc.disconnect()
      obj.gain.disconnect()
    })
    this.shepardOscs = []
  }

  // ─── FOOTSTEP ────────────────────────────────────────────
  playFootstep() {
    const ctx = this.ensureCtx()
    const bufferSize = ctx.sampleRate * 0.02 // Very short
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2)
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer
    
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 300 + Math.random() * 200 // Slight variation
    filter.Q.value = 1
    
    const gain = ctx.createGain()
    gain.gain.value = 0.04
    
    source.connect(filter).connect(gain).connect(this.masterGain)
    source.start()
  }

  // ─── BETRAYAL STINGER ────────────────────────────────────
  playBetrayalStinger() {
    const ctx = this.ensureCtx()
    
    // Massive pitch drop
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(800, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 1.5)
    
    gain.gain.setValueAtTime(0.4, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.0)
    
    osc.connect(gain).connect(this.masterGain)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 2.0)
    
    // Layered chaos
    this.playNoiseHit(0.2, 1.0)
    setTimeout(() => this.playGlitch(), 200)
    setTimeout(() => this.playGlitch(), 500)
  }

  // ─── SECTION TRANSITION RISER ────────────────────────────
  playSectionTransition() {
    const ctx = this.ensureCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.type = 'sine'
    osc.frequency.setValueAtTime(50, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 2.0)
    
    gain.gain.setValueAtTime(0.01, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 1.8)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.1)
    
    osc.connect(gain).connect(this.masterGain)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 2.1)
  }

  playUiAlert(tone: 'danger' | 'warning' | 'system' = 'warning') {
    const ctx = this.ensureCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = tone === 'danger' ? 'square' : 'triangle'
    const base = tone === 'danger' ? 420 : tone === 'warning' ? 620 : 760
    osc.frequency.setValueAtTime(base, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(base * 1.65, ctx.currentTime + 0.07)
    gain.gain.setValueAtTime(tone === 'danger' ? 0.09 : 0.06, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)
    osc.connect(gain).connect(this.masterGain)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.12)
  }

  playRespawnWarp() {
    const ctx = this.ensureCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(180, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.08)
    osc.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + 0.18)
    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)
    osc.connect(gain).connect(this.masterGain)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.2)
  }

  playTauntBeep() {
    const ctx = this.ensureCtx()
    const notes = [900, 740, 980]
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const t = ctx.currentTime + idx * 0.04
      osc.type = 'square'
      osc.frequency.setValueAtTime(freq, t)
      gain.gain.setValueAtTime(0.03, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045)
      osc.connect(gain).connect(this.masterGain)
      osc.start(t)
      osc.stop(t + 0.045)
    })
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
