import { describe, it, expect } from 'vitest'
import {
  getIntervalForBox,
  getDaysSince,
  isWordDue,
  calculateWordPriority,
  sortWordsByPriority,
  selectWordsWithLeitner,
  getReviewStats,
} from './leitner'
import type { WordProgress, WordWithCategory } from '../types'

// Helper to create a date N days ago
function daysAgo(days: number, from: Date = new Date()): string {
  const date = new Date(from)
  date.setDate(date.getDate() - days)
  return date.toISOString().split('T')[0]
}

// Helper to create a mock word
function createWord(id: string, category = 'test'): WordWithCategory {
  return {
    id,
    spanish: `spanish-${id}`,
    german: `german-${id}`,
    example: '',
    exampleDe: '',
    category,
    categoryName: 'Test',
  }
}

// Fixed date for consistent testing
const TODAY = new Date('2024-06-15')

describe('getIntervalForBox', () => {
  it('should return correct intervals for boxes 1-5', () => {
    expect(getIntervalForBox(1)).toBe(1) // 2^0 = 1 day
    expect(getIntervalForBox(2)).toBe(2) // 2^1 = 2 days
    expect(getIntervalForBox(3)).toBe(4) // 2^2 = 4 days
    expect(getIntervalForBox(4)).toBe(8) // 2^3 = 8 days
    expect(getIntervalForBox(5)).toBe(16) // 2^4 = 16 days
  })

  it('should handle "invisible" boxes 6+', () => {
    expect(getIntervalForBox(6)).toBe(32) // 2^5 = 32 days
    expect(getIntervalForBox(7)).toBe(64) // 2^6 = 64 days
    expect(getIntervalForBox(8)).toBe(128) // 2^7 = 128 days
    expect(getIntervalForBox(10)).toBe(512) // 2^9 = 512 days
  })

  it('should handle edge case of box 0 (theoretical)', () => {
    expect(getIntervalForBox(0)).toBe(0.5) // 2^-1 = 0.5 days
  })
})

describe('getDaysSince', () => {
  it('should calculate days correctly', () => {
    expect(getDaysSince('2024-06-14', TODAY)).toBe(1)
    expect(getDaysSince('2024-06-13', TODAY)).toBe(2)
    expect(getDaysSince('2024-06-10', TODAY)).toBe(5)
    expect(getDaysSince('2024-06-01', TODAY)).toBe(14)
  })

  it('should return 0 for today', () => {
    expect(getDaysSince('2024-06-15', TODAY)).toBe(0)
  })

  it('should return Infinity for empty string', () => {
    expect(getDaysSince('', TODAY)).toBe(Infinity)
  })

  it('should return Infinity for invalid date', () => {
    expect(getDaysSince('invalid-date', TODAY)).toBe(Infinity)
  })

  it('should handle future dates (negative days) correctly', () => {
    expect(getDaysSince('2024-06-16', TODAY)).toBe(-1)
    expect(getDaysSince('2024-06-20', TODAY)).toBe(-5)
  })
})

describe('isWordDue', () => {
  it('should return true for new words (no progress)', () => {
    expect(isWordDue(undefined, TODAY)).toBe(true)
  })

  it('should return true for words with empty lastSeen', () => {
    expect(isWordDue({ box: 1, lastSeen: '', correct: 0, wrong: 0 }, TODAY)).toBe(true)
  })

  it('should return true for box 1 word seen yesterday', () => {
    const progress: WordProgress = {
      box: 1,
      lastSeen: daysAgo(1, TODAY),
      correct: 1,
      wrong: 0,
    }
    expect(isWordDue(progress, TODAY)).toBe(true)
  })

  it('should return false for box 1 word seen today', () => {
    const progress: WordProgress = {
      box: 1,
      lastSeen: daysAgo(0, TODAY),
      correct: 1,
      wrong: 0,
    }
    expect(isWordDue(progress, TODAY)).toBe(false)
  })

  it('should handle box 2 intervals correctly', () => {
    // Box 2 interval = 2 days
    expect(isWordDue({ box: 2, lastSeen: daysAgo(1, TODAY), correct: 2, wrong: 0 }, TODAY)).toBe(false)
    expect(isWordDue({ box: 2, lastSeen: daysAgo(2, TODAY), correct: 2, wrong: 0 }, TODAY)).toBe(true)
    expect(isWordDue({ box: 2, lastSeen: daysAgo(3, TODAY), correct: 2, wrong: 0 }, TODAY)).toBe(true)
  })

  it('should handle box 5 (mastered) intervals correctly', () => {
    // Box 5 interval = 16 days
    expect(isWordDue({ box: 5, lastSeen: daysAgo(15, TODAY), correct: 5, wrong: 0 }, TODAY)).toBe(false)
    expect(isWordDue({ box: 5, lastSeen: daysAgo(16, TODAY), correct: 5, wrong: 0 }, TODAY)).toBe(true)
    expect(isWordDue({ box: 5, lastSeen: daysAgo(20, TODAY), correct: 5, wrong: 0 }, TODAY)).toBe(true)
  })

  it('should handle invisible box 6+ correctly', () => {
    // Box 6 interval = 32 days
    expect(isWordDue({ box: 6, lastSeen: daysAgo(31, TODAY), correct: 6, wrong: 0 }, TODAY)).toBe(false)
    expect(isWordDue({ box: 6, lastSeen: daysAgo(32, TODAY), correct: 6, wrong: 0 }, TODAY)).toBe(true)

    // Box 7 interval = 64 days
    expect(isWordDue({ box: 7, lastSeen: daysAgo(63, TODAY), correct: 7, wrong: 0 }, TODAY)).toBe(false)
    expect(isWordDue({ box: 7, lastSeen: daysAgo(64, TODAY), correct: 7, wrong: 0 }, TODAY)).toBe(true)
  })

  it('should handle box 10 (very long interval)', () => {
    // Box 10 interval = 512 days
    expect(isWordDue({ box: 10, lastSeen: daysAgo(500, TODAY), correct: 10, wrong: 0 }, TODAY)).toBe(false)
    expect(isWordDue({ box: 10, lastSeen: daysAgo(512, TODAY), correct: 10, wrong: 0 }, TODAY)).toBe(true)
  })
})

describe('calculateWordPriority', () => {
  it('should give new words high priority', () => {
    const result = calculateWordPriority(undefined, TODAY)
    expect(result.priority).toBe(800)
    expect(result.isNew).toBe(true)
    expect(result.isDue).toBe(true)
    expect(result.box).toBe(0)
  })

  it('should give overdue box 1 words highest priority', () => {
    const progress: WordProgress = {
      box: 1,
      lastSeen: daysAgo(3, TODAY), // 3 days ago, overdue by 2 days
      correct: 1,
      wrong: 0,
    }
    const result = calculateWordPriority(progress, TODAY)
    // Base: 1000 - 100 = 900, bonus: 2 * 10 = 20
    expect(result.priority).toBe(920)
    expect(result.isDue).toBe(true)
    expect(result.daysOverdue).toBe(2)
    expect(result.box).toBe(1)
    expect(result.isNew).toBe(false)
  })

  it('should give lower priority to higher boxes', () => {
    const box1 = calculateWordPriority({ box: 1, lastSeen: daysAgo(1, TODAY), correct: 1, wrong: 0 }, TODAY)
    const box2 = calculateWordPriority({ box: 2, lastSeen: daysAgo(2, TODAY), correct: 2, wrong: 0 }, TODAY)
    const box3 = calculateWordPriority({ box: 3, lastSeen: daysAgo(4, TODAY), correct: 3, wrong: 0 }, TODAY)
    const box5 = calculateWordPriority({ box: 5, lastSeen: daysAgo(16, TODAY), correct: 5, wrong: 0 }, TODAY)

    expect(box1.priority).toBeGreaterThan(box2.priority)
    expect(box2.priority).toBeGreaterThan(box3.priority)
    expect(box3.priority).toBeGreaterThan(box5.priority)
  })

  it('should prioritize more overdue words within same box', () => {
    const slightlyOverdue = calculateWordPriority(
      { box: 2, lastSeen: daysAgo(2, TODAY), correct: 2, wrong: 0 },
      TODAY
    )
    const veryOverdue = calculateWordPriority(
      { box: 2, lastSeen: daysAgo(10, TODAY), correct: 2, wrong: 0 },
      TODAY
    )

    expect(veryOverdue.priority).toBeGreaterThan(slightlyOverdue.priority)
    expect(veryOverdue.daysOverdue).toBe(8) // 10 - 2 = 8 days overdue
    expect(slightlyOverdue.daysOverdue).toBe(0) // exactly due, 0 days overdue
  })

  it('should cap overdue bonus at 200', () => {
    const extremelyOverdue = calculateWordPriority(
      { box: 1, lastSeen: daysAgo(100, TODAY), correct: 1, wrong: 0 },
      TODAY
    )
    // Base: 900, max bonus: 200
    expect(extremelyOverdue.priority).toBe(1100)
  })

  it('should give non-due words low priority', () => {
    const notDue = calculateWordPriority(
      { box: 3, lastSeen: daysAgo(1, TODAY), correct: 3, wrong: 0 }, // needs 4 days
      TODAY
    )

    expect(notDue.isDue).toBe(false)
    expect(notDue.priority).toBeLessThan(100)
    expect(notDue.daysOverdue).toBe(0)
  })

  it('should handle invisible boxes (6+) correctly', () => {
    // Box 6 due
    const box6Due = calculateWordPriority(
      { box: 6, lastSeen: daysAgo(32, TODAY), correct: 6, wrong: 0 },
      TODAY
    )
    expect(box6Due.isDue).toBe(true)
    expect(box6Due.box).toBe(6)
    // Base: 1000 - 600 = 400
    expect(box6Due.priority).toBe(400)

    // Box 10 - very low priority even when due
    const box10Due = calculateWordPriority(
      { box: 10, lastSeen: daysAgo(512, TODAY), correct: 10, wrong: 0 },
      TODAY
    )
    expect(box10Due.isDue).toBe(true)
    // Base: 1000 - 1000 = 0 (clamped to 0)
    expect(box10Due.priority).toBe(0)
  })

  it('should prioritize new words over high-box due words', () => {
    const newWord = calculateWordPriority(undefined, TODAY)
    const box5Due = calculateWordPriority(
      { box: 5, lastSeen: daysAgo(16, TODAY), correct: 5, wrong: 0 },
      TODAY
    )

    // New words (800) should have higher priority than box 5 (500)
    expect(newWord.priority).toBeGreaterThan(box5Due.priority)
  })

  it('should prioritize due box 1-2 words over new words', () => {
    const newWord = calculateWordPriority(undefined, TODAY)
    const box1Due = calculateWordPriority(
      { box: 1, lastSeen: daysAgo(1, TODAY), correct: 1, wrong: 0 },
      TODAY
    )
    const box2Due = calculateWordPriority(
      { box: 2, lastSeen: daysAgo(2, TODAY), correct: 2, wrong: 0 },
      TODAY
    )

    // Box 1 (900) > new (800) > box 2 (800, but new might be equal)
    expect(box1Due.priority).toBeGreaterThan(newWord.priority)
    // Box 2 = 800, new = 800 - they're equal priority
    expect(box2Due.priority).toBe(newWord.priority)
  })
})

describe('sortWordsByPriority', () => {
  it('should sort words by priority descending', () => {
    const words = [
      createWord('new1'),
      createWord('box5'),
      createWord('box1'),
      createWord('box2'),
    ]

    const progressMap: Record<string, WordProgress> = {
      box5: { box: 5, lastSeen: daysAgo(16, TODAY), correct: 5, wrong: 0 },
      box1: { box: 1, lastSeen: daysAgo(1, TODAY), correct: 1, wrong: 0 },
      box2: { box: 2, lastSeen: daysAgo(2, TODAY), correct: 2, wrong: 0 },
      // new1 has no progress
    }

    const sorted = sortWordsByPriority(words, progressMap, TODAY)

    expect(sorted[0].word.id).toBe('box1') // Priority 900
    // new1 and box2 both have priority 800, order may vary
    expect(sorted[3].word.id).toBe('box5') // Priority 500
  })

  it('should handle empty word list', () => {
    const sorted = sortWordsByPriority([], {}, TODAY)
    expect(sorted).toEqual([])
  })

  it('should handle all new words', () => {
    const words = [createWord('a'), createWord('b'), createWord('c')]
    const sorted = sortWordsByPriority(words, {}, TODAY)

    // All should have same priority (800)
    expect(sorted.every((w) => w.priority === 800)).toBe(true)
    expect(sorted.every((w) => w.isNew)).toBe(true)
  })

  it('should include priority metadata', () => {
    const words = [createWord('test')]
    const progressMap = {
      test: { box: 3, lastSeen: daysAgo(5, TODAY), correct: 3, wrong: 0 },
    }

    const sorted = sortWordsByPriority(words, progressMap, TODAY)

    expect(sorted[0].isDue).toBe(true)
    expect(sorted[0].daysOverdue).toBe(1) // 5 - 4 = 1 day overdue
    expect(sorted[0].box).toBe(3)
    expect(sorted[0].isNew).toBe(false)
  })
})

describe('selectWordsWithLeitner', () => {
  it('should select top N words by priority', () => {
    const words = [
      createWord('new1'),
      createWord('new2'),
      createWord('box1'),
      createWord('box5'),
    ]

    const progressMap: Record<string, WordProgress> = {
      box1: { box: 1, lastSeen: daysAgo(1, TODAY), correct: 1, wrong: 0 },
      box5: { box: 5, lastSeen: daysAgo(16, TODAY), correct: 5, wrong: 0 },
    }

    const selected = selectWordsWithLeitner(words, progressMap, 3, TODAY)

    expect(selected.length).toBe(3)
    // box1 should definitely be included (highest priority)
    expect(selected.some((w) => w.id === 'box1')).toBe(true)
    // box5 should NOT be included (lowest priority)
    expect(selected.some((w) => w.id === 'box5')).toBe(false)
  })

  it('should return all words if count exceeds available', () => {
    const words = [createWord('a'), createWord('b')]
    const selected = selectWordsWithLeitner(words, {}, 10, TODAY)
    expect(selected.length).toBe(2)
  })

  it('should handle empty word list', () => {
    const selected = selectWordsWithLeitner([], {}, 10, TODAY)
    expect(selected).toEqual([])
  })

  it('should handle count of 0', () => {
    const words = [createWord('a')]
    const selected = selectWordsWithLeitner(words, {}, 0, TODAY)
    expect(selected).toEqual([])
  })

  it('should prioritize overdue words over new words', () => {
    const words = [
      createWord('new1'),
      createWord('new2'),
      createWord('overdue'),
    ]

    const progressMap: Record<string, WordProgress> = {
      overdue: { box: 1, lastSeen: daysAgo(5, TODAY), correct: 1, wrong: 1 },
    }

    const selected = selectWordsWithLeitner(words, progressMap, 1, TODAY)

    expect(selected[0].id).toBe('overdue')
  })

  it('should select mix of due and new words appropriately', () => {
    const words = [
      createWord('new1'),
      createWord('new2'),
      createWord('new3'),
      createWord('box1'),
      createWord('box2'),
      createWord('box3'),
    ]

    const progressMap: Record<string, WordProgress> = {
      box1: { box: 1, lastSeen: daysAgo(1, TODAY), correct: 1, wrong: 0 },
      box2: { box: 2, lastSeen: daysAgo(2, TODAY), correct: 2, wrong: 0 },
      box3: { box: 3, lastSeen: daysAgo(4, TODAY), correct: 3, wrong: 0 },
    }

    const selected = selectWordsWithLeitner(words, progressMap, 5, TODAY)

    expect(selected.length).toBe(5)
    // box1 should be first (priority 900)
    expect(selected[0].id).toBe('box1')
  })
})

describe('getReviewStats', () => {
  it('should count new words correctly', () => {
    const words = [createWord('a'), createWord('b'), createWord('c')]
    const stats = getReviewStats(words, {}, TODAY)

    expect(stats.totalDue).toBe(3)
    expect(stats.newWords).toBe(3)
    expect(stats.overdueCount).toBe(0)
  })

  it('should count due words by box', () => {
    const words = [
      createWord('box1a'),
      createWord('box1b'),
      createWord('box2'),
      createWord('box5'),
    ]

    const progressMap: Record<string, WordProgress> = {
      box1a: { box: 1, lastSeen: daysAgo(1, TODAY), correct: 1, wrong: 0 },
      box1b: { box: 1, lastSeen: daysAgo(2, TODAY), correct: 1, wrong: 0 },
      box2: { box: 2, lastSeen: daysAgo(3, TODAY), correct: 2, wrong: 0 },
      box5: { box: 5, lastSeen: daysAgo(16, TODAY), correct: 5, wrong: 0 },
    }

    const stats = getReviewStats(words, progressMap, TODAY)

    expect(stats.totalDue).toBe(4)
    expect(stats.newWords).toBe(0)
    expect(stats.dueByBox[1]).toBe(2)
    expect(stats.dueByBox[2]).toBe(1)
    expect(stats.dueByBox[5]).toBe(1)
  })

  it('should count overdue words', () => {
    const words = [
      createWord('exactlyDue'),
      createWord('overdue'),
      createWord('notDue'),
    ]

    const progressMap: Record<string, WordProgress> = {
      exactlyDue: { box: 2, lastSeen: daysAgo(2, TODAY), correct: 2, wrong: 0 }, // exactly due
      overdue: { box: 2, lastSeen: daysAgo(5, TODAY), correct: 2, wrong: 0 }, // 3 days overdue
      notDue: { box: 2, lastSeen: daysAgo(1, TODAY), correct: 2, wrong: 0 }, // not due
    }

    const stats = getReviewStats(words, progressMap, TODAY)

    expect(stats.totalDue).toBe(2)
    expect(stats.overdueCount).toBe(1) // only "overdue" is overdue
  })

  it('should handle invisible boxes (6+)', () => {
    const words = [createWord('box6'), createWord('box8')]

    const progressMap: Record<string, WordProgress> = {
      box6: { box: 6, lastSeen: daysAgo(32, TODAY), correct: 6, wrong: 0 },
      box8: { box: 8, lastSeen: daysAgo(128, TODAY), correct: 8, wrong: 0 },
    }

    const stats = getReviewStats(words, progressMap, TODAY)

    expect(stats.totalDue).toBe(2)
    expect(stats.dueByBox[6]).toBe(1)
    expect(stats.dueByBox[8]).toBe(1)
  })

  it('should handle empty word list', () => {
    const stats = getReviewStats([], {}, TODAY)

    expect(stats.totalDue).toBe(0)
    expect(stats.newWords).toBe(0)
    expect(stats.overdueCount).toBe(0)
    expect(Object.keys(stats.dueByBox)).toHaveLength(0)
  })

  it('should not count non-due words', () => {
    const words = [createWord('notDue1'), createWord('notDue2')]

    const progressMap: Record<string, WordProgress> = {
      notDue1: { box: 5, lastSeen: daysAgo(10, TODAY), correct: 5, wrong: 0 }, // needs 16 days
      notDue2: { box: 3, lastSeen: daysAgo(2, TODAY), correct: 3, wrong: 0 }, // needs 4 days
    }

    const stats = getReviewStats(words, progressMap, TODAY)

    expect(stats.totalDue).toBe(0)
  })
})

describe('Leitner system integration', () => {
  it('should correctly prioritize a realistic practice session', () => {
    // Simulate a user with varied word progress
    const words = [
      createWord('forgotten'), // Box 1, very overdue
      createWord('struggling'), // Box 1, due
      createWord('learning'), // Box 2, due
      createWord('improving'), // Box 3, due
      createWord('mastered'), // Box 5, due
      createWord('expert'), // Box 7, due (invisible box)
      createWord('new1'), // New word
      createWord('new2'), // New word
      createWord('recent'), // Box 2, not due
    ]

    const progressMap: Record<string, WordProgress> = {
      forgotten: { box: 1, lastSeen: daysAgo(10, TODAY), correct: 1, wrong: 5 },
      struggling: { box: 1, lastSeen: daysAgo(1, TODAY), correct: 2, wrong: 2 },
      learning: { box: 2, lastSeen: daysAgo(3, TODAY), correct: 3, wrong: 1 },
      improving: { box: 3, lastSeen: daysAgo(5, TODAY), correct: 4, wrong: 1 },
      mastered: { box: 5, lastSeen: daysAgo(20, TODAY), correct: 6, wrong: 0 },
      expert: { box: 7, lastSeen: daysAgo(70, TODAY), correct: 8, wrong: 0 },
      recent: { box: 2, lastSeen: daysAgo(1, TODAY), correct: 2, wrong: 0 },
    }

    // Select 5 words for practice
    const selected = selectWordsWithLeitner(words, progressMap, 5, TODAY)

    // Should prioritize in this order:
    // 1. forgotten (box 1, very overdue)
    // 2. struggling (box 1, due)
    // 3. new1 or new2 or learning (similar priority)
    expect(selected[0].id).toBe('forgotten')
    expect(selected[1].id).toBe('struggling')

    // "recent" should not be in top 5 (not due)
    expect(selected.some((w) => w.id === 'recent')).toBe(false)

    // "expert" should not be in top 5 (lowest priority among due)
    expect(selected.some((w) => w.id === 'expert')).toBe(false)
  })

  it('should handle user who has mastered all words', () => {
    const words = [
      createWord('a'),
      createWord('b'),
      createWord('c'),
    ]

    // All words in high boxes, not due yet
    const progressMap: Record<string, WordProgress> = {
      a: { box: 8, lastSeen: daysAgo(50, TODAY), correct: 10, wrong: 0 },
      b: { box: 7, lastSeen: daysAgo(30, TODAY), correct: 8, wrong: 0 },
      c: { box: 6, lastSeen: daysAgo(20, TODAY), correct: 7, wrong: 0 },
    }

    const stats = getReviewStats(words, progressMap, TODAY)
    expect(stats.totalDue).toBe(0)

    // Selection should still work, picking by highest priority (closest to due)
    const selected = selectWordsWithLeitner(words, progressMap, 2, TODAY)
    expect(selected.length).toBe(2)
  })

  it('should handle fresh user with no progress', () => {
    const words = [
      createWord('a'),
      createWord('b'),
      createWord('c'),
      createWord('d'),
      createWord('e'),
    ]

    const stats = getReviewStats(words, {}, TODAY)
    expect(stats.totalDue).toBe(5)
    expect(stats.newWords).toBe(5)

    const selected = selectWordsWithLeitner(words, {}, 3, TODAY)
    expect(selected.length).toBe(3)
    // All should be new words
  })
})
