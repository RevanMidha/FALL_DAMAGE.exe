import Phaser from 'phaser'

export class CameraEffects {
  private camera: Phaser.Cameras.Scene2D.Camera
  private scene: Phaser.Scene
  private baseZoom = 1.12

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.camera = scene.cameras.main
  }

  landShake(impactSpeed = 0) {
    const intensity = Phaser.Math.Clamp(impactSpeed / 950, 0.003, 0.011)
    const duration = Phaser.Math.Clamp(45 + impactSpeed * 0.08, 70, 130)
    this.camera.shake(duration, intensity)
  }

  deathShake() {
    this.camera.shake(240, 0.018)
    this.camera.flash(140, 255, 49, 90, true)
    this.scene.tweens.add({
      targets: this.camera,
      zoom: this.baseZoom + 0.18,
      duration: 95,
      yoyo: true,
      ease: 'Quad.easeOut',
    })
  }

  trollShake() {
    this.camera.shake(360, 0.021)
    this.camera.flash(180, 255, 109, 0, true)
  }

  startBreathingZoom() {
    this.scene.tweens.add({
      targets: this.camera,
      zoom: this.baseZoom + 0.018,
      duration: 3200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })
  }

  sectionTransition() {
    this.scene.tweens.add({
      targets: this.camera,
      zoom: this.baseZoom - 0.065,
      duration: 280,
      yoyo: true,
      ease: 'Cubic.easeInOut',
    })
    this.camera.flash(90, 255, 174, 0, true)
  }

  setupFollow(target: Phaser.GameObjects.GameObject, worldWidth: number, worldHeight: number) {
    this.camera.startFollow(target, true, 0.095, 0.105)
    this.camera.setDeadzone(170, 86)
    this.camera.setZoom(this.baseZoom)
    this.camera.setBounds(0, 0, worldWidth, worldHeight)
    this.startBreathingZoom()
  }
}
