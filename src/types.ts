export interface Word {
  id: string
  spanish: string
  german: string
  example: string
  exampleDe: string
}

// Verb-spezifische Typen
export type VerbEnding = 'ar' | 'er' | 'ir'

export type Person = 'yo' | 'tú' | 'él/ella' | 'nosotros' | 'vosotros' | 'ellos'

export type Tense = 'presente' | 'indefinido' | 'imperfecto' | 'futuro'

export interface ConjugationForms {
  yo: string
  tú: string
  'él/ella': string
  nosotros: string
  vosotros: string
  ellos: string
}

export interface VerbWord extends Word {
  type: 'verb'
  verbEnding: VerbEnding
  isRegular: boolean
  stemChange?: 'e>ie' | 'o>ue' | 'e>i' | 'u>ue' // Stammvokaländerung
  irregularForms?: {
    presente?: Partial<ConjugationForms>
    indefinido?: Partial<ConjugationForms>
    imperfecto?: Partial<ConjugationForms>
    futuro?: Partial<ConjugationForms>
  }
}

export interface WordWithCategory extends Word {
  category: string
  categoryName: string
  // Optionale Verb-Felder
  type?: 'verb'
  verbEnding?: VerbEnding
  isRegular?: boolean
  stemChange?: 'e>ie' | 'o>ue' | 'e>i' | 'u>ue'
  irregularForms?: VerbWord['irregularForms']
}

// Type Guard für Verben
export function isVerbWord(word: Word | WordWithCategory): word is VerbWord | (WordWithCategory & VerbWord) {
  return 'type' in word && word.type === 'verb'
}

export interface Category {
  category: string
  name: string
  words: Word[]
}

export interface CategoryWithDifficulty extends Category {
  difficulty: number // 1-5
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

export type ExerciseType = 'flashcard' | 'multiple-choice' | 'write' | 'mixed' | 'conjugation' | 'audio-practice' | 'sentence'

// Satz-Übung Typen
export interface SentenceTemplate {
  id: string
  german: string           // Deutscher Satz mit {slot} Platzhaltern
  spanish: string          // Spanischer Satz mit {slot} Platzhaltern
  slots: SentenceSlot[]    // Welche Wörter eingesetzt werden
  hints?: string[]         // Optionale Hilfestellungen
}

export interface SentenceSlot {
  key: string              // Platzhalter-Name z.B. "food"
  categories: string[]     // Erlaubte Kategorien für diesen Slot
  wordIds?: string[]       // Oder spezifische Wort-IDs
}

export interface GeneratedSentence {
  german: string           // Fertiger deutscher Satz
  spanish: string          // Fertiger spanischer Satz
  usedWords: WordWithCategory[]  // Verwendete Vokabeln (für Fortschritts-Update)
  template: SentenceTemplate     // Original-Template
}

export type TabId = 'dashboard' | 'practice' | 'vocabulary' | 'settings'

// Custom Word - benutzerdefinierte Vokabeln (Beispiele optional)
export interface CustomWord {
  id: string
  spanish: string
  german: string
  example?: string
  exampleDe?: string
  createdAt: string
  // Optionale Verb-Felder (ab Level 3)
  type?: 'verb'
  verbEnding?: VerbEnding
  isRegular?: boolean
}

// Custom Word als WordWithCategory für Integration
export interface CustomWordWithCategory extends CustomWord {
  category: 'custom'
  categoryName: string
}
