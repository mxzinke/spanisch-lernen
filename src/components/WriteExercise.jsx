import { useState } from 'preact/hooks'
import { useSpeech } from '../hooks/useSpeech.js'

export function WriteExercise({ word, onResult }) {
  const [input, setInput] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const { speak } = useSpeech()

  const normalize = (str) => {
    return str
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Akzente entfernen für Vergleich
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const correct = normalize(input) === normalize(word.spanish)
    setIsCorrect(correct)
    setShowResult(true)
    speak(word.spanish)
  }

  const handleContinue = () => {
    onResult(isCorrect)
    setInput('')
    setShowResult(false)
  }

  return (
    <div class="space-y-6">
      <div class="card text-center">
        <p class="text-sm text-gray-500 mb-2">Übersetze ins Spanische:</p>
        <p class="text-3xl font-bold text-gray-800">{word.german}</p>
      </div>

      {!showResult ? (
        <form onSubmit={handleSubmit} class="space-y-4">
          <input
            type="text"
            value={input}
            onInput={(e) => setInput(e.target.value)}
            placeholder="Spanische Übersetzung..."
            class="w-full p-4 text-xl border-2 border-gray-200 rounded-xl focus:border-spanish-red focus:outline-none"
            autoFocus
            autoComplete="off"
            autoCapitalize="off"
          />
          <button
            type="submit"
            class="btn btn-primary w-full py-3 text-lg"
            disabled={!input.trim()}
          >
            Prüfen
          </button>
        </form>
      ) : (
        <div class="space-y-4">
          <div
            class={`card ${isCorrect ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'}`}
          >
            <div class="text-center">
              <p class="text-4xl mb-2">{isCorrect ? '🎉' : '😅'}</p>
              <p class={`text-xl font-bold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                {isCorrect ? 'Richtig!' : 'Nicht ganz...'}
              </p>

              {!isCorrect && (
                <div class="mt-4 space-y-2">
                  <p class="text-sm text-gray-600">Deine Antwort:</p>
                  <p class="text-lg line-through text-red-600">{input}</p>
                  <p class="text-sm text-gray-600 mt-2">Richtige Antwort:</p>
                </div>
              )}

              <p class="text-2xl font-bold text-spanish-red mt-2">
                {word.spanish}
                <button
                  onClick={() => speak(word.spanish)}
                  class="ml-2 text-xl hover:scale-110 transition-transform"
                >
                  🔊
                </button>
              </p>

              <p class="text-sm text-gray-500 mt-3 italic">"{word.example}"</p>
            </div>
          </div>

          <button onClick={handleContinue} class="btn btn-primary w-full py-3">
            Weiter
          </button>
        </div>
      )}
    </div>
  )
}
