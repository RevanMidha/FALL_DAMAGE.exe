import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { useGameUiStore } from '../../store/gameUi/gameUiStore'
import { keycapClass } from '../../utils/helpers'
import { MEME_SYSTEM_LINES } from '../../constants/gameConstants'

export function MenuOverlay() {
  const gamePhase = useGameUiStore((s) => s.gamePhase)
  const memePool = useMemo(() => MEME_SYSTEM_LINES, [])
  const [memeIndex, setMemeIndex] = useState(0)

  useEffect(() => {
    if (gamePhase !== 'menu') return
    const timer = window.setInterval(() => {
      setMemeIndex((idx) => (idx + 1) % memePool.length)
    }, 1700)
    return () => window.clearInterval(timer)
  }, [gamePhase, memePool])

  return (
    <AnimatePresence>
      {gamePhase === 'menu' && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-3 sm:px-4"
        >
          <div className="w-[min(860px,calc(100vw-1.25rem))] rounded-lg border border-[#ff1744]/35 bg-[rgba(24,2,2,0.78)] px-4 py-7 text-center font-mono shadow-[0_0_70px_rgba(255,23,68,0.14)] backdrop-blur-md sm:px-6">
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
            <AnimatePresence mode="wait">
              <motion.p
                key={memeIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 0.92, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
                className="mt-2 text-[11px] text-[#ff1744]/85"
              >
                {`> ${memePool[memeIndex]}`}
              </motion.p>
            </AnimatePresence>
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
  )
}
