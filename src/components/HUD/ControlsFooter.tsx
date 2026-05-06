import { keycapClass } from '../../utils/helpers'

export function ControlsFooter() {
  return (
    <footer className="pointer-events-none absolute bottom-4 left-1/2 z-20 max-w-[calc(100vw-1rem)] -translate-x-1/2 rounded-md border border-white/15 bg-[rgba(24,2,2,0.78)] px-4 py-2 text-center font-mono text-[10px] leading-5 text-white/65 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className={`rounded border px-2 py-0.5 ${keycapClass('warning')}`}>A/D</span>
        <span>move</span>
        <span className="text-white/20">|</span>
        <span className={`rounded border px-2 py-0.5 ${keycapClass('system')}`}>SPACE/W</span>
        <span>jump</span>
        <span className="text-white/20">|</span>
        <span className={`rounded border px-2 py-0.5 ${keycapClass('danger')}`}>S</span>
        <span>fast fall</span>
        <span className="text-white/20">|</span>
        <span className={`rounded border px-2 py-0.5 ${keycapClass('danger')}`}>R</span>
        <span>retry</span>
      </div>
    </footer>
  )
}
