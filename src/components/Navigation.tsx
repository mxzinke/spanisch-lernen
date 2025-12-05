import type { TabId } from '../types'

interface Props {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Start', icon: 'home' },
  { id: 'practice', label: 'Üben', icon: 'practice' },
  { id: 'vocabulary', label: 'Vokabeln', icon: 'vocab' },
  { id: 'settings', label: 'Mehr', icon: 'settings' },
]

function Icon({ name, active }: { name: string; active: boolean }) {
  const color = active ? 'currentColor' : 'currentColor'

  switch (name) {
    case 'home':
      return (
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke={color} stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    case 'practice':
      return (
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke={color} stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    case 'vocab':
      return (
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke={color} stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    case 'settings':
      return (
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke={color} stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )
    default:
      return null
  }
}

export function Navigation({ activeTab, onTabChange }: Props) {
  return (
    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-sand-200 z-50 pb-safe">
      <div class="flex justify-around items-center max-w-lg mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            class={`
              flex flex-col items-center justify-center py-2 px-4 min-w-[72px]
              transition-colors duration-150
              ${activeTab === tab.id
                ? 'text-terracotta'
                : 'text-warm-gray'
              }
            `}
          >
            <Icon name={tab.icon} active={activeTab === tab.id} />
            <span class="text-xs mt-1 font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
