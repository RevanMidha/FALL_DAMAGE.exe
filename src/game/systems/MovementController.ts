import Phaser from 'phaser'
import { movementConfig } from '../core/config'
import { audioManager } from './AudioManager'

type MovementDependencies = {
  scene: Phaser.Scene
  body: Phaser.Physics.Arcade.Body
  onLand?: (impactSpeed: number) => void
  onJump?: () => void
  onWallSlideStart?: () => void
  onWallSlideStop?: () => void
}

type ControlKeys = {
  W: Phaser.Input.Keyboard.Key
  A: Phaser.Input.Keyboard.Key
  S: Phaser.Input.Keyboard.Key
  D: Phaser.Input.Keyboard.Key
  R: Phaser.Input.Keyboard.Key
}

export class MovementController {
  private scene: Phaser.Scene
  private body: Phaser.Physics.Arcade.Body
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys
  private keys: ControlKeys
  private coyoteTimer = 0
  private wallCoyoteTimer = 0
  private jumpBufferTimer = 0
  private wallJumpLockTimer = 0
  private wallJumpDirection = 0
  private lastWallDirection = 0
  private wasOnFloor = false
  private wasWallSliding = false
  private lastFallSpeed = 0
  private footstepTimer = 0
  private onLand?: (impactSpeed: number) => void
  private onJump?: () => void
  private onWallSlideStart?: () => void
  private onWallSlideStop?: () => void

  constructor({ scene, body, onLand, onJump, onWallSlideStart, onWallSlideStop }: MovementDependencies) {
    this.scene = scene
    this.body = body
    this.cursors = this.scene.input.keyboard!.createCursorKeys()
    this.keys = this.scene.input.keyboard!.addKeys('W,A,S,D,R') as ControlKeys
    this.onLand = onLand
    this.onJump = onJump
    this.onWallSlideStart = onWallSlideStart
    this.onWallSlideStop = onWallSlideStop
  }

  update(deltaSeconds: number) {
    const dtMs = deltaSeconds * 1000
    const onFloor = this.body.blocked.down
    const touchingLeft = this.body.blocked.left
    const touchingRight = this.body.blocked.right
    const touchingWall = touchingLeft || touchingRight
    const moveInput = this.getMoveInput()

    if (onFloor && !this.wasOnFloor) {
      audioManager.playLand()
      this.onLand?.(this.lastFallSpeed)
      this.footstepTimer = 0
    }
    this.wasOnFloor = onFloor
    this.lastFallSpeed = Math.max(0, this.body.velocity.y)

    if (onFloor && moveInput !== 0) {
      this.footstepTimer -= dtMs
      if (this.footstepTimer <= 0) {
        audioManager.playFootstep()
        this.footstepTimer = 220
      }
    } else {
      this.footstepTimer = 0
    }

    this.coyoteTimer = onFloor ? movementConfig.coyoteTimeMs : Math.max(0, this.coyoteTimer - dtMs)
    if (touchingLeft) {
      this.wallCoyoteTimer = movementConfig.wallCoyoteTimeMs
      this.lastWallDirection = -1
    } else if (touchingRight) {
      this.wallCoyoteTimer = movementConfig.wallCoyoteTimeMs
      this.lastWallDirection = 1
    } else {
      this.wallCoyoteTimer = Math.max(0, this.wallCoyoteTimer - dtMs)
    }
    this.jumpBufferTimer = this.getJumpJustPressed()
      ? movementConfig.jumpBufferMs
      : Math.max(0, this.jumpBufferTimer - dtMs)
    this.wallJumpLockTimer = Math.max(0, this.wallJumpLockTimer - dtMs)

    this.applyHorizontalMovement(moveInput, onFloor, deltaSeconds)

    const isWallSliding =
      !onFloor &&
      touchingWall &&
      this.body.velocity.y > 0 &&
      ((touchingLeft && moveInput < 0) || (touchingRight && moveInput > 0))

    if (isWallSliding) {
      this.body.setVelocityY(Math.min(this.body.velocity.y, movementConfig.wallSlideSpeed))
      if (!this.wasWallSliding) {
        audioManager.startWallSlide()
        this.onWallSlideStart?.()
      }
    } else if (this.wasWallSliding) {
      audioManager.stopWallSlide()
      this.onWallSlideStop?.()
    }
    this.wasWallSliding = isWallSliding

    const canGroundJump = this.coyoteTimer > 0
    const canWallJump = !onFloor && this.wallCoyoteTimer > 0 && this.lastWallDirection !== 0
    if (this.jumpBufferTimer > 0 && (canGroundJump || canWallJump)) {
      this.jumpBufferTimer = 0
      this.coyoteTimer = 0
      audioManager.playJump()
      this.onJump?.()

      if (canWallJump) {
        const awayFromWall = -this.lastWallDirection
        this.wallJumpLockTimer = movementConfig.wallJumpLockMs
        this.wallJumpDirection = awayFromWall
        this.wallCoyoteTimer = 0
        this.body.setVelocityX(awayFromWall * movementConfig.wallJumpHorizontal)
        this.body.setVelocityY(-movementConfig.wallJumpVertical)
      } else {
        this.wallJumpDirection = 0
        this.body.setVelocityY(-movementConfig.jumpVelocity)
      }
    }

    this.applyGravityTechniques(onFloor)
  }

  wantsRestart() {
    return Phaser.Input.Keyboard.JustDown(this.keys.R)
  }

  private applyHorizontalMovement(moveInput: number, onFloor: boolean, deltaSeconds: number) {
    if (onFloor) {
      this.wallJumpDirection = 0
    }

    const targetVelocity = moveInput * movementConfig.maxRunSpeed
    const hasInput = moveInput !== 0
    const acceleration = onFloor
      ? hasInput ? movementConfig.acceleration : movementConfig.deceleration
      : hasInput ? movementConfig.airAcceleration : movementConfig.airDeceleration

    const correctedTargetVelocity =
      this.wallJumpLockTimer > 0 && !onFloor && moveInput !== 0 && Math.sign(moveInput) !== this.wallJumpDirection
        ? 0
        : targetVelocity

    const nextVelocity = this.moveTowards(this.body.velocity.x, correctedTargetVelocity, acceleration * deltaSeconds)
    this.body.setVelocityX(nextVelocity)
    this.body.setMaxVelocity(movementConfig.maxRunSpeed, movementConfig.maxFallSpeed)
  }

  private moveTowards(current: number, target: number, maxDelta: number) {
    if (Math.abs(target - current) <= maxDelta) return target
    return current + Math.sign(target - current) * maxDelta
  }

  private applyGravityTechniques(onFloor: boolean) {
    this.body.setGravityY(movementConfig.gravity)
    if (onFloor) return

    const holdingJump = this.getJumpHeld()
    const fastFalling = this.cursors.down.isDown || this.keys.S.isDown
    const velocityY = this.body.velocity.y

    if (fastFalling && velocityY > -100) {
      this.body.setGravityY(movementConfig.gravity * movementConfig.fastFallGravityMultiplier)
    } else if (velocityY > 0) {
      this.body.setGravityY(movementConfig.gravity * movementConfig.fallGravityMultiplier)
    } else if (!holdingJump) {
      this.body.setGravityY(movementConfig.gravity * movementConfig.lowJumpGravityMultiplier)
    } else if (Math.abs(velocityY) < movementConfig.apexThreshold) {
      this.body.setGravityY(movementConfig.gravity * movementConfig.apexGravityMultiplier)
    }
  }

  private getMoveInput() {
    const right = this.cursors.right.isDown || this.keys.D.isDown
    const left = this.cursors.left.isDown || this.keys.A.isDown
    return Number(right) - Number(left)
  }

  private getJumpJustPressed() {
    return Boolean(
      Phaser.Input.Keyboard.JustDown(this.cursors.space!) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.up!) ||
      Phaser.Input.Keyboard.JustDown(this.keys.W),
    )
  }

  private getJumpHeld() {
    return Boolean(this.cursors.space?.isDown || this.cursors.up?.isDown || this.keys.W.isDown)
  }

  destroy() {
    audioManager.stopWallSlide()
  }
}
