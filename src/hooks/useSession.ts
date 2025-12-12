import { useState, useEffect, useCallback } from 'preact/hooks'
import type { ExerciseType, Word, WordWithCategory, WordProgress } from '../types'
import { allWords as defaultAllWords, getAllVerbs } from '../data/vocabulary'
import { shuffle } from '../utils/shuffle'
import { selectWordsWithLeitner } from '../utils/leitner'

const EXERCISE_TYPES: ExerciseType[] = ['flashcard', 'multiple-choice', 'write']

interface UseSessionOptions {
  selectedCategory: string
  unlockedCategoryIds: string[]
  canUseConjugation: boolean
  customWords?: WordWithCategory[]
  progressMap?: Record<string, WordProgress>
}

interface SessionState {
  words: Word[]
  exerciseOrder: ExerciseType[]
  currentIndex: number
  stats: { correct: number; wrong: number }
}

const INITIAL_STATE: SessionState = {
  words: [],
  exerciseOrder: [],
  currentIndex: 0,
  stats: { correct: 0, wrong: 0 },
}

export function useSession(options: UseSessionOptions) {
  const { selectedCategory, unlockedCategoryIds, canUseConjugation, customWords = [], progressMap = {} } = options

  const [mode, setMode] = useState<ExerciseType | 'mixed' | null>(null)
  const [session, setSession] = useState<SessionState>(INITIAL_STATE)

  // Combine default words with custom words
  const allWords = [...defaultAllWords, ...customWords]

  // Session-Wörter nur einmal beim Start der Session festlegen
  useEffect(() => {
    if (mode === null) {
      return
    }

    let words: Word[]
    let exerciseOrder: ExerciseType[]

    if (mode === 'conjugation') {
      // Get verbs from standard categories
      const standardVerbs = getAllVerbs().filter((w) => unlockedCategoryIds.includes(w.category))
      // Also include custom verbs (they have type === 'verb')
      const customVerbsList = customWords.filter((w) => w.type === 'verb')
      const allVerbs = [...standardVerbs, ...customVerbsList]
      // Use Leitner prioritization for verb selection, then shuffle for variety
      const prioritizedVerbs = selectWordsWithLeitner(allVerbs, progressMap, 10)
      words = shuffle(prioritizedVerbs)
      exerciseOrder = words.map(() => 'conjugation' as ExerciseType)
    } else {
      // Include custom words (category 'custom') along with unlocked categories
      const unlockedWords = allWords.filter(
        (w) => unlockedCategoryIds.includes(w.category) || w.category === 'custom'
      )
      const filteredWords =
        selectedCategory === 'all'
          ? unlockedWords
          : selectedCategory === 'custom'
          ? unlockedWords.filter((w) => w.category === 'custom')
          : unlockedWords.filter((w) => w.category === selectedCategory)

      // Use Leitner prioritization: select words based on spaced repetition,
      // then shuffle to add variety while keeping priority-based selection
      const prioritizedWords = selectWordsWithLeitner(filteredWords, progressMap, 10)
      words = shuffle(prioritizedWords)

      if (mode === 'mixed') {
        exerciseOrder = words.map((word) => {
          if (canUseConjugation && word.type === 'verb') {
            const typesWithConjugation: ExerciseType[] = [...EXERCISE_TYPES, 'conjugation']
            return typesWithConjugation[Math.floor(Math.random() * typesWithConjugation.length)]
          }
          return EXERCISE_TYPES[Math.floor(Math.random() * EXERCISE_TYPES.length)]
        })
      } else {
        exerciseOrder = words.map(() => mode)
      }
    }

    setSession({
      words,
      exerciseOrder,
      currentIndex: 0,
      stats: { correct: 0, wrong: 0 },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Nur beim Session-Start ausführen
  }, [mode])

  const currentWord = session.words[session.currentIndex]
  const currentExerciseType = session.exerciseOrder[session.currentIndex]
  const isReady = session.words.length > 0
  const isComplete = isReady && session.currentIndex >= session.words.length
  const progress = isReady ? (session.currentIndex / session.words.length) * 100 : 0

  const recordResult = useCallback((correct: boolean) => {
    setSession((prev) => ({
      ...prev,
      currentIndex: prev.currentIndex + 1,
      stats: {
        correct: prev.stats.correct + (correct ? 1 : 0),
        wrong: prev.stats.wrong + (correct ? 0 : 1),
      },
    }))
  }, [])

  const skip = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      currentIndex: prev.currentIndex + 1,
    }))
  }, [])

  const reset = useCallback(() => {
    setMode(null)
    setSession(INITIAL_STATE)
  }, [])

  const startSession = useCallback((newMode: ExerciseType | 'mixed') => {
    setMode(newMode)
  }, [])

  return {
    // State
    mode,
    currentWord,
    currentExerciseType,
    sessionWords: session.words,
    stats: session.stats,
    currentIndex: session.currentIndex,

    // Derived
    isReady,
    isComplete,
    progress,

    // Actions
    startSession,
    recordResult,
    skip,
    reset,
  }
}
