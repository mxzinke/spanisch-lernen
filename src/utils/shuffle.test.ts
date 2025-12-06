import { describe, it, expect } from 'vitest'
import { shuffle, shuffleWithoutConsecutiveDuplicates, hasConsecutiveDuplicates } from './shuffle'

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

describe('hasConsecutiveDuplicates', () => {
  it('should return true when consecutive duplicates exist', () => {
    const array = [{ id: 'a' }, { id: 'a' }, { id: 'b' }]
    expect(hasConsecutiveDuplicates(array, (item) => item.id)).toBe(true)
  })

  it('should return false when no consecutive duplicates exist', () => {
    const array = [{ id: 'a' }, { id: 'b' }, { id: 'a' }]
    expect(hasConsecutiveDuplicates(array, (item) => item.id)).toBe(false)
  })

  it('should return false for empty arrays', () => {
    expect(hasConsecutiveDuplicates([], (item: { id: string }) => item.id)).toBe(false)
  })

  it('should return false for single element arrays', () => {
    const array = [{ id: 'a' }]
    expect(hasConsecutiveDuplicates(array, (item) => item.id)).toBe(false)
  })

  it('should detect duplicates at the end', () => {
    const array = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'c' }]
    expect(hasConsecutiveDuplicates(array, (item) => item.id)).toBe(true)
  })
})

describe('shuffleWithoutConsecutiveDuplicates', () => {
  it('should return an array of the same length', () => {
    const input = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
    const result = shuffleWithoutConsecutiveDuplicates(input, (item) => item.id)
    expect(result.length).toBe(input.length)
  })

  it('should not have consecutive duplicates when possible', () => {
    // Create an array with potential for consecutive duplicates
    const input = [
      { id: 'a' },
      { id: 'a' },
      { id: 'b' },
      { id: 'b' },
      { id: 'c' },
      { id: 'c' },
    ]

    // Run multiple times to ensure it consistently works
    for (let i = 0; i < 20; i++) {
      const result = shuffleWithoutConsecutiveDuplicates(input, (item) => item.id)
      expect(hasConsecutiveDuplicates(result, (item) => item.id)).toBe(false)
    }
  })

  it('should handle arrays where consecutive duplicates are unavoidable', () => {
    // More of one type than others, making it impossible to avoid consecutive duplicates
    const input = [
      { id: 'a' },
      { id: 'a' },
      { id: 'a' },
      { id: 'a' },
      { id: 'b' },
    ]

    // Should not throw and should return all elements
    const result = shuffleWithoutConsecutiveDuplicates(input, (item) => item.id)
    expect(result.length).toBe(input.length)
  })

  it('should handle empty arrays', () => {
    const result = shuffleWithoutConsecutiveDuplicates([], (item: { id: string }) => item.id)
    expect(result).toEqual([])
  })

  it('should handle single element arrays', () => {
    const input = [{ id: 'a' }]
    const result = shuffleWithoutConsecutiveDuplicates(input, (item) => item.id)
    expect(result).toEqual([{ id: 'a' }])
  })

  it('should contain all original elements', () => {
    const input = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }]
    const result = shuffleWithoutConsecutiveDuplicates(input, (item) => item.id)
    const inputIds = input.map((i) => i.id).sort()
    const resultIds = result.map((i) => i.id).sort()
    expect(resultIds).toEqual(inputIds)
  })

  it('should work with word-like objects', () => {
    const words = [
      { id: 'hola', spanish: 'Hola', german: 'Hallo' },
      { id: 'adios', spanish: 'Adiós', german: 'Tschüss' },
      { id: 'gracias', spanish: 'Gracias', german: 'Danke' },
      { id: 'hola', spanish: 'Hola', german: 'Hallo' }, // duplicate
      { id: 'por-favor', spanish: 'Por favor', german: 'Bitte' },
    ]

    for (let i = 0; i < 20; i++) {
      const result = shuffleWithoutConsecutiveDuplicates(words, (w) => w.id)
      expect(hasConsecutiveDuplicates(result, (w) => w.id)).toBe(false)
    }
  })

  it('should not modify the original array', () => {
    const input = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
    const originalCopy = JSON.stringify(input)
    shuffleWithoutConsecutiveDuplicates(input, (item) => item.id)
    expect(JSON.stringify(input)).toBe(originalCopy)
  })

  it('should handle larger arrays with multiple duplicate groups', () => {
    const input = [
      { id: 'a' },
      { id: 'a' },
      { id: 'b' },
      { id: 'b' },
      { id: 'c' },
      { id: 'c' },
      { id: 'd' },
      { id: 'd' },
      { id: 'e' },
      { id: 'e' },
    ]

    for (let i = 0; i < 20; i++) {
      const result = shuffleWithoutConsecutiveDuplicates(input, (item) => item.id)
      expect(result.length).toBe(input.length)
      expect(hasConsecutiveDuplicates(result, (item) => item.id)).toBe(false)
    }
  })
})
