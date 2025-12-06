interface DifficultyBadgeProps {
  level: number
  size?: 'sm' | 'md' | "lg"
}

// Farbverlauf: Grün (einfach) → Gelb/Clay (mittel) → Terracotta (schwer)
const levelColors: Record<number, string> = {
  // Level 1-6: Anfänger (Olive-Töne)
  1: 'bg-olive/15 text-olive',
  2: 'bg-olive/18 text-olive',
  3: 'bg-olive/22 text-olive',
  4: 'bg-olive/26 text-olive',
  5: 'bg-olive-light/30 text-olive',
  6: 'bg-olive-light/35 text-olive',
  // Level 7-12: Mittelstufe (Clay-Töne)
  7: 'bg-clay/15 text-warm-brown',
  8: 'bg-clay/20 text-warm-brown',
  9: 'bg-clay/25 text-warm-brown',
  10: 'bg-clay/30 text-warm-brown',
  11: 'bg-clay-light/35 text-warm-brown',
  12: 'bg-clay-light/40 text-warm-brown',
  // Level 13-18: Fortgeschritten (Terracotta-Töne)
  13: 'bg-terracotta/15 text-terracotta',
  14: 'bg-terracotta/20 text-terracotta',
  15: 'bg-terracotta/25 text-terracotta',
  16: 'bg-terracotta/30 text-terracotta',
  17: 'bg-terracotta/35 text-terracotta',
  18: 'bg-terracotta/40 text-terracotta-dark',
}

export function DifficultyBadge({ level, size = 'sm' }: DifficultyBadgeProps) {
  const colorClass = levelColors[level] || levelColors[3]
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1'

  return <span class={`rounded-full font-medium ${colorClass} ${sizeClass}`}>Level {level}</span>
}
