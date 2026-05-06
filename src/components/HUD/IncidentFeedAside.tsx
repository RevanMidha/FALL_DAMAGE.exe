import { motion } from 'framer-motion'
import { useGameUiStore } from '../../store/gameUi/gameUiStore'
import { MEME_SYSTEM_LINES, SECTION_BRIEFS } from '../../constants/gameConstants'

export function IncidentFeedAside({ deathQuip }: { deathQuip: string }) {
  const sectionName = useGameUiStore((s) => s.sectionName)
  const prompt = useGameUiStore((s) => s.prompt)
  const deaths = useGameUiStore((s) => s.deaths)

  const memeLine = MEME_SYSTEM_LINES[deaths % MEME_SYSTEM_LINES.length]

  const incidentFeed = [
    `objective: climb higher than your patience`,
    `runtime: ${SECTION_BRIEFS[sectionName] ?? 'no sympathy detected'}`,
    `prompt: ${prompt}`,
    `memory: ${deathQuip}`,
    `meme_kernel: ${memeLine}`,
  ]

  return (
    <motion.aside
      animate={{ y: [0, -2, 0], borderColor: ['rgba(255,109,0,0.25)', 'rgba(255,23,68,0.35)', 'rgba(255,109,0,0.25)'] }}
      transition={{ duration: 4.2, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
      className="pointer-events-none absolute bottom-20 right-4 z-20 hidden w-[320px] rounded-md border border-[#ff6d00]/25 bg-[rgba(24,2,2,0.82)] p-3 font-mono text-[10px] text-white/62 backdrop-blur-md lg:block"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="tracking-[0.3em] text-[#ff6d00]/80">INCIDENT FEED</span>
        <span className="text-[#ff1744]">LIVE</span>
      </div>
      <div className="space-y-2">
        {incidentFeed.map((line, index) => (
          <motion.div
            key={`${line}-${index}`}
            initial={{ opacity: 0.35, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            className="border-l border-[#ff1744]/25 pl-3"
          >
            {line}
          </motion.div>
        ))}
      </div>
    </motion.aside>
  )
}
