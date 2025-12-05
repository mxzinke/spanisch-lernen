import { useState } from 'preact/hooks'
import type { TabId } from './types'
import { Navigation } from './components/Navigation'
import { Dashboard } from './components/Dashboard'
import { Practice } from './components/Practice'
import { VocabList } from './components/VocabList'
import { Settings } from './components/Settings'

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard')

  return (
    <div class="min-h-screen flex flex-col">
      {/* Clean, minimal header */}
      <header class="bg-white border-b border-sand-200">
        <div class="container mx-auto max-w-2xl px-4 py-5">
          <h1 class="text-center">Spanisch Lernen</h1>
        </div>
      </header>

      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      <main class="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <div class="fade-in">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'practice' && <Practice />}
          {activeTab === 'vocabulary' && <VocabList />}
          {activeTab === 'settings' && <Settings />}
        </div>
      </main>
    </div>
  )
}
