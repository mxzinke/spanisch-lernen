import { useProgress } from '../hooks/useProgress.js'
import { allWords, categories } from '../data/vocabulary.js'

export function Dashboard() {
  const { progress, getStats, getWordsForReview } = useProgress()
  const stats = getStats()

  // Berechne Statistiken
  const learnedWords = Object.keys(progress.words).length
  const totalWords = allWords.length
  const wordsForReview = getWordsForReview(allWords).length

  // Box-Verteilung
  const boxDistribution = [0, 0, 0, 0, 0]
  Object.values(progress.words).forEach((wp) => {
    boxDistribution[wp.box - 1]++
  })

  // Heutiges Datum
  const today = new Date().toISOString().split('T')[0]
  const practicedToday = stats.lastPractice === today

  return (
    <div class="space-y-6">
      {/* Willkommen */}
      <div class="card bg-gradient-to-r from-spanish-red to-red-600 text-white">
        <h2 class="text-xl font-bold">¡Hola! 👋</h2>
        <p class="text-red-100 mt-1">
          {practicedToday
            ? 'Du hast heute schon geübt. ¡Muy bien!'
            : 'Zeit für deine tägliche Übung!'}
        </p>
      </div>

      {/* Streak */}
      <div class="card text-center">
        <div class="text-5xl mb-2">🔥</div>
        <div class="text-4xl font-bold text-spanish-red">{stats.streak}</div>
        <p class="text-gray-500">
          {stats.streak === 1 ? 'Tag' : 'Tage'} in Folge
        </p>
      </div>

      {/* Statistiken */}
      <div class="grid grid-cols-2 gap-4">
        <div class="card text-center">
          <p class="text-3xl font-bold text-spanish-red">{learnedWords}</p>
          <p class="text-sm text-gray-500">Wörter gelernt</p>
          <p class="text-xs text-gray-400">von {totalWords}</p>
        </div>
        <div class="card text-center">
          <p class="text-3xl font-bold text-spanish-yellow">{wordsForReview}</p>
          <p class="text-sm text-gray-500">Zur Wiederholung</p>
          <p class="text-xs text-gray-400">fällig heute</p>
        </div>
      </div>

      {/* Erfolgsquote */}
      <div class="card">
        <h3 class="font-bold mb-3">Erfolgsquote</h3>
        <div class="flex items-center gap-4">
          <div class="flex-1 bg-gray-200 rounded-full h-4">
            <div
              class="bg-green-500 h-4 rounded-full transition-all"
              style={{
                width: `${
                  stats.totalCorrect + stats.totalWrong > 0
                    ? (stats.totalCorrect / (stats.totalCorrect + stats.totalWrong)) * 100
                    : 0
                }%`,
              }}
            />
          </div>
          <span class="font-bold text-green-600">
            {stats.totalCorrect + stats.totalWrong > 0
              ? Math.round(
                  (stats.totalCorrect / (stats.totalCorrect + stats.totalWrong)) * 100
                )
              : 0}
            %
          </span>
        </div>
        <div class="flex justify-between text-sm text-gray-500 mt-2">
          <span>✓ {stats.totalCorrect} richtig</span>
          <span>✗ {stats.totalWrong} falsch</span>
        </div>
      </div>

      {/* Leitner-Boxen */}
      <div class="card">
        <h3 class="font-bold mb-3">Lernfortschritt (Leitner-System)</h3>
        <div class="space-y-2">
          {boxDistribution.map((count, i) => (
            <div key={i} class="flex items-center gap-3">
              <span class="text-sm w-16 text-gray-500">Box {i + 1}</span>
              <div class="flex-1 bg-gray-100 rounded-full h-3">
                <div
                  class="h-3 rounded-full transition-all"
                  style={{
                    width: `${learnedWords > 0 ? (count / learnedWords) * 100 : 0}%`,
                    backgroundColor: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'][i],
                  }}
                />
              </div>
              <span class="text-sm w-8 text-right text-gray-600">{count}</span>
            </div>
          ))}
        </div>
        <p class="text-xs text-gray-400 mt-3">
          Box 1 = täglich • Box 5 = alle 16 Tage
        </p>
      </div>

      {/* Kategorien */}
      <div class="card">
        <h3 class="font-bold mb-3">Kategorien</h3>
        <div class="space-y-2">
          {categories.map((cat) => {
            const catWords = allWords.filter((w) => w.category === cat.category)
            const learned = catWords.filter((w) => progress.words[w.id]).length
            return (
              <div key={cat.category} class="flex items-center gap-3">
                <span class="text-sm flex-1">{cat.name}</span>
                <div class="w-24 bg-gray-100 rounded-full h-2">
                  <div
                    class="bg-spanish-red h-2 rounded-full"
                    style={{ width: `${(learned / catWords.length) * 100}%` }}
                  />
                </div>
                <span class="text-xs text-gray-500 w-12 text-right">
                  {learned}/{catWords.length}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
