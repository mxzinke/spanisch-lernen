import { useState, useEffect } from 'preact/hooks'
import type { Person, WordWithCategory } from '../types'
import { ConjugationTable } from './ConjugationTable'
import {
  conjugateVerb,
  selectRandomPersons,
  checkConjugationAnswer,
  getConjugationExplanation,
} from '../utils/conjugation'
import { useSpeech } from '../hooks/useSpeech'
import { SpeakerIcon } from './SpeakerIcon'

type Phase = 'infinitive' | 'conjugate' | 'result'

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

  // Wähle 2 zufällige Personen beim Laden
  useEffect(() => {
    setSelectedPersons(selectRandomPersons(2))
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
              w-full px-4 py-3 text-lg text-center rounded-lg border-2 transition-colors
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
      <div class="space-y-6">
        <div class="text-center space-y-2">
          <p class="text-sm text-warm-gray">Konjugiere im Presente:</p>
          <div class="flex items-center justify-center gap-3">
            <p class="text-2xl font-serif font-medium text-terracotta">{verb.spanish}</p>
            <button
              onClick={() => speak(verb.spanish)}
              class="p-2 text-warm-gray/50 hover:text-terracotta transition-colors"
            >
              <SpeakerIcon class="w-5 h-5" />
            </button>
          </div>
          <p class="text-sm text-warm-gray/70">({verb.german})</p>
        </div>

        <div class="bg-white rounded-xl p-4 border border-sand-200">
          <p class="text-xs text-warm-gray/70 mb-3 text-center">
            Fülle die markierten Formen aus:
          </p>
          <div onKeyDown={handleConjugationKeyDown}>
            <ConjugationTable
              verb={verb}
              tense="presente"
              highlightPersons={selectedPersons}
              inputMode={true}
              userInputs={userInputs}
              onInputChange={handleInputChange}
            />
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
    <div class="space-y-6">
      <div class="text-center space-y-3">
        {overallCorrect ? (
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-olive/10 text-olive">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span class="font-medium">Richtig!</span>
          </div>
        ) : (
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dusty-rose/20 text-dusty-rose">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span class="font-medium">Noch nicht ganz</span>
          </div>
        )}

        <div class="flex items-center justify-center gap-3">
          <p class="text-2xl font-serif font-medium text-terracotta">{verb.spanish}</p>
          <button
            onClick={() => speak(verb.spanish)}
            class="p-2 text-warm-gray/50 hover:text-terracotta transition-colors"
          >
            <SpeakerIcon class="w-5 h-5" />
          </button>
        </div>

        <div class="flex justify-center">{getVerbTypeLabel()}</div>
      </div>

      {/* Alle Konjugationen anzeigen */}
      <div class="bg-white rounded-xl p-4 border border-sand-200">
        <ConjugationTable
          verb={verb}
          tense="presente"
          highlightPersons={selectedPersons}
          showResults={true}
          results={results}
          userInputs={userInputs}
        />
      </div>

      {/* Erklärung */}
      <div class="bg-sand-50 rounded-xl p-4 border border-sand-200">
        <h4 class="text-sm font-medium text-warm-brown mb-2">Erklärung</h4>
        <p class="text-sm text-warm-gray whitespace-pre-line">{getConjugationExplanation(verb)}</p>
      </div>

      {/* Beispielsatz */}
      <button
        onClick={() => speak(verb.example)}
        class="w-full p-4 bg-white hover:bg-sand-50 rounded-xl border border-sand-200 text-left transition-colors group"
      >
        <p class="text-xs text-warm-gray/70 mb-1">Beispiel:</p>
        <p class="font-serif text-warm-brown group-hover:text-terracotta flex items-center gap-2 transition-colors">
          <SpeakerIcon class="w-4 h-4 opacity-50 group-hover:opacity-100 shrink-0" />
          <span>„{verb.example}"</span>
        </p>
        <p class="text-sm text-warm-gray/70 mt-1 ml-6">{verb.exampleDe}</p>
      </button>

      <button onClick={handleFinish} class="btn btn-primary w-full py-3">
        Weiter
      </button>
    </div>
  )
}
