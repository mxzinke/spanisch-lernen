import { useState, useEffect } from 'preact/hooks'

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Check if already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true

    // Check if iOS Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)

    // Check if user dismissed the prompt before
    const dismissed = localStorage.getItem('install-prompt-dismissed')

    // Show on iOS Safari (or for testing with ?install-prompt query param)
    const forceShow = window.location.search.includes('install-prompt')
    if (forceShow || (!isStandalone && isIOS && isSafari && !dismissed)) {
      // Small delay so it doesn't appear immediately
      setTimeout(() => setShowPrompt(true), forceShow ? 500 : 2000)
    }
  }, [])

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('install-prompt-dismissed', 'true')
  }

  if (!showPrompt) return null

  return (
    <div class="fixed inset-x-0 bottom-[4.5rem] z-50 px-3 pb-2 animate-slide-up">
      <div class="bg-white rounded-2xl shadow-lifted p-4 relative border border-sand-100">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          class="absolute top-2 right-2 p-1.5 text-warm-gray hover:text-warm-brown rounded-full hover:bg-sand-50"
          aria-label="Schließen"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div class="flex items-center gap-3 pr-6">
          {/* App Icon */}
          <div class="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-terracotta to-wine rounded-xl flex items-center justify-center shadow-sm">
            <span class="text-cream font-serif text-lg font-semibold">E</span>
          </div>

          <div class="flex-1 min-w-0">
            <p class="font-medium text-warm-brown text-sm leading-tight">
              Zum Home-Bildschirm hinzufügen
            </p>

            {/* Compact instruction */}
            <p class="text-xs text-warm-gray mt-1 flex items-center gap-1.5 flex-wrap">
              <span>Tippe</span>
              <span class="inline-flex items-center justify-center w-5 h-5 bg-sand-100 rounded">
                <svg class="w-3.5 h-3.5 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </span>
              <span>→</span>
              <span class="font-medium text-warm-brown">Zum Home-Bildschirm</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
