import { useMemo } from 'preact/hooks'
import type { Progress } from '../types'
import { categoriesWithDifficulty, allWords } from '../data/vocabulary'

const MASTERY_THRESHOLD = 0.7 // 70% für nächstes Level
const MASTERY_BOX = 3 // Box 3+ = gemeistert

export interface UserLevelInfo {
  currentLevel: number
  progressToNextLevel: number // 0-100
  wordsInCurrentLevel: number
  masteredInCurrentLevel: number
  unlockedCategoryIds: string[]
  isMaxLevel: boolean
}

export function useUserLevel(progress: Progress): UserLevelInfo {
  return useMemo(() => {
    let currentLevel = 1
    let progressToNextLevel = 0
    let wordsInCurrentLevel = 0
    let masteredInCurrentLevel = 0

    for (let level = 1; level <= 15; level++) {
      const categoriesAtLevel = categoriesWithDifficulty.filter((c) => c.difficulty === level)
      const categoryIds = categoriesAtLevel.map((c) => c.category)
      const wordsAtLevel = allWords.filter((w) => categoryIds.includes(w.category))

      if (wordsAtLevel.length === 0) continue

      const masteredWords = wordsAtLevel.filter((w) => {
        const wp = progress.words[w.id]
        return wp && wp.box >= MASTERY_BOX
      })

      const masteryPercentage = masteredWords.length / wordsAtLevel.length

      if (masteryPercentage < MASTERY_THRESHOLD) {
        currentLevel = level
        progressToNextLevel = Math.round((masteryPercentage / MASTERY_THRESHOLD) * 100)
        wordsInCurrentLevel = wordsAtLevel.length
        masteredInCurrentLevel = masteredWords.length
        break
      }

      // Level abgeschlossen, zum nächsten
      if (level === 15) {
        currentLevel = 15
        progressToNextLevel = 100
        wordsInCurrentLevel = wordsAtLevel.length
        masteredInCurrentLevel = masteredWords.length
      }
    }

    const unlockedCategoryIds = categoriesWithDifficulty
      .filter((c) => c.difficulty <= currentLevel)
      .map((c) => c.category)

    return {
      currentLevel,
      progressToNextLevel,
      wordsInCurrentLevel,
      masteredInCurrentLevel,
      unlockedCategoryIds,
      isMaxLevel: currentLevel === 15 && progressToNextLevel === 100,
    }
  }, [progress.words])
}
