/**
 * GameScene — Main gameplay scene
 * Integrates: movement, camera, particles, audio, traps, checkpoints, troll mechanics
 */
import Phaser from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH, SPAWN_X, SPAWN_Y, SECTIONS, PLAYER_COLOR, PLAYER_STROKE_COLOR } from '../core/config'
import { buildVerticalSliceLevel, type MovingPlatform } from '../levels'
import { MovementController } from '../systems/MovementController'
import { ParticleManager, CameraEffects } from '../effects'
import { TrollManager } from '../traps'
import { audioManager } from '../audio'
import { useGameUiStore } from '../../store/gameUi/gameUiStore'

export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle
  private playerGlow!: Phaser.GameObjects.Rectangle
  private movement!: MovementController
  private particles!: ParticleManager
  private cameraFx!: CameraEffects
  private trollManager!: TrollManager
  private spawnPoint = new Phaser.Math.Vector2(SPAWN_X, SPAWN_Y)
  private currentSection = ''
  private checkpointPositions: Phaser.Math.Vector2[] = []
  private movingPlatforms: MovingPlatform[] = []
  private fakeVictoryResolved = false
  private progressUpdateTimer = 0
  private isDead = false
  private wallSlideDir = 0
  private wallSparkCooldown = 0
  private parallaxTimer = 0
  private bgFarLayer: Phaser.GameObjects.Container | null = null
  private bgNearLayer: Phaser.GameObjects.Container | null = null

  constructor() {
    super('GameScene')
  }

  create() {
    // Init audio on first user interaction
    audioManager.init()
    audioManager.startDrone()
    audioManager.startHeartbeat(60)

    this.cameras.main.setBackgroundColor('#080000')
    this.createBackgroundLayers()

    // Physics world bounds
    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT)

    // Init systems
    this.particles = new ParticleManager(this)
    this.cameraFx = new CameraEffects(this)
    this.trollManager = new TrollManager(this)

    // Build level
    const level = buildVerticalSliceLevel(this, this.trollManager)
    this.movingPlatforms = level.movingPlatforms

    // ─── PLAYER ───────────────────────────────────────
    // Glow layer behind player
    this.playerGlow = this.add.rectangle(SPAWN_X, SPAWN_Y, 32, 42, PLAYER_STROKE_COLOR, 0.08)
    this.playerGlow.setDepth(4)

    // Player rectangle
    this.player = this.add.rectangle(SPAWN_X, SPAWN_Y, 22, 32, PLAYER_COLOR, 1)
    this.player.setStrokeStyle(2, PLAYER_STROKE_COLOR, 1)
    this.player.setDepth(5)

    this.physics.add.existing(this.player)
    const body = this.player.body as Phaser.Physics.Arcade.Body
    body.setCollideWorldBounds(false)
    body.setSize(20, 31)

    // ─── COLLISIONS ───────────────────────────────────
    this.physics.add.collider(this.player, level.solids)

    this.physics.add.overlap(this.player, level.spikes, () => {
      this.killPlayer('SPIKE COLLISION')
    })

    // Checkpoint overlaps
    level.checkpointZones.forEach((zone, index) => {
      // Store checkpoint positions (slightly above the zone)
      this.checkpointPositions.push(new Phaser.Math.Vector2(zone.x, zone.y - 20))
      this.physics.add.overlap(this.player, zone, () => {
        this.activateCheckpoint(index)
      })
    })

    level.fakeCheckpointZones.forEach((zone) => {
      this.physics.add.overlap(this.player, zone, () => {
        this.trollManager.triggerFakeCheckpoint()
      })
    })

    // Fake victory trigger
    this.physics.add.overlap(this.player, level.fakeVictoryZone, () => {
      if (!this.fakeVictoryResolved) {
        this.fakeVictoryResolved = true
        ;(level.fakeVictoryZone.body as Phaser.Physics.Arcade.StaticBody).enable = false
        this.revealFakeVictoryRoute(
          level.fakeVictoryRevealPlatforms,
          level.fakeVictoryRevealSigns,
          level.upperWorldFog,
          level.upperWorldFogLabel,
        )
      }
      this.trollManager.triggerFakeVictory(() => {
        audioManager.playBetrayalStinger()
        this.killPlayer('FAKE VICTORY')
      })
    })

    // Fake crash trigger
    this.physics.add.overlap(this.player, level.fakeCrashZone, () => {
      this.trollManager.triggerFakeCrash(() => this.killPlayer('SYSTEM CRASH'))
    })

    // Real ending
    this.physics.add.overlap(this.player, level.realEndZone, () => {
      this.triggerRealEnding()
    })

    // ─── MOVEMENT CONTROLLER ──────────────────────────
    this.movement = new MovementController({
      scene: this,
      body,
      onLand: (impactSpeed) => {
        if (!this.isDead) {
          this.particles.emitLandingDust(this.player.x, this.player.y + 16)
          this.cameraFx.landShake(impactSpeed)
        }
      },
      onJump: () => {
        // Squash & stretch on jump
        this.tweens.add({
          targets: this.player,
          scaleX: 0.8,
          scaleY: 1.2,
          duration: 80,
          yoyo: true,
          ease: 'Quad.easeOut',
        })
      },
      onWallSlideStart: () => {
        this.wallSlideDir = (this.player.body as Phaser.Physics.Arcade.Body).blocked.left ? -1 : 1
      },
      onWallSlideStop: () => {
        this.wallSlideDir = 0
      },
    })

    // ─── CAMERA ───────────────────────────────────────
    this.cameraFx.setupFollow(this.player, GAME_WIDTH, GAME_HEIGHT)

    // ─── AMBIENT PARTICLES ────────────────────────────
    this.particles.createAmbientParticles()
    this.particles.createPlayerTrail(this.player)

    // ─── UI INIT ──────────────────────────────────────
    const ui = useGameUiStore.getState()
    ui.setPrompt('climb_or_die.exe')
    ui.setSection('TRUST PHASE')
    ui.setGamePhase('playing')
  }

  update(_time: number, delta: number) {
    if (this.isDead) return

    const dt = delta / 1000
    this.wallSparkCooldown -= delta
    const body = this.player.body as Phaser.Physics.Arcade.Body

    // Movement
    this.movement.update(dt)

    if (this.movement.wantsRestart()) {
      this.killPlayer('MANUAL RETRY')
      return
    }

    this.applyMovingPlatformCarry(body)

    // Update player glow position
    this.playerGlow.setPosition(this.player.x, this.player.y)
    this.playerGlow.setAlpha(0.06 + Math.min(Math.abs(body.velocity.y) / 1400, 0.22))
    this.particles.setTrailIntensity(Math.abs(body.velocity.x) > 220 || Math.abs(body.velocity.y) > 300)
    this.parallaxTimer -= delta
    if (this.parallaxTimer <= 0) {
      this.updateParallaxLayers()
      this.parallaxTimer = 33
    }

    // Wall slide particles
    if (this.wallSlideDir !== 0) {
      const sparkX = this.player.x + (this.wallSlideDir < 0 ? -12 : 12)
      if (this.wallSparkCooldown <= 0 && Math.random() > 0.45) {
        this.particles.emitWallSparks(sparkX, this.player.y, -this.wallSlideDir)
        this.wallSparkCooldown = 90
      }
    }

    // Troll manager update (disappearing platforms)
    this.trollManager.update(body, dt, (x, y, w) => {
      this.particles.emitCollapseDebris(x, y, w)
    })

    // Void fall death
    if (this.player.y > GAME_HEIGHT + 50) {
      this.killPlayer('VOID FALL')
    }

    // Section tracking
    this.updateSectionTracking()
    this.updateProgressUi(dt)
  }

  private applyMovingPlatformCarry(playerBody: Phaser.Physics.Arcade.Body) {
    for (const moving of this.movingPlatforms) {
      const platform = moving.platform
      const deltaX = platform.x - moving.previousX
      const deltaY = platform.y - moving.previousY

      const playerCenterX = playerBody.center.x
      const playerBottom = playerBody.bottom
      const platformLeft = platform.x - platform.width / 2 - 4
      const platformRight = platform.x + platform.width / 2 + 4
      const platformTop = platform.y - platform.height / 2
      const standingOnPlatform =
        playerBody.blocked.down &&
        playerCenterX >= platformLeft &&
        playerCenterX <= platformRight &&
        Math.abs(playerBottom - platformTop) < 10

      if (standingOnPlatform && (deltaX !== 0 || deltaY !== 0)) {
        this.player.x += deltaX
        this.player.y += deltaY
        playerBody.updateFromGameObject()
      }

      moving.previousX = platform.x
      moving.previousY = platform.y
    }
  }

  private createBackgroundLayers() {
    const far = this.add.container(0, 0)
    const near = this.add.container(0, 0)

    for (let i = 0; i < 8; i++) {
      const y = 380 + i * (GAME_HEIGHT / 10)
      const orb = this.add.ellipse(240 + (i % 2) * 720, y, 520, 300, 0xff1744, 0.045)
      orb.setBlendMode(Phaser.BlendModes.ADD)
      far.add(orb)
    }

    for (let i = 0; i < 14; i++) {
      const x = Phaser.Math.Between(80, GAME_WIDTH - 80)
      const y = Phaser.Math.Between(120, GAME_HEIGHT - 80)
      const glow = this.add.ellipse(x, y, Phaser.Math.Between(80, 220), Phaser.Math.Between(30, 120), 0xff6d00, 0.05)
      glow.setBlendMode(Phaser.BlendModes.ADD)
      near.add(glow)
    }

    far.setDepth(-30)
    near.setDepth(-25)
    this.bgFarLayer = far
    this.bgNearLayer = near
  }

  private updateParallaxLayers() {
    if (!this.bgFarLayer || !this.bgNearLayer) return
    const camY = this.cameras.main.scrollY
    this.bgFarLayer.y = camY * 0.12
    this.bgNearLayer.y = camY * 0.2
  }

  private updateProgressUi(deltaSeconds: number) {
    this.progressUpdateTimer -= deltaSeconds
    if (this.progressUpdateTimer > 0) return
    this.progressUpdateTimer = 0.2

    const progress = Phaser.Math.Clamp(1 - this.player.y / GAME_HEIGHT, 0, 1)
    const ui = useGameUiStore.getState()
    ui.setProgress(progress)
    if (this.currentSection === 'BETRAYAL') {
      ui.setPlayerPosition(this.player.x, this.player.y)
    }
  }

  private revealFakeVictoryRoute(
    platforms: { platform: Phaser.GameObjects.Rectangle; edge: Phaser.GameObjects.Rectangle }[],
    signs: Phaser.GameObjects.Text[],
    upperFog: Phaser.GameObjects.Rectangle,
    upperFogLabel: Phaser.GameObjects.Text,
  ) {
    platforms.forEach(({ platform, edge }, index) => {
      ;(platform.body as Phaser.Physics.Arcade.StaticBody).enable = true
      platform.setVisible(true)
      edge.setVisible(true)
      this.tweens.add({
        targets: [platform, edge],
        alpha: 1,
        duration: 220,
        delay: index * 120,
      })
    })

    signs.forEach((sign, index) => {
      this.tweens.add({
        targets: sign,
        alpha: 0.82,
        y: sign.y - 6,
        duration: 260,
        delay: 140 + index * 120,
        ease: 'Quad.easeOut',
      })
    })

    this.tweens.add({
      targets: [upperFog, upperFogLabel],
      alpha: 0,
      duration: 520,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        upperFog.setVisible(false)
        upperFogLabel.setVisible(false)
      },
    })

    const ui = useGameUiStore.getState()
    this.time.delayedCall(1900, () => {
      ui.setPrompt('victory_flag_revoked.route_left.exe')
      ui.setStatus('warning')
    })
  }

  /** Track which section the player is in and update UI */
  private updateSectionTracking() {
    const py = this.player.y
    let newSection = ''
    for (const [, sec] of Object.entries(SECTIONS)) {
      if (py >= sec.top && py <= sec.bottom) {
        newSection = sec.name
        break
      }
    }
    if (newSection && newSection !== this.currentSection) {
      this.currentSection = newSection
      const ui = useGameUiStore.getState()
      ui.setSection(newSection)
      this.cameraFx.sectionTransition()

      if (newSection !== 'TRUST PHASE') {
        audioManager.playSectionTransition()
      }
      
      if (newSection === 'FINALE') {
        audioManager.startShepardTone()
        audioManager.stopSequencer()
      } else {
        audioManager.stopShepardTone()
        if (newSection === 'TENSION') audioManager.startSequencer(130)
        if (newSection === 'DECEPTION') audioManager.startSequencer(145)
        if (newSection === 'BETRAYAL') audioManager.startSequencer(160)
        if (newSection === 'PRECISION') audioManager.startSequencer(180)
      }

      // Update prompts based on section
      switch (newSection) {
        case 'TRUST PHASE':
          ui.setPrompt('learning_controls.exe')
          ui.setStatus('stable')
          break
        case 'TENSION':
          ui.setPrompt('danger_ahead.warning')
          ui.setStatus('warning')
          break
        case 'DECEPTION':
          ui.setPrompt('trust_nothing.exe')
          ui.setStatus('warning')
          break
        case 'BETRAYAL':
          ui.setPrompt('hope_is_a_bug.exe')
          ui.setStatus('critical')
          audioManager.playBetrayalStinger()
          break
        case 'PRECISION':
          ui.setPrompt('no_margin_for_error.sys')
          ui.setStatus('critical')
          audioManager.playUiAlert('danger')
          break
        case 'FINALE':
          ui.setPrompt('end_of_line.exe')
          ui.setStatus('critical')
          audioManager.playUiAlert('warning')
          break
      }
    }
  }

  /** Activate a real checkpoint */
  private activateCheckpoint(index: number) {
    const ui = useGameUiStore.getState()
    if (ui.lastCheckpointIndex >= index) return

    ui.setCheckpoint(index)
    this.spawnPoint.copy(this.checkpointPositions[index])
    audioManager.playCheckpoint()
    audioManager.playUiAlert('system')
    this.particles.emitCheckpointGlow(this.checkpointPositions[index].x, this.checkpointPositions[index].y)
    ui.setPrompt(`checkpoint_${index + 1}.saved`)
  }

  /** Kill the player with full juice */
  private killPlayer(reason: string) {
    if (this.isDead) return
    this.isDead = true

    const deathX = this.player.x
    const deathY = this.player.y

    // Audio
    if (reason === 'SPIKE COLLISION') {
      audioManager.playSpikeHit()
    }
    audioManager.playDeath()

    // Particles
    this.particles.emitDeathBurst(deathX, deathY)

    // Camera
    this.cameraFx.deathShake()

    // Flash player red
    this.player.setFillStyle(0xff1744, 1)
    this.player.setStrokeStyle(2, 0xff6b8a, 1)

    // UI update
    const ui = useGameUiStore.getState()
    ui.pushDeath()
    ui.setPrompt(`fatal_error: ${reason}`)
    ui.pulseGlitch()

    // Update heartbeat speed
    audioManager.updateHeartbeatRate(ui.deaths + 1)

    // Brief freeze then respawn
    this.time.delayedCall(350, () => {
      this.respawnPlayer()
    })
  }

  /** Respawn at last checkpoint */
  private respawnPlayer() {
    this.player.setPosition(this.spawnPoint.x, this.spawnPoint.y)
    const body = this.player.body as Phaser.Physics.Arcade.Body
    body.setVelocity(0, 0)
    body.setAcceleration(0, 0)

    // Reset visual
    this.player.setFillStyle(PLAYER_COLOR, 1)
    this.player.setStrokeStyle(2, PLAYER_STROKE_COLOR, 1)
    this.player.setScale(1, 1)
    audioManager.playRespawnWarp()

    this.isDead = false
  }

  /** Real ending sequence */
  private triggerRealEnding() {
    if (this.isDead) return
    this.isDead = true // Prevent further input

    const ui = useGameUiStore.getState()
    ui.setSection('END OF LINE')
    ui.setPrompt('process_complete.exe')
    ui.setStatus('stable')
    audioManager.playVictory()
    audioManager.stopHeartbeat()

    this.cameras.main.fade(2000, 0, 0, 0, true)
    this.time.delayedCall(2500, () => {
      ui.setGamePhase('ending')
    })
  }
}
