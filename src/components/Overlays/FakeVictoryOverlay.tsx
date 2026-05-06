import { AnimatePresence, motion } from 'framer-motion'
import { useGameUiStore } from '../../store/gameUi/gameUiStore'

export function FakeVictoryOverlay() {
  const fakeVictoryVisible = useGameUiStore((s) => s.fakeVictoryVisible)

  return (
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
  )
}
