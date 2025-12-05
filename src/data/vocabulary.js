// Importiere alle Vokabel-Dateien
import greetings from '../../data/vocabulary/greetings.json'
import basics from '../../data/vocabulary/basics.json'
import numbers from '../../data/vocabulary/numbers.json'
import food from '../../data/vocabulary/food.json'
import market from '../../data/vocabulary/market.json'

export const categories = [
  greetings,
  basics,
  numbers,
  food,
  market,
]

export const allWords = categories.flatMap((cat) =>
  cat.words.map((word) => ({ ...word, category: cat.category, categoryName: cat.name }))
)

export function getWordsByCategory(categoryId) {
  const category = categories.find((c) => c.category === categoryId)
  return category ? category.words : []
}

export function getRandomWords(count, excludeIds = []) {
  const available = allWords.filter((w) => !excludeIds.includes(w.id))
  return available.sort(() => Math.random() - 0.5).slice(0, count)
}
