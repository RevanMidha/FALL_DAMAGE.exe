import Phaser from 'phaser'
import { BootScene } from './scenes/BootScene'
import { GameScene } from './scenes/GameScene'
import { UIScene } from './scenes/UIScene'

// Canvas size matches viewport, NOT world size
// The world is 1280×4200 but the camera shows a viewport-sized window into it
const CANVAS_WIDTH = 1280
const CANVAS_HEIGHT = 720

export class GameManager {
  private game: Phaser.Game | null = null

  mount(parent: HTMLDivElement) {
    if (this.game) return
    this.game = new Phaser.Game({
      type: Phaser.AUTO,
      parent,
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      backgroundColor: '#0a0000',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [BootScene, GameScene, UIScene],
      render: {
        pixelArt: false,
        antialias: true,
      },
    })
  }

  destroy() {
    this.game?.destroy(true)
    this.game = null
  }
}
