/**
 * Shuffle utilities for preventing consecutive duplicates in word exercises.
 */

/**
 * Fisher-Yates shuffle algorithm - provides a proper random shuffle.
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Shuffles an array while ensuring no consecutive elements have the same key.
 * This is useful for word exercises where we don't want the same word
 * appearing directly after itself.
 *
 * @param array - The array to shuffle
 * @param getKey - Function to extract a comparison key from each element
 * @param maxAttempts - Maximum shuffle attempts before giving up (default: 10)
 * @returns Shuffled array with no consecutive duplicates (if possible)
 */
export function shuffleWithoutConsecutiveDuplicates<T>(
  array: T[],
  getKey: (item: T) => string,
  maxAttempts: number = 10
): T[] {
  if (array.length <= 1) {
    return [...array]
  }

  // First, do a proper Fisher-Yates shuffle
  let result = shuffle(array)

  // Check if we have consecutive duplicates
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (!hasConsecutiveDuplicates(result, getKey)) {
      return result
    }

    // Try to fix consecutive duplicates by swapping
    result = fixConsecutiveDuplicates(result, getKey)

    // If fixing didn't work, reshuffle and try again
    if (hasConsecutiveDuplicates(result, getKey)) {
      result = shuffle(array)
    }
  }

  // If we couldn't fix after max attempts, return best effort
  return result
}

/**
 * Checks if an array has any consecutive elements with the same key.
 */
export function hasConsecutiveDuplicates<T>(array: T[], getKey: (item: T) => string): boolean {
  for (let i = 0; i < array.length - 1; i++) {
    if (getKey(array[i]) === getKey(array[i + 1])) {
      return true
    }
  }
  return false
}

/**
 * Attempts to fix consecutive duplicates by swapping elements.
 */
function fixConsecutiveDuplicates<T>(array: T[], getKey: (item: T) => string): T[] {
  const result = [...array]

  for (let i = 0; i < result.length - 1; i++) {
    if (getKey(result[i]) === getKey(result[i + 1])) {
      // Find a suitable element to swap with
      let swapped = false
      for (let j = i + 2; j < result.length; j++) {
        // Check if swapping would not create new consecutive duplicates
        const candidateKey = getKey(result[j])
        const prevKey = i > 0 ? getKey(result[i - 1]) : null
        const nextNextKey = j + 1 < result.length ? getKey(result[j + 1]) : null

        // Candidate should not match the previous element (at position i-1)
        // and the element at i should not match the element after j
        if (candidateKey !== getKey(result[i]) && candidateKey !== prevKey) {
          // Also check that moving result[i+1] to position j won't create issues
          const movedKey = getKey(result[i + 1])
          if (movedKey !== nextNextKey && (j - 1 === i + 1 || movedKey !== getKey(result[j - 1]))) {
            ;[result[i + 1], result[j]] = [result[j], result[i + 1]]
            swapped = true
            break
          }
        }
      }

      // If we couldn't find a good swap, try swapping with an earlier element
      if (!swapped) {
        for (let j = 0; j < i; j++) {
          const candidateKey = getKey(result[j])
          if (candidateKey !== getKey(result[i]) && candidateKey !== getKey(result[i + 2] ?? result[i])) {
            const prevKey = j > 0 ? getKey(result[j - 1]) : null
            const nextKey = j + 1 < i ? getKey(result[j + 1]) : null
            const movedKey = getKey(result[i + 1])
            if (movedKey !== prevKey && movedKey !== nextKey) {
              ;[result[i + 1], result[j]] = [result[j], result[i + 1]]
              break
            }
          }
        }
      }
    }
  }

  return result
}
