import { useState } from 'preact/hooks'
import { useSpeech } from '../hooks/useSpeech'
import { useProgress } from '../hooks/useProgress'
import { useUserLevel } from '../hooks/useUserLevel'
import { sortedCategories, allWords } from '../data/vocabulary'
import { SpeakerIcon } from './SpeakerIcon'

export function VocabList() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [search, setSearch] = useState('')
  const { speak } = useSpeech()
  const { progress, getWordProgress } = useProgress()
  const { unlockedCategoryIds } = useUserLevel(progress)

  const filteredWords = allWords
    .filter((w) => selectedCategory === 'all' || w.category === selectedCategory)
    .filter(
      (w) =>
        w.spanish.toLowerCase().includes(search.toLowerCase()) ||
        w.german.toLowerCase().includes(search.toLowerCase())
    )

  const getBoxStyles = (box: number): string => {
    const styles = [
      'bg-rose-muted/20',
      'bg-clay-light/30',
      'bg-clay/20',
      'bg-olive-light/30',
      'bg-olive/20',
    ]
    return styles[box - 1] || ''
  }

  return (
    <div class="space-y-6">
      {/* Search and filter */}
      <div class="space-y-3">
        <input
          type="text"
          value={search}
          onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
          placeholder="Suchen..."
          class="input"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory((e.target as HTMLSelectElement).value)}
          class="select"
        >
          <option value="all">Alle freigeschalteten Kategorien ({unlockedCategoryIds.length})</option>
          {Array.from({ length: 15 }, (_, i) => i + 1).map((level) => (
            <optgroup key={level} label={`Level ${level}`}>
              {sortedCategories
                .filter((cat) => cat.difficulty === level)
                .map((cat) => {
                  const isLocked = !unlockedCategoryIds.includes(cat.category)
                  return (
                    <option key={cat.category} value={cat.category} disabled={isLocked}>
                      {isLocked ? '\u{1F512} ' : ''}{cat.name} ({cat.words.length})
                    </option>
                  )
                })}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Legend */}
      <div class="flex gap-2 text-xs text-warm-gray justify-center flex-wrap">
        <span class="px-2 py-1 bg-sand-100 rounded">Neu</span>
        <span class="px-2 py-1 bg-rose-muted/20 rounded">Stufe 1</span>
        <span class="px-2 py-1 bg-clay-light/30 rounded">Stufe 2</span>
        <span class="px-2 py-1 bg-clay/20 rounded">Stufe 3</span>
        <span class="px-2 py-1 bg-olive-light/30 rounded">Stufe 4</span>
        <span class="px-2 py-1 bg-olive/20 rounded">Stufe 5</span>
      </div>

      {/* Word list */}
      <div class="space-y-2">
        {filteredWords.length === 0 ? (
          <div class="card text-center text-warm-gray py-8">
            Keine Vokabeln gefunden
          </div>
        ) : (
          filteredWords.map((word) => {
            const wp = getWordProgress(word.id)
            const hasProgress = wp.correct > 0 || wp.wrong > 0

            return (
              <div
                key={word.id}
                class={`card p-4 ${hasProgress ? getBoxStyles(wp.box) : ''}`}
              >
                <div class="flex items-start gap-3">
                  <button
                    onClick={() => speak(word.spanish)}
                    class="mt-1 p-2 text-warm-gray hover:text-warm-brown hover:bg-white/50 rounded transition-colors"
                    title="Anhören"
                  >
                    <SpeakerIcon class="w-5 h-5" />
                  </button>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="font-serif font-medium text-terracotta">{word.spanish}</span>
                      {hasProgress && (
                        <span class="text-xs px-2 py-0.5 bg-white/50 text-warm-gray rounded">
                          Stufe {wp.box}
                        </span>
                      )}
                    </div>
                    <p class="text-warm-brown">{word.german}</p>
                    <button
                      onClick={() => speak(word.example)}
                      class="text-sm font-serif text-warm-gray mt-1 italic truncate text-left hover:text-terracotta transition-colors cursor-pointer flex items-center gap-1 group"
                      title="Beispielsatz anhören"
                    >
                      <SpeakerIcon class="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
                      <span class="truncate">„{word.example}"</span>
                    </button>
                  </div>
                  {hasProgress && (
                    <div class="text-right text-xs text-warm-gray shrink-0">
                      <div class="text-olive">{wp.correct} richtig</div>
                      <div class="text-rose-muted">{wp.wrong} falsch</div>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Count */}
      <p class="text-center text-sm text-warm-gray">
        {filteredWords.length} {filteredWords.length === 1 ? 'Vokabel' : 'Vokabeln'}
      </p>
    </div>
  )
}
