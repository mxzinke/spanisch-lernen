interface DifficultyBadgeProps {
  level: number
  size?: 'sm' | 'md' | "lg"
}

// Farbverlauf: Grün (einfach) → Gelb/Clay (mittel) → Terracotta (schwer)
const levelColors: Record<number, string> = {
  // Level 1-5: Anfänger (Olive-Töne)
  1: 'bg-olive/15 text-olive',
  2: 'bg-olive/20 text-olive',
  3: 'bg-olive/25 text-olive',
  4: 'bg-olive-light/30 text-olive',
  5: 'bg-olive-light/40 text-olive',
  // Level 6-10: Mittelstufe (Clay-Töne)
  6: 'bg-clay/15 text-warm-brown',
  7: 'bg-clay/20 text-warm-brown',
  8: 'bg-clay/25 text-warm-brown',
  9: 'bg-clay-light/30 text-warm-brown',
  10: 'bg-clay-light/40 text-warm-brown',
  // Level 11-15: Fortgeschritten (Terracotta-Töne)
  11: 'bg-terracotta/15 text-terracotta',
  12: 'bg-terracotta/20 text-terracotta',
  13: 'bg-terracotta/25 text-terracotta',
  14: 'bg-terracotta/30 text-terracotta',
  15: 'bg-terracotta/40 text-terracotta-dark',
}

export function DifficultyBadge({ level, size = 'sm' }: DifficultyBadgeProps) {
  const colorClass = levelColors[level] || levelColors[3]
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1'

  return <span class={`rounded-full font-medium ${colorClass} ${sizeClass}`}>Level {level}</span>
}
