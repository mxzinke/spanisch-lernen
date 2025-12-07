import { useState, useEffect, useMemo } from 'preact/hooks'
import type { ExerciseType } from '../types'
import { Flashcard } from './Flashcard'
import { MultipleChoice } from './MultipleChoice'
import { WriteExercise } from './WriteExercise'
import { ConjugationExercise } from './ConjugationExercise'
import { useProgress } from '../hooks/useProgress'
import { useUserLevel } from '../hooks/useUserLevel'
import { useSession } from '../hooks/useSession'
import { useCustomWords, CUSTOM_CATEGORY_NAME } from '../hooks/useCustomWords'
import { allWords, sortedCategories } from '../data/vocabulary'

const MIN_LEVEL_FOR_CONJUGATION = 3

interface PracticeProps {
  initialCategory?: string | null
}

export function Practice({ initialCategory }: PracticeProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all')

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory)
    }
  }, [initialCategory])

  const { progress, updateWordProgress } = useProgress()
  const { currentLevel, unlockedCategoryIds } = useUserLevel(progress)
  const canUseConjugation = currentLevel >= MIN_LEVEL_FOR_CONJUGATION
  const { customWords, customWordsWithCategory } = useCustomWords()

  // Combine all words with custom words for Multiple Choice distractors
  const allWordsWithCustom = useMemo(
    () => [...allWords, ...customWordsWithCategory],
    [customWordsWithCategory]
  )

  const {
    mode,
    currentWord,
    currentExerciseType,
    sessionWords,
    stats,
    currentIndex,
    isReady,
    isComplete,
    progress: sessionProgress,
    startSession,
    recordResult,
    skip,
    reset,
  } = useSession({
    selectedCategory,
    unlockedCategoryIds,
    canUseConjugation,
    customWords: customWordsWithCategory,
  })

  const handleResult = (correct: boolean | null) => {
    if (currentWord && correct !== null) {
      updateWordProgress(currentWord.id, correct)
      recordResult(correct)
    } else {
      skip()
    }
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
            <option value="all">Alle freigeschalteten ({unlockedCategoryIds.length + (customWords.length > 0 ? 1 : 0)} Kategorien)</option>
            {customWords.length > 0 && (
              <option value="custom">{CUSTOM_CATEGORY_NAME} - {customWords.length} Wörter</option>
            )}
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
              onClick={() => startSession('mixed')}
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
              onClick={() => startSession('flashcard')}
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
              onClick={() => startSession('multiple-choice')}
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
              onClick={() => startSession('write')}
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
              onClick={() => canUseConjugation && startSession('conjugation')}
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
  if (!isReady) {
    return (
      <div class="card text-center py-8">
        <p class="text-warm-gray">Lade Übung...</p>
      </div>
    )
  }

  // Session complete screen
  if (isComplete) {
    const total = stats.correct + stats.wrong
    const percentage = total > 0 ? Math.round((stats.correct / total) * 100) : 0

    return (
      <div class="card text-center space-y-8 py-8">
        <div>
          <p class="text-4xl font-semibold text-olive mb-2">{percentage}%</p>
          <h2 class="text-xl text-warm-brown">Übung abgeschlossen</h2>
        </div>

        <div class="flex justify-center gap-8">
          <div>
            <p class="text-2xl font-semibold text-olive">{stats.correct}</p>
            <p class="text-sm text-warm-gray">Richtig</p>
          </div>
          <div class="w-px bg-sand-200" />
          <div>
            <p class="text-2xl font-semibold text-rose-muted">{stats.wrong}</p>
            <p class="text-sm text-warm-gray">Falsch</p>
          </div>
        </div>

        <button onClick={reset} class="btn btn-primary">
          Neue Übung starten
        </button>
      </div>
    )
  }

  // Active exercise
  return (
    <div class="space-y-6">
      {/* Progress header */}
      <div class="flex items-center gap-4">
        <button onClick={reset} class="btn btn-ghost text-sm">
          Abbrechen
        </button>
        <div class="flex-1 progress-track h-1.5">
          <div
            class="progress-fill h-full bg-terracotta"
            style={{ width: `${sessionProgress}%` }}
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
      {currentExerciseType === 'flashcard' && (
        <Flashcard word={currentWord} onResult={handleResult} onSkip={skip} />
      )}
      {currentExerciseType === 'multiple-choice' && (
        <MultipleChoice word={currentWord} allWords={allWordsWithCustom} onResult={handleResult} />
      )}
      {currentExerciseType === 'write' && <WriteExercise word={currentWord} onResult={handleResult} />}
      {currentExerciseType === 'conjugation' && <ConjugationExercise verb={currentWord} onResult={handleResult} />}
    </div>
  )
}
