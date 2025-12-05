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
    <div class="space-y-6">
      {/* TTS Einstellungen */}
      <div class="card">
        <h2 class="text-xl font-bold mb-4">🔊 Sprachausgabe (TTS)</h2>

        {!isSupported ? (
          <p class="text-red-600">Dein Browser unterstützt keine Sprachausgabe.</p>
        ) : (
          <div class="space-y-4">
            {/* Stimme wählen */}
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Stimme</label>
              <select
                value={currentVoice?.name || ''}
                onChange={(e) => setVoice((e.target as HTMLSelectElement).value)}
                class="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-spanish-red focus:outline-none"
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
              <p class="text-xs text-gray-500 mt-1">
                {voices.length} spanische Stimme(n) verfügbar
              </p>
            </div>

            {/* Geschwindigkeit */}
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Geschwindigkeit: {rate.toFixed(2)}x
              </label>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.05"
                value={rate}
                onInput={(e) => setRate(parseFloat((e.target as HTMLInputElement).value))}
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-spanish-red"
              />
              <div class="flex justify-between text-xs text-gray-400 mt-1">
                <span>Langsam (0.5x)</span>
                <span>Normal (1x)</span>
                <span>Schnell (1.5x)</span>
              </div>
            </div>

            {/* Test-Button */}
            <button onClick={handleTestVoice} class="btn btn-primary w-full">
              🔊 Stimme testen
            </button>
          </div>
        )}
      </div>

      {/* Daten */}
      <div class="card">
        <h2 class="text-xl font-bold mb-4">📊 Daten</h2>

        <div class="space-y-3">
          <p class="text-sm text-gray-600">
            Dein Lernfortschritt wird lokal in deinem Browser gespeichert.
          </p>

          <button onClick={handleReset} class="btn btn-danger w-full">
            🗑️ Fortschritt zurücksetzen
          </button>
        </div>
      </div>

      {/* Info */}
      <div class="card bg-gray-50">
        <h2 class="text-xl font-bold mb-4">ℹ️ Info</h2>
        <div class="space-y-2 text-sm text-gray-600">
          <p>
            <strong>Leitner-System:</strong> Wörter werden nach dem Spaced-Repetition-Prinzip
            wiederholt. Richtige Antworten verschieben ein Wort in eine höhere Box (seltener
            wiederholen), falsche zurück zu Box 1.
          </p>
          <p>
            <strong>Box-Intervalle:</strong>
          </p>
          <ul class="list-disc list-inside ml-2">
            <li>Box 1: Täglich</li>
            <li>Box 2: Alle 2 Tage</li>
            <li>Box 3: Alle 4 Tage</li>
            <li>Box 4: Alle 8 Tage</li>
            <li>Box 5: Alle 16 Tage</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
