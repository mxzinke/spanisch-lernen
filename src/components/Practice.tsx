import { useState, useMemo, useEffect } from 'preact/hooks'
import type { ExerciseType } from '../types'
import { Flashcard } from './Flashcard'
import { MultipleChoice } from './MultipleChoice'
import { WriteExercise } from './WriteExercise'
import { ConjugationExercise } from './ConjugationExercise'
import { useProgress } from '../hooks/useProgress'
import { useUserLevel } from '../hooks/useUserLevel'
import { allWords, sortedCategories, getAllVerbs } from '../data/vocabulary'
import { selectWordsForSession } from '../utils/shuffle'

const EXERCISE_TYPES: ExerciseType[] = ['flashcard', 'multiple-choice', 'write']
const MIN_LEVEL_FOR_CONJUGATION = 3 // Verben sind auf Level 3, Konjugation direkt verfügbar

interface PracticeProps {
  initialCategory?: string | null
}

export function Practice({ initialCategory }: PracticeProps) {
  const [mode, setMode] = useState<ExerciseType | null>(null)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all')

  // Kategorie aktualisieren wenn von außen geändert
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory)
    }
  }, [initialCategory])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0 })
  const [exerciseOrder, setExerciseOrder] = useState<ExerciseType[]>([])
  const [sessionWords, setSessionWords] = useState<typeof allWords>([])
  const { progress, updateWordProgress } = useProgress()
  const { currentLevel, unlockedCategoryIds } = useUserLevel(progress)
  const canUseConjugation = currentLevel >= MIN_LEVEL_FOR_CONJUGATION

  // Session-Wörter nur einmal beim Start der Session festlegen
  // Dadurch bleiben die Wörter während der Session stabil
  useEffect(() => {
    if (mode === null) {
      // Keine Session aktiv - nichts tun
      return
    }

    // Session startet: Wörter auswählen und fixieren
    if (mode === 'conjugation') {
      const allVerbs = getAllVerbs()
      const unlockedVerbs = allVerbs.filter((w) => unlockedCategoryIds.includes(w.category))
      const words = selectWordsForSession(unlockedVerbs, (w) => w.id, 10, { maxOccurrences: 1 })
      setSessionWords(words)

      // Für Konjugation: alle Übungen sind 'conjugation'
      setExerciseOrder(words.map(() => 'conjugation' as ExerciseType))
    } else {
      const unlockedWords = allWords.filter((w) => unlockedCategoryIds.includes(w.category))
      const filteredWords =
        selectedCategory === 'all' ? unlockedWords : unlockedWords.filter((w) => w.category === selectedCategory)
      const words = selectWordsForSession(filteredWords, (w) => w.id, 10, { maxOccurrences: 1 })
      setSessionWords(words)

      if (mode === 'mixed') {
        // Für mixed: zufällige Übungstypen pro Wort
        const order = words.map((word) => {
          if (canUseConjugation && word.type === 'verb') {
            const typesWithConjugation: ExerciseType[] = [...EXERCISE_TYPES, 'conjugation']
            return typesWithConjugation[Math.floor(Math.random() * typesWithConjugation.length)]
          }
          return EXERCISE_TYPES[Math.floor(Math.random() * EXERCISE_TYPES.length)]
        })
        setExerciseOrder(order)
      } else {
        // Für einzelne Modi: alle Übungen sind vom gleichen Typ
        setExerciseOrder(words.map(() => mode))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Nur beim Session-Start ausführen
  }, [mode])

  const currentWord = sessionWords[currentIndex]
  const isSessionReady = sessionWords.length > 0
  const isComplete = isSessionReady && currentIndex >= sessionWords.length

  const handleResult = (correct: boolean | null) => {
    if (currentWord && correct !== null) {
      updateWordProgress(currentWord.id, correct)
      setSessionStats((prev) => ({
        correct: prev.correct + (correct ? 1 : 0),
        wrong: prev.wrong + (correct ? 0 : 1),
      }))
    }
    setCurrentIndex((i) => i + 1)
  }

  const handleSkip = () => {
    setCurrentIndex((i) => i + 1)
  }

  const resetSession = () => {
    setMode(null)
    setCurrentIndex(0)
    setSessionStats({ correct: 0, wrong: 0 })
    setExerciseOrder([])
    setSessionWords([])
  }

  // Exercise selection screen
  if (!mode) {
    return (
      <div class="space-y-8">
        {/* Category selection */}
        <section>
          <label class="block text-sm font-medium text-warm-gray mb-2">Kategorie</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory((e.target as HTMLSelectElement).value)}
            class="select"
          >
            <option value="all">Alle freigeschalteten ({unlockedCategoryIds.length} Kategorien)</option>
            {sortedCategories.map((cat) => {
              const isLocked = !unlockedCategoryIds.includes(cat.category)
              return (
                <option key={cat.category} value={cat.category} disabled={isLocked}>
                  {isLocked ? '\u{1F512} ' : ''}{cat.name} (Level {cat.difficulty}) - {cat.words.length} Wörter
                </option>
              )
            })}
          </select>
        </section>

        {/* Exercise type selection */}
        <section>
          <h2 class="text-lg font-medium text-warm-brown mb-4">Übungsart wählen</h2>
          <div class="space-y-3">
            <button
              onClick={() => setMode('mixed')}
              class="card-hover w-full p-5 text-left group border-2 border-terracotta/30"
            >
              <div class="flex items-center gap-4">
                <span class="text-2xl">Gemischt</span>
              </div>
              <p class="text-sm text-warm-gray mt-1">
                Zufällige Übungsarten
              </p>
            </button>

            <button
              onClick={() => setMode('flashcard')}
              class="card-hover w-full p-5 text-left group"
            >
              <div class="flex items-center gap-4">
                <span class="text-2xl">Karteikarten</span>
              </div>
              <p class="text-sm text-warm-gray mt-1">
                Umdrehen und selbst bewerten
              </p>
            </button>

            <button
              onClick={() => setMode('multiple-choice')}
              class="card-hover w-full p-5 text-left group"
            >
              <div class="flex items-center gap-4">
                <span class="text-2xl">Multiple Choice</span>
              </div>
              <p class="text-sm text-warm-gray mt-1">
                Wähle aus vier Antworten
              </p>
            </button>

            <button
              onClick={() => setMode('write')}
              class="card-hover w-full p-5 text-left group"
            >
              <div class="flex items-center gap-4">
                <span class="text-2xl">Schreiben</span>
              </div>
              <p class="text-sm text-warm-gray mt-1">
                Tippe die spanische Übersetzung
              </p>
            </button>

            {/* Konjugation - ab Level 3 */}
            <button
              onClick={() => canUseConjugation && setMode('conjugation')}
              class={`card-hover w-full p-5 text-left group ${!canUseConjugation ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!canUseConjugation}
            >
              <div class="flex items-center justify-between gap-4">
                <span class="text-2xl">Konjugation</span>
                {!canUseConjugation && (
                  <span class="text-xs bg-sand-200 text-warm-gray px-2 py-1 rounded-full">
                    Ab Level {MIN_LEVEL_FOR_CONJUGATION}
                  </span>
                )}
              </div>
              <p class="text-sm text-warm-gray mt-1">
                Verben konjugieren lernen
              </p>
            </button>
          </div>
        </section>
      </div>
    )
  }

  // Loading state while session words are being prepared
  if (!isSessionReady) {
    return (
      <div class="card text-center py-8">
        <p class="text-warm-gray">Lade Übung...</p>
      </div>
    )
  }

  // Session complete screen
  if (isComplete) {
    const total = sessionStats.correct + sessionStats.wrong
    const percentage = total > 0 ? Math.round((sessionStats.correct / total) * 100) : 0

    return (
      <div class="card text-center space-y-8 py-8">
        <div>
          <p class="text-4xl font-semibold text-olive mb-2">{percentage}%</p>
          <h2 class="text-xl text-warm-brown">Übung abgeschlossen</h2>
        </div>

        <div class="flex justify-center gap-8">
          <div>
            <p class="text-2xl font-semibold text-olive">{sessionStats.correct}</p>
            <p class="text-sm text-warm-gray">Richtig</p>
          </div>
          <div class="w-px bg-sand-200" />
          <div>
            <p class="text-2xl font-semibold text-rose-muted">{sessionStats.wrong}</p>
            <p class="text-sm text-warm-gray">Falsch</p>
          </div>
        </div>

        <button onClick={resetSession} class="btn btn-primary">
          Neue Übung starten
        </button>
      </div>
    )
  }

  // Active exercise
  const exerciseType: ExerciseType = mode === 'mixed' ? exerciseOrder[currentIndex] || 'flashcard' : mode

  return (
    <div class="space-y-6">
      {/* Progress header */}
      <div class="flex items-center gap-4">
        <button onClick={resetSession} class="btn btn-ghost text-sm">
          Abbrechen
        </button>
        <div class="flex-1 progress-track h-1.5">
          <div
            class="progress-fill h-full bg-terracotta"
            style={{ width: `${(currentIndex / sessionWords.length) * 100}%` }}
          />
        </div>
        <span class="text-sm text-warm-gray">
          {currentIndex + 1}/{sessionWords.length}
        </span>
      </div>

      {/* Category badge */}
      <div class="text-center">
        <span class="inline-block px-3 py-1 bg-sand-100 text-warm-gray text-sm rounded-full">
          {currentWord.categoryName}
        </span>
      </div>

      {/* Exercise component */}
      {exerciseType === 'flashcard' && (
        <Flashcard word={currentWord} onResult={handleResult} onSkip={handleSkip} />
      )}
      {exerciseType === 'multiple-choice' && (
        <MultipleChoice word={currentWord} allWords={allWords} onResult={handleResult} />
      )}
      {exerciseType === 'write' && <WriteExercise word={currentWord} onResult={handleResult} />}
      {exerciseType === 'conjugation' && <ConjugationExercise verb={currentWord} onResult={handleResult} />}
    </div>
  )
}
