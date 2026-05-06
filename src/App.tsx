import { startTransition, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { GameManager } from './game/core/GameManager'
import { audioManager } from './game/audio'
import { useGameUiStore } from './store/gameUi/gameUiStore'
import { DEATH_QUIPS, SECTION_BRIEFS } from './constants/gameConstants'
import type { ToastState } from './types/ui'

import { MenuOverlay } from './components/Menu/MenuOverlay'
import { HUDHeader } from './components/HUD/HUDHeader'
import { TerminalAside } from './components/HUD/TerminalAside'
import { TelemetryAside } from './components/HUD/TelemetryAside'
import { TowerAside } from './components/HUD/TowerAside'
import { IncidentFeedAside } from './components/HUD/IncidentFeedAside'
import { ControlsFooter } from './components/HUD/ControlsFooter'
import { ToastMessage } from './components/HUD/ToastMessage'
import { DeathOverlay } from './components/Overlays/DeathOverlay'
import { FakeCrashOverlay } from './components/Overlays/FakeCrashOverlay'
import { FakeVictoryOverlay } from './components/Overlays/FakeVictoryOverlay'
import { FakeCorruptionOverlay } from './components/Overlays/FakeCorruptionOverlay'
import { EndingScreen } from './components/Ending/EndingScreen'

function App() {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const manager = useMemo(() => new GameManager(), [])

  const deaths = useGameUiStore((s) => s.deaths)
  const sectionName = useGameUiStore((s) => s.sectionName)
  const gamePhase = useGameUiStore((s) => s.gamePhase)
  const lastCheckpointIndex = useGameUiStore((s) => s.lastCheckpointIndex)
  const fakeStatus = useGameUiStore((s) => s.fakeStatus)
  const progress = useGameUiStore((s) => s.progress)
  const playerX = useGameUiStore((s) => s.playerX)
  const playerY = useGameUiStore((s) => s.playerY)

  const [deathQuip, setDeathQuip] = useState('calibrating cruelty...')
  const [showDeathFlash, setShowDeathFlash] = useState(false)
  const [showDeathBanner, setShowDeathBanner] = useState(false)
  const [showAssistHud, setShowAssistHud] = useState(true)
  const [toast, setToast] = useState<ToastState | null>(null)
  const prevDeaths = useRef(0)
  const prevSection = useRef(sectionName)
  const prevCheckpoint = useRef(lastCheckpointIndex)

  useEffect(() => {
    if (!hostRef.current) return
    manager.mount(hostRef.current)
    return () => manager.destroy()
  }, [manager])

  useEffect(() => {
    if (deaths > prevDeaths.current) {
      startTransition(() => {
        setDeathQuip(DEATH_QUIPS[Math.floor(Math.random() * DEATH_QUIPS.length)])
        setToast({
          title: 'INCIDENT RECORDED',
          detail: `death count increased to ${deaths}`,
          tone: 'danger',
        })
      })
      setShowDeathFlash(true)
      setShowDeathBanner(true)
      setShowAssistHud(true)
      window.setTimeout(() => setShowDeathFlash(false), 520)
      window.setTimeout(() => setShowDeathBanner(false), 2200)
    }
    prevDeaths.current = deaths
  }, [deaths])

  useEffect(() => {
    if (sectionName !== prevSection.current && prevSection.current) {
      startTransition(() => {
        setToast({
          title: sectionName,
          detail: SECTION_BRIEFS[sectionName] ?? 'environmental hostility increasing',
          tone: fakeStatus === 'critical' ? 'danger' : 'warning',
        })
      })
      setShowAssistHud(true)
    }
    prevSection.current = sectionName
  }, [fakeStatus, sectionName])

  useEffect(() => {
    if (lastCheckpointIndex > prevCheckpoint.current) {
      startTransition(() => {
        setToast({
          title: `CHECKPOINT ${lastCheckpointIndex + 1}`,
          detail: 'progress captured. suffering preserved.',
          tone: 'system',
        })
      })
      setShowAssistHud(true)
    }
    prevCheckpoint.current = lastCheckpointIndex
  }, [lastCheckpointIndex])

  useEffect(() => {
    if (!toast) return
    audioManager.playUiAlert(toast.tone)
    if (toast.tone === 'danger') {
      audioManager.playTauntBeep()
    }
    const timeout = window.setTimeout(() => setToast(null), 1800)
    return () => window.clearTimeout(timeout)
  }, [toast])

  useEffect(() => {
    if (fakeStatus === 'critical') {
      setShowAssistHud(true)
      return
    }
    const timeout = window.setTimeout(() => setShowAssistHud(false), 1600)
    return () => window.clearTimeout(timeout)
  }, [fakeStatus, sectionName, deaths, toast])

  const inRun = gamePhase === 'playing' || gamePhase === 'ending'
  const shouldShowUtilityHud =
    showAssistHud || fakeStatus === 'critical' || gamePhase !== 'playing'
  const shouldShowControls =
    shouldShowUtilityHud || (sectionName === 'TRUST PHASE' && deaths < 3)
  const hideTopRightHudForFakeWinApproach =
    (sectionName === 'BETRAYAL' && progress > 0.62 && progress < 0.79) ||
    (playerY < 1550 && playerX > 760)

  return (
    <main className="theme-cyan-teal-purple relative h-screen w-screen overflow-hidden bg-[#140202] text-white">
      <div ref={hostRef} className="h-full w-full" />

      <div className="alarm-sweep" />
      <div className="scanlines" />
      <div className="vignette" />
      <div className="hud-frame" />

      <div className="pointer-events-none absolute inset-3 z-[9994] hidden sm:block">
        <div className="corner-bracket left-0 top-0" />
        <div className="corner-bracket right-0 top-0 rotate-90" />
        <div className="corner-bracket bottom-0 left-0 -rotate-90" />
        <div className="corner-bracket bottom-0 right-0 rotate-180" />
      </div>

      <MenuOverlay />

      {inRun && (
        <>
          {shouldShowUtilityHud && <HUDHeader />}

          {shouldShowUtilityHud && (
            <motion.div
              animate={{
                opacity: hideTopRightHudForFakeWinApproach ? 0 : 1,
                y: hideTopRightHudForFakeWinApproach ? -12 : 0,
              }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="pointer-events-none absolute right-4 top-4 z-20 flex w-[min(360px,calc(100vw-2rem))] flex-col gap-3"
            >
              <TerminalAside />
              <TelemetryAside />
            </motion.div>
          )}

          <TowerAside />
          <DeathOverlay deaths={deaths} deathQuip={deathQuip} visible={showDeathBanner} />
          {shouldShowUtilityHud && <IncidentFeedAside deathQuip={deathQuip} />}
          <ToastMessage toast={toast} />
          {shouldShowControls && <ControlsFooter />}
        </>
      )}

      <AnimatePresence>
        {showDeathFlash && (
          <motion.div
            initial={{ opacity: 0.65 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="pointer-events-none absolute inset-0 z-[9997] bg-[#ff1744]"
          />
        )}
      </AnimatePresence>

      <FakeVictoryOverlay />
      <FakeCorruptionOverlay />
      <FakeCrashOverlay />
      <EndingScreen />
    </main>
  )
}

export default App
