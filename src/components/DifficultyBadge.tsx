interface DifficultyBadgeProps {
  level: number
  size?: 'sm' | 'md' | "lg"
}

const levelColors: Record<number, string> = {
  1: 'bg-olive/20 text-olive',
  2: 'bg-olive-light/30 text-olive',
  3: 'bg-clay/20 text-warm-brown',
  4: 'bg-clay-light/30 text-warm-brown',
  5: 'bg-terracotta/20 text-terracotta',
}

export function DifficultyBadge({ level, size = 'sm' }: DifficultyBadgeProps) {
  const colorClass = levelColors[level] || levelColors[3]
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1'

  return <span class={`rounded-full font-medium ${colorClass} ${sizeClass}`}>Level {level}</span>
}
