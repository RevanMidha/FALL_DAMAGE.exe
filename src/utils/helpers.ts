export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function keycapClass(tone: 'danger' | 'warning' | 'system') {
  if (tone === 'danger') {
    return 'border-[#ff1744]/40 bg-[rgba(255,23,68,0.08)] text-[#ff1744]'
  }
  if (tone === 'warning') {
    return 'border-[#ff6d00]/40 bg-[rgba(255,109,0,0.08)] text-[#ff6d00]'
  }
  return 'border-[#ffea00]/40 bg-[rgba(255,234,0,0.08)] text-[#ffea00]'
}
