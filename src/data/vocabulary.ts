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

// Schwierigkeits-Mapping für Kategorien (1-18)
export const categoryDifficulty: Record<string, number> = {
  // Level 1 - Erste Schritte
  greetings: 1,
  basics: 1,
  // Level 2 - Zahlen & Beschreiben
  numbers: 2,
  adjectives: 2,
  // Level 3 - Familie & Grundverben
  family: 3,
  verbs: 3,
  // Level 4 - Zuhause & Ortsangaben
  home: 4,
  prepositions: 4,
  // Level 5 - Essen & Trinken
  food: 5,
  restaurant: 5,
  // Level 6 - Einkaufen
  market: 6,
  clothing: 6,
  // Level 7 - Alltag & Verbindungswörter
  daily: 7,
  connectors: 7,
  // Level 8 - Natur
  weather: 8,
  animals: 8,
  // Level 9 - Unterwegs
  travel: 9,
  city: 9,
  // Level 10 - Gesundheit & Notfall
  health: 10,
  emergency: 10,
  // Level 11 - Arbeit & Freizeit
  work: 11,
  hobbies: 11,
  // Level 12 - Gefühle
  emotions: 12,
  // Level 13 - Formen & Materialien
  shapes: 13,
  materials: 13,
  // Level 14 - Kultur & Musik
  music: 14,
  'spanish-culture': 14,
  // Level 15 - Geografie
  geography: 15,
  // Level 16 - Technik & Erweitertes Essen
  technology: 16,
  'food-extended': 16,
  // Level 17 - Politik & Geschäft
  politics: 17,
  business: 17,
  // Level 18 - Finanzen & Redewendungen
  finance: 18,
  idioms: 18,
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
 * Semantische Gruppen - Wörter die konzeptuell zusammengehören
 * und als Distraktoren füreinander besonders gut geeignet sind
 */
type SemanticGroup =
  | 'question_word'
  | 'time_adverb'
  | 'place_adverb'
  | 'affirmation'
  | 'greeting'
  | 'weekday'
  | 'month'
  | 'color'
  | 'number'
  | 'ordinal'
  | 'family'
  | 'body_part'
  | 'direction'
  | null

/**
 * Erkennt die semantische Gruppe eines Wortes basierend auf Mustern
 */
export function getSemanticGroup(spanish: string): SemanticGroup {
  const normalized = spanish
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()

  // Fragewörter (beginnen mit ¿ oder enthalten typische Fragewörter)
  if (
    spanish.startsWith('¿') ||
    /^(como|que|cuando|donde|por que|cual|quien|cuanto|adonde)\b/.test(normalized)
  ) {
    return 'question_word'
  }

  // Zeitadverbien
  if (
    /^(hoy|manana|ayer|ahora|luego|despues|antes|siempre|nunca|todavia|ya|pronto|tarde|temprano)\b/.test(
      normalized
    )
  ) {
    return 'time_adverb'
  }

  // Ortsadverbien
  if (/^(aqui|alli|aca|alla|cerca|lejos|dentro|fuera|arriba|abajo|delante|detras)\b/.test(normalized)) {
    return 'place_adverb'
  }

  // Bejahung/Verneinung
  if (/^(si|no|tal vez|quiza|quizas|claro|por supuesto)\b/.test(normalized)) {
    return 'affirmation'
  }

  // Begrüßungen
  if (
    /^(hola|adios|buenos dias|buenas tardes|buenas noches|hasta luego|hasta manana|chao)\b/.test(
      normalized
    )
  ) {
    return 'greeting'
  }

  // Wochentage
  if (/^(lunes|martes|miercoles|jueves|viernes|sabado|domingo)\b/.test(normalized)) {
    return 'weekday'
  }

  // Monate
  if (
    /^(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\b/.test(
      normalized
    )
  ) {
    return 'month'
  }

  // Farben
  if (
    /^(rojo|azul|verde|amarillo|naranja|morado|rosa|negro|blanco|gris|marron|violeta)\b/.test(
      normalized
    )
  ) {
    return 'color'
  }

  // Ordinalzahlen
  if (/^(primero|segundo|tercero|cuarto|quinto|sexto|septimo|octavo|noveno|decimo)\b/.test(normalized)) {
    return 'ordinal'
  }

  // Richtungen
  if (/^(norte|sur|este|oeste|izquierda|derecha|recto|adelante|atras)\b/.test(normalized)) {
    return 'direction'
  }

  return null
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
 * 1. Gleiche semantische Gruppe (Fragewörter, Wochentage, etc.)
 * 2. Gleiche Kategorie + hohe phonetische/visuelle Ähnlichkeit
 * 3. Andere Kategorie + hohe phonetische Ähnlichkeit
 * 4. Ähnliche Schwierigkeitsstufe (±2 Levels)
 * 5. Zufällige Wörter als Fallback
 */
export function getSmartDistractors(
  targetWord: WordWithCategory,
  allWords: WordWithCategory[],
  count: number = 3
): WordWithCategory[] {
  const targetDifficulty = categoryDifficulty[targetWord.category] || 8
  const targetSemanticGroup = getSemanticGroup(targetWord.spanish)

  // Alle außer dem Zielwort - Duplikate nach ID entfernen
  const seenIds = new Set<string>([targetWord.id])
  const available: WordWithCategory[] = []
  for (const w of allWords) {
    if (!seenIds.has(w.id)) {
      seenIds.add(w.id)
      available.push(w)
    }
  }

  // Berechne Ähnlichkeits-Scores für alle Wörter
  const scoredWords: ScoredWord[] = available.map((w) => {
    let score = calculateSimilarityScore(targetWord.spanish, w.spanish)

    // Bonus für gleiche semantische Gruppe (+50) - höchste Priorität!
    // z.B. Fragewörter mit Fragewörtern, Wochentage mit Wochentagen
    if (targetSemanticGroup !== null) {
      const wordSemanticGroup = getSemanticGroup(w.spanish)
      if (wordSemanticGroup === targetSemanticGroup) {
        score += 50
      }
    }

    // Bonus für gleiche Kategorie (+40) - wichtiger als phonetische Ähnlichkeit
    if (w.category === targetWord.category) {
      score += 40
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

  // Strategie: Wähle die besten Kandidaten mit minimaler Zufallsvariation
  // Nimm die Top-Kandidaten und wähle daraus, um etwas Variation zu haben
  // aber nicht zu viel (nur aus den Top count + 2)
  const topPoolSize = Math.min(count + 2, scoredWords.length)
  const topPool = scoredWords.slice(0, topPoolSize)

  // Mische nur die Top-Kandidaten leicht
  const shuffled = topPool.sort(() => Math.random() - 0.5)

  return shuffled.slice(0, count).map((sw) => sw.word)
}
