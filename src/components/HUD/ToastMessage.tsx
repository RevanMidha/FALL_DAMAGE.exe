import { AnimatePresence, motion } from 'framer-motion'
import type { ToastState } from '../../types/ui'
import { useGameUiStore } from '../../store/gameUi/gameUiStore'

export function ToastMessage({ toast }: { toast: ToastState | null }) {
  const gamePhase = useGameUiStore((s) => s.gamePhase)

  return (
    <AnimatePresence>
      {toast && gamePhase === 'playing' && (
        <motion.div
          initial={{ opacity: 0, y: -18, scale: 0.96 }}
          animate={{ opacity: 1, y: [0, -2, 0], scale: 1 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ y: { duration: 1.1, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' } }}
          className="pointer-events-none absolute left-1/2 top-20 z-30 w-[min(420px,calc(100vw-2rem))] -translate-x-1/2 rounded-md border bg-[rgba(24,2,2,0.9)] px-4 py-3 font-mono backdrop-blur-md"
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
  )
}
