import type { TabId } from '../types'

interface Props {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

const tabs: { id: TabId; label: string }[] = [
  { id: 'dashboard', label: 'Übersicht' },
  { id: 'practice', label: 'Üben' },
  { id: 'vocabulary', label: 'Vokabeln' },
  { id: 'settings', label: 'Einstellungen' },
]

export function Navigation({ activeTab, onTabChange }: Props) {
  return (
    <nav class="bg-white border-b border-sand-200 sticky top-0 z-10">
      <div class="container mx-auto max-w-2xl px-4">
        <div class="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              class={`
                flex-1 py-3.5 text-sm font-medium transition-all duration-150
                relative
                ${activeTab === tab.id
                  ? 'text-terracotta'
                  : 'text-warm-gray hover:text-warm-brown'
                }
              `}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span class="absolute bottom-0 left-4 right-4 h-0.5 bg-terracotta rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
