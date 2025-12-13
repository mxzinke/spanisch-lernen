/**
 * Leitner-System utilities for spaced repetition word selection.
 *
 * The Leitner system uses boxes with exponentially increasing review intervals:
 * - Box 1: review daily (interval = 1 day)
 * - Box 2: review every 2 days
 * - Box 3: review every 4 days
 * - Box 4: review every 8 days
 * - Box 5: review every 16 days (considered "mastered")
 * - Box 6+: continues exponentially (32, 64, ... days) - "invisible" boxes
 *
 * Formula: interval = 2^(box-1) days
 */

import type { WordProgress, WordWithCategory } from '../types'

export interface WordWithPriority {
  word: WordWithCategory
  priority: number
  isDue: boolean
  daysOverdue: number
  box: number
  isNew: boolean
}

/**
 * Calculate the review interval in days for a given box number.
 * Box 1 = 1 day, Box 2 = 2 days, Box 3 = 4 days, etc.
 */
export function getIntervalForBox(box: number): number {
  return Math.pow(2, box - 1)
}

/**
 * Calculate days since a date string (ISO format YYYY-MM-DD).
 * Returns Infinity for empty/invalid dates (treated as never seen).
 */
export function getDaysSince(dateStr: string, today: Date = new Date()): number {
  if (!dateStr) return Infinity

  const lastSeen = new Date(dateStr)
  if (isNaN(lastSeen.getTime())) return Infinity

  // Reset time to midnight for accurate day calculation
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const lastSeenMidnight = new Date(lastSeen.getFullYear(), lastSeen.getMonth(), lastSeen.getDate())

  const diffMs = todayMidnight.getTime() - lastSeenMidnight.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

/**
 * Check if a word is due for review based on its box and last seen date.
 */
export function isWordDue(progress: WordProgress | undefined, today: Date = new Date()): boolean {
  // New words (no progress) are always due
  if (!progress || !progress.lastSeen) return true

  const daysSince = getDaysSince(progress.lastSeen, today)
  const interval = getIntervalForBox(progress.box)

  return daysSince >= interval
}

/**
 * Calculate priority score for a word. Higher = more urgent.
 *
 * Priority factors:
 * 1. Due words have higher priority than non-due words
 * 2. Among due words: lower box = higher priority (harder words first)
 * 3. Among due words with same box: more overdue = higher priority
 * 4. New words have medium-high priority (between due box 1-2 words and box 3+ words)
 */
export function calculateWordPriority(
  progress: WordProgress | undefined,
  today: Date = new Date()
): { priority: number; isDue: boolean; daysOverdue: number; box: number; isNew: boolean } {
  // New word - no progress record
  if (!progress || !progress.lastSeen) {
    return {
      priority: 800, // High priority, but below overdue box 1-2 words
      isDue: true,
      daysOverdue: 0,
      box: 0,
      isNew: true,
    }
  }

  const box = progress.box
  const interval = getIntervalForBox(box)
  const daysSince = getDaysSince(progress.lastSeen, today)
  const isDue = daysSince >= interval
  const daysOverdue = isDue ? daysSince - interval : 0

  if (!isDue) {
    // Not due yet - low priority
    // Priority based on how close to being due (higher = closer to due)
    const daysUntilDue = interval - daysSince
    const priority = Math.max(0, 100 - daysUntilDue * 10)
    return { priority, isDue: false, daysOverdue: 0, box, isNew: false }
  }

  // Word is due for review
  // Base priority: 1000 - (box * 100), so box 1 = 900, box 2 = 800, etc.
  // Bonus for days overdue: +10 per day overdue (max +200)
  const boxPriority = Math.max(0, 1000 - box * 100)
  const overdueBonusCapped = Math.min(daysOverdue * 10, 200)
  const priority = boxPriority + overdueBonusCapped

  return { priority, isDue, daysOverdue, box, isNew: false }
}

/**
 * Sort words by Leitner priority for practice session.
 * Returns words sorted from highest to lowest priority.
 */
export function sortWordsByPriority(
  words: WordWithCategory[],
  progressMap: Record<string, WordProgress>,
  today: Date = new Date()
): WordWithPriority[] {
  const wordsWithPriority: WordWithPriority[] = words.map((word) => {
    const progress = progressMap[word.id]
    const { priority, isDue, daysOverdue, box, isNew } = calculateWordPriority(progress, today)
    return { word, priority, isDue, daysOverdue, box, isNew }
  })

  // Sort by priority descending (highest priority first)
  return wordsWithPriority.sort((a, b) => b.priority - a.priority)
}

/**
 * Select words for a practice session using Leitner prioritization.
 *
 * Selection strategy:
 * 1. Sort all words by priority
 * 2. Take top N words
 * 3. Shuffle the selected words to add variety while maintaining priority-based selection
 *
 * @param words - All available words
 * @param progressMap - Word progress data keyed by word ID
 * @param count - Number of words to select
 * @param today - Current date (for testing)
 * @returns Selected words prioritized by Leitner system
 */
export function selectWordsWithLeitner(
  words: WordWithCategory[],
  progressMap: Record<string, WordProgress>,
  count: number,
  today: Date = new Date()
): WordWithCategory[] {
  if (words.length === 0 || count <= 0) return []

  const sorted = sortWordsByPriority(words, progressMap, today)

  // Take top N words by priority
  const selected = sorted.slice(0, count).map((wp) => wp.word)

  return selected
}

/**
 * Get statistics about words due for review.
 */
export function getReviewStats(
  words: WordWithCategory[],
  progressMap: Record<string, WordProgress>,
  today: Date = new Date()
): {
  totalDue: number
  newWords: number
  dueByBox: Record<number, number>
  overdueCount: number
} {
  let totalDue = 0
  let newWords = 0
  let overdueCount = 0
  const dueByBox: Record<number, number> = {}

  for (const word of words) {
    const progress = progressMap[word.id]
    const { isDue, daysOverdue, box, isNew } = calculateWordPriority(progress, today)

    if (isDue) {
      totalDue++
      if (isNew) {
        newWords++
      } else {
        dueByBox[box] = (dueByBox[box] || 0) + 1
        if (daysOverdue > 0) {
          overdueCount++
        }
      }
    }
  }

  return { totalDue, newWords, dueByBox, overdueCount }
}
