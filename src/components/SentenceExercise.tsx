import { useState } from 'preact/hooks'
import { useSpeech } from '../hooks/useSpeech'
import type { GeneratedSentence } from '../types'
import { SpeakerIcon } from './SpeakerIcon'

interface Props {
  sentence: GeneratedSentence
  onResult: (correct: boolean) => void
}

type AnswerResult = 'correct' | 'close' | 'wrong'

// Normalisiere Text für Vergleich
function normalize(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Entferne Akzente
    .replace(/[¿¡.,!?]/g, '') // Entferne Satzzeichen
    .replace(/\s+/g, ' ') // Normalisiere Leerzeichen
}

// Levenshtein-Distanz für "fast richtig" Erkennung
function levenshteinDistance(a: string, b: string): number {
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

function checkSentence(input: string, expected: string): AnswerResult {
  const normalizedInput = normalize(input)
  const normalizedExpected = normalize(expected)

  if (normalizedInput === normalizedExpected) {
    return 'correct'
  }

  // Toleranz: ~20% der Satzlänge, mindestens 3 Zeichen
  const maxDistance = Math.max(3, Math.floor(normalizedExpected.length * 0.2))
  const distance = levenshteinDistance(normalizedInput, normalizedExpected)

  if (distance <= maxDistance) {
    return 'close'
  }

  return 'wrong'
}

export function SentenceExercise({ sentence, onResult }: Props) {
  const [input, setInput] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [result, setResult] = useState<AnswerResult>('wrong')
  const { speak } = useSpeech()

  const handleSubmit = (e: Event) => {
    e.preventDefault()
    if (!input.trim()) return

    const answerResult = checkSentence(input, sentence.spanish)
    setResult(answerResult)
    setShowResult(true)
    speak(sentence.spanish)
  }

  const handleDontKnow = () => {
    setResult('wrong')
    setShowResult(true)
    speak(sentence.spanish)
  }

  const handleContinue = () => {
    // Bei "close" zählt es als richtig, bei "wrong" als falsch
    onResult(result === 'correct' || result === 'close')
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
      {/* Aufgabe */}
      <div class="card text-center py-8">
        <p class="text-sm text-warm-gray mb-3">Übersetze den Satz ins Spanische:</p>
        <p class="text-2xl font-serif font-medium text-warm-brown leading-relaxed">
          {sentence.german}
        </p>

        {/* Verwendete Vokabeln als Hinweis */}
        <div class="mt-6 flex flex-wrap gap-2 justify-center">
          {sentence.usedWords.map((word) => (
            <span
              key={word.id}
              class="px-3 py-1 bg-sand-100 text-warm-gray text-sm rounded-full"
            >
              {word.german}
            </span>
          ))}
        </div>
      </div>

      {!showResult ? (
        <form onSubmit={handleSubmit} class="space-y-4">
          <textarea
            value={input}
            onInput={(e) => setInput((e.target as HTMLTextAreaElement).value)}
            placeholder="Schreibe den spanischen Satz..."
            class="input text-lg min-h-[100px] resize-none"
            autoComplete="off"
            autoCapitalize="sentences"
            autoCorrect="off"
            spellcheck={false}
            lang="es"
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
            Lösung zeigen
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
                  <p
                    class={`text-lg ${result === 'close' ? 'text-amber-600' : 'text-rose-dark'} ${result === 'wrong' ? 'line-through' : ''}`}
                  >
                    {input}
                  </p>
                </div>
              )}

              {result === 'close' && (
                <p class="text-sm text-amber-600 mb-4">
                  Achte auf die genaue Schreibweise und Akzente
                </p>
              )}

              <p class="text-sm text-warm-gray">
                {result === 'correct' ? 'Der Satz:' : 'Richtige Antwort:'}
              </p>
              <p class="text-xl font-serif font-medium text-terracotta mt-1">
                {sentence.spanish}
              </p>

              <button
                type="button"
                onClick={() => speak(sentence.spanish)}
                class="mt-3 px-4 py-2 text-sm text-warm-gray hover:text-warm-brown hover:bg-white/50 rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <SpeakerIcon class="w-4 h-4" />
                Anhören
              </button>

              {/* Verwendete Vokabeln */}
              <div class="mt-6 pt-4 border-t border-warm-gray/10">
                <p class="text-xs text-warm-gray mb-2">Verwendete Vokabeln:</p>
                <div class="flex flex-wrap gap-2 justify-center">
                  {sentence.usedWords.map((word) => (
                    <button
                      key={word.id}
                      type="button"
                      onClick={() => speak(word.spanish)}
                      class="px-3 py-1 bg-sand-100 hover:bg-sand-200 text-warm-gray text-sm rounded-full transition-colors flex items-center gap-1"
                    >
                      <span>{word.spanish}</span>
                      <SpeakerIcon class="w-3 h-3 opacity-50" />
                    </button>
                  ))}
                </div>
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
