/**
 * LevelFactory — Builds the vertical tower level with 6 psychological sections
 * Each section escalates tension and introduces new mechanics
 */
import Phaser from 'phaser'
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PLATFORM_COLOR,
  PLATFORM_EDGE_COLOR,
  PLATFORM_EDGE_ALPHA,
  SPIKE_COLOR,
  WALL_COLOR,
  CHECKPOINT_COLOR,
} from '../core/config'
import { TrollManager } from './TrollManager'

export type MovingPlatform = {
  platform: Phaser.GameObjects.Rectangle
  edge: Phaser.GameObjects.Rectangle
  previousX: number
  previousY: number
}

export type LevelBuildOutput = {
  solids: Phaser.Physics.Arcade.StaticGroup
  spikes: Phaser.Physics.Arcade.StaticGroup
  checkpointZones: Phaser.GameObjects.Zone[]
  fakeCheckpointZones: Phaser.GameObjects.Zone[]
  movingPlatforms: MovingPlatform[]
  fakeVictoryRevealPlatforms: { platform: Phaser.GameObjects.Rectangle; edge: Phaser.GameObjects.Rectangle }[]
  fakeVictoryRevealSigns: Phaser.GameObjects.Text[]
  upperWorldFog: Phaser.GameObjects.Rectangle
  upperWorldFogLabel: Phaser.GameObjects.Text
  fakeVictoryZone: Phaser.GameObjects.Zone
  fakeCrashZone: Phaser.GameObjects.Zone
  realEndZone: Phaser.GameObjects.Zone
}

/** Helper to add a neon-edged platform */
function addPlatform(
  scene: Phaser.Scene,
  solids: Phaser.Physics.Arcade.StaticGroup,
  x: number, y: number, w: number, h: number,
  trollManager?: TrollManager,
  disappearing = false,
  collapseDelay = 500,
  pulseEdge = false,
) {
  const platform = scene.add.rectangle(x, y, w, h, PLATFORM_COLOR, 1)
  const edge = scene.add.rectangle(x, y - h / 2 + 1, w, 2, PLATFORM_EDGE_COLOR, PLATFORM_EDGE_ALPHA)
  scene.physics.add.existing(platform, true)
  solids.add(platform as unknown as Phaser.Physics.Arcade.Image)

  // Optional edge pulse on selected hero platforms only (perf-safe).
  if (pulseEdge) {
    scene.tweens.add({
      targets: edge,
      alpha: { from: PLATFORM_EDGE_ALPHA * 0.7, to: PLATFORM_EDGE_ALPHA },
      duration: 1200 + Math.random() * 1600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: Math.random() * 800,
    })
  }

  if (disappearing && trollManager) {
    trollManager.registerDisappearing(platform, edge, collapseDelay)
  }

  return { platform, edge }
}

function addHiddenPlatform(
  scene: Phaser.Scene,
  solids: Phaser.Physics.Arcade.StaticGroup,
  x: number, y: number, w: number, h: number,
) {
  const hidden = addPlatform(scene, solids, x, y, w, h)
  hidden.platform.setVisible(false)
  hidden.edge.setVisible(false)
  hidden.platform.setAlpha(0)
  hidden.edge.setAlpha(0)
  ;(hidden.platform.body as Phaser.Physics.Arcade.StaticBody).enable = false
  return hidden
}

/** Helper to add spike zone */
function addSpike(
  scene: Phaser.Scene,
  spikes: Phaser.Physics.Arcade.StaticGroup,
  x: number, y: number, w: number, h: number,
) {
  const spike = scene.add.rectangle(x, y, w, h, SPIKE_COLOR, 0.85)
  spike.setStrokeStyle(1, 0xff8c66, 0.55)
  scene.physics.add.existing(spike, true)
  spikes.add(spike as unknown as Phaser.Physics.Arcade.Image)

  // Add glow effect
  const glow = scene.add.rectangle(x, y, w + 4, h + 4, SPIKE_COLOR, 0.15)
  glow.setDepth(-1)

  scene.tweens.add({
    targets: glow,
    alpha: { from: 0.08, to: 0.24 },
    duration: 740 + Math.random() * 500,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  })

  return spike
}

/** Helper to add wall */
function addWall(
  scene: Phaser.Scene,
  solids: Phaser.Physics.Arcade.StaticGroup,
  x: number, y: number, w: number, h: number,
) {
  const wall = scene.add.rectangle(x, y, w, h, WALL_COLOR, 1)
  wall.setStrokeStyle(1, PLATFORM_EDGE_COLOR, 0.15)
  scene.physics.add.existing(wall, true)
  solids.add(wall as unknown as Phaser.Physics.Arcade.Image)
  return wall
}

/** Add a moving platform (oscillates horizontally) */
function addMovingPlatform(
  scene: Phaser.Scene,
  solids: Phaser.Physics.Arcade.StaticGroup,
  x: number, y: number, w: number, h: number,
  rangeX: number, duration: number,
): MovingPlatform {
  const platform = scene.add.rectangle(x, y, w, h, PLATFORM_COLOR, 1)
  const edge = scene.add.rectangle(x, y - h / 2 + 1, w, 2, CHECKPOINT_COLOR, 0.85)
  scene.physics.add.existing(platform, true)
  solids.add(platform as unknown as Phaser.Physics.Arcade.Image)
  const movingPlatform = { platform, edge, previousX: x, previousY: y }

  scene.tweens.add({
    targets: [platform, edge],
    x: x + rangeX,
    duration,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
    onUpdate: () => {
      const body = platform.body as Phaser.Physics.Arcade.StaticBody
      body.updateFromGameObject()
    },
  })

  return movingPlatform
}

/** Add a spike hazard that patrols on a deterministic tween. */
function addMovingSpike(
  scene: Phaser.Scene,
  spikes: Phaser.Physics.Arcade.StaticGroup,
  x: number, y: number, w: number, h: number,
  rangeX: number, duration: number,
) {
  const spike = scene.add.rectangle(x, y, w, h, SPIKE_COLOR, 0.85)
  spike.setStrokeStyle(1, 0xffb84d, 0.6)
  scene.physics.add.existing(spike, true)
  spikes.add(spike as unknown as Phaser.Physics.Arcade.Image)

  const glow = scene.add.rectangle(x, y, w + 8, h + 8, SPIKE_COLOR, 0.16)
  glow.setDepth(-1)

  scene.tweens.add({
    targets: [spike, glow],
    x: x + rangeX,
    duration,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
    onUpdate: () => {
      const body = spike.body as Phaser.Physics.Arcade.StaticBody
      body.updateFromGameObject()
    },
  })
}

/** Helper to add a decorative warning sign */
function addSign(scene: Phaser.Scene, x: number, y: number, text: string, color = 0xff1744) {
  scene.add.text(x, y, text, {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '11px',
    color: `#${color.toString(16).padStart(6, '0')}`,
    align: 'center',
  }).setOrigin(0.5).setAlpha(0.7)
}

// ═══════════════════════════════════════════════════════════
// MAIN LEVEL BUILDER
// ═══════════════════════════════════════════════════════════

export function buildVerticalSliceLevel(
  scene: Phaser.Scene,
  trollManager: TrollManager,
): LevelBuildOutput {
  const solids = scene.physics.add.staticGroup()
  const spikes = scene.physics.add.staticGroup()
  const checkpointZones: Phaser.GameObjects.Zone[] = []
  const fakeCheckpointZones: Phaser.GameObjects.Zone[] = []
  const movingPlatforms: MovingPlatform[] = []
  const fakeVictoryRevealPlatforms: { platform: Phaser.GameObjects.Rectangle; edge: Phaser.GameObjects.Rectangle }[] = []
  const fakeVictoryRevealSigns: Phaser.GameObjects.Text[] = []

  // ─── WORLD WALLS (invisible boundaries left/right) ─────
  addWall(scene, solids, -10, GAME_HEIGHT / 2, 20, GAME_HEIGHT)
  addWall(scene, solids, GAME_WIDTH + 10, GAME_HEIGHT / 2, 20, GAME_HEIGHT)

  // ═══════════════════════════════════════════════════════
  // SECTION 1: TRUST PHASE (Y: 3700–4050)
  // Safe, wide platforms. Teach movement. Build confidence.
  // ═══════════════════════════════════════════════════════

  addSign(scene, 200, 3840, '> FALL_DAMAGE.exe LOADED', 0xff1744)
  addSign(scene, 200, 3858, '> MOVE: A/D  JUMP: SPACE/W', 0xffea00)

  // Ground floor
  addPlatform(scene, solids, 300, 3920, 550, 36)
  addPlatform(scene, solids, 700, 3850, 200, 24)
  addPlatform(scene, solids, 950, 3780, 220, 24)
  addPlatform(scene, solids, 700, 3700, 200, 24)
  addPlatform(scene, solids, 450, 3620, 250, 24)

  addSign(scene, 450, 3590, '> climb_higher.exe')

  // Real checkpoint 1
  const cp1 = scene.add.zone(450, 3580, 80, 80)
  scene.physics.add.existing(cp1, true)
  checkpointZones.push(cp1)
  // Checkpoint visual marker
  scene.add.rectangle(450, 3595, 6, 50, CHECKPOINT_COLOR, 0.7).setStrokeStyle(1, 0xffea00, 0.4)

  // ═══════════════════════════════════════════════════════
  // SECTION 2: TENSION (Y: 2700–3500)
  // Introduce spikes, narrower platforms, moving platforms
  // ═══════════════════════════════════════════════════════

  addPlatform(scene, solids, 200, 3520, 180, 22)
  addPlatform(scene, solids, 450, 3440, 160, 22)

  // First spikes — between safe areas
  addSpike(scene, spikes, 330, 3550, 40, 16)

  addPlatform(scene, solids, 700, 3360, 180, 22)
  addSpike(scene, spikes, 580, 3440, 40, 16)

  addPlatform(scene, solids, 1000, 3280, 200, 22)
  addPlatform(scene, solids, 750, 3200, 160, 22)

  // Moving platform
  movingPlatforms.push(addMovingPlatform(scene, solids, 450, 3120, 140, 20, 200, 2500))
  addMovingSpike(scene, spikes, 980, 3185, 52, 16, -220, 1900)

  addSign(scene, 750, 3170, '> keep going...', 0xff6d00)

  addPlatform(scene, solids, 200, 3040, 220, 22)
  addSpike(scene, spikes, 350, 3040, 50, 18)
  addPlatform(scene, solids, 550, 2960, 160, 22)
  addPlatform(scene, solids, 850, 2880, 200, 22)
  addPlatform(scene, solids, 600, 2800, 160, 22)

  // Real checkpoint 2
  const cp2 = scene.add.zone(850, 2840, 80, 80)
  scene.physics.add.existing(cp2, true)
  checkpointZones.push(cp2)
  scene.add.rectangle(850, 2855, 6, 50, CHECKPOINT_COLOR, 0.7).setStrokeStyle(1, 0xffea00, 0.4)

  // ═══════════════════════════════════════════════════════
  // SECTION 3: DECEPTION (Y: 1900–2700)
  // Disappearing platforms, fake checkpoint, misleading signs
  // ═══════════════════════════════════════════════════════

  addPlatform(scene, solids, 350, 2720, 180, 22)
  // DISAPPEARING!
  addPlatform(scene, solids, 600, 2640, 160, 22, trollManager, true, 600)
  addPlatform(scene, solids, 900, 2560, 180, 22)

  // Misleading arrow pointing toward spikes
  addSign(scene, 1100, 2520, '>>> SAFE PATH >>>', 0x00ff41)
  addSpike(scene, spikes, 1180, 2560, 80, 20)

  addPlatform(scene, solids, 700, 2480, 160, 22, trollManager, true, 450)
  addPlatform(scene, solids, 400, 2400, 200, 22)
  addPlatform(scene, solids, 650, 2320, 140, 22)

  // FAKE CHECKPOINT — looks like a real one but does nothing
  scene.add.rectangle(400, 2365, 6, 50, 0x00ff41, 0.6).setStrokeStyle(1, 0x66ff66, 0.4)
  addSign(scene, 400, 2350, '> checkpoint_saved.tmp', 0x00ff41)

  const fakeCpZone = scene.add.zone(400, 2365, 96, 110)
  scene.physics.add.existing(fakeCpZone, true)
  fakeCheckpointZones.push(fakeCpZone)

  movingPlatforms.push(addMovingPlatform(scene, solids, 900, 2240, 120, 20, -180, 2200))
  addPlatform(scene, solids, 500, 2160, 160, 22)
  addSpike(scene, spikes, 700, 2160, 60, 16)

  addPlatform(scene, solids, 250, 2080, 200, 22, trollManager, true, 400)
  addPlatform(scene, solids, 550, 2000, 180, 22)

  // Real checkpoint 3
  const cp3 = scene.add.zone(550, 1960, 80, 80)
  scene.physics.add.existing(cp3, true)
  checkpointZones.push(cp3)
  scene.add.rectangle(550, 1975, 6, 50, CHECKPOINT_COLOR, 0.7).setStrokeStyle(1, 0xffea00, 0.4)

  // ═══════════════════════════════════════════════════════
  // SECTION 4: BETRAYAL (Y: 1100–1900)
  // Fake victory, dense spikes, psychological manipulation
  // ═══════════════════════════════════════════════════════

  addPlatform(scene, solids, 800, 1920, 160, 22)
  addPlatform(scene, solids, 1050, 1840, 180, 22)
  addSpike(scene, spikes, 920, 1920, 40, 16)

  addPlatform(scene, solids, 750, 1760, 140, 22)
  addPlatform(scene, solids, 450, 1680, 180, 22, trollManager, true, 350)
  addPlatform(scene, solids, 200, 1600, 200, 22)

  // Wall-jump corridor
  addWall(scene, solids, 100, 1500, 24, 200)
  addWall(scene, solids, 300, 1500, 24, 200)
  addSpike(scene, spikes, 200, 1600, 150, 12)

  addPlatform(scene, solids, 500, 1400, 180, 22)
  movingPlatforms.push(addMovingPlatform(scene, solids, 750, 1320, 100, 20, 150, 1800))
  addMovingSpike(scene, spikes, 940, 1365, 46, 16, -260, 1500)
  addPlatform(scene, solids, 1050, 1240, 180, 22)

  fakeVictoryRevealPlatforms.push(addHiddenPlatform(scene, solids, 900, 1160, 130, 18))
  fakeVictoryRevealPlatforms.push(addHiddenPlatform(scene, solids, 700, 1065, 120, 18))
  fakeVictoryRevealPlatforms.push(addHiddenPlatform(scene, solids, 520, 985, 110, 18))
  fakeVictoryRevealPlatforms.push(addHiddenPlatform(scene, solids, 400, 910, 110, 18))
  const rerouteSign = scene.add.text(870, 1115, '> NO EXIT. GO LEFT.', {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '11px',
    color: '#ffea00',
    align: 'center',
  }).setOrigin(0.5).setAlpha(0)
  fakeVictoryRevealSigns.push(rerouteSign)
  const rerouteSign2 = scene.add.text(530, 955, '> ROUTE UNLOCKED', {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '11px',
    color: '#ff6d00',
    align: 'center',
  }).setOrigin(0.5).setAlpha(0)
  fakeVictoryRevealSigns.push(rerouteSign2)

  // FAKE VICTORY ZONE — triggers the troll
  addSign(scene, 1050, 1200, '> EXIT DETECTED', 0x00ff41)
  addSign(scene, 1050, 1215, '> ALMOST THERE!', 0x00ff41)
  const fakeVictoryZone = scene.add.zone(1050, 1200, 150, 80)
  scene.physics.add.existing(fakeVictoryZone, true)

  // Hide upper sections before fake-victory trigger so the trap remains believable.
  const upperWorldFog = scene.add.rectangle(
    GAME_WIDTH / 2,
    560,
    GAME_WIDTH + 160,
    1120,
    0x060000,
    0.98,
  )
  upperWorldFog.setDepth(18)
  const upperWorldFogLabel = scene.add.text(1060, 1020, 'SIGNAL LOCKED // UNKNOWN ABOVE', {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '11px',
    color: '#ff1744',
  })
  upperWorldFogLabel.setOrigin(1, 0.5).setAlpha(0.75).setDepth(19)

  // Real checkpoint 4
  const cp4 = scene.add.zone(200, 1560, 80, 80)
  scene.physics.add.existing(cp4, true)
  checkpointZones.push(cp4)
  scene.add.rectangle(200, 1575, 6, 50, CHECKPOINT_COLOR, 0.7).setStrokeStyle(1, 0xffea00, 0.4)

  // ═══════════════════════════════════════════════════════
  // SECTION 5: PRECISION (Y: 400–1100)
  // Tiny platforms, tight corridors, spike walls, mastery required
  // ═══════════════════════════════════════════════════════

  addPlatform(scene, solids, 800, 1140, 100, 20)
  addPlatform(scene, solids, 600, 1060, 90, 20)
  addSpike(scene, spikes, 700, 1100, 30, 14)

  addPlatform(scene, solids, 400, 980, 100, 20)
  addPlatform(scene, solids, 600, 900, 80, 20)
  addMovingSpike(scene, spikes, 520, 940, 42, 14, 240, 1450)

  // Tight wall-jump chimney
  addWall(scene, solids, 780, 850, 24, 300)
  addWall(scene, solids, 900, 850, 24, 300)
  addSpike(scene, spikes, 840, 1000, 80, 12) // Spikes at bottom of chimney

  addPlatform(scene, solids, 1000, 740, 100, 20)
  addPlatform(scene, solids, 800, 660, 80, 20, trollManager, true, 300)
  addPlatform(scene, solids, 550, 580, 120, 20)
  addSpike(scene, spikes, 700, 660, 40, 14)

  addPlatform(scene, solids, 300, 520, 100, 20)

  // Real checkpoint 5
  const cp5 = scene.add.zone(300, 480, 80, 80)
  scene.physics.add.existing(cp5, true)
  checkpointZones.push(cp5)
  scene.add.rectangle(300, 495, 6, 50, CHECKPOINT_COLOR, 0.7).setStrokeStyle(1, 0xffea00, 0.4)

  addPlatform(scene, solids, 550, 440, 100, 20)
  addPlatform(scene, solids, 380, 360, 96, 18)
  addSpike(scene, spikes, 470, 368, 34, 12)
  addPlatform(scene, solids, 260, 300, 94, 18, trollManager, true, 340)
  addPlatform(scene, solids, 420, 245, 86, 18)
  addMovingSpike(scene, spikes, 640, 250, 40, 14, 220, 1400)
  addPlatform(scene, solids, 760, 190, 92, 18)

  // ═══════════════════════════════════════════════════════
  // SECTION 6: FINALE (Y: 0–400)
  // Fake crash, then real ending
  // ═══════════════════════════════════════════════════════

  addPlatform(scene, solids, 800, 370, 120, 20)
  addSpike(scene, spikes, 680, 400, 40, 14)

  addPlatform(scene, solids, 1050, 300, 100, 20)
  addPlatform(scene, solids, 800, 230, 100, 20)
  addPlatform(scene, solids, 550, 170, 140, 20)

  // FAKE CRASH ZONE — triggers fake BSOD
  const fakeCrashZone = scene.add.zone(550, 130, 120, 60)
  scene.physics.add.existing(fakeCrashZone, true)

  addPlatform(scene, solids, 350, 110, 120, 20)

  // REAL END ZONE
  addSign(scene, 640, 50, '> END OF LINE', 0xffea00)
  const endPlatform = scene.add.rectangle(640, 80, 300, 24, PLATFORM_COLOR, 1)
  const endEdge = scene.add.rectangle(640, 69, 300, 2, 0xff1744, 0.9)
  scene.physics.add.existing(endPlatform, true)
  solids.add(endPlatform as unknown as Phaser.Physics.Arcade.Image)

  // Pulsing glow on final platform
  scene.tweens.add({
    targets: endEdge,
    alpha: 0.3,
    duration: 1000,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  })

  const realEndZone = scene.add.zone(640, 40, 280, 60)
  scene.physics.add.existing(realEndZone, true)

  // ─── DEATH PIT at very bottom ─────
  addSpike(scene, spikes, GAME_WIDTH / 2, GAME_HEIGHT - 10, GAME_WIDTH, 30)

  // ─── BACKGROUND DECORATIONS ─────
  addBackgroundDecorations(scene)

  return {
    solids,
    spikes,
    checkpointZones,
    fakeCheckpointZones,
    movingPlatforms,
    fakeVictoryRevealPlatforms,
    fakeVictoryRevealSigns,
    upperWorldFog,
    upperWorldFogLabel,
    fakeVictoryZone,
    fakeCrashZone,
    realEndZone,
  }
}

/** Add atmospheric background elements */
function addBackgroundDecorations(scene: Phaser.Scene) {
  // Vertical grid lines.
  for (let x = 0; x <= GAME_WIDTH; x += 80) {
    scene.add.rectangle(x, GAME_HEIGHT / 2, 1, GAME_HEIGHT, 0xff1744, 0.028).setDepth(-10)
  }
  // Horizontal grid lines
  for (let y = 0; y <= GAME_HEIGHT; y += 80) {
    scene.add.rectangle(GAME_WIDTH / 2, y, GAME_WIDTH, 1, 0xff6d00, 0.02).setDepth(-10)
  }

  // Section divider lines.
  const sectionYs = [3500, 2700, 1900, 1100, 400]
  sectionYs.forEach(y => {
    scene.add.rectangle(GAME_WIDTH / 2, y, GAME_WIDTH, 2, 0xff6d00, 0.11).setDepth(-9)
  })

  // Scattered decorative signal noise.
  for (let i = 0; i < 24; i++) {
    const x = Phaser.Math.Between(50, GAME_WIDTH - 50)
    const y = Phaser.Math.Between(50, GAME_HEIGHT - 50)
    const size = Phaser.Math.Between(1, 3)
    const alpha = Phaser.Math.FloatBetween(0.04, 0.12)
    const color = Math.random() > 0.5 ? 0xff1744 : 0xff6d00
    scene.add.circle(x, y, size, color, alpha).setDepth(-10)
  }
}
