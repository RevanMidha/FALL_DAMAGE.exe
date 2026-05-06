/**
 * TrollManager — Psychological manipulation mechanics
 * Manages disappearing platforms, fake events, and troll triggers
 */
import Phaser from 'phaser'
import { useGameUiStore } from '../../store/gameUi/gameUiStore'
import { audioManager } from './AudioManager'

export type DisappearingPlatform = {
  rect: Phaser.GameObjects.Rectangle
  edge: Phaser.GameObjects.Rectangle
  body: Phaser.Physics.Arcade.Body
  timer: number
  collapsed: boolean
  collapseDelay: number
  originalX: number
  originalY: number
}

export class TrollManager {
  private scene: Phaser.Scene
  private disappearingPlatforms: DisappearingPlatform[] = []
  private fakeVictoryTriggered = false
  private fakeCrashTriggered = false
  private fakeCheckpointTriggered = false

  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }

  /** Register a platform that collapses after player stands on it */
  registerDisappearing(rect: Phaser.GameObjects.Rectangle, edge: Phaser.GameObjects.Rectangle, delay = 500) {
    const body = rect.body as Phaser.Physics.Arcade.Body
    this.disappearingPlatforms.push({
      rect,
      edge,
      body,
      timer: 0,
      collapsed: false,
      collapseDelay: delay,
      originalX: rect.x,
      originalY: rect.y,
    })
  }

  /** Call every frame — checks if player is standing on disappearing platforms */
  update(playerBody: Phaser.Physics.Arcade.Body, _dt: number, onCollapse?: (x: number, y: number, w: number) => void) {
    for (const dp of this.disappearingPlatforms) {
      if (dp.collapsed) continue

      // Check if player is directly above this platform
      const px = playerBody.center.x
      const py = playerBody.bottom
      const platLeft = dp.rect.x - dp.rect.width / 2
      const platRight = dp.rect.x + dp.rect.width / 2
      const platTop = dp.rect.y - dp.rect.height / 2

      const isStanding = playerBody.blocked.down &&
        px > platLeft && px < platRight &&
        Math.abs(py - platTop) < 8

      if (isStanding) {
        dp.timer += _dt * 1000
        // Visual warning: shake the platform
        const shake = Math.sin(dp.timer * 0.03) * (dp.timer / dp.collapseDelay) * 3
        dp.rect.x = dp.originalX + shake
        dp.edge.x = dp.originalX + shake

        // Change color as warning
        const progress = Math.min(dp.timer / dp.collapseDelay, 1)
        const r = Math.floor(0x1a + (0xff - 0x1a) * progress)
        const g = Math.floor(0x27 + (0x31 - 0x27) * progress)
        const b = Math.floor(0x44 + (0x5a - 0x44) * progress)
        dp.edge.setFillStyle((r << 16) | (g << 8) | b, 0.9)

        if (dp.timer >= dp.collapseDelay) {
          this.collapsePlatform(dp)
          if (onCollapse) onCollapse(dp.rect.x, dp.rect.y, dp.rect.width)
        }
      } else {
        // Reset timer if player leaves
        if (dp.timer > 0 && dp.timer < dp.collapseDelay * 0.8) {
          dp.timer = Math.max(0, dp.timer - _dt * 500)
          dp.rect.x = dp.originalX
          dp.edge.x = dp.originalX
          dp.edge.setFillStyle(0xff1744, 0.7)
        }
      }
    }
  }

  private collapsePlatform(dp: DisappearingPlatform) {
    dp.collapsed = true
    dp.body.enable = false
    audioManager.playCollapse()

    // Fade out and fall
    this.scene.tweens.add({
      targets: [dp.rect, dp.edge],
      y: dp.originalY + 60,
      alpha: 0,
      duration: 300,
      ease: 'Quad.easeIn',
      onComplete: () => {
        dp.rect.setVisible(false)
        dp.edge.setVisible(false)

        // Respawn platform after delay
        this.scene.time.delayedCall(3000, () => {
          dp.collapsed = false
          dp.timer = 0
          dp.rect.setPosition(dp.originalX, dp.originalY)
          dp.edge.setPosition(dp.originalX, dp.originalY)
          dp.rect.setAlpha(1)
          dp.edge.setAlpha(1)
          dp.rect.setVisible(true)
          dp.edge.setVisible(true)
          dp.body.enable = true
          dp.edge.setFillStyle(0xff1744, 0.7)
        })
      },
    })
  }

  /** Trigger fake victory → kill player */
  triggerFakeVictory(killCallback: () => void) {
    if (this.fakeVictoryTriggered) return
    this.fakeVictoryTriggered = true

    const ui = useGameUiStore.getState()
    ui.setSection('VICTORY?')
    ui.setPrompt('CONGRATULATIONS! YOU WIN!')
    ui.setStatus('stable')
    ui.showVictoryOverlay()
    audioManager.playVictory()
    audioManager.playTauntBeep()

    this.scene.time.delayedCall(1500, () => {
      audioManager.playGlitch()
      audioManager.playTauntBeep()
      ui.hideVictoryOverlay()
      ui.setPrompt('just_kidding.exe')
      ui.setStatus('critical')
      ui.pulseGlitch()

      this.scene.time.delayedCall(500, () => {
        killCallback()
        this.fakeVictoryTriggered = false
        ui.setSection('RETRY LOOP')
      })
    })
  }

  /** Trigger fake browser crash overlay */
  triggerFakeCrash(killCallback: () => void) {
    if (this.fakeCrashTriggered) return
    this.fakeCrashTriggered = true

    audioManager.playFakeCrash()
    audioManager.playUiAlert('danger')
    const ui = useGameUiStore.getState()
    ui.showCrashOverlay()

    this.scene.time.delayedCall(2500, () => {
      ui.hideCrashOverlay()
      killCallback()
      this.scene.time.delayedCall(500, () => {
        this.fakeCrashTriggered = false
      })
    })
  }

  triggerFakeCheckpoint() {
    if (this.fakeCheckpointTriggered) return
    this.fakeCheckpointTriggered = true

    const ui = useGameUiStore.getState()
    audioManager.playCheckpoint()
    audioManager.playTauntBeep()
    ui.setPrompt('checkpoint_saved.tmp')
    ui.setStatus('stable')

    this.scene.time.delayedCall(900, () => {
      audioManager.playGlitch()
      audioManager.playUiAlert('warning')
      ui.showCorruptionOverlay()
      ui.setPrompt('tmp file deleted. nice try.')
      ui.setStatus('warning')
      ui.pulseGlitch()

      this.scene.time.delayedCall(1100, () => {
        ui.hideCorruptionOverlay()
      })
    })
  }

  /** Reset states for new game */
  reset() {
    this.fakeVictoryTriggered = false
    this.fakeCrashTriggered = false
    this.fakeCheckpointTriggered = false
    for (const dp of this.disappearingPlatforms) {
      dp.collapsed = false
      dp.timer = 0
    }
  }
}
