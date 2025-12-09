import { useState, useMemo } from 'preact/hooks'
import type { WordWithCategory } from '../types'
import { useSpeech } from '../hooks/useSpeech'
import { SpeakerIcon } from './SpeakerIcon'
import { getSmartDistractors } from '../data/vocabulary'

interface Props {
  word: WordWithCategory
  allWords: WordWithCategory[]
  onResult: (correct: boolean) => void
}

export function MultipleChoice({ word, allWords, onResult }: Props) {
  const [selected, setSelected] = useState<WordWithCategory | null>(null)
  const [showResult, setShowResult] = useState(false)
  const { speak } = useSpeech()

  // Zufällig Richtung wählen: true = Spanisch→Deutsch, false = Deutsch→Spanisch
  const isSpanishToGerman = useMemo(() => Math.random() > 0.5, [word])

  const options = useMemo(() => {
    // Intelligente Auswahl: gleiche Kategorie bevorzugen, dann ähnliche Schwierigkeit
    const distractors = getSmartDistractors(word, allWords, 3)
    return [...distractors, word].sort(() => Math.random() - 0.5)
  }, [word, allWords])

  const handleSelect = (option: WordWithCategory) => {
    if (showResult) return
    setSelected(option)
    setShowResult(true)
    // Immer die richtige spanische Antwort vorlesen
    speak(word.spanish)

    setTimeout(() => {
      const isCorrect = option.id === word.id
      setSelected(null)
      setShowResult(false)
      onResult(isCorrect)
    }, 1500)
  }

  const getButtonClass = (option: WordWithCategory): string => {
    const base = 'w-full p-4 rounded-xl text-left font-medium transition-all duration-150'
    if (!showResult) {
      // Use mc-option class for touch-safe hover (only on devices that support hover)
      return 'mc-option'
    }
    if (option.id === word.id) {
      return `${base} bg-olive/10 border-2 border-olive text-olive-dark`
    }
    if (option.id === selected?.id) {
      return `${base} bg-rose-muted/20 border-2 border-rose-muted text-rose-dark`
    }
    return `${base} bg-sand-100 border border-sand-200 opacity-50`
  }

  return (
    <div class="space-y-6">
      <div class="card text-center py-8">
        <p class="text-sm text-warm-gray mb-3">
          {isSpanishToGerman ? 'Was bedeutet...' : 'Wie sagt man auf Spanisch...'}
        </p>
        <p class="text-3xl font-serif font-medium text-terracotta">
          {isSpanishToGerman ? word.spanish : word.german}
        </p>
        {isSpanishToGerman && (
          <button
            onClick={() => speak(word.spanish)}
            class="mt-3 px-4 py-2 text-sm text-warm-gray hover:text-warm-brown hover:bg-sand-100 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <SpeakerIcon class="w-4 h-4" />
            Anhören
          </button>
        )}
      </div>

      <div class="space-y-3">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option)}
            disabled={showResult}
            class={getButtonClass(option)}
          >
            {isSpanishToGerman ? option.german : option.spanish}
          </button>
        ))}
      </div>

      {showResult && (
        <p class="text-center text-sm text-warm-gray">Weiter in einem Moment...</p>
      )}
    </div>
  )
}
