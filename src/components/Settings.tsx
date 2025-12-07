import { useState, useRef } from 'preact/hooks'
import { useSpeech } from '../hooks/useSpeech'
import { useProgress } from '../hooks/useProgress'

export function Settings() {
  const { voices, currentVoice, rate, setRate, setVoice, speak, isSupported } = useSpeech()
  const { resetProgress, exportProgress, importProgress } = useProgress()
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [importMessage, setImportMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleTestVoice = () => {
    speak('Hola, ¿cómo estás? Me llamo María.')
  }

  const handleReset = () => {
    if (confirm('Willst du wirklich deinen gesamten Lernfortschritt löschen?')) {
      resetProgress()
    }
  }

  const handleExport = () => {
    exportProgress()
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: Event) => {
    const input = e.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return

    try {
      await importProgress(file)
      setImportStatus('success')
      setImportMessage('Fortschritt erfolgreich wiederhergestellt!')
      setTimeout(() => setImportStatus('idle'), 3000)
    } catch (error) {
      setImportStatus('error')
      setImportMessage(error instanceof Error ? error.message : 'Import fehlgeschlagen')
      setTimeout(() => setImportStatus('idle'), 3000)
    }

    // Reset file input
    input.value = ''
  }

  return (
    <div class="space-y-8">


      {/* Info section */}
      <section class="card">
        <h2 class="mb-4 font-serif">Über das Leitner-System</h2>
        <div class="space-y-4 text-sm text-warm-gray">
          <p>
            Das Leitner-System nutzt <span class="text-warm-brown font-medium">Spaced Repetition</span> –
            eine wissenschaftlich bewährte Lernmethode. Die Idee: Wörter, die du gut kannst,
            werden seltener abgefragt. Schwierige Wörter übst du öfter.
          </p>
          <p>
            Jedes Wort durchläuft 5 Stufen. Bei einer <span class="text-olive">richtigen Antwort</span> steigt
            es eine Stufe auf. Bei einer <span class="text-terracotta">falschen Antwort</span> fällt es
            zurück zu Stufe 1 – so stellst du sicher, dass du es wirklich lernst.
          </p>
          <div class="space-y-2">
            <p class="font-medium text-warm-brown">Wiederholungsintervalle:</p>
            <ul class="space-y-1.5 ml-4">
              <li class="flex items-center gap-2">
                <span class="w-16">Stufe 1:</span>
                <span class="text-warm-brown">Täglich</span>
                <span class="text-warm-gray/60 text-xs">– neue Wörter</span>
              </li>
              <li class="flex items-center gap-2">
                <span class="w-16">Stufe 2:</span>
                <span class="text-warm-brown">Alle 2 Tage</span>
              </li>
              <li class="flex items-center gap-2">
                <span class="w-16">Stufe 3:</span>
                <span class="text-warm-brown">Alle 4 Tage</span>
              </li>
              <li class="flex items-center gap-2">
                <span class="w-16">Stufe 4:</span>
                <span class="text-warm-brown">Alle 8 Tage</span>
              </li>
              <li class="flex items-center gap-2">
                <span class="w-16">Stufe 5+:</span>
                <span class="text-olive">Ab 16 Tage</span>
                <span class="text-warm-gray/60 text-xs">– gemeistert!</span>
              </li>
            </ul>
          </div>
          <p class="text-xs text-warm-gray/70 pt-2 border-t border-sand-200">
            Ab Stufe 5 hast du ein Wort gemeistert. Danach wachsen die Intervalle weiter exponentiell
            (32, 64, 128 Tage...), sodass gut gelernte Wörter dich kaum noch stören.
          </p>
        </div>
      </section>
      
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
          Dein Lernfortschritt wird sicher in deinem Browser gespeichert.
          Erstelle regelmäßig ein Backup, um deine Daten zu sichern.
        </p>

        {/* Export/Import buttons */}
        <div class="space-y-3 mb-6">
          <button onClick={handleExport} class="btn btn-secondary w-full flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Backup herunterladen
          </button>

          <button onClick={handleImportClick} class="btn btn-secondary w-full flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Backup wiederherstellen
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            class="hidden"
          />

          {importStatus !== 'idle' && (
            <p class={`text-sm text-center ${importStatus === 'success' ? 'text-olive' : 'text-rose-dark'}`}>
              {importMessage}
            </p>
          )}
        </div>

        {/* Danger zone */}
        <div class="pt-4 border-t border-sand-200">
          <p class="text-sm text-warm-gray mb-3">Gefahrenzone</p>
          <button onClick={handleReset} class="btn btn-danger w-full">
            Fortschritt zurücksetzen
          </button>
        </div>
      </section>

    </div>
  )
}
