import { describe, it, expect } from 'vitest'
import {
  shuffle,
  selectWordsForSession,
  limitOccurrences,
  selectWithMinDistance,
  hasMinimumDistance,
  countOccurrences,
} from './shuffle'

describe('shuffle', () => {
  it('should return an array of the same length', () => {
    const input = [1, 2, 3, 4, 5]
    const result = shuffle(input)
    expect(result.length).toBe(input.length)
  })

  it('should contain all original elements', () => {
    const input = [1, 2, 3, 4, 5]
    const result = shuffle(input)
    expect(result.sort()).toEqual(input.sort())
  })

  it('should not modify the original array', () => {
    const input = [1, 2, 3, 4, 5]
    const originalCopy = [...input]
    shuffle(input)
    expect(input).toEqual(originalCopy)
  })

  it('should handle empty arrays', () => {
    const result = shuffle([])
    expect(result).toEqual([])
  })

  it('should handle single element arrays', () => {
    const result = shuffle([1])
    expect(result).toEqual([1])
  })
})

describe('limitOccurrences', () => {
  const getKey = (item: { id: string }) => item.id

  it('should limit occurrences to maxOccurrences', () => {
    const input = [
      { id: 'a' },
      { id: 'a' },
      { id: 'a' },
      { id: 'b' },
      { id: 'b' },
    ]

    const result = limitOccurrences(input, getKey, 2)
    const counts = countOccurrences(result, getKey)

    expect(counts.get('a')).toBeLessThanOrEqual(2)
    expect(counts.get('b')).toBeLessThanOrEqual(2)
  })

  it('should keep all items if none exceed limit', () => {
    const input = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
    const result = limitOccurrences(input, getKey, 2)
    expect(result.length).toBe(3)
  })

  it('should handle empty arrays', () => {
    const result = limitOccurrences([], getKey, 2)
    expect(result).toEqual([])
  })

  it('should limit to 1 occurrence when maxOccurrences is 1', () => {
    const input = [
      { id: 'a' },
      { id: 'a' },
      { id: 'b' },
      { id: 'b' },
    ]
    const result = limitOccurrences(input, getKey, 1)
    const counts = countOccurrences(result, getKey)

    expect(counts.get('a')).toBe(1)
    expect(counts.get('b')).toBe(1)
  })
})

describe('hasMinimumDistance', () => {
  const getKey = (item: { id: string }) => item.id

  it('should return true when minimum distance is maintained', () => {
    const array = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'a' }]
    expect(hasMinimumDistance(array, getKey, 3)).toBe(true)
  })

  it('should return false when distance is too small', () => {
    const array = [{ id: 'a' }, { id: 'b' }, { id: 'a' }]
    expect(hasMinimumDistance(array, getKey, 3)).toBe(false)
  })

  it('should return true for consecutive duplicates with minDistance 1', () => {
    const array = [{ id: 'a' }, { id: 'a' }]
    expect(hasMinimumDistance(array, getKey, 1)).toBe(true)
  })

  it('should return false for consecutive duplicates with minDistance 2', () => {
    const array = [{ id: 'a' }, { id: 'a' }]
    expect(hasMinimumDistance(array, getKey, 2)).toBe(false)
  })

  it('should return true for empty arrays', () => {
    expect(hasMinimumDistance([], getKey, 3)).toBe(true)
  })

  it('should return true for single element arrays', () => {
    expect(hasMinimumDistance([{ id: 'a' }], getKey, 3)).toBe(true)
  })

  it('should handle exact minimum distance', () => {
    // Distance of 3: positions 0 and 3
    const array = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'a' }]
    expect(hasMinimumDistance(array, getKey, 3)).toBe(true)
    expect(hasMinimumDistance(array, getKey, 4)).toBe(false)
  })
})

describe('selectWithMinDistance', () => {
  const getKey = (item: { id: string }) => item.id

  it('should maintain minimum distance between same keys', () => {
    const input = [
      { id: 'a' },
      { id: 'a' },
      { id: 'b' },
      { id: 'b' },
      { id: 'c' },
      { id: 'c' },
      { id: 'd' },
      { id: 'd' },
    ]

    for (let i = 0; i < 20; i++) {
      const result = selectWithMinDistance(input, getKey, 8, 3)
      expect(hasMinimumDistance(result, getKey, 3)).toBe(true)
    }
  })

  it('should return requested count if possible', () => {
    const input = [
      { id: 'a' },
      { id: 'b' },
      { id: 'c' },
      { id: 'd' },
      { id: 'e' },
    ]
    const result = selectWithMinDistance(input, getKey, 3, 2)
    expect(result.length).toBe(3)
  })

  it('should handle empty arrays', () => {
    const result = selectWithMinDistance([], getKey, 5, 3)
    expect(result).toEqual([])
  })

  it('should handle count larger than array', () => {
    const input = [{ id: 'a' }, { id: 'b' }]
    const result = selectWithMinDistance(input, getKey, 10, 3)
    expect(result.length).toBe(2)
  })
})

describe('selectWordsForSession', () => {
  const getKey = (item: { id: string }) => item.id

  it('should respect default maxOccurrences (2) and minDistance (3)', () => {
    // Create input with many duplicates
    const input = [
      { id: 'a' }, { id: 'a' }, { id: 'a' }, { id: 'a' },
      { id: 'b' }, { id: 'b' }, { id: 'b' }, { id: 'b' },
      { id: 'c' }, { id: 'c' }, { id: 'c' }, { id: 'c' },
      { id: 'd' }, { id: 'd' },
      { id: 'e' }, { id: 'e' },
    ]

    for (let i = 0; i < 30; i++) {
      const result = selectWordsForSession(input, getKey, 10)

      // Check max 2 occurrences
      const counts = countOccurrences(result, getKey)
      for (const count of counts.values()) {
        expect(count).toBeLessThanOrEqual(2)
      }

      // Check minimum distance of 3
      expect(hasMinimumDistance(result, getKey, 3)).toBe(true)
    }
  })

  it('should return requested count', () => {
    const input = [
      { id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }, { id: 'e' },
      { id: 'f' }, { id: 'g' }, { id: 'h' }, { id: 'i' }, { id: 'j' },
    ]
    const result = selectWordsForSession(input, getKey, 10)
    expect(result.length).toBe(10)
  })

  it('should handle empty arrays', () => {
    const result = selectWordsForSession([], getKey, 10)
    expect(result).toEqual([])
  })

  it('should handle count of 0', () => {
    const input = [{ id: 'a' }, { id: 'b' }]
    const result = selectWordsForSession(input, getKey, 0)
    expect(result).toEqual([])
  })

  it('should work with custom options', () => {
    const input = [
      { id: 'a' }, { id: 'a' }, { id: 'a' },
      { id: 'b' }, { id: 'b' }, { id: 'b' },
    ]

    const result = selectWordsForSession(input, getKey, 6, {
      maxOccurrences: 1,
      minDistance: 2,
    })

    // With maxOccurrences 1, should only have 2 unique words
    const counts = countOccurrences(result, getKey)
    for (const count of counts.values()) {
      expect(count).toBe(1)
    }
  })

  it('should not modify the original array', () => {
    const input = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
    const originalCopy = JSON.stringify(input)
    selectWordsForSession(input, getKey, 3)
    expect(JSON.stringify(input)).toBe(originalCopy)
  })

  it('should work with word-like objects', () => {
    const words = [
      { id: 'hola', spanish: 'Hola', german: 'Hallo' },
      { id: 'hola', spanish: 'Hola', german: 'Hallo' },
      { id: 'adios', spanish: 'Adiós', german: 'Tschüss' },
      { id: 'adios', spanish: 'Adiós', german: 'Tschüss' },
      { id: 'gracias', spanish: 'Gracias', german: 'Danke' },
      { id: 'gracias', spanish: 'Gracias', german: 'Danke' },
      { id: 'por-favor', spanish: 'Por favor', german: 'Bitte' },
      { id: 'por-favor', spanish: 'Por favor', german: 'Bitte' },
      { id: 'buenos-dias', spanish: 'Buenos días', german: 'Guten Tag' },
      { id: 'buenos-dias', spanish: 'Buenos días', german: 'Guten Tag' },
    ]

    for (let i = 0; i < 20; i++) {
      const result = selectWordsForSession(words, (w) => w.id, 10)

      // Max 2 of each word
      const counts = countOccurrences(result, (w) => w.id)
      for (const count of counts.values()) {
        expect(count).toBeLessThanOrEqual(2)
      }

      // Min distance 3
      expect(hasMinimumDistance(result, (w) => w.id, 3)).toBe(true)
    }
  })

  it('should handle case where not enough words to fill count', () => {
    const input = [{ id: 'a' }, { id: 'b' }]
    const result = selectWordsForSession(input, getKey, 10)
    // With maxOccurrences 2, we can have at most 4 items
    expect(result.length).toBeLessThanOrEqual(4)
  })

  it('should produce varied results across multiple calls', () => {
    const input = [
      { id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }, { id: 'e' },
      { id: 'f' }, { id: 'g' }, { id: 'h' }, { id: 'i' }, { id: 'j' },
    ]

    const results = new Set<string>()
    for (let i = 0; i < 10; i++) {
      const result = selectWordsForSession(input, getKey, 5)
      results.add(result.map((r) => r.id).join(','))
    }

    // Should have at least some variation
    expect(results.size).toBeGreaterThan(1)
  })
})

describe('countOccurrences', () => {
  const getKey = (item: { id: string }) => item.id

  it('should count occurrences correctly', () => {
    const input = [
      { id: 'a' },
      { id: 'a' },
      { id: 'b' },
      { id: 'c' },
      { id: 'c' },
      { id: 'c' },
    ]

    const counts = countOccurrences(input, getKey)

    expect(counts.get('a')).toBe(2)
    expect(counts.get('b')).toBe(1)
    expect(counts.get('c')).toBe(3)
  })

  it('should handle empty arrays', () => {
    const counts = countOccurrences([], getKey)
    expect(counts.size).toBe(0)
  })
})
