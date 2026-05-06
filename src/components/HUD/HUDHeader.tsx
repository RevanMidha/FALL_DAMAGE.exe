import { WarningCircle } from 'phosphor-react'
import { motion } from 'framer-motion'
import { useGameUiStore } from '../../store/gameUi/gameUiStore'

export function HUDHeader() {
  const fakeStatus = useGameUiStore((s) => s.fakeStatus)
  const sectionName = useGameUiStore((s) => s.sectionName)
  const statusColor = fakeStatus === 'critical' ? '#ff1744' : fakeStatus === 'warning' ? '#ff6d00' : '#ffea00'

  return (
    <>
      <motion.div
        animate={{
          opacity: fakeStatus === 'critical' ? [0.72, 1, 0.72] : [0.9, 1, 0.9],
          y: [0, -1, 0],
        }}
        transition={{
          duration: fakeStatus === 'critical' ? 1.15 : 2.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
        className="pointer-events-none absolute left-1/2 top-4 z-20 hidden -translate-x-1/2 md:flex items-center gap-3 rounded-md border border-[#ff1744]/30 bg-[rgba(30,4,4,0.82)] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.35em] text-[#ffea00]/85 backdrop-blur-md"
      >
        <span>unsafe mode</span>
        <span className="text-white/20">|</span>
        <span>instant retry</span>
        <span className="text-white/20">|</span>
        <span>zero mercy</span>
      </motion.div>

      <motion.header
        animate={{ y: [0, -1, 0] }}
        transition={{ duration: 3.8, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
        className="pointer-events-none absolute left-4 top-4 z-20 flex items-center gap-3 rounded-md border px-4 py-2.5 font-mono text-xs backdrop-blur-md"
        style={{
          borderColor: fakeStatus === 'critical' ? 'rgba(255,23,68,0.55)' : 'rgba(255,109,0,0.35)',
          background: 'rgba(24,2,2,0.82)',
          boxShadow: `0 0 20px ${fakeStatus === 'critical' ? 'rgba(255,23,68,0.25)' : 'rgba(255,109,0,0.16)'}`,
        }}
      >
        <WarningCircle size={18} className={fakeStatus === 'critical' ? 'text-[#ff1744]' : fakeStatus === 'warning' ? 'text-[#ff6d00]' : 'text-[#ffea00]'} weight="fill" />
        <div className="flex flex-col">
          <span className="text-glow-orange" style={{ color: statusColor }}>FALL_DAMAGE.exe</span>
          <span className="text-[10px] uppercase tracking-[0.22em] text-white/42">{sectionName}</span>
        </div>
      </motion.header>
    </>
  )
}
