import { useState } from 'preact/hooks'
import type { WordWithCategory } from '../types'
import { useSpeech } from '../hooks/useSpeech'
import { SpeakerIcon } from './SpeakerIcon'

interface Props {
  word: WordWithCategory
  onResult: (correct: boolean) => void
}

export function WriteExercise({ word, onResult }: Props) {
  const [input, setInput] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const { speak } = useSpeech()

  const normalize = (str: string): string => {
    return str
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
  }

  const handleSubmit = (e: Event) => {
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
      <div class="card text-center py-8">
        <p class="text-sm text-warm-gray mb-3">Übersetze ins Spanische:</p>
        <p class="text-3xl font-serif font-medium text-warm-brown">{word.german}</p>
      </div>

      {!showResult ? (
        <form onSubmit={handleSubmit} class="space-y-4">
          <input
            type="text"
            value={input}
            onInput={(e) => setInput((e.target as HTMLInputElement).value)}
            placeholder="Spanische Übersetzung..."
            class="input text-lg"
            autoFocus
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <button
            type="submit"
            class="btn btn-primary w-full py-3"
            disabled={!input.trim()}
          >
            Prüfen
          </button>
        </form>
      ) : (
        <div class="space-y-4">
          <div
            class={`card ${
              isCorrect
                ? 'bg-olive/5 border border-olive/30'
                : 'bg-rose-muted/10 border border-rose-muted/30'
            }`}
          >
            <div class="text-center py-4">
              <p class={`text-xl font-semibold mb-4 ${isCorrect ? 'text-olive-dark' : 'text-rose-dark'}`}>
                {isCorrect ? 'Richtig!' : 'Nicht ganz...'}
              </p>

              {!isCorrect && (
                <div class="mb-4">
                  <p class="text-sm text-warm-gray">Deine Antwort:</p>
                  <p class="text-lg text-rose-dark line-through">{input}</p>
                </div>
              )}

              <p class="text-sm text-warm-gray">
                {isCorrect ? 'Die Antwort:' : 'Richtige Antwort:'}
              </p>
              <p class="text-2xl font-serif font-medium text-terracotta mt-1">{word.spanish}</p>

              <button
                onClick={() => speak(word.spanish)}
                class="mt-3 px-4 py-2 text-sm text-warm-gray hover:text-warm-brown hover:bg-white/50 rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <SpeakerIcon class="w-4 h-4" />
                Anhören
              </button>

              <button
                onClick={() => speak(word.example)}
                class="text-sm font-serif text-warm-gray mt-4 italic hover:text-terracotta transition-colors flex items-center gap-1 mx-auto group"
                title="Beispielsatz anhören"
              >
                <SpeakerIcon class="w-3 h-3 opacity-50 group-hover:opacity-100 shrink-0" />
                <span>„{word.example}"</span>
              </button>
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
