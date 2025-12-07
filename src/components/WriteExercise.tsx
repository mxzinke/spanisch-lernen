import { useState } from 'preact/hooks'
import type { WordWithCategory } from '../types'
import { useSpeech } from '../hooks/useSpeech'
import { SpeakerIcon } from './SpeakerIcon'

type Result = 'correct' | 'close' | 'wrong'

interface Props {
  word: WordWithCategory
  onResult: (correct: boolean | null) => void
}

function levenshtein(a: string, b: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

export function WriteExercise({ word, onResult }: Props) {
  const [input, setInput] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [result, setResult] = useState<Result>('wrong')
  const { speak } = useSpeech()

  const normalize = (str: string): string => {
    return str
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/^[¿¡]+|[?!]+$/g, '')
      .replace(/\.{2,}|…/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  const checkAnswer = (userInput: string, expected: string): Result => {
    const normalizedInput = normalize(userInput)
    const normalizedExpected = normalize(expected)

    if (normalizedInput === normalizedExpected) {
      return 'correct'
    }

    const distance = levenshtein(normalizedInput, normalizedExpected)
    const maxAllowed = Math.max(2, Math.floor(normalizedExpected.length * 0.2))

    if (distance <= maxAllowed) {
      return 'close'
    }

    return 'wrong'
  }

  const handleSubmit = (e: Event) => {
    e.preventDefault()
    if (!input.trim()) return

    const answerResult = checkAnswer(input, word.spanish)
    setResult(answerResult)
    setShowResult(true)
    speak(word.spanish)
  }

  const handleDontKnow = () => {
    setResult('wrong')
    setShowResult(true)
    speak(word.spanish)
  }

  const handleContinue = () => {
    const resultValue = result === 'correct' ? true : result === 'wrong' ? false : null
    onResult(resultValue)
    setInput('')
    setShowResult(false)
  }

  const getResultStyles = () => {
    switch (result) {
      case 'correct':
        return {
          bg: 'bg-olive/5 border border-olive/30',
          text: 'text-olive-dark',
          title: 'Richtig!',
        }
      case 'close':
        return {
          bg: 'bg-amber-50 border border-amber-300/50',
          text: 'text-amber-700',
          title: 'Fast richtig!',
        }
      case 'wrong':
        return {
          bg: 'bg-rose-muted/10 border border-rose-muted/30',
          text: 'text-rose-dark',
          title: 'Nicht ganz...',
        }
    }
  }

  const styles = getResultStyles()

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
            autoCapitalize="none"
            autoCorrect="off"
            spellcheck={false}
            inputMode="text"
            lang="es"
            data-form-type="other"
            data-lpignore="true"
            enterKeyHint="done"
          />
          <button
            type="submit"
            class="btn btn-primary w-full py-3"
            disabled={!input.trim()}
          >
            Prüfen
          </button>
          <button
            type="button"
            onClick={handleDontKnow}
            class="btn w-full py-3 bg-warm-cream border border-warm-gray/20 text-warm-gray hover:bg-sand hover:border-warm-gray/30"
          >
            Weiß ich nicht
          </button>
        </form>
      ) : (
        <div class="space-y-4">
          <div class={`card ${styles.bg}`}>
            <div class="text-center py-4">
              <p class={`text-xl font-semibold mb-4 ${styles.text}`}>
                {styles.title}
              </p>

              {result !== 'correct' && (
                <div class="mb-4">
                  <p class="text-sm text-warm-gray">Deine Antwort:</p>
                  <p class={`text-lg ${result === 'close' ? 'text-amber-600' : 'text-rose-dark'} ${result === 'wrong' ? 'line-through' : ''}`}>
                    {input}
                  </p>
                </div>
              )}

              {result === 'close' && (
                <p class="text-sm text-amber-600 mb-4">
                  Achte auf die genaue Schreibweise
                </p>
              )}

              <p class="text-sm text-warm-gray">
                {result === 'correct' ? 'Die Antwort:' : 'Richtige Antwort:'}
              </p>
              <p class="text-2xl font-serif font-medium text-terracotta mt-1">{word.spanish}</p>

              <button
                onClick={() => speak(word.spanish)}
                class="mt-3 px-4 py-2 text-sm text-warm-gray hover:text-warm-brown hover:bg-white/50 rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <SpeakerIcon class="w-4 h-4" />
                Anhören
              </button>

              <div class="mt-4 space-y-1">
                <button
                  onClick={() => speak(word.example)}
                  class="text-base font-serif text-warm-gray italic hover:text-terracotta transition-colors flex items-center gap-1 mx-auto group"
                  title="Beispielsatz anhören"
                >
                  <SpeakerIcon class="w-3 h-3 opacity-50 group-hover:opacity-100 shrink-0" />
                  <span>„{word.example}"</span>
                </button>
                <p class="text-sm text-warm-gray/60 italic">{word.exampleDe}</p>
              </div>
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
