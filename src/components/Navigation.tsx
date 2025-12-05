import type { TabId } from '../types'

interface Props {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'practice', label: 'Üben', icon: '✏️' },
  { id: 'vocabulary', label: 'Vokabeln', icon: '📚' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
]

export function Navigation({ activeTab, onTabChange }: Props) {
  return (
    <nav class="bg-white border-b border-gray-200">
      <div class="container mx-auto max-w-2xl">
        <div class="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              class={`flex-1 py-3 px-4 text-center font-medium transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'text-spanish-red border-b-2 border-spanish-red'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span class="mr-2">{tab.icon}</span>
              <span class="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
