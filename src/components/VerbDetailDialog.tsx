import { useState, useEffect } from 'preact/hooks'
import { createPortal } from 'preact/compat'
import type { Tense, WordWithCategory } from '../types'
import { ConjugationTable } from './ConjugationTable'
import { getConjugationExplanation } from '../utils/conjugation'
import { useSpeech } from '../hooks/useSpeech'
import { SpeakerIcon } from './SpeakerIcon'

interface Props {
  verb: WordWithCategory
  onClose: () => void
}

const allTenses: Tense[] = ['presente', 'indefinido', 'imperfecto', 'futuro']

export function VerbDetailDialog({ verb, onClose }: Props) {
  const [selectedTense, setSelectedTense] = useState<Tense>('presente')
  const { speak } = useSpeech()

  // Prevent body scroll when dialog is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const getVerbTypeLabel = () => {
    if (verb.isRegular) {
      return (
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-olive/10 text-olive text-sm font-medium">
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
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium">
          Stammvokaländerung: {changeLabels[verb.stemChange]}
        </span>
      )
    }
    return (
      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-dusty-rose/20 text-dusty-rose text-sm font-medium">
        Unregelmäßig
      </span>
    )
  }

  return createPortal(
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div class="absolute inset-0 bg-warm-brown/30 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div class="relative bg-sand w-full max-w-lg max-h-[90vh] overflow-hidden rounded-2xl shadow-xl flex flex-col">
        {/* Header */}
        <div class="p-6 border-b border-sand-200 bg-white">
          <div class="flex items-start justify-between gap-4">
            <div class="space-y-2">
              <div class="flex items-center gap-3">
                <h2 class="text-2xl font-serif font-medium text-warm-brown">{verb.spanish}</h2>
                <button
                  onClick={() => speak(verb.spanish)}
                  class="p-2 text-warm-gray/50 hover:text-terracotta transition-colors"
                >
                  <SpeakerIcon class="w-5 h-5" />
                </button>
              </div>
              <p class="text-warm-gray">{verb.german}</p>
              {getVerbTypeLabel()}
            </div>
            <button
              onClick={onClose}
              class="p-2 text-warm-gray hover:text-warm-brown hover:bg-sand-100 rounded-lg transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tense Tabs */}
        <div class="px-4 pt-4 bg-sand-50 border-b border-sand-200">
          <div class="flex gap-1 overflow-x-auto pb-px">
            {allTenses.map((tense) => (
              <button
                key={tense}
                onClick={() => setSelectedTense(tense)}
                class={`
                  px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap transition-colors
                  ${selectedTense === tense
                    ? 'bg-white text-terracotta border-t border-l border-r border-sand-200 -mb-px'
                    : 'text-warm-gray hover:text-warm-brown hover:bg-sand-100'
                  }
                `}
              >
                {tense === 'presente' && 'Presente'}
                {tense === 'indefinido' && 'Indefinido'}
                {tense === 'imperfecto' && 'Imperfecto'}
                {tense === 'futuro' && 'Futuro'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Konjugationstabelle */}
          <div class="bg-white rounded-xl p-4 border border-sand-200">
            <ConjugationTable verb={verb} tense={selectedTense} />
          </div>

          {/* Erklärung */}
          <div class="bg-sand-50 rounded-xl p-4 border border-sand-200">
            <h4 class="text-sm font-medium text-warm-brown mb-2">Erklärung</h4>
            <p class="text-sm text-warm-gray whitespace-pre-line">
              {getConjugationExplanation(verb, selectedTense)}
            </p>
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
        </div>

        {/* Footer */}
        <div class="p-4 border-t border-sand-200 bg-white">
          <button onClick={onClose} class="btn btn-secondary w-full">
            Schließen
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
