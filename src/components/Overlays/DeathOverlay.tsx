import { AnimatePresence, motion } from 'framer-motion'
import { Skull } from 'phosphor-react'

export function DeathOverlay({
  deaths,
  deathQuip,
  visible,
}: {
  deaths: number
  deathQuip: string
  visible: boolean
}) {
  return (
    <AnimatePresence>
      {deaths > 0 && visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.86 }}
          animate={{ opacity: 1, scale: 1, y: [0, -1, 0] }}
          transition={{ y: { duration: 2.4, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' } }}
          className="pointer-events-none absolute bottom-20 left-1/2 z-20 flex w-[min(540px,calc(100vw-2rem))] -translate-x-1/2 items-center gap-4 rounded-lg border-2 border-[#ff1744]/40 bg-[rgba(24,2,2,0.88)] px-5 py-3 font-mono backdrop-blur-md"
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
                animate={{ opacity: [0.75, 1, 0.75], x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                className="block min-w-0 text-[11px] italic text-[#ffea00]/75"
              >
                "{deathQuip}"
              </motion.span>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
