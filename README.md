# FALL_DAMAGE.exe

A browser-based rage platformer disguised as a hostile operating system.

Built for frontend-only AI web hackathons with one goal: make players say "one more try."

## What This Is

`FALL_DAMAGE.exe` is a cinematic precision platformer where:

- movement is tight and skill-based
- retries are instant
- the UI taunts the player in real time
- fake checkpoints, fake victory, and system-style misdirection create emotional spikes

This project prioritizes:

1. movement feel
2. responsivenesshttp://localhost:5173/
3. emotional reactions
4. polish and demo quality

## Tech Stack

- React + Vite + TypeScript
- Phaser 3 (gameplay and physics)
- TailwindCSS (UI styling)
- Framer Motion (HUD and cinematic transitions)
- Zustand (lightweight game-to-UI state bridge)

## Controls

- `A / D` - Move
- `SPACE / W` - Jump
- `S` - Fast Fall
- `R` - Retry

## Core Features (Current Build)

- precision platforming vertical slice
- coyote time + jump buffer
- wall slide + wall jump
- tuned acceleration/deceleration and air control
- instant death + respawn loop
- fake terminal HUD with live telemetry
- section progression and checkpoint tracking
- cinematic overlays (fake crash/fake victory/fake corruption flow)

## Project Structure

```text
src/
  components/
  game/
    audio/
      index.ts
    effects/
      index.ts
    levels/
      index.ts
    scenes/
      BootScene.ts
      GameScene.ts
      UIScene.ts
      MenuScene.ts
      DeathScene.ts
      EndingScene.ts
    systems/
      MovementController.ts
      LevelFactory.ts
      CameraEffects.ts
      TrollManager.ts
      ...
    traps/
      index.ts
    config.ts
    GameManager.ts
  store/
    gameUiStore.ts
  App.tsx
  index.css
```

## Local Development

### 1) Install

```bash
npm install
```

### 2) Run Dev Server

```bash
npm run dev
```

### 3) Production Build

```bash
npm run build
```

### 4) Preview Build

```bash
npm run preview
```

## Gameplay Design Notes

- Difficulty comes from timing, precision, and expectation subversion.
- Mechanics are deterministic and skill-based (no random unfair physics).
- The world intentionally manipulates player trust through UI and level scripting.
- Content scope stays small on purpose: one highly polished vertical slice beats wide unfinished content.

## Hackathon Demo Pitch (Short)

"It's a frontend-only rage platformer where the game pretends to be a dying OS. Movement is tight, retries are instant, and the interface actively trolls the player with fake wins, fake saves, and betrayal moments."

## Next Improvements

- add layered audio design (drone, impact bass, glitch stingers)
- tighten camera drama (impact zoom, transition framing)
- optimize bundle splitting for smaller initial load
- add a final polished ending sequence variant

## GitHub Push Checklist

- Ensure the app builds: `npm run build`
- Optional lint check: `npm run lint`
- Commit all source + config files (do not commit `node_modules` or `dist`)
- Push your branch:

```bash
git add .
git commit -m "chore: organize game folders and polish project docs"
git push -u origin <your-branch>
```
