import { useMemo, useCallback } from 'preact/hooks'
import type { WordWithCategory, WordProgress, GeneratedSentence, SentenceTemplate } from '../types'
import { allWords } from '../data/vocabulary'
import templatesData from '../../data/sentences/all-templates.json'

const MIN_BOX_FOR_SENTENCE = 4

const allTemplates: SentenceTemplate[] = templatesData.templates as SentenceTemplate[]

interface UseSentenceGeneratorOptions {
  progressMap: Record<string, WordProgress>
  unlockedCategoryIds: string[]
}

export function useSentenceGenerator(options: UseSentenceGeneratorOptions) {
  const { progressMap, unlockedCategoryIds } = options

  // Wörter die in Box 4+ sind (gut gelernt)
  const learnedWords = useMemo(() => {
    return allWords.filter((word) => {
      const progress = progressMap[word.id]
      return (
        progress &&
        progress.box >= MIN_BOX_FOR_SENTENCE &&
        unlockedCategoryIds.includes(word.category)
      )
    })
  }, [progressMap, unlockedCategoryIds])

  // Prüfe ob genug Wörter für Satz-Übungen vorhanden
  const isAvailable = useMemo(() => {
    return learnedWords.length >= 5
  }, [learnedWords])

  // Prüfe ob ein Wort ein Substantiv ist (hat Artikel El/La/Los/Las)
  const isNoun = (word: WordWithCategory): boolean => {
    return /^(El|La|Los|Las)\s+/i.test(word.spanish)
  }

  // Finde ein Wort für einen Slot
  const findWordForSlot = useCallback(
    (slot: { key: string; categories?: string[]; wordIds?: string[] }): WordWithCategory | null => {
      let candidates: WordWithCategory[] = []

      if (slot.wordIds && slot.wordIds.length > 0) {
        // Spezifische Wort-IDs - keine Filterung
        candidates = learnedWords.filter((w) => slot.wordIds!.includes(w.id))
      } else if (slot.categories && slot.categories.length > 0) {
        // Kategorien-basiert - nur Substantive (mit Artikel)
        candidates = learnedWords.filter(
          (w) => slot.categories!.includes(w.category) && isNoun(w)
        )
      }

      if (candidates.length === 0) {
        // Fallback: alle Wörter der Kategorie (auch wenn nicht in Box 4+)
        if (slot.wordIds && slot.wordIds.length > 0) {
          candidates = allWords.filter(
            (w) => slot.wordIds!.includes(w.id) && unlockedCategoryIds.includes(w.category)
          )
        } else if (slot.categories && slot.categories.length > 0) {
          candidates = allWords.filter(
            (w) =>
              slot.categories!.includes(w.category) &&
              unlockedCategoryIds.includes(w.category) &&
              isNoun(w)
          )
        }
      }

      if (candidates.length === 0) return null

      // Zufälliges Wort auswählen
      return candidates[Math.floor(Math.random() * candidates.length)]
    },
    [learnedWords, unlockedCategoryIds]
  )

  // Generiere einen Satz aus einem Template
  const generateSentence = useCallback(
    (template: SentenceTemplate): GeneratedSentence | null => {
      const usedWords: WordWithCategory[] = []
      let german = template.german
      let spanish = template.spanish

      for (const slot of template.slots) {
        const word = findWordForSlot(slot)
        if (!word) return null

        usedWords.push(word)

        // Entferne Artikel und konvertiere zu Kleinbuchstaben für Einfügen mitten im Satz
        const spanishWord = word.spanish
          .replace(/^(El|La|Los|Las)\s+/i, '')
          .toLowerCase()
        const germanWord = word.german
          .replace(/^(Der|Die|Das|Ein|Eine)\s+/i, '')

        german = german.replace(`{${slot.key}}`, germanWord)
        spanish = spanish.replace(`{${slot.key}}`, spanishWord)
      }

      // Ersten Buchstaben des Satzes großschreiben (nach ¿ oder am Anfang)
      spanish = spanish.replace(/^(¿?)(\w)/, (_, prefix, char) => prefix + char.toUpperCase())
      german = german.replace(/^(\w)/, (char) => char.toUpperCase())

      return {
        german,
        spanish,
        usedWords,
        template,
      }
    },
    [findWordForSlot]
  )

  // Generiere mehrere Sätze für eine Session
  const generateSentences = useCallback(
    (count: number = 10): GeneratedSentence[] => {
      // Filtere Templates basierend auf verfügbaren Kategorien
      const availableTemplates = allTemplates.filter((template) => {
        // Template ist verfügbar wenn alle benötigten Kategorien freigeschaltet sind
        return template.slots.every((slot) => {
          if (slot.categories && slot.categories.length > 0) {
            return slot.categories.some((cat) => unlockedCategoryIds.includes(cat))
          }
          // wordIds: prüfe ob mindestens ein Wort aus einer freigeschalteten Kategorie ist
          if (slot.wordIds && slot.wordIds.length > 0) {
            return slot.wordIds.some((id) => {
              const word = allWords.find((w) => w.id === id)
              return word && unlockedCategoryIds.includes(word.category)
            })
          }
          // Leere Slots (statische Sätze) sind immer verfügbar
          return true
        })
      })

      const sentences: GeneratedSentence[] = []
      const usedTemplateIds = new Set<string>()

      // Mische Templates
      const shuffledTemplates = [...availableTemplates].sort(() => Math.random() - 0.5)

      for (const template of shuffledTemplates) {
        if (sentences.length >= count) break

        // Versuche mehrere Variationen pro Template
        const attempts = 3
        for (let i = 0; i < attempts && sentences.length < count; i++) {
          const sentence = generateSentence(template)
          if (sentence) {
            // Prüfe ob genau diese Kombination schon existiert
            const key = `${template.id}-${sentence.usedWords.map((w) => w.id).join('-')}`
            if (!usedTemplateIds.has(key)) {
              usedTemplateIds.add(key)
              sentences.push(sentence)
            }
          }
        }
      }

      return sentences
    },
    [generateSentence, unlockedCategoryIds]
  )

  return {
    isAvailable,
    learnedWordsCount: learnedWords.length,
    generateSentences,
    generateSentence,
  }
}
