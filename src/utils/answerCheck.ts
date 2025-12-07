export type AnswerResult = 'correct' | 'close' | 'wrong'

export function levenshtein(a: string, b: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

export function normalize(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^[¿¡]+|[?!]+$/g, '')
    .replace(/\.{2,}|…/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function checkAnswer(userInput: string, expected: string): AnswerResult {
  const normalizedInput = normalize(userInput)
  const normalizedExpected = normalize(expected)

  if (normalizedInput === normalizedExpected) {
    return 'correct'
  }

  const distance = levenshtein(normalizedInput, normalizedExpected)
  const maxAllowed = Math.max(2, Math.floor(normalizedExpected.length * 0.2))

  if (distance <= maxAllowed) {
    return 'close'
  }

  return 'wrong'
}
