import Phaser from 'phaser'
import { audioManager } from '../systems/AudioManager'
import { useGameUiStore } from '../../store/gameUiStore'

export class BootScene extends Phaser.Scene {
  private bootMessages = [
    '> INITIALIZING FALL_DAMAGE.exe ...',
    '> LOADING PHYSICS ENGINE ......... OK',
    '> CALIBRATING GRAVITY ............ OK',
    '> DISABLING MERCY ................ OK',
    '> WARNING: PLAYER SURVIVAL RATE = 0.3%',
    '> COMPILING RAGE ALGORITHMS ...... OK',
    '> ALL SYSTEMS HOSTILE',
    '',
    '> PRESS [SPACE] TO EXECUTE',
  ]

  constructor() {
    super('BootScene')
  }

  create() {
    this.cameras.main.setBackgroundColor('#080000')
    useGameUiStore.getState().setGamePhase('boot')

    this.input.keyboard!.once('keydown-SPACE', () => {
      audioManager.init()
    })

    let delay = 0
    this.bootMessages.forEach((msg, i) => {
      delay += i === 0 ? 300 : 200 + Math.random() * 150

      this.time.delayedCall(delay, () => {
        audioManager.playClick()
        const color =
          i === 4 ? '#ffea00' :
          i === 6 ? '#ff1744' :
          i === 8 ? '#ff6d00' :
          '#ff6d00'

        const txt = this.add.text(80, 80 + i * 28, msg, {
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '15px',
          color,
        })
        txt.setAlpha(0)
        this.tweens.add({ targets: txt, alpha: 1, duration: 100 })
      })
    })

    const totalDelay = 300 + this.bootMessages.length * 350
    this.time.delayedCall(totalDelay, () => {
      const cursor = this.add.text(80, 80 + this.bootMessages.length * 28, '_', {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '15px',
        color: '#ffea00',
      })
      this.tweens.add({
        targets: cursor,
        alpha: 0,
        duration: 500,
        yoyo: true,
        repeat: -1,
      })

      this.input.keyboard!.once('keydown-SPACE', () => {
        audioManager.playClick()
        this.cameras.main.flash(300, 255, 109, 0)
        this.time.delayedCall(400, () => {
          useGameUiStore.getState().setGamePhase('menu')
          this.scene.start('MenuScene')
        })
      })
    })
  }
}
