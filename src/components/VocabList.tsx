import { useState } from 'preact/hooks'
import { useSpeech } from '../hooks/useSpeech'
import { useProgress } from '../hooks/useProgress'
import { categories, allWords } from '../data/vocabulary'

export function VocabList() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [search, setSearch] = useState('')
  const { speak } = useSpeech()
  const { getWordProgress } = useProgress()

  const filteredWords = allWords
    .filter((w) => selectedCategory === 'all' || w.category === selectedCategory)
    .filter(
      (w) =>
        w.spanish.toLowerCase().includes(search.toLowerCase()) ||
        w.german.toLowerCase().includes(search.toLowerCase())
    )

  const getBoxColor = (box: number): string => {
    const colors = ['bg-red-100', 'bg-orange-100', 'bg-yellow-100', 'bg-green-100', 'bg-emerald-100']
    return colors[box - 1] || 'bg-gray-100'
  }

  return (
    <div class="space-y-4">
      {/* Filter */}
      <div class="card space-y-3">
        <input
          type="text"
          value={search}
          onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
          placeholder="🔍 Suchen..."
          class="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-spanish-red focus:outline-none"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory((e.target as HTMLSelectElement).value)}
          class="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-spanish-red focus:outline-none"
        >
          <option value="all">Alle Kategorien ({allWords.length})</option>
          {categories.map((cat) => (
            <option key={cat.category} value={cat.category}>
              {cat.name} ({cat.words.length})
            </option>
          ))}
        </select>
      </div>

      {/* Legende */}
      <div class="flex gap-2 text-xs text-gray-500 justify-center flex-wrap">
        <span class="px-2 py-1 bg-gray-100 rounded">Neu</span>
        <span class="px-2 py-1 bg-red-100 rounded">Box 1</span>
        <span class="px-2 py-1 bg-orange-100 rounded">Box 2</span>
        <span class="px-2 py-1 bg-yellow-100 rounded">Box 3</span>
        <span class="px-2 py-1 bg-green-100 rounded">Box 4</span>
        <span class="px-2 py-1 bg-emerald-100 rounded">Box 5</span>
      </div>

      {/* Wortliste */}
      <div class="space-y-2">
        {filteredWords.length === 0 ? (
          <div class="card text-center text-gray-500">Keine Wörter gefunden</div>
        ) : (
          filteredWords.map((word) => {
            const wp = getWordProgress(word.id)
            const hasProgress = wp.correct > 0 || wp.wrong > 0

            return (
              <div key={word.id} class={`card p-4 ${hasProgress ? getBoxColor(wp.box) : ''}`}>
                <div class="flex items-start gap-3">
                  <button
                    onClick={() => speak(word.spanish)}
                    class="text-xl hover:scale-110 transition-transform mt-1"
                  >
                    🔊
                  </button>
                  <div class="flex-1">
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-spanish-red">{word.spanish}</span>
                      {hasProgress && (
                        <span class="text-xs px-2 py-0.5 bg-white/50 rounded">Box {wp.box}</span>
                      )}
                    </div>
                    <p class="text-gray-700">{word.german}</p>
                    <p class="text-sm text-gray-500 italic mt-1">"{word.example}"</p>
                  </div>
                  {hasProgress && (
                    <div class="text-right text-xs text-gray-500">
                      <div class="text-green-600">✓ {wp.correct}</div>
                      <div class="text-red-600">✗ {wp.wrong}</div>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Anzahl */}
      <p class="text-center text-sm text-gray-500">{filteredWords.length} Wörter</p>
    </div>
  )
}
