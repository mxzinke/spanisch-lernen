import { useState, useEffect } from 'preact/hooks'
import type { Person, WordWithCategory } from '../types'
import { ConjugationTable } from './ConjugationTable'
import {
  conjugateVerb,
  selectRandomPersons,
  checkConjugationAnswer,
} from '../utils/conjugation'
import { useSpeech } from '../hooks/useSpeech'
import { SpeakerIcon } from './SpeakerIcon'

type Phase = 'infinitive' | 'conjugate' | 'result'

const personLabels: Record<Person, string> = {
  'yo': 'yo',
  'tú': 'tú',
  'él/ella': 'él/ella',
  'nosotros': 'nosotros',
  'vosotros': 'vosotros',
  'ellos': 'ellos/ellas',
}

interface Props {
  verb: WordWithCategory
  onResult: (correct: boolean) => void
}

export function ConjugationExercise({ verb, onResult }: Props) {
  const [phase, setPhase] = useState<Phase>('infinitive')
  const [infinitiveInput, setInfinitiveInput] = useState('')
  const [infinitiveResult, setInfinitiveResult] = useState<'correct' | 'almost' | 'wrong' | null>(null)
  const [selectedPersons, setSelectedPersons] = useState<Person[]>([])
  const [userInputs, setUserInputs] = useState<Partial<Record<Person, string>>>({})
  const [results, setResults] = useState<Partial<Record<Person, 'correct' | 'almost' | 'wrong'>>>({})
  const [overallCorrect, setOverallCorrect] = useState(false)

  const { speak } = useSpeech()
  const forms = conjugateVerb(verb, 'presente')

  // Reset alle States wenn ein neues Verb kommt
  useEffect(() => {
    setPhase('infinitive')
    setInfinitiveInput('')
    setInfinitiveResult(null)
    setSelectedPersons(selectRandomPersons(2))
    setUserInputs({})
    setResults({})
    setOverallCorrect(false)
  }, [verb.id])

  const handleInfinitiveSubmit = () => {
    const result = checkConjugationAnswer(infinitiveInput, verb.spanish)
    setInfinitiveResult(result)

    if (result === 'correct' || result === 'almost') {
      // Kurze Verzögerung, dann zur Konjugationsphase
      setTimeout(() => {
        speak(verb.spanish)
        setPhase('conjugate')
      }, 800)
    }
  }

  const handleInfinitiveKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (infinitiveResult === 'wrong') {
        // Bei falsch: zur Konjugationsphase wechseln (Verb trotzdem lernen)
        speak(verb.spanish)
        setPhase('conjugate')
      } else if (!infinitiveResult) {
        handleInfinitiveSubmit()
      }
    }
  }

  const handleInputChange = (person: Person, value: string) => {
    setUserInputs((prev) => ({ ...prev, [person]: value }))
  }

  const handleConjugationSubmit = () => {
    const newResults: Partial<Record<Person, 'correct' | 'almost' | 'wrong'>> = {}
    let allCorrect = true

    for (const person of selectedPersons) {
      const userAnswer = userInputs[person] || ''
      const correctAnswer = forms[person]
      const result = checkConjugationAnswer(userAnswer, correctAnswer)
      newResults[person] = result
      if (result === 'wrong') {
        allCorrect = false
      }
    }

    setResults(newResults)
    setOverallCorrect(allCorrect && infinitiveResult !== 'wrong')
    setPhase('result')

    // Sprich das Verb vor
    setTimeout(() => speak(verb.spanish), 300)
  }

  const handleConjugationKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleConjugationSubmit()
    }
  }

  const handleFinish = () => {
    onResult(overallCorrect)
  }

  const getVerbTypeLabel = () => {
    if (verb.isRegular) {
      return (
        <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-olive/10 text-olive text-xs font-medium">
          Regelmäßig -{verb.verbEnding?.toUpperCase()}
        </span>
      )
    }
    if (verb.stemChange) {
      const changeLabels: Record<string, string> = {
        'e>ie': 'e → ie',
        'o>ue': 'o → ue',
        'e>i': 'e → i',
        'u>ue': 'u → ue',
      }
      return (
        <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
          Stammvokaländerung: {changeLabels[verb.stemChange]}
        </span>
      )
    }
    return (
      <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-dusty-rose/20 text-dusty-rose text-xs font-medium">
        Unregelmäßig
      </span>
    )
  }

  // Phase 1: Infinitiv abfragen
  if (phase === 'infinitive') {
    return (
      <div class="space-y-6">
        <div class="text-center space-y-2">
          <p class="text-sm text-warm-gray">Wie lautet der Infinitiv?</p>
          <p class="text-2xl font-serif font-medium text-warm-brown">{verb.german}</p>
        </div>

        <div class="bg-white rounded-xl p-6 border border-sand-200 space-y-4">
          <input
            type="text"
            value={infinitiveInput}
            onInput={(e) => setInfinitiveInput((e.target as HTMLInputElement).value)}
            onKeyDown={handleInfinitiveKeyDown}
            class={`
              w-full px-4 py-3 text-[16px] text-center rounded-lg border-2 transition-colors
              focus:outline-none
              ${infinitiveResult === 'correct' ? 'border-olive bg-olive/5' : ''}
              ${infinitiveResult === 'almost' ? 'border-amber-400 bg-amber-50' : ''}
              ${infinitiveResult === 'wrong' ? 'border-dusty-rose bg-dusty-rose/5' : ''}
              ${!infinitiveResult ? 'border-sand-200 focus:border-terracotta' : ''}
            `}
            placeholder="Verb eingeben..."
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellcheck={false}
            autoFocus
          />

          {infinitiveResult && (
            <div class="text-center space-y-2">
              {infinitiveResult === 'correct' && (
                <p class="text-olive font-medium">Richtig!</p>
              )}
              {infinitiveResult === 'almost' && (
                <p class="text-amber-600 font-medium">
                  Fast richtig! Achte auf die Akzente: <span class="font-serif">{verb.spanish}</span>
                </p>
              )}
              {infinitiveResult === 'wrong' && (
                <p class="text-dusty-rose font-medium">
                  Die richtige Antwort ist: <span class="font-serif text-lg">{verb.spanish}</span>
                </p>
              )}
            </div>
          )}
        </div>

        {!infinitiveResult && (
          <div class="flex gap-3">
            <button
              onClick={() => {
                setInfinitiveResult('wrong')
              }}
              class="btn btn-secondary flex-1 py-3"
            >
              Weiß nicht
            </button>
            <button onClick={handleInfinitiveSubmit} class="btn btn-primary flex-1 py-3">
              Prüfen
            </button>
          </div>
        )}

        {infinitiveResult === 'wrong' && (
          <button
            onClick={() => {
              speak(verb.spanish)
              setPhase('conjugate')
            }}
            class="btn btn-primary w-full py-3"
          >
            Weiter zur Konjugation
          </button>
        )}
      </div>
    )
  }

  // Phase 2: Konjugation ausfüllen
  if (phase === 'conjugate') {
    return (
      <div class="space-y-5">
        {/* Verb-Header */}
        <div class="text-center">
          <p class="text-xs text-warm-gray/70 mb-2 uppercase tracking-wide">Konjugiere im Presente</p>
          <div class="flex items-center justify-center gap-2">
            <p class="text-2xl font-serif font-medium text-terracotta">{verb.spanish}</p>
            <button
              onClick={() => speak(verb.spanish)}
              class="p-1.5 text-warm-gray/40 hover:text-terracotta transition-colors"
            >
              <SpeakerIcon class="w-4 h-4" />
            </button>
          </div>
          <p class="text-sm text-warm-gray mt-1">{verb.german}</p>
        </div>

        {/* Fokussierte Eingabe nur für abgefragte Formen */}
        <div class="bg-white rounded-xl border border-sand-200 overflow-hidden" onKeyDown={handleConjugationKeyDown}>
          <div class="divide-y divide-sand-100">
            {selectedPersons.map((person, index) => (
              <div key={person} class="px-4 py-4">
                <div class="flex items-center gap-4">
                  {/* Person-Label */}
                  <div class="w-24 shrink-0">
                    <span class="text-sm text-warm-gray">{personLabels[person]}</span>
                  </div>

                  {/* Input-Feld */}
                  <div class="flex-1">
                    <input
                      type="text"
                      value={userInputs[person] || ''}
                      onInput={(e) => handleInputChange(person, (e.target as HTMLInputElement).value)}
                      class="w-full px-3 py-2.5 text-base rounded-lg border-2 border-sand-200 transition-colors focus:outline-none focus:border-terracotta"
                      placeholder="..."
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellcheck={false}
                      autoFocus={index === 0}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleConjugationSubmit} class="btn btn-primary w-full py-3">
          Prüfen
        </button>
      </div>
    )
  }

  // Phase 3: Ergebnis
  return (
    <div class="space-y-5">
      {/* Verb-Header */}
      <div class="text-center">
        <div class="flex items-center justify-center gap-2 mb-1">
          <p class="text-2xl font-serif font-medium text-terracotta">{verb.spanish}</p>
          <button
            onClick={() => speak(verb.spanish)}
            class="p-1.5 text-warm-gray/40 hover:text-terracotta transition-colors"
          >
            <SpeakerIcon class="w-4 h-4" />
          </button>
        </div>
        <p class="text-sm text-warm-gray">{verb.german}</p>
      </div>

      {/* Ergebnis-Karte - fokussiert auf die abgefragten Formen */}
      <div class="bg-white rounded-xl border border-sand-200 overflow-hidden">
        {/* Status-Header */}
        <div
          class={`px-4 py-3 ${overallCorrect ? 'bg-olive/10' : 'bg-dusty-rose/10'}`}
        >
          <div class="flex items-center justify-center gap-2">
            {overallCorrect ? (
              <>
                <svg class="w-5 h-5 text-olive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="font-medium text-olive">Richtig!</span>
              </>
            ) : (
              <>
                <svg class="w-5 h-5 text-dusty-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01" />
                  <circle cx="12" cy="12" r="10" stroke-width="2" fill="none" />
                </svg>
                <span class="font-medium text-dusty-rose">Schau nochmal</span>
              </>
            )}
          </div>
        </div>

        {/* Abgefragte Formen mit Ergebnis */}
        <div class="divide-y divide-sand-100">
          {selectedPersons.map((person) => {
            const result = results[person]
            const correctForm = forms[person]
            const userAnswer = userInputs[person] || ''
            const isCorrect = result === 'correct'
            const isAlmost = result === 'almost'

            return (
              <div key={person} class="px-4 py-4">
                <div class="flex items-start justify-between gap-4">
                  {/* Person-Label */}
                  <div class="w-24 shrink-0">
                    <span class="text-sm text-warm-gray">{personLabels[person]}</span>
                  </div>

                  {/* Antwort-Bereich */}
                  <div class="flex-1 text-right">
                    {isCorrect ? (
                      <div class="flex items-center justify-end gap-2">
                        <span class="font-serif text-lg text-olive font-medium">{correctForm}</span>
                        <svg class="w-4 h-4 text-olive shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : isAlmost ? (
                      <div class="space-y-1">
                        <div class="flex items-center justify-end gap-2">
                          <span class="font-serif text-lg text-amber-600 font-medium">{correctForm}</span>
                          <span class="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Akzente</span>
                        </div>
                        <p class="text-sm text-warm-gray/60">Deine Eingabe: {userAnswer}</p>
                      </div>
                    ) : (
                      <div class="space-y-1">
                        <div class="flex items-center justify-end gap-2">
                          <span class="font-serif text-lg text-warm-brown font-medium">{correctForm}</span>
                        </div>
                        {userAnswer && (
                          <p class="text-sm text-dusty-rose line-through">{userAnswer}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Verb-Info (kompakt) */}
      <div class="flex items-center justify-center gap-2">
        {getVerbTypeLabel()}
      </div>

      {/* Vollständige Konjugation (eingeklappt) */}
      <details class="group">
        <summary class="flex items-center justify-center gap-2 py-2 text-sm text-warm-gray cursor-pointer hover:text-warm-brown transition-colors">
          <span>Alle Formen anzeigen</span>
          <svg class="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </summary>
        <div class="mt-3 bg-white rounded-xl p-4 border border-sand-200">
          <ConjugationTable
            verb={verb}
            tense="presente"
            highlightPersons={selectedPersons}
            showResults={true}
            results={results}
            userInputs={userInputs}
          />
        </div>
      </details>

      {/* Beispielsatz (subtiler) */}
      <button
        onClick={() => speak(verb.example)}
        class="w-full p-3 bg-sand-50 hover:bg-sand-100 rounded-lg text-left transition-colors group"
      >
        <div class="flex items-start gap-2">
          <SpeakerIcon class="w-4 h-4 text-warm-gray/40 group-hover:text-terracotta mt-0.5 shrink-0 transition-colors" />
          <div class="min-w-0">
            <p class="font-serif text-warm-brown text-sm">„{verb.example}"</p>
            <p class="text-xs text-warm-gray/60 mt-0.5">{verb.exampleDe}</p>
          </div>
        </div>
      </button>

      <button onClick={handleFinish} class="btn btn-primary w-full py-3">
        Weiter
      </button>
    </div>
  )
}
