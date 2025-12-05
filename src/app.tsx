import { useState, useRef } from 'preact/hooks'
import type { TabId } from './types'
import { Navigation } from './components/Navigation'
import { Dashboard } from './components/Dashboard'
import { Practice } from './components/Practice'
import { VocabList } from './components/VocabList'
import { Settings } from './components/Settings'
import { Logo } from './components/Logo'
import { InstallPrompt } from './components/InstallPrompt'

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard')
  const [isAnimating, setIsAnimating] = useState(false)
  const [displayTab, setDisplayTab] = useState<TabId>('dashboard')
  const prevTabRef = useRef<TabId>('dashboard')

  // Tab order for determining animation direction
  const tabOrder: TabId[] = ['dashboard', 'practice', 'vocabulary', 'settings']

  const handleTabChange = (newTab: TabId) => {
    if (newTab === activeTab) return

    prevTabRef.current = activeTab
    setIsAnimating(true)
    setActiveTab(newTab)

    // Short delay before showing new content
    setTimeout(() => {
      setDisplayTab(newTab)
      setIsAnimating(false)
    }, 150)
  }

  const getAnimationDirection = () => {
    const prevIndex = tabOrder.indexOf(prevTabRef.current)
    const currentIndex = tabOrder.indexOf(activeTab)
    return currentIndex > prevIndex ? 'slide-left' : 'slide-right'
  }

  return (
    <div class="min-h-screen flex flex-col">
      {/* Header with logo */}
      <header class="bg-white/95 backdrop-blur-sm border-b border-sand-200 sticky top-0 z-40 pt-safe">
        <div class="container mx-auto max-w-2xl px-4 py-3">
          <div class="flex items-center justify-center gap-2.5">
            <Logo size={28} />
            <h1 class="text-lg font-semibold text-warm-brown">Spanisch Lernen</h1>
          </div>
        </div>
      </header>

      <main class="flex-1 container mx-auto px-4 py-6 max-w-2xl overflow-hidden">
        <div
          class={`page-transition ${isAnimating ? 'page-exit' : 'page-enter'} ${getAnimationDirection()}`}
        >
          {displayTab === 'dashboard' && <Dashboard onNavigate={handleTabChange} />}
          {displayTab === 'practice' && <Practice />}
          {displayTab === 'vocabulary' && <VocabList />}
          {displayTab === 'settings' && <Settings />}
        </div>
      </main>

      <Navigation activeTab={activeTab} onTabChange={handleTabChange} />
      <InstallPrompt />
    </div>
  )
}
