import { useSpeech } from '../hooks/useSpeech'
import { useProgress } from '../hooks/useProgress'

export function Settings() {
  const { voices, currentVoice, rate, setRate, setVoice, speak, isSupported } = useSpeech()
  const { resetProgress } = useProgress()

  const handleTestVoice = () => {
    speak('Hola, ¿cómo estás? Me llamo María.')
  }

  const handleReset = () => {
    if (confirm('Willst du wirklich deinen gesamten Lernfortschritt löschen?')) {
      resetProgress()
    }
  }

  return (
    <div class="space-y-8">
      {/* TTS Settings */}
      <section class="card">
        <h2 class="mb-6 font-serif">Sprachausgabe</h2>

        {!isSupported ? (
          <p class="text-rose-dark">
            Dein Browser unterstützt keine Sprachausgabe.
          </p>
        ) : (
          <div class="space-y-6">
            {/* Voice selection */}
            <div>
              <label class="block text-sm font-medium text-warm-gray mb-2">
                Stimme
              </label>
              <select
                value={currentVoice?.name || ''}
                onChange={(e) => setVoice((e.target as HTMLSelectElement).value)}
                class="select"
              >
                {voices.length === 0 ? (
                  <option value="">Keine spanischen Stimmen gefunden</option>
                ) : (
                  voices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))
                )}
              </select>
              <p class="text-xs text-warm-gray mt-2">
                {voices.length} spanische {voices.length === 1 ? 'Stimme' : 'Stimmen'} verfügbar
              </p>
            </div>

            {/* Speed slider */}
            <div>
              <label class="block text-sm font-medium text-warm-gray mb-2">
                Geschwindigkeit: {rate.toFixed(2)}x
              </label>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.05"
                value={rate}
                onInput={(e) => setRate(parseFloat((e.target as HTMLInputElement).value))}
                class="w-full h-2 bg-sand-200 rounded-lg appearance-none cursor-pointer accent-terracotta"
              />
              <div class="flex justify-between text-xs text-warm-gray mt-2">
                <span>Langsam</span>
                <span>Normal</span>
                <span>Schnell</span>
              </div>
            </div>

            {/* Test button */}
            <button onClick={handleTestVoice} class="btn btn-secondary w-full">
              Stimme testen
            </button>
          </div>
        )}
      </section>

      {/* Data section */}
      <section class="card">
        <h2 class="mb-4 font-serif">Daten</h2>
        <p class="text-sm text-warm-gray mb-4">
          Dein Lernfortschritt wird lokal in deinem Browser gespeichert.
        </p>
        <button onClick={handleReset} class="btn btn-danger w-full">
          Fortschritt zurücksetzen
        </button>
      </section>

      {/* Info section */}
      <section class="card">
        <h2 class="mb-4 font-serif">Über das Leitner-System</h2>
        <div class="space-y-3 text-sm text-warm-gray">
          <p>
            Wörter werden nach dem Spaced-Repetition-Prinzip wiederholt.
            Richtige Antworten verschieben ein Wort in eine höhere Stufe,
            falsche zurück zu Stufe 1.
          </p>
          <div class="space-y-1">
            <p class="font-medium text-warm-brown">Wiederholungsintervalle:</p>
            <ul class="space-y-1 ml-4">
              <li>Stufe 1: Täglich</li>
              <li>Stufe 2: Alle 2 Tage</li>
              <li>Stufe 3: Alle 4 Tage</li>
              <li>Stufe 4: Alle 8 Tage</li>
              <li>Stufe 5: Alle 16 Tage</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
