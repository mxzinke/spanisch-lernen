import { useProgress } from '../hooks/useProgress'
import { allWords, categories } from '../data/vocabulary'

// Motivierende Sprüche nach Tageszeit und Zustand
const motivationalMessages = {
  morning: {
    // 5:00 - 11:59
    notPracticed: [
      { title: '¡Buenos días!', subtitle: 'Starte deinen Tag mit Spanisch' },
      { title: 'Guten Morgen!', subtitle: 'Morgens lernt es sich am besten' },
      { title: 'Frisch ans Werk!', subtitle: 'Ein paar Vokabeln zum Wachwerden?' },
      { title: '¡Arriba!', subtitle: 'Der frühe Vogel lernt Spanisch' },
      { title: 'Bereit für heute?', subtitle: 'Starte entspannt in den Tag' },
    ],
    practiced: [
      { title: '¡Excelente!', subtitle: 'Toll gestartet - der Tag kann kommen!' },
      { title: 'Früh geübt!', subtitle: 'Du hast den Tag produktiv begonnen' },
      { title: '¡Muy bien!', subtitle: 'Morgens gleich erledigt - super!' },
    ],
  },
  afternoon: {
    // 12:00 - 17:59
    notPracticed: [
      { title: '¡Buenas tardes!', subtitle: 'Zeit für eine Lernpause?' },
      { title: 'Kurze Pause?', subtitle: 'Ideal für ein paar Vokabeln' },
      { title: 'Halbzeit!', subtitle: 'Gönn dir eine Spanisch-Session' },
      { title: '¡Vamos!', subtitle: 'Der Nachmittag ist noch jung' },
      { title: 'Lust auf Spanisch?', subtitle: 'Kleine Pausen, große Fortschritte' },
    ],
    practiced: [
      { title: 'Gut gemacht!', subtitle: 'Heute schon fleißig gewesen' },
      { title: '¡Perfecto!', subtitle: 'Du bleibst am Ball' },
      { title: 'Weiter so!', subtitle: 'Dein Einsatz zahlt sich aus' },
    ],
  },
  evening: {
    // 18:00 - 21:59
    notPracticed: [
      { title: '¡Buenas noches!', subtitle: 'Noch Zeit für eine Runde?' },
      { title: 'Feierabend-Lernen?', subtitle: 'Entspannt den Tag ausklingen lassen' },
      { title: 'Noch nicht geübt?', subtitle: 'Der Abend ist perfekt dafür' },
      { title: '¡Hola!', subtitle: 'Ein paar Minuten vor dem Entspannen?' },
      { title: 'Guten Abend!', subtitle: 'Abends prägt sich vieles besser ein' },
    ],
    practiced: [
      { title: '¡Fantástico!', subtitle: 'Du hast heute alles gegeben' },
      { title: 'Geschafft!', subtitle: 'Genieß deinen Feierabend' },
      { title: '¡Bravo!', subtitle: 'Morgen geht es weiter' },
    ],
  },
  night: {
    // 22:00 - 4:59
    notPracticed: [
      { title: 'Noch wach?', subtitle: 'Eine kleine Runde geht noch' },
      { title: 'Nachtschicht?', subtitle: 'Auch spät lernt es sich gut' },
      { title: '¡Hola, buhó!', subtitle: 'Für Nachteulen ist es nie zu spät' },
    ],
    practiced: [
      { title: 'Gut gemacht!', subtitle: 'Ab ins Bett - du hast es verdient' },
      { title: '¡Dulces sueños!', subtitle: 'Im Schlaf festigt sich das Gelernte' },
      { title: 'Schlaf gut!', subtitle: 'Morgen wartet neues Wissen' },
    ],
  },
}

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night'

function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  if (hour >= 18 && hour < 22) return 'evening'
  return 'night'
}

// Wählt einen Spruch basierend auf Tageszeit und Datum
function getDailyMessage(practiced: boolean): { title: string; subtitle: string } {
  const timeOfDay = getTimeOfDay()
  const messages = practiced
    ? motivationalMessages[timeOfDay].practiced
    : motivationalMessages[timeOfDay].notPracticed

  const today = new Date()
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  )
  const index = dayOfYear % messages.length
  return messages[index]
}

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

  const dailyMessage = getDailyMessage(practicedToday)

  // Untertitel: Bei nicht geübt zeigen wir Vokabel-Anzahl wenn vorhanden, sonst den motivierenden Spruch
  const subtitle = practicedToday
    ? dailyMessage.subtitle
    : dailyMessage.subtitle

  return (
    <div class="space-y-8">
      {/* Welcome section - simple and warm */}
      <section class="text-center py-4">
        <h2 class="text-2xl font-semibold font-serif text-warm-brown mb-2">
          {dailyMessage.title}
        </h2>
        <p class="text-warm-gray">{subtitle}</p>
      </section>

      {/* Main stats - clean grid */}
      <section class="grid grid-cols-3 gap-3">
        <div class="card text-center px-3 py-4">
          <p class="text-2xl sm:text-3xl font-semibold text-warm-gold mb-1">{stats.streak}</p>
          <p class="text-xs sm:text-sm text-warm-gray">Streak</p>
        </div>
        <div class="card text-center px-3 py-4">
          <p class="text-2xl sm:text-3xl font-semibold text-terracotta mb-1">{learnedWords}</p>
          <p class="text-xs sm:text-sm text-warm-gray">Gelernt</p>
        </div>
        <div class="card text-center px-3 py-4">
          <p class="text-2xl sm:text-3xl font-semibold text-olive mb-1">{successRate}%</p>
          <p class="text-xs sm:text-sm text-warm-gray">Erfolg</p>
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
