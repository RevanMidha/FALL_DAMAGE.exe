// World dimensions for the tall vertical tower.
export const GAME_WIDTH = 1280
export const GAME_HEIGHT = 4200

// Movement tuning. This is the fastest place to tune the game's soul.
export const movementConfig = {
  maxRunSpeed: 320,
  acceleration: 2700,
  deceleration: 3300,
  airAcceleration: 1900,
  airDeceleration: 900,
  jumpVelocity: 585,
  gravity: 1550,
  apexGravityMultiplier: 0.72,
  apexThreshold: 70,
  fallGravityMultiplier: 1.5,
  lowJumpGravityMultiplier: 1.85,
  fastFallGravityMultiplier: 2.2,
  maxFallSpeed: 1180,
  coyoteTimeMs: 120,
  jumpBufferMs: 140,
  wallSlideSpeed: 115,
  wallJumpHorizontal: 370,
  wallJumpVertical: 535,
  wallJumpLockMs: 130,
}

// Visual config: warning lights, blood-hot hazards, fake-safe lies.
export const PLATFORM_COLOR = 0x130202
export const PLATFORM_EDGE_COLOR = 0xff1744
export const PLATFORM_EDGE_ALPHA = 0.82
export const SPIKE_COLOR = 0xff0033
export const WALL_COLOR = 0x080000
export const CHECKPOINT_COLOR = 0xff6d00
export const PLAYER_COLOR = 0xf7fbff
export const PLAYER_STROKE_COLOR = 0xffea00

// Section Y boundaries (from bottom to top).
export const SECTIONS = {
  TRUST: { top: 3500, bottom: 4000, name: 'TRUST PHASE' },
  TENSION: { top: 2700, bottom: 3500, name: 'TENSION' },
  DECEPTION: { top: 1900, bottom: 2700, name: 'DECEPTION' },
  BETRAYAL: { top: 1100, bottom: 1900, name: 'BETRAYAL' },
  PRECISION: { top: 400, bottom: 1100, name: 'PRECISION' },
  FINALE: { top: 0, bottom: 400, name: 'FINALE' },
}

export const SPAWN_X = 200
export const SPAWN_Y = 3880
