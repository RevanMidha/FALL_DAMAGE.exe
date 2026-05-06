/**
 * ParticleManager — Handles all particle effects using Phaser's particle system
 * Creates textures procedurally (no asset files needed)
 */
import Phaser from 'phaser'

export class ParticleManager {
  private scene: Phaser.Scene

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.createTextures()
  }

  /** Generate tiny particle textures at runtime */
  private createTextures() {
    // 4x4 white pixel
    if (!this.scene.textures.exists('particle')) {
      const gfx = this.scene.make.graphics({ x: 0, y: 0 })
      gfx.fillStyle(0xffffff, 1)
      gfx.fillRect(0, 0, 4, 4)
      gfx.generateTexture('particle', 4, 4)
      gfx.destroy()
    }

    // 6x6 glow circle
    if (!this.scene.textures.exists('glow_particle')) {
      const gfx = this.scene.make.graphics({ x: 0, y: 0 })
      gfx.fillStyle(0xffffff, 0.8)
      gfx.fillCircle(6, 6, 6)
      gfx.generateTexture('glow_particle', 12, 12)
      gfx.destroy()
    }

    // 2x2 tiny dot for ambient
    if (!this.scene.textures.exists('dot')) {
      const gfx = this.scene.make.graphics({ x: 0, y: 0 })
      gfx.fillStyle(0xffffff, 1)
      gfx.fillCircle(2, 2, 2)
      gfx.generateTexture('dot', 4, 4)
      gfx.destroy()
    }
  }

  /** Dust burst on landing */
  emitLandingDust(x: number, y: number) {
    const emitter = this.scene.add.particles(x, y, 'particle', {
      speed: { min: 30, max: 80 },
      angle: { min: -160, max: -20 },
      scale: { start: 1, end: 0 },
      alpha: { start: 0.6, end: 0 },
      tint: 0xff1744,
      lifespan: 350,
      quantity: 8,
      gravityY: 120,
      emitting: false,
    })
    emitter.explode(8)
    this.scene.time.delayedCall(500, () => emitter.destroy())
  }

  /** Red explosion on death */
  emitDeathBurst(x: number, y: number) {
    const emitter = this.scene.add.particles(x, y, 'glow_particle', {
      speed: { min: 80, max: 220 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.2, end: 0 },
      alpha: { start: 1, end: 0 },
      tint: [0xff315a, 0xff6b8a, 0xffffff],
      lifespan: 500,
      quantity: 16,
      gravityY: 200,
      emitting: false,
    })
    emitter.explode(16)
    this.scene.time.delayedCall(600, () => emitter.destroy())
  }

  /** Sparks while wall-sliding */
  emitWallSparks(x: number, y: number, direction: number) {
    const emitter = this.scene.add.particles(x, y, 'particle', {
      speedX: { min: direction * 20, max: direction * 60 },
      speedY: { min: -30, max: 30 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.8, end: 0 },
      tint: [0xff1744, 0xff6d00],
      lifespan: 200,
      quantity: 2,
      emitting: false,
    })
    emitter.explode(2)
    this.scene.time.delayedCall(300, () => emitter.destroy())
  }

  /** Checkpoint activation glow ring */
  emitCheckpointGlow(x: number, y: number) {
    const emitter = this.scene.add.particles(x, y, 'glow_particle', {
      speed: { min: 20, max: 60 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.7, end: 0 },
      tint: 0xff1744,
      lifespan: 800,
      quantity: 12,
      emitting: false,
    })
    emitter.explode(12)
    this.scene.time.delayedCall(1000, () => emitter.destroy())
  }

  /** Platform collapse debris */
  emitCollapseDebris(x: number, y: number, width: number) {
    const emitter = this.scene.add.particles(x, y, 'particle', {
      speed: { min: 40, max: 120 },
      angle: { min: -120, max: -60 },
      scale: { start: 1.2, end: 0.3 },
      alpha: { start: 0.8, end: 0 },
      tint: [0x1a0a0a, 0xff1744],
      lifespan: 600,
      quantity: Math.floor(width / 15),
      gravityY: 300,
      emitting: false,
    })
    emitter.explode(Math.floor(width / 15))
    this.scene.time.delayedCall(800, () => emitter.destroy())
  }

  /** Create ambient floating particles for atmosphere */
  createAmbientParticles() {
    // These float slowly upward across the entire game world
    const emitter = this.scene.add.particles(640, 4200, 'dot', {
      x: { min: 0, max: 1280 },
      y: { min: 0, max: 4200 },
      speedY: { min: -15, max: -5 },
      speedX: { min: -5, max: 5 },
      scale: { min: 0.3, max: 0.8 },
      alpha: { min: 0.1, max: 0.35 },
      tint: [0xff1744, 0xff6d00, 0xff4444],
      lifespan: 8000,
      frequency: 300,
      quantity: 1,
    })
    emitter.setScrollFactor(0.5) // Parallax effect
    emitter.setDepth(-5)
    return emitter
  }
}
