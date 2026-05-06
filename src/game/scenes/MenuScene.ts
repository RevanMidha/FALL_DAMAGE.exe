import Phaser from 'phaser'
import { audioManager } from '../audio'
import { useGameUiStore } from '../../store/gameUiStore'

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene')
  }

  create() {
    this.cameras.main.setBackgroundColor('#080000')

    const ui = useGameUiStore.getState()
    ui.setGamePhase('menu')
    ui.setPrompt('press_space_to_begin.exe')
    ui.setSection('VERTICAL SLICE')
    ui.setStatus('warning')

    const startGame = () => {
      audioManager.playClick()
      ui.setGamePhase('playing')
      this.cameras.main.flash(220, 255, 23, 68, true)
      this.time.delayedCall(260, () => {
        this.scene.start('GameScene')
        this.scene.launch('UIScene')
      })
    }

    this.input.keyboard!.once('keydown-SPACE', startGame)
    this.input.once('pointerdown', startGame)
  }
}
