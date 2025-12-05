import { useState, useEffect } from 'preact/hooks'

const STORAGE_KEY = 'spanisch-lernen-progress'

const defaultProgress = {
  words: {},
  stats: {
    streak: 0,
    lastPractice: null,
    totalCorrect: 0,
    totalWrong: 0,
  },
}

export function useProgress() {
  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : defaultProgress
    } catch {
      return defaultProgress
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  }, [progress])

  const updateWordProgress = (wordId, correct) => {
    setProgress((prev) => {
      const wordProgress = prev.words[wordId] || { box: 1, correct: 0, wrong: 0 }
      const today = new Date().toISOString().split('T')[0]

      // Leitner-System: richtig = höhere Box, falsch = zurück zu Box 1
      const newBox = correct
        ? Math.min(wordProgress.box + 1, 5)
        : 1

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
  }

  const getWordProgress = (wordId) => {
    return progress.words[wordId] || { box: 1, correct: 0, wrong: 0 }
  }

  const getStats = () => progress.stats

  const getWordsForReview = (allWords) => {
    const today = new Date()

    return allWords.filter((word) => {
      const wp = progress.words[word.id]
      if (!wp) return true // Neue Wörter immer zeigen

      const lastSeen = new Date(wp.lastSeen)
      const daysSince = Math.floor((today - lastSeen) / (1000 * 60 * 60 * 24))

      // Box 1: täglich, Box 2: alle 2 Tage, Box 3: alle 4 Tage, etc.
      const interval = Math.pow(2, wp.box - 1)
      return daysSince >= interval
    })
  }

  const resetProgress = () => {
    setProgress(defaultProgress)
  }

  return {
    progress,
    updateWordProgress,
    getWordProgress,
    getStats,
    getWordsForReview,
    resetProgress,
  }
}
