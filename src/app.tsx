import { useState, useRef } from 'preact/hooks'
import type { TabId } from './types'
import { Navigation } from './components/Navigation'
import { Dashboard } from './components/Dashboard'
import { Practice } from './components/Practice'
import { VocabList } from './components/VocabList'
import { Settings } from './components/Settings'
import { Logo } from './components/Logo'
import { InstallPrompt } from './components/InstallPrompt'
import { useProgress } from './hooks/useProgress'

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard')
  const [isAnimating, setIsAnimating] = useState(false)
  const [displayTab, setDisplayTab] = useState<TabId>('dashboard')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const prevTabRef = useRef<TabId>('dashboard')

  // Easter Egg: 10x schnell auf Logo tippen für Dev-Menü
  const { boostToLevel } = useProgress()
  const [showDevMenu, setShowDevMenu] = useState(false)
  const tapCountRef = useRef(0)
  const lastTapRef = useRef(0)

  const handleLogoTap = () => {
    const now = Date.now()
    if (now - lastTapRef.current > 2000) {
      tapCountRef.current = 0
    }
    lastTapRef.current = now
    tapCountRef.current++

    if (tapCountRef.current >= 10) {
      tapCountRef.current = 0
      setShowDevMenu(true)
    }
  }

  const handleBoostLevel = (level: number) => {
    boostToLevel(level)
    setShowDevMenu(false)
    window.location.reload()
  }

  // Tab order for determining animation direction
  const tabOrder: TabId[] = ['dashboard', 'practice', 'vocabulary', 'settings']

  const handleTabChange = (newTab: TabId, category?: string) => {
    if (newTab === activeTab && !category) return

    // Kategorie setzen wenn übergeben
    if (category) {
      setSelectedCategory(category)
    } else if (newTab !== 'practice') {
      setSelectedCategory(null)
    }

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
          <div
            class="flex items-center justify-center gap-2.5 cursor-pointer select-none"
            style={{ touchAction: 'manipulation' }}
            onClick={handleLogoTap}
          >
            <Logo size={28} />
            <h1 class="text-lg font-semibold text-warm-brown">Spanisch Lernen</h1>
          </div>
        </div>
      </header>

      {/* Dev Menu Modal */}
      {showDevMenu && (
        <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h2 class="text-lg font-semibold text-warm-brown mb-4">Dev-Menü</h2>
            <p class="text-sm text-warm-gray mb-4">Wähle ein Level zum Boosten:</p>
            <div class="grid grid-cols-6 gap-2 mb-4">
              {Array.from({ length: 18 }, (_, i) => i + 1).map((level) => (
                <button
                  key={level}
                  onClick={() => handleBoostLevel(level)}
                  class="p-2 text-sm font-medium rounded-lg bg-sand-100 hover:bg-terracotta hover:text-white transition-colors"
                >
                  {level}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowDevMenu(false)}
              class="w-full py-2 text-sm text-warm-gray hover:text-warm-brown transition-colors"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      <main class="flex-1 container mx-auto px-4 py-6 max-w-2xl overflow-hidden">
        <div
          class={`page-transition ${isAnimating ? 'page-exit' : 'page-enter'} ${getAnimationDirection()}`}
        >
          {displayTab === 'dashboard' && <Dashboard onNavigate={handleTabChange} />}
          {displayTab === 'practice' && <Practice initialCategory={selectedCategory} />}
          {displayTab === 'vocabulary' && <VocabList />}
          {displayTab === 'settings' && <Settings />}
        </div>
      </main>

      <Navigation activeTab={activeTab} onTabChange={handleTabChange} />
      <InstallPrompt />
    </div>
  )
}
