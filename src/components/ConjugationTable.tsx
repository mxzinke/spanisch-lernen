import type { Person, Tense, WordWithCategory } from '../types'
import { conjugateVerb, allPersons, personWithGender, tenseLabels } from '../utils/conjugation'
import { useSpeech } from '../hooks/useSpeech'
import { SpeakerIcon } from './SpeakerIcon'

interface Props {
  verb: WordWithCategory
  tense?: Tense
  showTenseLabel?: boolean
  highlightPersons?: Person[]
  inputMode?: boolean
  userInputs?: Partial<Record<Person, string>>
  onInputChange?: (person: Person, value: string) => void
  showResults?: boolean
  results?: Partial<Record<Person, 'correct' | 'almost' | 'wrong'>>
}

export function ConjugationTable({
  verb,
  tense = 'presente',
  showTenseLabel = false,
  highlightPersons = [],
  inputMode = false,
  userInputs = {},
  onInputChange,
  showResults = false,
  results = {},
}: Props) {
  const { speak } = useSpeech()
  const forms = conjugateVerb(verb, tense)

  const getResultStyles = (person: Person) => {
    if (!showResults || !results[person]) return ''
    switch (results[person]) {
      case 'correct':
        return 'bg-olive/10 border-olive'
      case 'almost':
        return 'bg-amber-50 border-amber-400'
      case 'wrong':
        return 'bg-dusty-rose/20 border-dusty-rose'
      default:
        return ''
    }
  }

  const handleSpeak = (form: string) => {
    speak(form)
  }

  return (
    <div class="space-y-2">
      {showTenseLabel && (
        <h4 class="text-sm font-medium text-warm-gray mb-3">{tenseLabels[tense]}</h4>
      )}
      <div class="grid gap-2">
        {allPersons.map((person) => {
          const isVosotros = person === 'vosotros'
          const isHighlighted = highlightPersons.includes(person)
          const isInput = inputMode && isHighlighted && !isVosotros
          const form = forms[person]

          return (
            <div
              key={person}
              class={`
                flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border transition-all
                ${isVosotros ? 'opacity-40 bg-warm-gray/5 border-warm-gray/10' : 'bg-white border-sand-200'}
                ${isHighlighted && !isVosotros ? 'ring-2 ring-terracotta/30' : ''}
                ${showResults ? getResultStyles(person) : ''}
              `}
            >
              {/* Person label */}
              <div class="w-20 sm:w-28 shrink-0">
                <span class={`text-xs sm:text-sm ${isVosotros ? 'text-warm-gray/50' : 'text-warm-gray'}`}>
                  {personWithGender[person]}
                </span>
              </div>

              {/* Conjugated form or input */}
              <div class="flex-1 min-w-0">
                {isInput && !showResults ? (
                  <input
                    type="text"
                    value={userInputs[person] || ''}
                    onInput={(e) => onInputChange?.(person, (e.target as HTMLInputElement).value)}
                    class={`
                      w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg border-2 transition-colors
                      focus:outline-none focus:border-terracotta
                      ${results[person] === 'wrong' ? 'border-dusty-rose' : 'border-sand-200'}
                    `}
                    placeholder="..."
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellcheck={false}
                  />
                ) : (
                  <div class="flex items-center gap-1 sm:gap-2 flex-wrap">
                    <span
                      class={`
                        font-medium font-serif text-base sm:text-lg
                        ${isVosotros ? 'text-warm-gray/50' : 'text-warm-brown'}
                        ${showResults && results[person] === 'correct' ? 'text-olive' : ''}
                        ${showResults && results[person] === 'wrong' ? 'text-dusty-rose' : ''}
                      `}
                    >
                      {form}
                    </span>
                    {showResults && isHighlighted && results[person] === 'wrong' && userInputs[person] && (
                      <span class="text-xs sm:text-sm text-dusty-rose line-through">
                        ({userInputs[person]})
                      </span>
                    )}
                    {showResults && results[person] === 'almost' && (
                      <span class="text-xs text-amber-600">
                        (Akzente!)
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Speaker button */}
              {!isInput && !isVosotros && (
                <button
                  onClick={() => handleSpeak(form)}
                  class="p-1.5 sm:p-2 text-warm-gray/50 hover:text-terracotta transition-colors shrink-0"
                  title="Anhören"
                >
                  <SpeakerIcon class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
