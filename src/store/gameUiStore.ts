import { create } from 'zustand'

type FakeSystemStatus = 'stable' | 'warning' | 'critical'
type GamePhase = 'boot' | 'menu' | 'playing' | 'ending'

type GameUiState = {
  // Core state
  deaths: number
  progress: number
  sectionName: string
  prompt: string
  fakeStatus: FakeSystemStatus
  glitchPulse: boolean
  gamePhase: GamePhase

  // Troll overlays
  fakeCrashVisible: boolean
  fakeVictoryVisible: boolean

  // Checkpoint
  lastCheckpointIndex: number

  // Actions
  setPrompt: (prompt: string) => void
  setProgress: (progress: number) => void
  setSection: (sectionName: string) => void
  pushDeath: () => void
  setStatus: (status: FakeSystemStatus) => void
  pulseGlitch: () => void
  setGamePhase: (phase: GamePhase) => void
  showCrashOverlay: () => void
  hideCrashOverlay: () => void
  showVictoryOverlay: () => void
  hideVictoryOverlay: () => void
  setCheckpoint: (index: number) => void
  resetGame: () => void
}

export const useGameUiStore = create<GameUiState>((set) => ({
  deaths: 0,
  progress: 0,
  sectionName: 'BOOTSTRAP',
  prompt: 'RUN: fall_damage.exe',
  fakeStatus: 'stable',
  glitchPulse: false,
  gamePhase: 'boot',
  fakeCrashVisible: false,
  fakeVictoryVisible: false,
  lastCheckpointIndex: -1,

  setPrompt: (prompt) => set({ prompt }),
  setProgress: (progress) => set({ progress }),
  setSection: (sectionName) => set({ sectionName }),
  pushDeath: () => set((state) => ({ deaths: state.deaths + 1 })),
  setStatus: (fakeStatus) => set({ fakeStatus }),
  pulseGlitch: () => {
    set({ glitchPulse: true })
    window.setTimeout(() => set({ glitchPulse: false }), 200)
  },
  setGamePhase: (gamePhase) => set({ gamePhase }),
  showCrashOverlay: () => set({ fakeCrashVisible: true }),
  hideCrashOverlay: () => set({ fakeCrashVisible: false }),
  showVictoryOverlay: () => set({ fakeVictoryVisible: true }),
  hideVictoryOverlay: () => set({ fakeVictoryVisible: false }),
  setCheckpoint: (lastCheckpointIndex) => set({ lastCheckpointIndex }),
  resetGame: () => set({
    deaths: 0,
    progress: 0,
    sectionName: 'BOOTSTRAP',
    prompt: 'RUN: fall_damage.exe',
    fakeStatus: 'stable',
    glitchPulse: false,
    gamePhase: 'boot',
    fakeCrashVisible: false,
    fakeVictoryVisible: false,
    lastCheckpointIndex: -1,
  }),
}))
