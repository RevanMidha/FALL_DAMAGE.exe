import { startTransition, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Lightning, Skull, Terminal, WarningCircle } from 'phosphor-react'
import { GameManager } from './game/GameManager'
import { useGameUiStore } from './store/gameUiStore'

const DEATH_QUIPS = [
  'skill issue',
  'that was embarrassing',
  'have you tried not dying?',
  'gravity wins again',
  'error: player.skill not found',
  'try jumping better',
  'the floor is not your friend',
  'L',
  'did that hurt?',
  'you call that a jump?',
  'maybe try a different game',
  'fall_damage.exe working as intended',
  'git gud',
  "your keyboard is fine. you're not.",
  'certified ragequit moment',
  "the game isn't broken. you are.",
  'patience.exe has stopped responding',
  'do you need a tutorial?',
  'walls: 1, you: 0',
  'rethink your life choices',
]

const SECTION_ORDER = [
  'TRUST PHASE',
  'TENSION',
  'DECEPTION',
  'BETRAYAL',
  'PRECISION',
  'FINALE',
]

const SECTION_STACK = [...SECTION_ORDER].reverse()

const SECTION_BRIEFS: Record<string, string> = {
  'TRUST PHASE': 'learn, relax, get lied to',
  TENSION: 'safe jumps are now a rumor',
  DECEPTION: 'the level starts gaslighting back',
  BETRAYAL: 'victory screens are traps now',
  PRECISION: 'every input gets audited',
  FINALE: 'one last insult before the end',
  BOOTSTRAP: 'system waking up',
  'END OF LINE': 'the process pretends to care',
}

type ToastTone = 'danger' | 'warning' | 'system'

type ToastState = {
  title: string
  detail: string
  tone: ToastTone
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function keycapClass(tone: 'danger' | 'warning' | 'system') {
  if (tone === 'danger') {
    return 'border-[#ff1744]/40 bg-[rgba(255,23,68,0.08)] text-[#ff1744]'
  }
  if (tone === 'warning') {
    return 'border-[#ff6d00]/40 bg-[rgba(255,109,0,0.08)] text-[#ff6d00]'
  }
  return 'border-[#ffea00]/40 bg-[rgba(255,234,0,0.08)] text-[#ffea00]'
}

function App() {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const manager = useMemo(() => new GameManager(), [])

  const deaths = useGameUiStore((s) => s.deaths)
  const progress = useGameUiStore((s) => s.progress)
  const sectionName = useGameUiStore((s) => s.sectionName)
  const prompt = useGameUiStore((s) => s.prompt)
  const glitchPulse = useGameUiStore((s) => s.glitchPulse)
  const fakeStatus = useGameUiStore((s) => s.fakeStatus)
  const gamePhase = useGameUiStore((s) => s.gamePhase)
  const fakeCrashVisible = useGameUiStore((s) => s.fakeCrashVisible)
  const fakeVictoryVisible = useGameUiStore((s) => s.fakeVictoryVisible)
  const fakeCorruptionVisible = useGameUiStore((s) => s.fakeCorruptionVisible)
  const lastCheckpointIndex = useGameUiStore((s) => s.lastCheckpointIndex)

  const [deathQuip, setDeathQuip] = useState('calibrating cruelty...')
  const [showDeathFlash, setShowDeathFlash] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)
  const prevDeaths = useRef(0)
  const prevSection = useRef(sectionName)
  const prevCheckpoint = useRef(lastCheckpointIndex)
  const ascentPercent = Math.round(progress * 100)

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
      window.setTimeout(() => setShowDeathFlash(false), 520)
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
    }
    prevCheckpoint.current = lastCheckpointIndex
  }, [lastCheckpointIndex])

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(null), 1800)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const statusColor = fakeStatus === 'critical' ? '#ff1744' : fakeStatus === 'warning' ? '#ff6d00' : '#ffea00'
  const inRun = gamePhase === 'playing' || gamePhase === 'ending'
  const currentSectionIndex = SECTION_ORDER.indexOf(sectionName)
  const dangerLevel = clamp(Math.round(deaths * 4 + progress * 55 + (fakeStatus === 'critical' ? 24 : fakeStatus === 'warning' ? 12 : 0)), 8, 100)
  const integrityLevel = clamp(100 - deaths * 3 - Math.round(progress * 22) - (fakeStatus === 'critical' ? 18 : fakeStatus === 'warning' ? 8 : 0), 4, 100)
  const rageSync = clamp(Math.round(28 + progress * 52 + Math.min(deaths * 2, 20)), 12, 99)
  const checkpointLabel = lastCheckpointIndex >= 0 ? `CP-${lastCheckpointIndex + 1}` : 'NONE'

  const telemetry = [
    { label: 'RAGE LOAD', value: dangerLevel, tone: 'danger' as const },
    { label: 'SHELL INTEGRITY', value: integrityLevel, tone: 'warning' as const },
    { label: 'PLAYER CONDITION', value: rageSync, tone: 'system' as const },
  ]

  const terminalLines = [
    `status=${fakeStatus}`,
    `checkpoint=${checkpointLabel}`,
    `deaths=${String(deaths).padStart(3, '0')}`,
    `section=${sectionName.toLowerCase().replaceAll(' ', '_')}`,
  ]

  const incidentFeed = [
    `objective: climb higher than your patience`,
    `runtime: ${SECTION_BRIEFS[sectionName] ?? 'no sympathy detected'}`,
    `prompt: ${prompt}`,
    `memory: ${deathQuip}`,
  ]

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#080000] text-white">
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

      <AnimatePresence>
        {gamePhase === 'menu' && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-3 sm:px-4"
          >
            <div className="w-[min(860px,calc(100vw-1.25rem))] rounded-lg border border-[#ff1744]/30 bg-[rgba(10,0,0,0.78)] px-4 py-7 text-center font-mono shadow-[0_0_70px_rgba(255,23,68,0.14)] backdrop-blur-md sm:px-6">
              <div className="mb-3 text-[11px] uppercase tracking-[0.6em] text-[#ff6d00]/80">hostile ascent protocol</div>
              <h1
                className="mx-auto max-w-full whitespace-nowrap text-[clamp(1.15rem,4.75vw,3.95rem)] font-black leading-none tracking-[0.04em] text-[#ffea00] text-glow-orange"
                style={{ fontFamily: 'Orbitron, monospace' }}
              >
                FALL_DAMAGE.exe
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/68 md:text-base">
                A browser rage platformer disguised as a dying operating system. Climb higher, trust nothing, and let the game insult you in real time.
              </p>
              <div className="mt-6 grid gap-3 text-left text-[11px] text-white/58 md:grid-cols-3">
                <div className="rounded border border-[#ff1744]/20 bg-[rgba(255,23,68,0.05)] p-3">
                  <div className="mb-1 text-[#ff1744]">movement-first</div>
                  <div>coyote time, wall tech, fast fall, instant retry</div>
                </div>
                <div className="rounded border border-[#ff6d00]/20 bg-[rgba(255,109,0,0.05)] p-3">
                  <div className="mb-1 text-[#ff6d00]">psychological traps</div>
                  <div>fake wins, fake saves, disappearing floors, malicious UI</div>
                </div>
                <div className="rounded border border-[#ffea00]/20 bg-[rgba(255,234,0,0.05)] p-3">
                  <div className="mb-1 text-[#ffea00]">hackathon slice</div>
                  <div>one polished vertical tower built to get one more try</div>
                </div>
              </div>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/50">
                <span className={`rounded border px-2 py-1 ${keycapClass('system')}`}>space</span>
                <span>begin execution</span>
                <span className="text-white/20">|</span>
                <span className={`rounded border px-2 py-1 ${keycapClass('warning')}`}>click</span>
                <span>override hesitation</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {inRun && (
        <>
          <motion.div
            animate={{ opacity: fakeStatus === 'critical' ? [0.75, 1, 0.75] : 1 }}
            transition={{ duration: 1.4, repeat: fakeStatus === 'critical' ? Number.POSITIVE_INFINITY : 0 }}
            className="pointer-events-none absolute left-1/2 top-4 z-20 hidden -translate-x-1/2 md:flex items-center gap-3 rounded-md border border-[#ff1744]/30 bg-[rgba(18,0,0,0.82)] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.35em] text-[#ffea00]/80 backdrop-blur-md"
          >
            <span>unsafe mode</span>
            <span className="text-white/20">|</span>
            <span>instant retry</span>
            <span className="text-white/20">|</span>
            <span>zero mercy</span>
          </motion.div>

          <header
            className="pointer-events-none absolute left-4 top-4 z-20 flex items-center gap-3 rounded-md border px-4 py-2.5 font-mono text-xs backdrop-blur-md"
            style={{
              borderColor: fakeStatus === 'critical' ? 'rgba(255,23,68,0.55)' : 'rgba(255,109,0,0.35)',
              background: 'rgba(8,0,0,0.84)',
              boxShadow: `0 0 20px ${fakeStatus === 'critical' ? 'rgba(255,23,68,0.25)' : 'rgba(255,109,0,0.16)'}`,
            }}
          >
        <WarningCircle size={18} className={fakeStatus === 'critical' ? 'text-[#ff1744]' : fakeStatus === 'warning' ? 'text-[#ff6d00]' : 'text-[#ffea00]'} weight="fill" />
        <div className="flex flex-col">
          <span className="text-glow-orange" style={{ color: statusColor }}>FALL_DAMAGE.exe</span>
          <span className="text-[10px] uppercase tracking-[0.22em] text-white/42">{sectionName}</span>
        </div>
          </header>

          <div className="pointer-events-none absolute right-4 top-4 z-20 flex w-[min(360px,calc(100vw-2rem))] flex-col gap-3">
            <motion.aside
              animate={{ x: glitchPulse ? [0, -6, 7, -3, 0] : 0 }}
              transition={{ duration: 0.22 }}
              className="rounded-md border border-[#ff6d00]/25 bg-[rgba(8,0,0,0.84)] p-3 font-mono text-xs backdrop-blur-md"
              style={{ boxShadow: '0 0 20px rgba(255,109,0,0.12)' }}
            >
              <div className="mb-2 flex items-center justify-between text-[#ff6d00]/65">
                <div className="flex items-center gap-2">
                  <Terminal size={12} />
                  <span>kernel_prompt</span>
                </div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-white/35">live</span>
              </div>
              <p className="break-words text-[#ff1744] text-glow-red">{'>'} {prompt}</p>
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-white/45">
                {terminalLines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </div>
            </motion.aside>

            <aside className="hidden w-full rounded-md border border-[#ff1744]/20 bg-[rgba(8,0,0,0.78)] p-3 font-mono text-[10px] text-white/60 backdrop-blur-md md:block">
              <div className="mb-3 flex items-center justify-between">
                <span className="tracking-[0.3em] text-[#ff6d00]/80">TELEMETRY</span>
                <span className="text-[#ffea00]">{checkpointLabel}</span>
              </div>
              <div className="space-y-3">
                {telemetry.map((item) => {
                  const color = item.tone === 'danger' ? '#ff1744' : item.tone === 'warning' ? '#ff6d00' : '#ffea00'
                  return (
                    <div key={item.label}>
                      <div className="mb-1 flex items-center justify-between">
                        <span>{item.label}</span>
                        <span style={{ color }}>{item.value}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded bg-white/10">
                        <motion.div
                          className="h-full"
                          style={{ backgroundColor: color, boxShadow: `0 0 14px ${color}` }}
                          animate={{ width: `${item.value}%` }}
                          transition={{ type: 'spring', stiffness: 120, damping: 22 }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-[9px] uppercase tracking-[0.15em] text-white/35">
                <span>status: {fakeStatus}</span>
                <span>section: {currentSectionIndex + 1}/6</span>
                <span>deaths: {String(deaths).padStart(3, '0')}</span>
                <span>ascent: {ascentPercent}%</span>
              </div>
            </aside>
          </div>

          <aside className="pointer-events-none absolute left-4 top-24 bottom-24 z-20 hidden w-40 rounded-md border border-[#ff1744]/20 bg-[rgba(8,0,0,0.72)] p-3 font-mono text-[10px] text-white/55 backdrop-blur-md xl:flex flex-col">
        <div className="mb-3 flex items-center justify-between">
          <span className="tracking-[0.3em] text-[#ff6d00]/80">TOWER</span>
          <span className="text-[#ffea00]">{ascentPercent}%</span>
        </div>
        <div className="relative flex-1 overflow-hidden rounded-sm border border-white/8 bg-[linear-gradient(180deg,rgba(255,23,68,0.08),rgba(0,0,0,0.18))]">
          <div className="absolute inset-x-3 bottom-2 top-2 flex flex-col">
            {SECTION_STACK.map((section) => {
              const active = section === sectionName
              const passed = SECTION_ORDER.indexOf(section) < currentSectionIndex
              return (
                <div
                  key={section}
                  className={`relative flex flex-1 items-center border-b border-white/6 px-2 text-[9px] tracking-[0.18em] ${
                    active
                      ? 'bg-[rgba(255,23,68,0.16)] text-[#ffea00]'
                      : passed
                        ? 'text-[#ff6d00]/80'
                        : 'text-white/38'
                  }`}
                >
                  {section}
                </div>
              )
            })}
          </div>
          <motion.div
            className="absolute left-0 right-0 h-[2px] bg-[#ffea00] shadow-[0_0_16px_rgba(255,234,0,0.9)]"
            animate={{ bottom: `calc(${ascentPercent}% - 1px)` }}
            transition={{ type: 'spring', stiffness: 100, damping: 18 }}
          />
        </div>
          </aside>


          <AnimatePresence>
        {deaths > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.86 }}
            animate={{ opacity: 1, scale: 1 }}
            className="pointer-events-none absolute bottom-20 left-1/2 z-20 flex w-[min(540px,calc(100vw-2rem))] -translate-x-1/2 items-center gap-4 rounded-lg border-2 border-[#ff1744]/40 bg-[rgba(8,0,0,0.9)] px-5 py-3 font-mono backdrop-blur-md"
            style={{ boxShadow: '0 0 30px rgba(255,23,68,0.25), inset 0 0 20px rgba(255,23,68,0.05)' }}
          >
            <Skull size={28} className="shrink-0 text-[#ff1744]" weight="fill" />
            <div className="flex flex-col">
              <motion.span
                key={deaths}
                initial={{ scale: 2.5, color: '#ffea00' }}
                animate={{ scale: 1, color: '#ff1744' }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className="text-3xl font-bold text-glow-red"
              >
                {deaths}
              </motion.span>
              <span className="text-[11px] font-bold tracking-widest text-[#ff6d00]/70">DEATHS</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 text-[10px] uppercase tracking-[0.22em] text-white/35">latest incident</div>
              <AnimatePresence mode="wait">
                <motion.span
                  key={deathQuip}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 0.78, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="block min-w-0 text-[11px] italic text-[#ffea00]/75"
                >
                  "{deathQuip}"
                </motion.span>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
          </AnimatePresence>

          <aside className="pointer-events-none absolute bottom-20 right-4 z-20 hidden w-[320px] rounded-md border border-[#ff6d00]/25 bg-[rgba(8,0,0,0.82)] p-3 font-mono text-[10px] text-white/55 backdrop-blur-md lg:block">
        <div className="mb-3 flex items-center justify-between">
          <span className="tracking-[0.3em] text-[#ff6d00]/80">INCIDENT FEED</span>
          <span className="text-[#ff1744]">LIVE</span>
        </div>
        <div className="space-y-2">
          {incidentFeed.map((line, index) => (
            <motion.div
              key={`${line}-${index}`}
              initial={{ opacity: 0.35, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className="border-l border-[#ff1744]/25 pl-3"
            >
              {line}
            </motion.div>
          ))}
        </div>
          </aside>

          <AnimatePresence>
        {toast && gamePhase === 'playing' && (
          <motion.div
            initial={{ opacity: 0, y: -18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12 }}
            className="pointer-events-none absolute left-1/2 top-20 z-30 w-[min(420px,calc(100vw-2rem))] -translate-x-1/2 rounded-md border bg-[rgba(10,0,0,0.92)] px-4 py-3 font-mono backdrop-blur-md"
            style={{
              borderColor:
                toast.tone === 'danger'
                  ? 'rgba(255,23,68,0.45)'
                  : toast.tone === 'warning'
                    ? 'rgba(255,109,0,0.45)'
                    : 'rgba(255,234,0,0.4)',
              boxShadow:
                toast.tone === 'danger'
                  ? '0 0 18px rgba(255,23,68,0.18)'
                  : toast.tone === 'warning'
                    ? '0 0 18px rgba(255,109,0,0.16)'
                    : '0 0 18px rgba(255,234,0,0.14)',
            }}
          >
            <div className="text-[10px] uppercase tracking-[0.28em] text-white/35">{toast.title}</div>
            <div className={`mt-1 text-sm ${toast.tone === 'danger' ? 'text-[#ff1744]' : toast.tone === 'warning' ? 'text-[#ff6d00]' : 'text-[#ffea00]'}`}>
              {toast.detail}
            </div>
          </motion.div>
        )}
          </AnimatePresence>

          <footer className="pointer-events-none absolute bottom-4 left-1/2 z-20 max-w-[calc(100vw-1rem)] -translate-x-1/2 rounded-md border border-white/10 bg-[rgba(8,0,0,0.78)] px-4 py-2 text-center font-mono text-[10px] leading-5 text-white/55 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className={`rounded border px-2 py-0.5 ${keycapClass('warning')}`}>A/D</span>
          <span>move</span>
          <span className="text-white/20">|</span>
          <span className={`rounded border px-2 py-0.5 ${keycapClass('system')}`}>SPACE/W</span>
          <span>jump</span>
          <span className="text-white/20">|</span>
          <span className={`rounded border px-2 py-0.5 ${keycapClass('danger')}`}>S</span>
          <span>fast fall</span>
          <span className="text-white/20">|</span>
          <span className={`rounded border px-2 py-0.5 ${keycapClass('danger')}`}>R</span>
          <span>retry</span>
        </div>
          </footer>
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

      <AnimatePresence>
        {fakeVictoryVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="pointer-events-none absolute inset-0 z-[9995] flex items-center justify-center bg-[rgba(8,0,0,0.66)] font-mono backdrop-blur-sm"
          >
            <div className="rounded-md border border-[#ff1744]/35 bg-[rgba(18,0,0,0.8)] px-8 py-7 text-center shadow-[0_0_40px_rgba(255,23,68,0.18)]">
              <p className="text-sm tracking-[0.5em] text-[#ffea00]/70">SYSTEM MESSAGE</p>
              <p className="mt-4 text-6xl font-black tracking-wider text-[#ff1744] text-glow-red">YOU WIN</p>
              <p className="mt-3 text-xs text-[#ff6d00]/70">saving replay... preparing disappointment...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {fakeCorruptionVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 z-[9995] flex items-center justify-center bg-[rgba(8,0,0,0.7)] font-mono backdrop-blur-sm"
          >
            <div className="w-[min(460px,calc(100vw-2rem))] rounded-md border border-[#ff1744]/40 bg-[rgba(18,0,0,0.88)] px-6 py-6 text-center shadow-[0_0_40px_rgba(255,23,68,0.16)]">
              <p className="text-[11px] uppercase tracking-[0.45em] text-[#ffea00]/72">save integrity compromised</p>
              <p className="mt-4 text-4xl font-black tracking-[0.2em] text-[#ff1744] text-glow-red">CHECKPOINT CORRUPTED</p>
              <p className="mt-3 text-sm text-[#ff6d00]/80">temporary file missing. your hope was not persisted.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {fakeCrashVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="crash-overlay"
          >
            <div className="text-center">
              <p className="text-[120px] leading-none">:(</p>
              <p className="mt-6 text-2xl">Your PC ran into a problem and needs to restart.</p>
              <p className="mt-2 text-sm opacity-60">We're collecting error info, and then we'll restart for you.</p>
              <p className="mt-8 text-sm opacity-40">Stop code: FALL_DAMAGE_OVERFLOW</p>
              <motion.p initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 2.2 }} className="mx-auto mt-6 h-1 max-w-[300px] rounded bg-white/40" />
              <p className="mt-2 text-xs opacity-30">just kidding lol</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {gamePhase === 'ending' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 z-[9996] flex flex-col items-center justify-center bg-[#080000]"
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="w-[min(560px,calc(100vw-2rem))] rounded-lg border border-[#ff1744]/30 bg-[rgba(12,0,0,0.88)] px-6 py-7 text-center shadow-[0_0_60px_rgba(255,23,68,0.16)]"
            >
              <Lightning size={48} className="mx-auto mb-4 text-[#ff6d00]" weight="fill" />
              <h1 className="font-mono text-4xl font-bold tracking-wider text-[#ffea00] text-glow-orange" style={{ fontFamily: 'Orbitron, monospace' }}>
                PROCESS COMPLETE
              </h1>
              <p className="mt-3 font-mono text-sm text-[#ff6d00]/75">You survived FALL_DAMAGE.exe</p>
              <div className="mt-6 grid grid-cols-2 gap-3 text-left font-mono text-xs sm:grid-cols-4">
                <div className="rounded border border-[#ff1744]/20 bg-[rgba(255,23,68,0.05)] p-3">
                  <div className="text-white/35">deaths</div>
                  <div className="mt-1 text-lg text-[#ff1744] text-glow-red">{deaths}</div>
                </div>
                <div className="rounded border border-[#ff6d00]/20 bg-[rgba(255,109,0,0.05)] p-3">
                  <div className="text-white/35">ascent</div>
                  <div className="mt-1 text-lg text-[#ffea00] text-glow-yellow">{ascentPercent}%</div>
                </div>
                <div className="rounded border border-[#ff6d00]/20 bg-[rgba(255,109,0,0.05)] p-3">
                  <div className="text-white/35">checkpoint</div>
                  <div className="mt-1 text-lg text-[#ff6d00]">{checkpointLabel}</div>
                </div>
                <div className="rounded border border-[#ffea00]/20 bg-[rgba(255,234,0,0.05)] p-3">
                  <div className="text-white/35">verdict</div>
                  <div className="mt-1 text-lg text-[#ffea00]">{deaths < 15 ? 'suspicious' : deaths < 40 ? 'stubborn' : 'feral'}</div>
                </div>
              </div>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }} className="mt-6 font-mono text-xs text-white/35">
                {deaths === 0 ? 'Impossible. You cheated.' :
                  deaths < 10 ? 'Impressive. Suspiciously impressive.' :
                  deaths < 25 ? 'Not bad. The game almost felt sorry for you.' :
                  deaths < 50 ? 'Average gamer energy detected.' :
                  'The game enjoyed watching you suffer.'}
              </motion.p>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.4 }}
                onClick={() => window.location.reload()}
                className="mt-8 rounded-md border border-[#ff1744]/35 bg-[rgba(255,23,68,0.06)] px-6 py-2 font-mono text-sm text-[#ffea00] transition-all hover:border-[#ff1744]/70 hover:bg-[rgba(255,23,68,0.12)] hover:shadow-[0_0_20px_rgba(255,23,68,0.24)]"
              >
                RETRY?
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

export default App
