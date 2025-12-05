import type { Category, WordWithCategory } from '../types'

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
