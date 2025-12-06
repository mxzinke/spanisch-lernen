import { useState, useEffect, useCallback } from 'preact/hooks'
import type { Progress, WordProgress, Stats, WordWithCategory } from '../types'
import { getProgress, saveProgress, defaultProgress, exportProgress, importProgress } from '../lib/db'
import { allWords, categoryDifficulty } from '../data/vocabulary'

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(defaultProgress)
  const [isLoading, setIsLoading] = useState(true)

  // Load progress from IndexedDB on mount
  useEffect(() => {
    getProgress().then((loaded) => {
      setProgress(loaded)
      setIsLoading(false)
    })
  }, [])

  // Save progress to IndexedDB whenever it changes
  useEffect(() => {
    if (!isLoading) {
      saveProgress(progress)
    }
  }, [progress, isLoading])

  const updateWordProgress = useCallback((wordId: string, correct: boolean) => {
    setProgress((prev) => {
      const wordProgress = prev.words[wordId] || { box: 1, correct: 0, wrong: 0, lastSeen: '' }
      const today = new Date().toISOString().split('T')[0]

      // Leitner-System: richtig = höhere Box, falsch = zurück zu Box 1
      const newBox = correct ? Math.min(wordProgress.box + 1, 5) : 1

      // Streak-Logik
      const lastPractice = prev.stats.lastPractice
      let newStreak = prev.stats.streak

      if (lastPractice !== today) {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]

        if (lastPractice === yesterdayStr) {
          newStreak += 1
        } else if (lastPractice !== today) {
          newStreak = 1
        }
      }

      return {
        words: {
          ...prev.words,
          [wordId]: {
            box: newBox,
            lastSeen: today,
            correct: wordProgress.correct + (correct ? 1 : 0),
            wrong: wordProgress.wrong + (correct ? 0 : 1),
          },
        },
        stats: {
          streak: newStreak,
          lastPractice: today,
          totalCorrect: prev.stats.totalCorrect + (correct ? 1 : 0),
          totalWrong: prev.stats.totalWrong + (correct ? 0 : 1),
        },
      }
    })
  }, [])

  const getWordProgress = useCallback(
    (wordId: string): WordProgress => {
      return progress.words[wordId] || { box: 1, correct: 0, wrong: 0, lastSeen: '' }
    },
    [progress.words]
  )

  const getStats = useCallback((): Stats => progress.stats, [progress.stats])

  const getWordsForReview = useCallback(
    (allWords: WordWithCategory[]): WordWithCategory[] => {
      const today = new Date()

      return allWords.filter((word) => {
        const wp = progress.words[word.id]
        if (!wp) return true // Neue Wörter immer zeigen

        const lastSeen = new Date(wp.lastSeen)
        const daysSince = Math.floor((today.getTime() - lastSeen.getTime()) / (1000 * 60 * 60 * 24))

        // Box 1: täglich, Box 2: alle 2 Tage, Box 3: alle 4 Tage, etc.
        const interval = Math.pow(2, wp.box - 1)
        return daysSince >= interval
      })
    },
    [progress.words]
  )

  const resetProgress = useCallback(() => {
    setProgress(defaultProgress)
  }, [])

  // Dev-Funktion: Boost auf ein bestimmtes Level (setzt alle Wörter bis zu diesem Level auf Box 4)
  const boostToLevel = useCallback((targetLevel: number) => {
    const today = new Date().toISOString().split('T')[0]
    const wordsToBoost = allWords.filter((w) => {
      const level = categoryDifficulty[w.category] || 99
      return level < targetLevel
    })

    setProgress((prev) => {
      const newWords = { ...prev.words }
      wordsToBoost.forEach((word) => {
        newWords[word.id] = {
          box: 4, // Box 4 = fast gemeistert (70% Threshold erreicht)
          lastSeen: today,
          correct: 5,
          wrong: 0,
        }
      })
      return {
        ...prev,
        words: newWords,
      }
    })
  }, [])

  // Export current progress as JSON file
  const handleExport = useCallback(() => {
    exportProgress(progress)
  }, [progress])

  // Import progress from JSON file
  const handleImport = useCallback(async (file: File): Promise<void> => {
    const imported = await importProgress(file)
    setProgress(imported)
  }, [])

  return {
    progress,
    isLoading,
    updateWordProgress,
    getWordProgress,
    getStats,
    getWordsForReview,
    resetProgress,
    boostToLevel,
    exportProgress: handleExport,
    importProgress: handleImport,
  }
}
