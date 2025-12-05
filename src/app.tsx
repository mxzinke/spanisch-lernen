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
    <div class="min-h-screen">
      <header class="bg-spanish-red text-white py-4 px-6 shadow-lg">
        <h1 class="text-2xl font-bold text-center">Spanisch Lernen</h1>
      </header>

      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      <main class="container mx-auto px-4 py-6 max-w-2xl">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'practice' && <Practice />}
        {activeTab === 'vocabulary' && <VocabList />}
        {activeTab === 'settings' && <Settings />}
      </main>
    </div>
  )
}
