import { useState, useEffect, useMemo } from 'preact/hooks'
import { createPortal } from 'preact/compat'
import type { CustomWord, VerbEnding } from '../types'
import { findExistingWord, type ExistingWordInfo } from '../data/vocabulary'
import { useUserLevel } from '../hooks/useUserLevel'
import { useProgress } from '../hooks/useProgress'

const MIN_LEVEL_FOR_VERBS = 3

interface Props {
  onSave: (word: Omit<CustomWord, 'id' | 'createdAt'>) => void
  onClose: () => void
  existingWord?: CustomWord // For editing
  hasCustomWord: (spanish: string) => boolean
}

export function AddCustomWord({ onSave, onClose, existingWord, hasCustomWord }: Props) {
  const [spanish, setSpanish] = useState(existingWord?.spanish || '')
  const [german, setGerman] = useState(existingWord?.german || '')
  const [example, setExample] = useState(existingWord?.example || '')
  const [exampleDe, setExampleDe] = useState(existingWord?.exampleDe || '')
  const [isVerb, setIsVerb] = useState(existingWord?.type === 'verb')
  const [verbEnding, setVerbEnding] = useState<VerbEnding>(existingWord?.verbEnding || 'ar')
  const [error, setError] = useState('')

  const { progress } = useProgress()
  const { currentLevel, unlockedCategoryIds } = useUserLevel(progress)
  const canAddVerbs = currentLevel >= MIN_LEVEL_FOR_VERBS

  // Check for existing word in vocabulary
  const existingInVocabulary: ExistingWordInfo | null = useMemo(() => {
    if (!spanish.trim()) return null
    return findExistingWord(spanish)
  }, [spanish])

  // Check if word is in a future (locked) category
  const isInFutureCategory = useMemo(() => {
    if (!existingInVocabulary) return false
    return !unlockedCategoryIds.includes(existingInVocabulary.word.category)
  }, [existingInVocabulary, unlockedCategoryIds])

  // Prevent body scroll when dialog is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const handleSubmit = (e: Event) => {
    e.preventDefault()
    setError('')

    const trimmedSpanish = spanish.trim()
    const trimmedGerman = german.trim()

    if (!trimmedSpanish) {
      setError('Bitte gib das spanische Wort ein.')
      return
    }
    if (!trimmedGerman) {
      setError('Bitte gib die deutsche Übersetzung ein.')
      return
    }

    // Check for duplicate in custom words (when adding new or changing the spanish word)
    const spanishChanged = existingWord && trimmedSpanish.toLowerCase() !== existingWord.spanish.toLowerCase()
    if ((!existingWord || spanishChanged) && hasCustomWord(trimmedSpanish)) {
      setError('Diese Vokabel existiert bereits in deinen eigenen Vokabeln.')
      return
    }

    // Validate verb ending
    if (isVerb && canAddVerbs) {
      const lowerSpanish = trimmedSpanish.toLowerCase()
      if (!lowerSpanish.endsWith('ar') && !lowerSpanish.endsWith('er') && !lowerSpanish.endsWith('ir')) {
        setError('Ein Verb muss auf -ar, -er oder -ir enden.')
        return
      }
    }

    const wordData: Omit<CustomWord, 'id' | 'createdAt'> = {
      spanish: trimmedSpanish,
      german: trimmedGerman,
      example: example.trim() || undefined,
      exampleDe: exampleDe.trim() || undefined,
    }

    // Add verb fields if it's a verb
    if (isVerb && canAddVerbs) {
      wordData.type = 'verb'
      wordData.verbEnding = verbEnding
      wordData.isRegular = true // Custom verbs are always regular
    }

    onSave(wordData)
  }

  // Auto-detect verb ending from spanish word
  useEffect(() => {
    if (isVerb && spanish.trim()) {
      const lowerSpanish = spanish.toLowerCase().trim()
      if (lowerSpanish.endsWith('ar')) {
        setVerbEnding('ar')
      } else if (lowerSpanish.endsWith('er')) {
        setVerbEnding('er')
      } else if (lowerSpanish.endsWith('ir')) {
        setVerbEnding('ir')
      }
    }
  }, [spanish, isVerb])

  return createPortal(
    <div class="fixed inset-0 z-50 flex items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div class="hidden sm:block absolute inset-0 bg-warm-brown/30 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div class="relative bg-white w-full h-full sm:h-auto sm:max-w-lg sm:max-h-[90vh] sm:rounded-2xl shadow-xl flex flex-col">
        {/* Header */}
        <div class="p-4 sm:p-6 border-b border-sand-200 bg-white shrink-0">
          <div class="flex items-start justify-between gap-4">
            <h2 class="text-xl font-serif font-medium text-warm-brown">
              {existingWord ? 'Vokabel bearbeiten' : 'Neue Vokabel hinzufügen'}
            </h2>
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

        {/* Form */}
        <form onSubmit={handleSubmit} class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-sand-50">
          {/* Spanish */}
          <div class="space-y-1">
            <label class="block text-sm font-medium text-warm-brown">
              Spanisch <span class="text-dusty-rose">*</span>
            </label>
            <input
              type="text"
              value={spanish}
              onInput={(e) => setSpanish((e.target as HTMLInputElement).value)}
              placeholder="z.B. el libro"
              class="input"
              autoFocus
            />
          </div>

          {/* Duplicate warning */}
          {existingInVocabulary && (
            <div
              class={`p-3 rounded-lg border ${
                isInFutureCategory
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-olive/10 border-olive/20 text-olive'
              }`}
            >
              <div class="flex items-start gap-2">
                <svg class="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div class="text-sm">
                  {isInFutureCategory ? (
                    <>
                      <p class="font-medium">Diese Vokabel wird in Level {existingInVocabulary.level} verfügbar</p>
                      <p class="mt-1">
                        „{existingInVocabulary.word.spanish}" ist in der Kategorie „
                        {existingInVocabulary.categoryName}" enthalten (du bist auf Level {currentLevel}).
                      </p>
                      <p class="mt-1 text-amber-600">
                        Du kannst sie trotzdem als eigene Vokabel hinzufügen, um sie jetzt schon zu üben.
                      </p>
                    </>
                  ) : (
                    <>
                      <p class="font-medium">Diese Vokabel existiert bereits</p>
                      <p class="mt-1">
                        „{existingInVocabulary.word.spanish}" ({existingInVocabulary.word.german}) ist in der
                        Kategorie „{existingInVocabulary.categoryName}" bereits freigeschaltet.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* German */}
          <div class="space-y-1">
            <label class="block text-sm font-medium text-warm-brown">
              Deutsch <span class="text-dusty-rose">*</span>
            </label>
            <input
              type="text"
              value={german}
              onInput={(e) => setGerman((e.target as HTMLInputElement).value)}
              placeholder="z.B. das Buch"
              class="input"
            />
          </div>

          {/* Verb option - only available from Level 3 */}
          {canAddVerbs && (
            <div class="space-y-3 p-3 rounded-lg bg-white border border-sand-200">
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVerb}
                  onChange={(e) => setIsVerb((e.target as HTMLInputElement).checked)}
                  class="w-5 h-5 rounded border-sand-300 text-terracotta focus:ring-terracotta"
                />
                <span class="text-sm font-medium text-warm-brown">Dies ist ein Verb</span>
              </label>

              {isVerb && (
                <div class="space-y-2 pl-8">
                  <p class="text-xs text-warm-gray">
                    Das Verb wird automatisch konjugiert (regelmäßig). Die Endung wird aus dem Infinitiv erkannt.
                  </p>
                  <div class="flex items-center gap-2 text-sm">
                    <span class="text-warm-gray">Erkannte Endung:</span>
                    <span class="px-2 py-0.5 bg-terracotta/10 text-terracotta rounded font-medium">
                      -{verbEnding}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Hint for users below Level 3 */}
          {!canAddVerbs && (
            <div class="p-3 rounded-lg bg-sand-100 border border-sand-200 text-sm text-warm-gray">
              Ab Level {MIN_LEVEL_FOR_VERBS} kannst du auch eigene Verben hinzufügen, die dann in Konjugationsübungen erscheinen.
            </div>
          )}

          {/* Example */}
          <div class="space-y-1">
            <label class="block text-sm font-medium text-warm-brown">
              Beispielsatz <span class="text-warm-gray">(optional)</span>
            </label>
            <input
              type="text"
              value={example}
              onInput={(e) => setExample((e.target as HTMLInputElement).value)}
              placeholder="z.B. Leo un libro interesante."
              class="input"
            />
          </div>

          {/* Example German */}
          <div class="space-y-1">
            <label class="block text-sm font-medium text-warm-brown">
              Beispielsatz (Deutsch) <span class="text-warm-gray">(optional)</span>
            </label>
            <input
              type="text"
              value={exampleDe}
              onInput={(e) => setExampleDe((e.target as HTMLInputElement).value)}
              placeholder="z.B. Ich lese ein interessantes Buch."
              class="input"
            />
          </div>

          {/* Error */}
          {error && (
            <div class="p-3 rounded-lg bg-dusty-rose/10 border border-dusty-rose/20 text-dusty-rose text-sm">
              {error}
            </div>
          )}
        </form>

        {/* Footer */}
        <div class="p-4 border-t border-sand-200 bg-white shrink-0 flex gap-3">
          <button type="button" onClick={onClose} class="btn btn-secondary flex-1">
            Abbrechen
          </button>
          <button type="submit" onClick={handleSubmit} class="btn btn-primary flex-1">
            {existingWord ? 'Speichern' : 'Hinzufügen'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
