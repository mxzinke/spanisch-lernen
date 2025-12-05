import { useState } from 'preact/hooks'
import { useSpeech } from '../hooks/useSpeech.js'

export function Flashcard({ word, onResult, onSkip }) {
  const [flipped, setFlipped] = useState(false)
  const { speak, isSpeaking } = useSpeech()

  const handleSpeak = (e) => {
    e.stopPropagation()
    speak(word.spanish)
  }

  const handleResult = (correct) => {
    setFlipped(false)
    onResult(correct)
  }

  return (
    <div class="space-y-6">
      <div
        onClick={() => setFlipped(!flipped)}
        class="card min-h-[250px] cursor-pointer flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-lg"
      >
        {!flipped ? (
          <>
            <p class="text-sm text-gray-500 mb-2">Wie heißt das auf Spanisch?</p>
            <p class="text-3xl font-bold text-gray-800">{word.german}</p>
            <p class="text-sm text-gray-400 mt-4">Tippe zum Umdrehen</p>
          </>
        ) : (
          <>
            <p class="text-sm text-gray-500 mb-2">Spanisch</p>
            <p class="text-3xl font-bold text-spanish-red">{word.spanish}</p>
            <button
              onClick={handleSpeak}
              class="mt-3 text-2xl hover:scale-110 transition-transform"
              disabled={isSpeaking}
            >
              🔊
            </button>
            <div class="mt-4 p-3 bg-gray-50 rounded-lg w-full">
              <p class="text-sm text-gray-600 italic">"{word.example}"</p>
              <p class="text-xs text-gray-400 mt-1">({word.exampleDe})</p>
            </div>
          </>
        )}
      </div>

      {flipped && (
        <div class="flex gap-4">
          <button
            onClick={() => handleResult(false)}
            class="btn btn-danger flex-1 py-3"
          >
            ❌ Falsch
          </button>
          <button
            onClick={() => handleResult(true)}
            class="btn btn-success flex-1 py-3"
          >
            ✓ Richtig
          </button>
        </div>
      )}

      {!flipped && (
        <button onClick={onSkip} class="btn btn-secondary w-full">
          Überspringen
        </button>
      )}
    </div>
  )
}
