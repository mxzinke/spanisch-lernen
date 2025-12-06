import { describe, it, expect } from 'vitest'
import { selectWordsForSession, countOccurrences } from '../utils/shuffle'
import { allWords } from '../data/vocabulary'

/**
 * Tests für die Session-Logik.
 * Die Kernfunktionalität (keine Duplikate, stabile Wortauswahl) wird hier getestet.
 * Die Hook-Integration wird implizit durch die UI-Tests abgedeckt.
 */
describe('useSession - Word Selection Logic', () => {
  it('should select unique words for a session', () => {
    const unlockedCategoryIds = ['greetings', 'basics', 'numbers']
    const unlockedWords = allWords.filter((w) => unlockedCategoryIds.includes(w.category))

    // Simulate 50 session starts
    for (let i = 0; i < 50; i++) {
      const sessionWords = selectWordsForSession(unlockedWords, (w) => w.id, 10, { maxOccurrences: 1 })

      // Each word should appear exactly once
      const counts = countOccurrences(sessionWords, (w) => w.id)
      for (const count of counts.values()) {
        expect(count).toBe(1)
      }

      // All IDs should be unique
      const uniqueIds = new Set(sessionWords.map((w) => w.id))
      expect(uniqueIds.size).toBe(sessionWords.length)
    }
  })

  it('should select words from all unlocked categories when category is "all"', () => {
    const unlockedCategoryIds = ['greetings', 'basics', 'numbers']
    const unlockedWords = allWords.filter((w) => unlockedCategoryIds.includes(w.category))

    const sessionWords = selectWordsForSession(unlockedWords, (w) => w.id, 10, { maxOccurrences: 1 })

    // Words should come from unlocked categories only
    for (const word of sessionWords) {
      expect(unlockedCategoryIds).toContain(word.category)
    }
  })

  it('should select words from specific category when filtered', () => {
    const selectedCategory = 'greetings'
    const unlockedCategoryIds = ['greetings', 'basics', 'numbers']
    const unlockedWords = allWords.filter((w) => unlockedCategoryIds.includes(w.category))
    const filteredWords = unlockedWords.filter((w) => w.category === selectedCategory)

    const sessionWords = selectWordsForSession(filteredWords, (w) => w.id, 10, { maxOccurrences: 1 })

    // All words should be from the selected category
    for (const word of sessionWords) {
      expect(word.category).toBe(selectedCategory)
    }
  })

  it('should return fewer words if category has less than 10 unique words', () => {
    // Filter to a small category
    const smallCategoryWords = allWords.filter((w) => w.category === 'greetings')
    const uniqueWordsCount = new Set(smallCategoryWords.map((w) => w.id)).size

    const sessionWords = selectWordsForSession(smallCategoryWords, (w) => w.id, 10, { maxOccurrences: 1 })

    // Should return at most the number of unique words available
    expect(sessionWords.length).toBeLessThanOrEqual(uniqueWordsCount)

    // All should still be unique
    const uniqueIds = new Set(sessionWords.map((w) => w.id))
    expect(uniqueIds.size).toBe(sessionWords.length)
  })

  it('should maintain word stability - same input produces consistent results structure', () => {
    const unlockedWords = allWords.filter((w) => ['greetings', 'basics'].includes(w.category))

    // Each call produces a valid session (unique words)
    // even though the actual words may differ due to randomization
    for (let i = 0; i < 20; i++) {
      const sessionWords = selectWordsForSession(unlockedWords, (w) => w.id, 10, { maxOccurrences: 1 })

      // Length should be 10 (or less if not enough words)
      expect(sessionWords.length).toBeGreaterThan(0)
      expect(sessionWords.length).toBeLessThanOrEqual(10)

      // All words should be unique
      const ids = sessionWords.map((w) => w.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    }
  })
})
