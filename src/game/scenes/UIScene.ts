/**
 * UIScene — In-game Phaser HUD overlay (runs parallel to GameScene)
 * Minimal — most HUD is handled by React overlay
 */
import Phaser from 'phaser'

export class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene')
  }

  create() {
    // UIScene is intentionally minimal
    // The React overlay handles all HUD display
    // This scene exists for any future Phaser-native UI needs
  }
}
