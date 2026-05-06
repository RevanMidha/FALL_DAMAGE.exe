import { motion } from 'framer-motion'
import { useGameUiStore } from '../../store/gameUi/gameUiStore'
import { SECTION_STACK, SECTION_ORDER } from '../../constants/gameConstants'

export function TowerAside() {
  const progress = useGameUiStore((s) => s.progress)
  const sectionName = useGameUiStore((s) => s.sectionName)
  
  const ascentPercent = Math.round(progress * 100)
  const currentSectionIndex = SECTION_ORDER.indexOf(sectionName)

  return (
    <motion.aside
      animate={{ boxShadow: ['0 0 10px rgba(255,23,68,0.08)', '0 0 18px rgba(255,109,0,0.18)', '0 0 10px rgba(255,23,68,0.08)'] }}
      transition={{ duration: 3.4, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
      className="pointer-events-none absolute left-4 top-24 bottom-24 z-20 hidden w-40 rounded-md border border-[#ff1744]/20 bg-[rgba(24,2,2,0.72)] p-3 font-mono text-[10px] text-white/62 backdrop-blur-md xl:flex flex-col"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="tracking-[0.3em] text-[#ff6d00]/80">TOWER</span>
        <span className="text-[#ffea00]">{ascentPercent}%</span>
      </div>
      <div className="relative flex-1 overflow-hidden rounded-sm border border-white/8 bg-[linear-gradient(180deg,rgba(255,23,68,0.08),rgba(0,0,0,0.18))]">
        <div className="absolute inset-x-3 bottom-2 top-2 flex flex-col">
          {SECTION_STACK.map((section) => {
            const active = section === sectionName
            const passed = SECTION_ORDER.indexOf(section) < currentSectionIndex
            return (
              <div
                key={section}
                className={`relative flex flex-1 items-center border-b border-white/6 px-2 text-[9px] tracking-[0.18em] ${
                  active
                    ? 'bg-[rgba(255,23,68,0.16)] text-[#ffea00]'
                    : passed
                      ? 'text-[#ff6d00]/80'
                      : 'text-white/38'
                }`}
              >
                {section}
              </div>
            )
          })}
        </div>
        <motion.div
          className="absolute left-0 right-0 h-[2px] bg-[#ffea00] shadow-[0_0_16px_rgba(255,234,0,0.9)]"
          animate={{ bottom: `calc(${ascentPercent}% - 1px)` }}
          transition={{ type: 'spring', stiffness: 100, damping: 18 }}
        />
      </div>
    </motion.aside>
  )
}
