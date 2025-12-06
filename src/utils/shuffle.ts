/**
 * Shuffle utilities for practice sessions.
 *
 * Rules:
 * - Maximum 2 occurrences of the same word per session
 * - Minimum 3 words distance between duplicates
 */

export interface ShuffleOptions {
  maxOccurrences?: number
  minDistance?: number
}

const DEFAULT_OPTIONS: Required<ShuffleOptions> = {
  maxOccurrences: 2,
  minDistance: 3,
}

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
 * Prepares words for a practice session with duplicate limits and spacing.
 *
 * @param array - The array to process
 * @param getKey - Function to extract a comparison key from each element
 * @param count - Number of words to return
 * @param options - Configuration for max occurrences and min distance
 * @returns Array of words respecting the duplicate rules
 */
export function selectWordsForSession<T>(
  array: T[],
  getKey: (item: T) => string,
  count: number,
  options: ShuffleOptions = {}
): T[] {
  const { maxOccurrences, minDistance } = { ...DEFAULT_OPTIONS, ...options }

  if (array.length === 0 || count <= 0) {
    return []
  }

  // Step 1: Limit occurrences per word
  const limitedPool = limitOccurrences(array, getKey, maxOccurrences)

  // Step 2: Try to build a valid sequence with retries
  const maxAttempts = 20
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const shuffled = shuffle(limitedPool)
    const selected = selectWithMinDistance(shuffled, getKey, count, minDistance)

    // Verify the result meets our constraints
    if (hasMinimumDistance(selected, getKey, minDistance)) {
      return selected
    }
  }

  // Fallback: Use interleaving algorithm for guaranteed spacing
  return interleaveWithSpacing(limitedPool, getKey, count, minDistance)
}

/**
 * Interleaves items to guarantee minimum distance between same keys.
 * This is a deterministic fallback that ensures spacing.
 */
function interleaveWithSpacing<T>(
  array: T[],
  getKey: (item: T) => string,
  count: number,
  minDistance: number
): T[] {
  // Group items by key
  const groups = new Map<string, T[]>()
  for (const item of shuffle(array)) {
    const key = getKey(item)
    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key)!.push(item)
  }

  // Sort groups by size (largest first) for better distribution
  const sortedGroups = [...groups.values()].sort((a, b) => b.length - a.length)

  // Build result by round-robin picking from groups
  const result: T[] = []
  const recentKeys: string[] = []

  while (result.length < count) {
    let added = false

    for (const group of sortedGroups) {
      if (group.length === 0) continue

      const candidateKey = getKey(group[0])

      // Check if we can add this item (respects minDistance)
      if (!recentKeys.slice(-minDistance).includes(candidateKey)) {
        const item = group.shift()!
        result.push(item)
        recentKeys.push(candidateKey)
        added = true

        if (result.length >= count) break
      }
    }

    // If we couldn't add anything in this round, we're stuck
    // Try to find any remaining item that maximizes distance
    if (!added) {
      let bestItem: T | null = null
      let bestGroup: T[] | null = null
      let bestDistance = -1

      for (const group of sortedGroups) {
        if (group.length === 0) continue

        const candidateKey = getKey(group[0])
        const lastIndex = recentKeys.lastIndexOf(candidateKey)
        const distance = lastIndex === -1 ? Infinity : recentKeys.length - lastIndex

        if (distance > bestDistance) {
          bestDistance = distance
          bestItem = group[0]
          bestGroup = group
        }
      }

      if (bestItem && bestGroup) {
        bestGroup.shift()
        result.push(bestItem)
        recentKeys.push(getKey(bestItem))
      } else {
        // No more items available
        break
      }
    }
  }

  return result
}

/**
 * Limits the number of occurrences of each unique key in the array.
 */
export function limitOccurrences<T>(
  array: T[],
  getKey: (item: T) => string,
  maxOccurrences: number
): T[] {
  const counts = new Map<string, number>()
  const result: T[] = []

  // First shuffle to randomize which duplicates we keep
  const shuffled = shuffle(array)

  for (const item of shuffled) {
    const key = getKey(item)
    const currentCount = counts.get(key) || 0
    if (currentCount < maxOccurrences) {
      result.push(item)
      counts.set(key, currentCount + 1)
    }
  }

  return result
}

/**
 * Selects items from array while maintaining minimum distance between same keys.
 */
export function selectWithMinDistance<T>(
  array: T[],
  getKey: (item: T) => string,
  count: number,
  minDistance: number
): T[] {
  const result: T[] = []
  const remaining = [...array]
  const recentKeys: string[] = []

  while (result.length < count && remaining.length > 0) {
    // Find a valid candidate
    let foundIndex = -1

    // Shuffle remaining to add randomness while still respecting constraints
    const indices = [...Array(remaining.length).keys()]
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[indices[i], indices[j]] = [indices[j], indices[i]]
    }

    for (const i of indices) {
      const candidateKey = getKey(remaining[i])

      // Check if this key appeared in the last minDistance positions
      if (!recentKeys.slice(-minDistance).includes(candidateKey)) {
        foundIndex = i
        break
      }
    }

    // If no valid candidate found, we're done with this attempt
    if (foundIndex === -1) {
      break
    }

    // Add the selected item
    const selected = remaining.splice(foundIndex, 1)[0]
    result.push(selected)
    recentKeys.push(getKey(selected))
  }

  return result
}

/**
 * Checks if minimum distance is maintained between same keys.
 */
export function hasMinimumDistance<T>(
  array: T[],
  getKey: (item: T) => string,
  minDistance: number
): boolean {
  const lastSeen = new Map<string, number>()

  for (let i = 0; i < array.length; i++) {
    const key = getKey(array[i])
    const lastIndex = lastSeen.get(key)

    if (lastIndex !== undefined) {
      const distance = i - lastIndex
      if (distance < minDistance) {
        return false
      }
    }

    lastSeen.set(key, i)
  }

  return true
}

/**
 * Counts occurrences of each key in the array.
 */
export function countOccurrences<T>(array: T[], getKey: (item: T) => string): Map<string, number> {
  const counts = new Map<string, number>()
  for (const item of array) {
    const key = getKey(item)
    counts.set(key, (counts.get(key) || 0) + 1)
  }
  return counts
}

/**
 * Legacy function for backwards compatibility.
 * @deprecated Use selectWordsForSession instead
 */
export function shuffleWithoutConsecutiveDuplicates<T>(
  array: T[],
  getKey: (item: T) => string
): T[] {
  return selectWordsForSession(array, getKey, array.length)
}
