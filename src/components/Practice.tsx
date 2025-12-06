import { useState, useMemo, useEffect } from 'preact/hooks'
import type { ExerciseType } from '../types'
import { Flashcard } from './Flashcard'
import { MultipleChoice } from './MultipleChoice'
import { WriteExercise } from './WriteExercise'
import { useProgress } from '../hooks/useProgress'
import { useUserLevel } from '../hooks/useUserLevel'
import { allWords, sortedCategories } from '../data/vocabulary'
import { shuffleWithoutConsecutiveDuplicates } from '../utils/shuffle'

const EXERCISE_TYPES: ExerciseType[] = ['flashcard', 'multiple-choice', 'write']

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
  const { progress, updateWordProgress } = useProgress()
  const { unlockedCategoryIds } = useUserLevel(progress)

  const sessionWords = useMemo(() => {
    // Nur Wörter aus freigeschalteten Kategorien
    const unlockedWords = allWords.filter((w) => unlockedCategoryIds.includes(w.category))
    const words =
      selectedCategory === 'all' ? unlockedWords : unlockedWords.filter((w) => w.category === selectedCategory)
    // Shuffle ohne direkt aufeinanderfolgende Duplikate
    const shuffled = shuffleWithoutConsecutiveDuplicates(words, (w) => w.id)
    return shuffled.slice(0, 10)
  }, [selectedCategory, mode, unlockedCategoryIds])

  useMemo(() => {
    if (mode === 'mixed') {
      const order = sessionWords.map(() => EXERCISE_TYPES[Math.floor(Math.random() * EXERCISE_TYPES.length)])
      setExerciseOrder(order)
    }
  }, [mode, sessionWords])

  const currentWord = sessionWords[currentIndex]
  const isComplete = currentIndex >= sessionWords.length

  const handleResult = (correct: boolean) => {
    if (currentWord) {
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

            <button
              onClick={() => setMode('mixed')}
              class="card-hover w-full p-5 text-left group border-2 border-dashed border-sand-300"
            >
              <div class="flex items-center gap-4">
                <span class="text-2xl">Gemischt</span>
              </div>
              <p class="text-sm text-warm-gray mt-1">
                Zufällige Übungsarten
              </p>
            </button>
          </div>
        </section>
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
    </div>
  )
}
