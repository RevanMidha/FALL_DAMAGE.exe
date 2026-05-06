import { AnimatePresence, motion } from 'framer-motion'
import { useGameUiStore } from '../../store/gameUi/gameUiStore'

export function FakeCorruptionOverlay() {
  const fakeCorruptionVisible = useGameUiStore((s) => s.fakeCorruptionVisible)

  return (
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
  )
}
