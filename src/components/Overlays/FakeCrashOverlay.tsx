import { AnimatePresence, motion } from 'framer-motion'
import { useGameUiStore } from '../../store/gameUi/gameUiStore'

export function FakeCrashOverlay() {
  const fakeCrashVisible = useGameUiStore((s) => s.fakeCrashVisible)

  return (
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
  )
}
