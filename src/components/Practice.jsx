import { useState, useMemo } from 'preact/hooks'
import { Flashcard } from './Flashcard.jsx'
import { MultipleChoice } from './MultipleChoice.jsx'
import { WriteExercise } from './WriteExercise.jsx'
import { useProgress } from '../hooks/useProgress.js'
import { allWords, categories } from '../data/vocabulary.js'

const EXERCISE_TYPES = ['flashcard', 'multiple-choice', 'write']

export function Practice() {
  const [mode, setMode] = useState(null) // null = Auswahl, sonst Übungstyp
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0 })
  const { updateWordProgress, getWordsForReview } = useProgress()

  // Wörter für diese Sitzung
  const sessionWords = useMemo(() => {
    let words = selectedCategory === 'all'
      ? allWords
      : allWords.filter((w) => w.category === selectedCategory)

    // Mische und nimm max 10 Wörter pro Sitzung
    return words.sort(() => Math.random() - 0.5).slice(0, 10)
  }, [selectedCategory, mode])

  const currentWord = sessionWords[currentIndex]
  const isComplete = currentIndex >= sessionWords.length

  const handleResult = (correct) => {
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
  }

  // Übungsauswahl
  if (!mode) {
    return (
      <div class="space-y-6">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">Kategorie wählen</h2>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            class="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-spanish-red focus:outline-none"
          >
            <option value="all">Alle Kategorien</option>
            {categories.map((cat) => (
              <option key={cat.category} value={cat.category}>
                {cat.name} ({cat.words.length} Wörter)
              </option>
            ))}
          </select>
        </div>

        <div class="card">
          <h2 class="text-xl font-bold mb-4">Übungsart wählen</h2>
          <div class="space-y-3">
            <button
              onClick={() => setMode('flashcard')}
              class="w-full p-4 bg-gradient-to-r from-spanish-red to-red-600 text-white rounded-xl text-left hover:shadow-lg transition-shadow"
            >
              <span class="text-2xl mr-3">🎴</span>
              <span class="font-bold">Karteikarten</span>
              <p class="text-sm text-red-100 mt-1 ml-9">
                Klassisch: Umdrehen & selbst bewerten
              </p>
            </button>

            <button
              onClick={() => setMode('multiple-choice')}
              class="w-full p-4 bg-gradient-to-r from-spanish-yellow to-yellow-500 text-gray-800 rounded-xl text-left hover:shadow-lg transition-shadow"
            >
              <span class="text-2xl mr-3">🔘</span>
              <span class="font-bold">Multiple Choice</span>
              <p class="text-sm text-yellow-800 mt-1 ml-9">
                Wähle aus 4 Antworten
              </p>
            </button>

            <button
              onClick={() => setMode('write')}
              class="w-full p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl text-left hover:shadow-lg transition-shadow"
            >
              <span class="text-2xl mr-3">✏️</span>
              <span class="font-bold">Schreiben</span>
              <p class="text-sm text-green-100 mt-1 ml-9">
                Tippe die spanische Übersetzung
              </p>
            </button>

            <button
              onClick={() => setMode('mixed')}
              class="w-full p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl text-left hover:shadow-lg transition-shadow"
            >
              <span class="text-2xl mr-3">🎲</span>
              <span class="font-bold">Gemischt</span>
              <p class="text-sm text-purple-100 mt-1 ml-9">
                Zufällige Übungsarten
              </p>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Sitzung abgeschlossen
  if (isComplete) {
    const total = sessionStats.correct + sessionStats.wrong
    const percentage = total > 0 ? Math.round((sessionStats.correct / total) * 100) : 0

    return (
      <div class="card text-center space-y-6">
        <div class="text-6xl">
          {percentage >= 80 ? '🎉' : percentage >= 50 ? '👍' : '💪'}
        </div>
        <h2 class="text-2xl font-bold">Sitzung beendet!</h2>

        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 bg-green-50 rounded-xl">
            <p class="text-3xl font-bold text-green-600">{sessionStats.correct}</p>
            <p class="text-sm text-green-700">Richtig</p>
          </div>
          <div class="p-4 bg-red-50 rounded-xl">
            <p class="text-3xl font-bold text-red-600">{sessionStats.wrong}</p>
            <p class="text-sm text-red-700">Falsch</p>
          </div>
        </div>

        <div class="text-4xl font-bold text-spanish-red">{percentage}%</div>

        <button onClick={resetSession} class="btn btn-primary w-full py-3">
          Neue Übung starten
        </button>
      </div>
    )
  }

  // Aktuelle Übung
  const exerciseType = mode === 'mixed'
    ? EXERCISE_TYPES[Math.floor(Math.random() * EXERCISE_TYPES.length)]
    : mode

  return (
    <div class="space-y-4">
      {/* Fortschrittsanzeige */}
      <div class="flex items-center gap-4">
        <button onClick={resetSession} class="text-gray-500 hover:text-gray-700">
          ← Zurück
        </button>
        <div class="flex-1 bg-gray-200 rounded-full h-2">
          <div
            class="bg-spanish-red h-2 rounded-full transition-all"
            style={{ width: `${(currentIndex / sessionWords.length) * 100}%` }}
          />
        </div>
        <span class="text-sm text-gray-500">
          {currentIndex + 1} / {sessionWords.length}
        </span>
      </div>

      {/* Kategorie-Badge */}
      <div class="text-center">
        <span class="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
          {currentWord.categoryName}
        </span>
      </div>

      {/* Übung */}
      {exerciseType === 'flashcard' && (
        <Flashcard word={currentWord} onResult={handleResult} onSkip={handleSkip} />
      )}
      {exerciseType === 'multiple-choice' && (
        <MultipleChoice word={currentWord} allWords={allWords} onResult={handleResult} />
      )}
      {exerciseType === 'write' && (
        <WriteExercise word={currentWord} onResult={handleResult} />
      )}
    </div>
  )
}
