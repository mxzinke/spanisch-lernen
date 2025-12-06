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
  onNavigate?: (tab: 'practice' | 'vocabulary' | 'settings', category?: string) => void
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { progress, getStats } = useProgress()
  const { currentLevel, progressToNextLevel, isMaxLevel } = useUserLevel(progress)
  const stats = getStats()

  const learnedWords = Object.keys(progress.words).length
  const totalWords = allWords.length

  // Box distribution
  const boxDistribution = [0, 0, 0, 0, 0]
  Object.values(progress.words).forEach((wp) => {
    boxDistribution[wp.box - 1]++
  })

  // Motivierende Zahlen
  const masteredWords = boxDistribution[4] // Box 5 = gemeistert

  const today = new Date().toISOString().split('T')[0]
  const practicedToday = stats.lastPractice === today

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

      {/* Dein Level & Streak - Hero-Bereich */}
      {hasStarted && (
        <section class="card">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <DifficultyBadge level={currentLevel} size="lg" />
              <div>
                <h3 class="text-lg font-medium text-warm-brown">Dein Level</h3>
                {!isMaxLevel && (
                  <p class="text-xs text-warm-gray">{100 - progressToNextLevel}% bis Level {currentLevel + 1}</p>
                )}
              </div>
            </div>
            {stats.streak > 0 && (
              <div class="text-right">
                <p class="text-2xl font-semibold text-warm-gold">{stats.streak}</p>
                <p class="text-xs text-warm-gray">Tage in Folge</p>
              </div>
            )}
          </div>

          {!isMaxLevel && (
            <>
              <div class="progress-track h-2 mb-2">
                <div
                  class="progress-fill h-full bg-terracotta"
                  style={{ width: `${progressToNextLevel}%` }}
                />
              </div>
              <p class="text-[11px] text-warm-gray/70">
                Meistere Wörter bis Stufe 5 (Leitner-System), um das nächste Level freizuschalten
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

      {/* Leitner-System Visualisierung */}
      {hasStarted && (
        <section class="card">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-medium text-warm-brown">Dein Lernfortschritt</h3>
            <button
              onClick={() => onNavigate?.('settings')}
              class="text-xs text-warm-gray hover:text-terracotta transition-colors"
            >
              Leitner-System →
            </button>
          </div>

          <p class="text-xs text-warm-gray mb-4">
            Wörter steigen bei richtiger Antwort eine Stufe auf, bei falscher zurück zu Stufe 1.
            Höhere Stufen werden seltener abgefragt – so lernst du effizient und langfristig.
          </p>

          {/* 5 Boxen Visualisierung */}
          <div class="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((box) => {
              const count = boxDistribution[box - 1]
              const maxHeight = Math.max(...boxDistribution, 1)
              const heightPercent = (count / maxHeight) * 100
              const isActive = count > 0
              // Farbverlauf von warm nach grün (Fortschritt)
              const colors = [
                'bg-terracotta',      // Stufe 1 - neu
                'bg-terracotta/70',   // Stufe 2
                'bg-clay',            // Stufe 3
                'bg-olive/70',        // Stufe 4
                'bg-olive'            // Stufe 5 - gemeistert
              ]
              return (
                <div key={box} class="flex-1 flex flex-col items-center">
                  <div class="w-full h-16 flex items-end justify-center mb-2">
                    <div
                      class={`w-full rounded-t transition-all ${colors[box - 1]}`}
                      style={{
                        height: isActive ? `${Math.max(heightPercent, 15)}%` : '4px',
                        opacity: isActive ? 1 : 0.25
                      }}
                    />
                  </div>
                  <span class={`text-sm font-medium ${isActive ? 'text-warm-brown' : 'text-warm-gray/40'}`}>
                    {count}
                  </span>
                  <span class="text-[10px] text-warm-gray mt-0.5">Stufe {box}</span>
                </div>
              )
            })}
          </div>

          {/* Legende */}
          <div class="flex justify-between text-[10px] text-warm-gray border-t border-sand-200 pt-3">
            <span>← Noch nicht gelernt</span>
            <span>Gemeistert →</span>
          </div>
        </section>
      )}

      {/* Meilenstein - kompakt */}
      {hasStarted && masteredWords > 0 && (
        <section class="card">
          <div class="flex items-center justify-between text-sm mb-2">
            <span class="text-warm-gray">Nächster Meilenstein</span>
            <span class="text-warm-brown font-medium">{milestone.next} gemeisterte Wörter</span>
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
        </section>
      )}

      {/* Freigeschaltete Kategorien - aktiv + bereit zusammen */}
      {(activeCategories.length > 0 || unlockedNotStarted.length > 0) && (
        <section class="card">
          <h3 class="text-sm font-medium mb-4">Deine Kategorien</h3>
          <div class="space-y-2">
            {/* Aktive Kategorien (begonnen) */}
            {activeCategories.map((cat) => {
              const percentage = (cat.learned / cat.total) * 100
              const isComplete = cat.learned === cat.total
              return (
                <div
                  key={cat.category}
                  class="flex items-center gap-3 py-2 px-3 -mx-1 rounded-lg hover:bg-sand-50 transition-colors cursor-pointer"
                  onClick={() => onNavigate?.('practice', cat.category)}
                >
                  <DifficultyBadge level={cat.difficulty} size="sm" />
                  <span class={`text-sm flex-1 truncate ${isComplete ? 'text-olive' : 'text-warm-brown'}`}>
                    {cat.name}
                    {isComplete && <span class="ml-1 text-olive">✓</span>}
                  </span>
                  <div class="w-16 progress-track h-1.5">
                    <div
                      class={`progress-fill h-full ${isComplete ? 'bg-olive' : 'bg-terracotta'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span class="text-xs text-warm-gray">{cat.total} Wörter</span>
                  <svg class="w-4 h-4 text-warm-gray/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )
            })}
            {/* Noch nicht begonnene Kategorien */}
            {unlockedNotStarted.map((cat) => (
              <div
                key={cat.category}
                class="flex items-center gap-3 py-2 px-3 -mx-1 rounded-lg hover:bg-sand-50 transition-colors cursor-pointer"
                onClick={() => onNavigate?.('practice', cat.category)}
              >
                <DifficultyBadge level={cat.difficulty} size="sm" />
                <span class="text-sm flex-1 text-warm-brown">{cat.name}</span>
                <div class="w-16" />
                <span class="text-xs text-warm-gray">{cat.total} Wörter</span>
                <svg class="w-4 h-4 text-warm-gray/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Gesamtfortschritt - aufklappbar */}
      {hasStarted && (
        <section class="card">
          <details class="group">
            <summary class="cursor-pointer text-sm text-warm-gray hover:text-warm-brown transition-colors flex items-center justify-between">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Gesamtfortschritt</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs">{learnedWords} von {totalWords}</span>
                <svg class="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </summary>
            <div class="mt-4 space-y-3">
              <div class="progress-track h-2">
                <div
                  class="progress-fill h-full bg-terracotta"
                  style={{ width: `${(learnedWords / totalWords) * 100}%` }}
                />
              </div>
              <div class="grid grid-cols-3 gap-2 text-center">
                <div class="py-2 px-3 rounded-lg bg-sand-50">
                  <p class="text-lg font-medium text-terracotta">{boxDistribution[0] + boxDistribution[1]}</p>
                  <p class="text-[10px] text-warm-gray">Stufe 1-2</p>
                </div>
                <div class="py-2 px-3 rounded-lg bg-sand-50">
                  <p class="text-lg font-medium text-clay">{boxDistribution[2] + boxDistribution[3]}</p>
                  <p class="text-[10px] text-warm-gray">Stufe 3-4</p>
                </div>
                <div class="py-2 px-3 rounded-lg bg-sand-50">
                  <p class="text-lg font-medium text-olive">{boxDistribution[4]}</p>
                  <p class="text-[10px] text-warm-gray">Gemeistert</p>
                </div>
              </div>
            </div>
          </details>
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
              {Array.from({ length: 14 }, (_, i) => i + 2).map((level) => {
                const catsAtLevel = lockedCategories.filter(c => c.difficulty === level)
                if (catsAtLevel.length === 0) return null
                return (
                  <div key={level} class="py-2">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-xs font-medium text-warm-gray/60">Level {level}</span>
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
