import { useState, useMemo } from 'preact/hooks'
import { useSpeech } from '../hooks/useSpeech.js'

export function MultipleChoice({ word, allWords, onResult }) {
  const [selected, setSelected] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const { speak } = useSpeech()

  // Generiere 4 Optionen (1 richtig + 3 falsch)
  const options = useMemo(() => {
    const wrong = allWords
      .filter((w) => w.id !== word.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)

    return [...wrong, word].sort(() => Math.random() - 0.5)
  }, [word, allWords])

  const handleSelect = (option) => {
    if (showResult) return
    setSelected(option)
    setShowResult(true)
    speak(word.spanish)

    // Nach 1.5s automatisch weiter
    setTimeout(() => {
      onResult(option.id === word.id)
      setSelected(null)
      setShowResult(false)
    }, 1500)
  }

  const getButtonClass = (option) => {
    if (!showResult) {
      return 'bg-white hover:bg-gray-50 border-2 border-gray-200'
    }
    if (option.id === word.id) {
      return 'bg-green-100 border-2 border-green-500 text-green-800'
    }
    if (option.id === selected?.id) {
      return 'bg-red-100 border-2 border-red-500 text-red-800'
    }
    return 'bg-gray-100 border-2 border-gray-200 opacity-50'
  }

  return (
    <div class="space-y-6">
      <div class="card text-center">
        <p class="text-sm text-gray-500 mb-2">Was bedeutet...</p>
        <p class="text-3xl font-bold text-spanish-red">{word.spanish}</p>
        <button
          onClick={() => speak(word.spanish)}
          class="mt-2 text-2xl hover:scale-110 transition-transform"
        >
          🔊
        </button>
      </div>

      <div class="space-y-3">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option)}
            disabled={showResult}
            class={`w-full p-4 rounded-xl text-left font-medium transition-all ${getButtonClass(option)}`}
          >
            {option.german}
            {showResult && option.id === word.id && (
              <span class="float-right">✓</span>
            )}
            {showResult && option.id === selected?.id && option.id !== word.id && (
              <span class="float-right">✗</span>
            )}
          </button>
        ))}
      </div>

      {showResult && (
        <div class="text-center text-sm text-gray-500">
          Weiter in einen Moment...
        </div>
      )}
    </div>
  )
}
