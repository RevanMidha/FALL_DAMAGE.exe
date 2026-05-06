import { Terminal } from 'phosphor-react'
import { motion } from 'framer-motion'
import { useGameUiStore } from '../../store/gameUi/gameUiStore'

export function TerminalAside() {
  const glitchPulse = useGameUiStore((s) => s.glitchPulse)
  const prompt = useGameUiStore((s) => s.prompt)
  const fakeStatus = useGameUiStore((s) => s.fakeStatus)
  const lastCheckpointIndex = useGameUiStore((s) => s.lastCheckpointIndex)
  const deaths = useGameUiStore((s) => s.deaths)
  const sectionName = useGameUiStore((s) => s.sectionName)

  const checkpointLabel = lastCheckpointIndex >= 0 ? `CP-${lastCheckpointIndex + 1}` : 'NONE'
  const terminalLines = [
    `status=${fakeStatus}`,
    `checkpoint=${checkpointLabel}`,
    `deaths=${String(deaths).padStart(3, '0')}`,
    `section=${sectionName.toLowerCase().replaceAll(' ', '_')}`,
  ]

  return (
    <motion.aside
      animate={{ x: glitchPulse ? [0, -6, 7, -3, 0] : 0 }}
      transition={{ duration: 0.22 }}
      className="rounded-md border border-[#ff6d00]/25 bg-[rgba(24,2,2,0.82)] p-3 font-mono text-xs backdrop-blur-md"
      style={{ boxShadow: '0 0 20px rgba(255,109,0,0.12)' }}
    >
      <div className="mb-2 flex items-center justify-between text-[#ff6d00]/65">
        <div className="flex items-center gap-2">
          <Terminal size={12} />
          <span>kernel_prompt</span>
        </div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-white/35">live</span>
      </div>
      <p className="break-words text-[#ff1744] text-glow-red">
        {'>'} {prompt} <span className="cursor-blink" />
      </p>
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-white/45">
        {terminalLines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </div>
    </motion.aside>
  )
}
