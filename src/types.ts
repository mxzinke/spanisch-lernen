export interface Word {
  id: string
  spanish: string
  german: string
  example: string
  exampleDe: string
}

export interface WordWithCategory extends Word {
  category: string
  categoryName: string
}

export interface Category {
  category: string
  name: string
  words: Word[]
}

export interface WordProgress {
  box: number
  lastSeen: string
  correct: number
  wrong: number
}

export interface Stats {
  streak: number
  lastPractice: string | null
  totalCorrect: number
  totalWrong: number
}

export interface Progress {
  words: Record<string, WordProgress>
  stats: Stats
}

export interface SpeechSettings {
  rate: number
  voiceName: string | null
}

export type ExerciseType = 'flashcard' | 'multiple-choice' | 'write' | 'mixed'

export type TabId = 'dashboard' | 'practice' | 'vocabulary' | 'settings'
