import type { Category, CategoryWithDifficulty, WordWithCategory } from '../types'

// Importiere alle Vokabel-Dateien
import greetings from '../../data/vocabulary/greetings.json'
import basics from '../../data/vocabulary/basics.json'
import numbers from '../../data/vocabulary/numbers.json'
import food from '../../data/vocabulary/food.json'
import market from '../../data/vocabulary/market.json'
import verbs from '../../data/vocabulary/verbs.json'
import family from '../../data/vocabulary/family.json'
import health from '../../data/vocabulary/health.json'
import home from '../../data/vocabulary/home.json'
import clothing from '../../data/vocabulary/clothing.json'
import weather from '../../data/vocabulary/weather.json'
import travel from '../../data/vocabulary/travel.json'
import work from '../../data/vocabulary/work.json'
import hobbies from '../../data/vocabulary/hobbies.json'
import emotions from '../../data/vocabulary/emotions.json'
import city from '../../data/vocabulary/city.json'
import adjectives from '../../data/vocabulary/adjectives.json'
import technology from '../../data/vocabulary/technology.json'
import daily from '../../data/vocabulary/daily.json'
import restaurant from '../../data/vocabulary/restaurant.json'
import foodExtended from '../../data/vocabulary/food-extended.json'
import animals from '../../data/vocabulary/animals.json'
import geography from '../../data/vocabulary/geography.json'
import materials from '../../data/vocabulary/materials.json'
import shapes from '../../data/vocabulary/shapes.json'
import music from '../../data/vocabulary/music.json'
import spanishCulture from '../../data/vocabulary/spanish-culture.json'
import politics from '../../data/vocabulary/politics.json'
import business from '../../data/vocabulary/business.json'
import finance from '../../data/vocabulary/finance.json'
import emergency from '../../data/vocabulary/emergency.json'
import connectors from '../../data/vocabulary/connectors.json'
import prepositions from '../../data/vocabulary/prepositions.json'
import idioms from '../../data/vocabulary/idioms.json'

export const categories: Category[] = [
  greetings,
  basics,
  numbers,
  food,
  market,
  verbs,
  family,
  health,
  home,
  clothing,
  weather,
  travel,
  work,
  hobbies,
  emotions,
  city,
  adjectives,
  technology,
  daily,
  restaurant,
  foodExtended,
  animals,
  geography,
  materials,
  shapes,
  music,
  spanishCulture,
  politics,
  business,
  finance,
  emergency,
  connectors,
  prepositions,
  idioms,
]

export const allWords: WordWithCategory[] = categories.flatMap((cat) =>
  cat.words.map((word) => ({ ...word, category: cat.category, categoryName: cat.name }))
)

export function getWordsByCategory(categoryId: string): WordWithCategory[] {
  const category = categories.find((c) => c.category === categoryId)
  if (!category) return []
  return category.words.map((word) => ({
    ...word,
    category: category.category,
    categoryName: category.name,
  }))
}

export function getRandomWords(count: number, excludeIds: string[] = []): WordWithCategory[] {
  const available = allWords.filter((w) => !excludeIds.includes(w.id))
  return available.sort(() => Math.random() - 0.5).slice(0, count)
}

// Alle Verben aus dem Vokabular (für Konjugationsübungen)
export function getAllVerbs(): WordWithCategory[] {
  return allWords.filter((w) => w.type === 'verb')
}

// Schwierigkeits-Mapping für Kategorien (1-15)
export const categoryDifficulty: Record<string, number> = {
  // Level 1 - Erste Schritte
  greetings: 1,
  basics: 1,
  // Level 2 - Zahlen & Alltag
  numbers: 2,
  daily: 2,
  // Level 3 - Familie & Zuhause
  family: 3,
  home: 3,
  // Level 4 - Essen & Trinken
  food: 4,
  restaurant: 4,
  // Level 5 - Einkaufen
  market: 5,
  clothing: 5,
  // Level 6 - Natur & Wetter
  weather: 6,
  animals: 6,
  // Level 7 - Unterwegs
  travel: 7,
  city: 7,
  // Level 8 - Gesundheit & Notfall
  health: 8,
  emergency: 8,
  // Level 9 - Arbeit & Freizeit
  work: 9,
  hobbies: 9,
  // Level 10 - Gefühle & Ausdruck
  emotions: 10,
  connectors: 10,
  // Level 11 - Beschreiben
  adjectives: 11,
  shapes: 11,
  materials: 11,
  // Level 12 - Grammatik-Bausteine
  verbs: 12,
  prepositions: 12,
  // Level 13 - Kultur & Musik
  music: 13,
  'spanish-culture': 13,
  // Level 14 - Welt & Moderne
  geography: 14,
  technology: 14,
  'food-extended': 14,
  // Level 15 - Fortgeschritten
  politics: 15,
  business: 15,
  finance: 15,
  idioms: 15,
}

// Kategorien mit Schwierigkeitsstufe
export const categoriesWithDifficulty: CategoryWithDifficulty[] = categories.map((cat) => ({
  ...cat,
  difficulty: categoryDifficulty[cat.category] || 3,
}))

// Nach Schwierigkeit sortierte Kategorien
export const sortedCategories = [...categoriesWithDifficulty].sort(
  (a, b) => a.difficulty - b.difficulty || a.name.localeCompare(b.name, 'de')
)

/**
 * Berechnet die Levenshtein-Distanz zwischen zwei Strings
 * Je kleiner der Wert, desto ähnlicher sind die Strings
 */
export function levenshteinDistance(a: string, b: string): number {
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
          matrix[i - 1][j - 1] + 1, // Substitution
          matrix[i][j - 1] + 1, // Insertion
          matrix[i - 1][j] + 1 // Deletion
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

/**
 * Extrahiert das Kernwort aus einem spanischen Ausdruck
 * Entfernt Artikel (El, La, Los, Las) und normalisiert
 */
function extractCoreWord(spanish: string): string {
  return spanish
    .toLowerCase()
    .replace(/^(el|la|los|las|un|una|unos|unas)\s+/i, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Entfernt Akzente
    .trim()
}

/**
 * Berechnet einen Ähnlichkeits-Score zwischen zwei Wörtern
 * Höherer Score = ähnlicher (besser als Distraktor)
 *
 * Faktoren:
 * - Phonetische Ähnlichkeit (Levenshtein)
 * - Gleicher Anfangsbuchstabe
 * - Ähnliche Wortlänge
 * - Gleiche Endung
 */
export function calculateSimilarityScore(word1: string, word2: string): number {
  const core1 = extractCoreWord(word1)
  const core2 = extractCoreWord(word2)

  let score = 0
  const maxLen = Math.max(core1.length, core2.length)

  // 1. Phonetische Ähnlichkeit (Levenshtein, normalisiert)
  // Je kleiner die Distanz, desto höher der Score
  const distance = levenshteinDistance(core1, core2)
  const similarityRatio = 1 - distance / maxLen
  score += similarityRatio * 50 // Max 50 Punkte

  // 2. Gleicher Anfangsbuchstabe (+15 Punkte)
  if (core1.charAt(0) === core2.charAt(0)) {
    score += 15
  }

  // 3. Gleiche ersten 2 Buchstaben (+10 Punkte)
  if (core1.substring(0, 2) === core2.substring(0, 2)) {
    score += 10
  }

  // 4. Ähnliche Wortlänge (+10 Punkte wenn Differenz <= 2)
  const lenDiff = Math.abs(core1.length - core2.length)
  if (lenDiff <= 2) {
    score += 10 - lenDiff * 3
  }

  // 5. Gleiche Endung (-ar, -er, -ir, -ción, etc.) (+15 Punkte)
  const endings = ['ar', 'er', 'ir', 'ción', 'sión', 'dad', 'mente', 'oso', 'osa', 'ero', 'era']
  for (const ending of endings) {
    if (core1.endsWith(ending) && core2.endsWith(ending)) {
      score += 15
      break
    }
  }

  return score
}

interface ScoredWord {
  word: WordWithCategory
  score: number
}

/**
 * Wählt intelligente Distraktoren (falsche Antworten) für Multiple-Choice
 * Priorisierung:
 * 1. Gleiche Kategorie + hohe phonetische/visuelle Ähnlichkeit
 * 2. Andere Kategorie + hohe phonetische Ähnlichkeit
 * 3. Ähnliche Schwierigkeitsstufe (±2 Levels)
 * 4. Zufällige Wörter als Fallback
 */
export function getSmartDistractors(
  targetWord: WordWithCategory,
  allWords: WordWithCategory[],
  count: number = 3
): WordWithCategory[] {
  const targetDifficulty = categoryDifficulty[targetWord.category] || 8

  // Alle außer dem Zielwort
  const available = allWords.filter((w) => w.id !== targetWord.id)

  // Berechne Ähnlichkeits-Scores für alle Wörter
  const scoredWords: ScoredWord[] = available.map((w) => {
    let score = calculateSimilarityScore(targetWord.spanish, w.spanish)

    // Bonus für gleiche Kategorie (+30)
    if (w.category === targetWord.category) {
      score += 30
    }

    // Bonus für ähnliche Schwierigkeit (+10 für ±2 Levels)
    const diff = categoryDifficulty[w.category] || 8
    if (Math.abs(diff - targetDifficulty) <= 2) {
      score += 10
    }

    return { word: w, score }
  })

  // Sortiere nach Score (höchster zuerst)
  scoredWords.sort((a, b) => b.score - a.score)

  // Wähle die Top-Kandidaten, aber mit etwas Zufall
  // Nimm aus den Top 20% zufällig, um Variation zu gewährleisten
  const topPoolSize = Math.max(count * 3, Math.ceil(scoredWords.length * 0.2))
  const topPool = scoredWords.slice(0, topPoolSize)

  // Mische die Top-Kandidaten und wähle die gewünschte Anzahl
  const shuffled = topPool.sort(() => Math.random() - 0.5)

  return shuffled.slice(0, count).map((sw) => sw.word)
}
