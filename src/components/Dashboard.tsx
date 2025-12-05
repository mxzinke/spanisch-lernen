import { useProgress } from '../hooks/useProgress'
import { useUserLevel } from '../hooks/useUserLevel'
import { allWords, sortedCategories } from '../data/vocabulary'
import { DifficultyBadge } from './DifficultyBadge'

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

// Meilensteine für Motivation
const milestones = [10, 25, 50, 100, 250, 500, 750, 1000, 1301]

function getMilestoneInfo(mastered: number) {
  const reached = milestones.filter(m => mastered >= m)
  const next = milestones.find(m => mastered < m) || milestones[milestones.length - 1]
  const current = reached.length > 0 ? reached[reached.length - 1] : 0
  const progressToNext = next > current ? ((mastered - current) / (next - current)) * 100 : 100
  return { current, next, progressToNext, reached: reached.length }
}

interface DashboardProps {
  onNavigate?: (tab: 'practice' | 'vocabulary', category?: string) => void
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { progress, getStats, getWordsForReview } = useProgress()
  const { currentLevel, progressToNextLevel, wordsInCurrentLevel, masteredInCurrentLevel, isMaxLevel } = useUserLevel(progress)
  const stats = getStats()

  const learnedWords = Object.keys(progress.words).length
  const totalWords = allWords.length
  const wordsForReview = getWordsForReview(allWords).length

  // Box distribution
  const boxDistribution = [0, 0, 0, 0, 0]
  Object.values(progress.words).forEach((wp) => {
    boxDistribution[wp.box - 1]++
  })

  // Motivierende Zahlen
  const masteredWords = boxDistribution[4] // Box 5 = gemeistert
  const secureWords = boxDistribution[3] + boxDistribution[4] // Box 4-5 = sicher
  const inProgress = boxDistribution[0] + boxDistribution[1] + boxDistribution[2] // Box 1-3 = in Arbeit

  const today = new Date().toISOString().split('T')[0]
  const practicedToday = stats.lastPractice === today

  const successRate =
    stats.totalCorrect + stats.totalWrong > 0
      ? Math.round((stats.totalCorrect / (stats.totalCorrect + stats.totalWrong)) * 100)
      : 0

  const dailyMessage = getDailyMessage(practicedToday)
  const milestone = getMilestoneInfo(masteredWords)

  const { unlockedCategoryIds } = useUserLevel(progress)

  // Kategorien mit Fortschritt berechnen
  const categoriesWithProgress = sortedCategories.map((cat) => {
    const catWords = allWords.filter((w) => w.category === cat.category)
    const learned = catWords.filter((w) => progress.words[w.id]).length
    const mastered = catWords.filter((w) => progress.words[w.id]?.box >= 4).length
    const isUnlocked = unlockedCategoryIds.includes(cat.category)
    return { ...cat, total: catWords.length, learned, mastered, isUnlocked }
  })

  // Kategorien nach Status gruppieren
  const activeCategories = categoriesWithProgress.filter(c => c.learned > 0)
    .sort((a, b) => b.mastered - a.mastered || b.learned - a.learned)
  const unlockedNotStarted = categoriesWithProgress.filter(c => c.learned === 0 && c.isUnlocked)
  const lockedCategories = categoriesWithProgress.filter(c => !c.isUnlocked)

  // Hat der Nutzer schon begonnen?
  const hasStarted = learnedWords > 0

  return (
    <div class="space-y-6">
      {/* Welcome section */}
      <section class="text-center py-6">
        <h2 class="text-2xl font-semibold font-serif text-warm-brown mb-2">
          {dailyMessage.title}
        </h2>
        <p class="text-warm-gray">{dailyMessage.subtitle}</p>
      </section>

      {/* Empty State - Ermutigendes Willkommen für neue Nutzer */}
      {!hasStarted && (
        <section class="card text-center py-8">
          <div class="max-w-xs mx-auto">
            <p class="text-4xl mb-4">🌱</p>
            <h3 class="text-lg font-medium text-warm-brown mb-2">
              Dein Wortschatz wartet
            </h3>
            <p class="text-warm-gray text-sm mb-6 leading-relaxed">
              {totalWords.toLocaleString()} spanische Wörter in {sortedCategories.length} Kategorien
              warten darauf, von dir entdeckt zu werden.
            </p>
            <button
              onClick={() => onNavigate?.('practice')}
              class="inline-flex items-center gap-2 text-sm text-terracotta hover:text-terracotta-dark transition-colors"
            >
              <span>Starte mit dem Üben-Tab</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </section>
      )}

      {/* Dein Level */}
      {hasStarted && (
        <section class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-warm-gray">Dein Level</h3>
            <DifficultyBadge level={currentLevel} size="md" />
          </div>

          {!isMaxLevel && (
            <>
              <div class="progress-track h-2 mb-2">
                <div
                  class="progress-fill h-full bg-terracotta"
                  style={{ width: `${progressToNextLevel}%` }}
                />
              </div>
              <p class="text-xs text-warm-gray">
                {masteredInCurrentLevel} von {wordsInCurrentLevel} Wörtern gemeistert ({progressToNextLevel}% bis Stufe {currentLevel + 1})
              </p>
            </>
          )}

          {isMaxLevel && (
            <p class="text-sm text-olive">
              Alle Level abgeschlossen - du bist ein Experte!
            </p>
          )}
        </section>
      )}

      {/* Dein Können - Nur anzeigen wenn Fortschritt vorhanden */}
      {hasStarted && (
        <section class="card">
          <h3 class="text-center text-sm text-warm-gray mb-4">Dein Wortschatz</h3>

          <div class="grid grid-cols-3 gap-4 mb-6">
            <div class="text-center">
              <p class="text-3xl sm:text-4xl font-semibold text-olive">{masteredWords}</p>
              <p class="text-xs text-warm-gray mt-1">gemeistert</p>
            </div>
            <div class="text-center border-x border-sand-200">
              <p class="text-3xl sm:text-4xl font-semibold text-terracotta">{secureWords}</p>
              <p class="text-xs text-warm-gray mt-1">sicher</p>
            </div>
            <div class="text-center">
              <p class="text-3xl sm:text-4xl font-semibold text-clay">{inProgress}</p>
              <p class="text-xs text-warm-gray mt-1">am Lernen</p>
            </div>
          </div>

          {/* Meilenstein-Fortschritt */}
          <div class="pt-4 border-t border-sand-200">
            <div class="flex items-center justify-between text-sm mb-2">
              <span class="text-warm-gray">Nächster Meilenstein</span>
              <span class="text-warm-brown font-medium">{milestone.next} Wörter</span>
            </div>
            <div class="progress-track h-2">
              <div
                class="progress-fill h-full bg-olive"
                style={{ width: `${milestone.progressToNext}%` }}
              />
            </div>
            <p class="text-xs text-warm-gray/80 mt-2 text-center">
              {milestone.next - masteredWords > 0
                ? `Noch ${milestone.next - masteredWords} bis zum Ziel`
                : 'Geschafft!'}
            </p>
          </div>
        </section>
      )}

      {/* Statistiken - kompakt und warm */}
      {hasStarted && (
        <section class="grid grid-cols-3 gap-3">
          <div class="card text-center px-3 py-4">
            <p class="text-2xl font-semibold text-warm-gold">{stats.streak}</p>
            <p class="text-xs text-warm-gray mt-1">Tage in Folge</p>
          </div>
          <div class="card text-center px-3 py-4">
            <p class="text-2xl font-semibold text-olive">{successRate}%</p>
            <p class="text-xs text-warm-gray mt-1">Trefferquote</p>
          </div>
          <div class="card text-center px-3 py-4">
            <p class="text-2xl font-semibold text-terracotta">{wordsForReview}</p>
            <p class="text-xs text-warm-gray mt-1">Wiederholung</p>
          </div>
        </section>
      )}

      {/* Lernstand - nur anzeigen wenn Fortschritt */}
      {hasStarted && (
        <section class="card">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-medium">Gesamtfortschritt</h3>
            <span class="text-xs text-warm-gray">{learnedWords} von {totalWords} begonnen</span>
          </div>
          {/* Einfacher Fortschrittsbalken zum Gesamtziel */}
          <div class="progress-track h-2 mb-4">
            <div
              class="progress-fill h-full bg-terracotta"
              style={{ width: `${(learnedWords / totalWords) * 100}%` }}
            />
          </div>

          {/* Box-Verteilung als kompakte Übersicht */}
          <div class="flex items-center gap-4 text-xs">
            <div class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-rose-muted"></span>
              <span class="text-warm-gray">Neu: {boxDistribution[0] + boxDistribution[1]}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-clay"></span>
              <span class="text-warm-gray">Üben: {boxDistribution[2] + boxDistribution[3]}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-olive"></span>
              <span class="text-warm-gray">Sicher: {boxDistribution[4]}</span>
            </div>
          </div>
        </section>
      )}

      {/* Aktive Kategorien - Erfolge hervorheben */}
      {activeCategories.length > 0 && (
        <section class="card">
          <h3 class="text-sm font-medium mb-4">Deine Kategorien</h3>
          <div class="space-y-3">
            {activeCategories.map((cat) => {
              const percentage = (cat.mastered / cat.total) * 100
              const isComplete = cat.mastered === cat.total
              return (
                <div
                  key={cat.category}
                  class="flex items-center gap-3 py-1 px-2 -mx-2 rounded-lg hover:bg-sand-50 transition-colors cursor-pointer"
                  onClick={() => onNavigate?.('practice', cat.category)}
                >
                  <DifficultyBadge level={cat.difficulty} size="sm" />
                  <span class={`text-sm flex-1 truncate ${isComplete ? 'text-olive' : 'text-warm-brown'}`}>
                    {cat.name}
                    {isComplete && <span class="ml-1 text-olive">✓</span>}
                  </span>
                  <div class="w-20 progress-track h-1.5">
                    <div
                      class={`progress-fill h-full ${isComplete ? 'bg-olive' : 'bg-terracotta'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span class="text-xs text-warm-gray w-12 text-right tabular-nums">
                    {cat.mastered}/{cat.total}
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Freigeschaltete, noch nicht begonnene Kategorien */}
      {unlockedNotStarted.length > 0 && (
        <section class="card">
          <h3 class="text-sm font-medium mb-4">Bereit zum Lernen</h3>
          <div class="space-y-2">
            {unlockedNotStarted.map((cat) => (
              <div
                key={cat.category}
                class="flex items-center gap-3 py-2 px-3 rounded-lg bg-sand-50 hover:bg-sand-100 transition-colors cursor-pointer"
                onClick={() => onNavigate?.('practice', cat.category)}
              >
                <DifficultyBadge level={cat.difficulty} size="sm" />
                <span class="text-sm flex-1 text-warm-brown">{cat.name}</span>
                <span class="text-xs text-warm-gray">{cat.total} Wörter</span>
                <svg class="w-4 h-4 text-warm-gray/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Gesperrte Kategorien */}
      {lockedCategories.length > 0 && (
        <section class="card">
          <details class="group">
            <summary class="cursor-pointer text-sm text-warm-gray hover:text-warm-brown transition-colors flex items-center justify-between">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>{lockedCategories.length} Kategorien noch gesperrt</span>
              </div>
              <svg class="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <p class="text-xs text-warm-gray/70 mt-2 mb-4">
              Schalte neue Kategorien frei, indem du 70% der Wörter im aktuellen Level meisterst.
            </p>
            <div class="space-y-1">
              {[2, 3, 4, 5].map((level) => {
                const catsAtLevel = lockedCategories.filter(c => c.difficulty === level)
                if (catsAtLevel.length === 0) return null
                return (
                  <div key={level} class="py-2">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-xs font-medium text-warm-gray/60">Stufe {level}</span>
                      <div class="flex-1 h-px bg-sand-200" />
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                      {catsAtLevel.map((cat) => (
                        <div
                          key={cat.category}
                          class="flex items-center gap-2 py-1.5 px-2 rounded bg-sand-50/50 opacity-60"
                        >
                          <svg class="w-3 h-3 text-warm-gray/40 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                          </svg>
                          <span class="text-xs text-warm-gray/70 truncate">{cat.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </details>
        </section>
      )}
    </div>
  )
}
