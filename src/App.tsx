import { useEffect, useMemo, useRef, useState } from 'react'
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

  const [deathQuip, setDeathQuip] = useState('')
  const [showDeathFlash, setShowDeathFlash] = useState(false)
  const prevDeaths = useRef(0)
  const ascentPercent = Math.round(progress * 100)

  useEffect(() => {
    if (!hostRef.current) return
    manager.mount(hostRef.current)
    return () => manager.destroy()
  }, [manager])

  useEffect(() => {
    if (deaths > prevDeaths.current) {
      setDeathQuip(DEATH_QUIPS[Math.floor(Math.random() * DEATH_QUIPS.length)])
      setShowDeathFlash(true)
      window.setTimeout(() => setShowDeathFlash(false), 520)
    }
    prevDeaths.current = deaths
  }, [deaths])

  const statusColor = fakeStatus === 'critical' ? '#ff1744' : fakeStatus === 'warning' ? '#ff6d00' : '#ffea00'

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#080000] text-white">
      <div ref={hostRef} className="h-full w-full" />
      <div className="scanlines" />
      <div className="vignette" />

      <header
        className="pointer-events-none absolute left-4 top-4 flex items-center gap-3 rounded-md border px-4 py-2.5 font-mono text-xs backdrop-blur-md"
        style={{
          borderColor: fakeStatus === 'critical' ? 'rgba(255,23,68,0.55)' : 'rgba(255,109,0,0.35)',
          background: 'rgba(8,0,0,0.84)',
          boxShadow: `0 0 20px ${fakeStatus === 'critical' ? 'rgba(255,23,68,0.25)' : 'rgba(255,109,0,0.16)'}`,
        }}
      >
        <WarningCircle size={18} className={fakeStatus === 'critical' ? 'text-[#ff1744]' : fakeStatus === 'warning' ? 'text-[#ff6d00]' : 'text-[#ffea00]'} weight="fill" />
        <div className="flex flex-col">
          <span className="text-glow-orange" style={{ color: statusColor }}>FALL_DAMAGE.exe</span>
          <span className="text-[10px] text-white/42">{sectionName}</span>
        </div>
      </header>

      <motion.aside
        animate={{ x: glitchPulse ? [0, -6, 7, -3, 0] : 0 }}
        transition={{ duration: 0.22 }}
        className="pointer-events-none absolute right-4 top-4 w-[min(340px,calc(100vw-2rem))] rounded-md border border-[#ff6d00]/25 bg-[rgba(8,0,0,0.84)] p-3 font-mono text-xs backdrop-blur-md"
        style={{ boxShadow: '0 0 20px rgba(255,109,0,0.12)' }}
      >
        <div className="mb-1.5 flex items-center gap-2 text-[#ff6d00]/65">
          <Terminal size={12} />
          <span>kernel_prompt</span>
        </div>
        <p className="break-words text-[#ff1744] text-glow-red">&gt; {prompt}</p>
      </motion.aside>

      <aside className="pointer-events-none absolute bottom-20 right-4 w-[220px] rounded-md border border-[#ff6d00]/30 bg-[rgba(8,0,0,0.78)] p-3 font-mono text-[10px] text-white/60 backdrop-blur-md">
        <div className="mb-2 flex items-center justify-between">
          <span>ASCENT</span>
          <span className="text-[#ffea00]">{ascentPercent}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded bg-white/10">
          <motion.div
            className="h-full bg-[#ff1744] shadow-[0_0_14px_rgba(255,23,68,0.8)]"
            animate={{ width: `${ascentPercent}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 22 }}
          />
        </div>
        <div className="mt-2 flex justify-between text-white/35">
          <span>pressure</span>
          <span>{fakeStatus.toUpperCase()}</span>
        </div>
      </aside>

      <AnimatePresence>
        {deaths > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.86 }}
            animate={{ opacity: 1, scale: 1 }}
            className="pointer-events-none absolute bottom-20 left-4 flex max-w-[min(520px,calc(100vw-2rem))] items-center gap-4 rounded-lg border-2 border-[#ff1744]/40 bg-[rgba(8,0,0,0.9)] px-5 py-3 font-mono backdrop-blur-md"
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
            <AnimatePresence mode="wait">
              <motion.span
                key={deathQuip}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 0.72, x: 0 }}
                exit={{ opacity: 0 }}
                className="min-w-0 text-[11px] italic text-[#ffea00]/75"
              >
                "{deathQuip}"
              </motion.span>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="pointer-events-none absolute bottom-4 left-1/2 max-w-[calc(100vw-1rem)] -translate-x-1/2 rounded-md border border-white/10 bg-[rgba(8,0,0,0.72)] px-5 py-2 text-center font-mono text-[10px] leading-5 text-white/55 backdrop-blur-sm">
        <span className="text-[#ff6d00]/70">A/D</span> MOVE
        <span className="mx-3 text-white/20">|</span>
        <span className="text-[#ffea00]/75">SPACE/W</span> JUMP
        <span className="mx-3 text-white/20">|</span>
        <span className="text-[#ff1744]/75">S</span> FAST FALL
        <span className="mx-3 text-white/20">|</span>
        <span className="text-[#ff1744]/75">R</span> RETRY
      </footer>

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
            <div className="text-center">
              <p className="text-sm tracking-[0.5em] text-[#ffea00]/70">SYSTEM MESSAGE</p>
              <p className="mt-4 text-6xl font-black tracking-wider text-[#ff1744] text-glow-red">YOU WIN</p>
              <p className="mt-3 text-xs text-[#ff6d00]/70">saving replay... preparing disappointment...</p>
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
            <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }} className="text-center">
              <Lightning size={48} className="mx-auto mb-4 text-[#ff6d00]" weight="fill" />
              <h1 className="font-mono text-4xl font-bold tracking-wider text-[#ffea00] text-glow-orange" style={{ fontFamily: 'Orbitron, monospace' }}>
                PROCESS COMPLETE
              </h1>
              <p className="mt-4 font-mono text-sm text-[#ff6d00]/75">You survived FALL_DAMAGE.exe</p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="mt-8 font-mono text-lg text-white/90">
                Total Deaths: <span className="text-[#ff1744] text-glow-red">{deaths}</span>
              </motion.p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="mt-4 font-mono text-xs text-white/35">
                {deaths === 0 ? 'Impossible. You cheated.' :
                  deaths < 10 ? 'Impressive. Suspiciously impressive.' :
                  deaths < 25 ? 'Not bad. The game almost felt sorry for you.' :
                  deaths < 50 ? 'Average gamer energy detected.' :
                  'The game enjoyed watching you suffer.'}
              </motion.p>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3 }}
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
