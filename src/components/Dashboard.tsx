import { useProgress } from '../hooks/useProgress'
import { allWords, categories } from '../data/vocabulary'

export function Dashboard() {
  const { progress, getStats, getWordsForReview } = useProgress()
  const stats = getStats()

  const learnedWords = Object.keys(progress.words).length
  const totalWords = allWords.length
  const wordsForReview = getWordsForReview(allWords).length

  // Box distribution
  const boxDistribution = [0, 0, 0, 0, 0]
  Object.values(progress.words).forEach((wp) => {
    boxDistribution[wp.box - 1]++
  })

  const today = new Date().toISOString().split('T')[0]
  const practicedToday = stats.lastPractice === today

  const successRate =
    stats.totalCorrect + stats.totalWrong > 0
      ? Math.round((stats.totalCorrect / (stats.totalCorrect + stats.totalWrong)) * 100)
      : 0

  return (
    <div class="space-y-8">
      {/* Welcome section - simple and warm */}
      <section class="text-center py-4">
        <h2 class="text-2xl font-semibold font-serif text-warm-brown mb-2">
          {practicedToday ? 'Gut gemacht heute!' : 'Bereit zum Lernen?'}
        </h2>
        <p class="text-warm-gray">
          {practicedToday
            ? 'Du hast heute schon geübt. Weiter so!'
            : wordsForReview > 0
              ? `${wordsForReview} Vokabeln warten auf dich`
              : 'Starte mit einer neuen Übung'}
        </p>
      </section>

      {/* Main stats - clean grid */}
      <section class="grid grid-cols-3 gap-4">
        <div class="card text-center">
          <p class="text-3xl font-semibold text-warm-gold mb-1">{stats.streak}</p>
          <p class="text-sm text-warm-gray">Tage-Streak</p>
        </div>
        <div class="card text-center">
          <p class="text-3xl font-semibold text-terracotta mb-1">{learnedWords}</p>
          <p class="text-sm text-warm-gray">Gelernt</p>
        </div>
        <div class="card text-center">
          <p class="text-3xl font-semibold text-olive mb-1">{successRate}%</p>
          <p class="text-sm text-warm-gray">Erfolgsquote</p>
        </div>
      </section>

      {/* Progress overview */}
      <section class="card">
        <div class="flex items-center justify-between mb-4">
          <h3>Gesamtfortschritt</h3>
          <span class="text-sm text-warm-gray">{learnedWords} von {totalWords}</span>
        </div>
        <div class="progress-track h-2">
          <div
            class="progress-fill h-full bg-terracotta"
            style={{ width: `${(learnedWords / totalWords) * 100}%` }}
          />
        </div>
        <div class="flex justify-between text-xs text-warm-gray mt-3">
          <span>{stats.totalCorrect} richtige Antworten</span>
          <span>{stats.totalWrong} falsche Antworten</span>
        </div>
      </section>

      {/* Leitner boxes - simplified */}
      <section class="card">
        <h3 class="mb-4">Lernstand</h3>
        <div class="space-y-3">
          {boxDistribution.map((count, i) => {
            const maxCount = Math.max(...boxDistribution, 1)
            const labels = ['Täglich', 'Alle 2 Tage', 'Alle 4 Tage', 'Alle 8 Tage', 'Gemeistert']
            const colors = ['bg-rose-muted', 'bg-clay-light', 'bg-clay', 'bg-olive-light', 'bg-olive']

            return (
              <div key={i} class="flex items-center gap-3">
                <span class="text-xs text-warm-gray w-20">{labels[i]}</span>
                <div class="flex-1 progress-track h-1.5">
                  <div
                    class={`progress-fill h-full ${colors[i]}`}
                    style={{ width: `${maxCount > 0 ? (count / maxCount) * 100 : 0}%` }}
                  />
                </div>
                <span class="text-xs text-warm-gray w-6 text-right">{count}</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* Categories - subtle progress indicators */}
      <section class="card">
        <h3 class="mb-4">Kategorien</h3>
        <div class="space-y-3">
          {categories.map((cat) => {
            const catWords = allWords.filter((w) => w.category === cat.category)
            const learned = catWords.filter((w) => progress.words[w.id]).length
            const percentage = (learned / catWords.length) * 100

            return (
              <div key={cat.category} class="flex items-center gap-3">
                <span class="text-sm text-warm-brown flex-1">{cat.name}</span>
                <div class="w-20 progress-track h-1.5">
                  <div
                    class="progress-fill h-full bg-terracotta"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span class="text-xs text-warm-gray w-10 text-right">
                  {learned}/{catWords.length}
                </span>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
