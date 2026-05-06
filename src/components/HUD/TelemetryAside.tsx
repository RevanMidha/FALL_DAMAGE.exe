import { motion } from 'framer-motion'
import { useGameUiStore } from '../../store/gameUi/gameUiStore'
import { clamp } from '../../utils/helpers'
import { SECTION_ORDER } from '../../constants/gameConstants'

export function TelemetryAside() {
  const deaths = useGameUiStore((s) => s.deaths)
  const progress = useGameUiStore((s) => s.progress)
  const fakeStatus = useGameUiStore((s) => s.fakeStatus)
  const lastCheckpointIndex = useGameUiStore((s) => s.lastCheckpointIndex)
  const sectionName = useGameUiStore((s) => s.sectionName)

  const ascentPercent = Math.round(progress * 100)
  const currentSectionIndex = SECTION_ORDER.indexOf(sectionName)
  const checkpointLabel = lastCheckpointIndex >= 0 ? `CP-${lastCheckpointIndex + 1}` : 'NONE'
  const dangerLevel = clamp(Math.round(deaths * 4 + progress * 55 + (fakeStatus === 'critical' ? 24 : fakeStatus === 'warning' ? 12 : 0)), 8, 100)
  const integrityLevel = clamp(100 - deaths * 3 - Math.round(progress * 22) - (fakeStatus === 'critical' ? 18 : fakeStatus === 'warning' ? 8 : 0), 4, 100)
  const rageSync = clamp(Math.round(28 + progress * 52 + Math.min(deaths * 2, 20)), 12, 99)

  const telemetry = [
    { label: 'RAGE LOAD', value: dangerLevel, tone: 'danger' as const },
    { label: 'SHELL INTEGRITY', value: integrityLevel, tone: 'warning' as const },
    { label: 'PLAYER CONDITION', value: rageSync, tone: 'system' as const },
  ]

  return (
    <motion.aside
      animate={{ boxShadow: ['0 0 12px rgba(255,23,68,0.1)', '0 0 18px rgba(255,109,0,0.22)', '0 0 12px rgba(255,23,68,0.1)'] }}
      transition={{ duration: 3.2, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
      className="hidden w-full rounded-md border border-[#ff1744]/20 bg-[rgba(24,2,2,0.78)] p-3 font-mono text-[10px] text-white/65 backdrop-blur-md md:block"
    >
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
        <span>section: {Math.max(1, currentSectionIndex + 1)}/{SECTION_ORDER.length}</span>
        <span>deaths: {String(deaths).padStart(3, '0')}</span>
        <span>ascent: {ascentPercent}%</span>
      </div>
    </motion.aside>
  )
}
