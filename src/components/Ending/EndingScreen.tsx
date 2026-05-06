import { AnimatePresence, motion } from 'framer-motion'
import { Lightning } from 'phosphor-react'
import { useGameUiStore } from '../../store/gameUi/gameUiStore'

export function EndingScreen() {
  const gamePhase = useGameUiStore((s) => s.gamePhase)
  const deaths = useGameUiStore((s) => s.deaths)
  const progress = useGameUiStore((s) => s.progress)
  const lastCheckpointIndex = useGameUiStore((s) => s.lastCheckpointIndex)
  
  const ascentPercent = Math.round(progress * 100)
  const checkpointLabel = lastCheckpointIndex >= 0 ? `CP-${lastCheckpointIndex + 1}` : 'NONE'

  return (
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
  )
}
