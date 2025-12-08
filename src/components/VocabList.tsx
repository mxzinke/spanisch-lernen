import { useState } from 'preact/hooks'
import type { WordWithCategory, CustomWord } from '../types'
import { isVerbWord } from '../types'
import { useSpeech } from '../hooks/useSpeech'
import { useProgress } from '../hooks/useProgress'
import { useUserLevel } from '../hooks/useUserLevel'
import { useCustomWords, CUSTOM_CATEGORY_NAME } from '../hooks/useCustomWords'
import { sortedCategories, allWords } from '../data/vocabulary'
import { SpeakerIcon } from './SpeakerIcon'
import { VerbDetailDialog } from './VerbDetailDialog'
import { AddCustomWord } from './AddCustomWord'

export function VocabList() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedVerb, setSelectedVerb] = useState<WordWithCategory | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingWord, setEditingWord] = useState<CustomWord | null>(null)
  const { speak } = useSpeech()
  const { progress, getWordProgress } = useProgress()
  const { unlockedCategoryIds } = useUserLevel(progress)
  const { customWords, customWordsWithCategory, addCustomWord, updateCustomWord, deleteCustomWord, hasCustomWord } =
    useCustomWords()

  // Combine all words with custom words for filtering
  const allWordsWithCustom = [...allWords, ...customWordsWithCategory]

  const filteredWords = allWordsWithCustom
    .filter((w) => {
      if (selectedCategory === 'custom') {
        return w.category === 'custom'
      }
      if (selectedCategory === 'all') {
        // Bei "alle" nur freigeschaltete Kategorien und eigene Vokabeln zeigen
        return unlockedCategoryIds.includes(w.category) || w.category === 'custom'
      }
      return w.category === selectedCategory
    })
    .filter(
      (w) =>
        w.spanish.toLowerCase().includes(search.toLowerCase()) ||
        w.german.toLowerCase().includes(search.toLowerCase())
    )

  // Check if a word is a custom word
  const isCustomWord = (wordId: string): boolean => wordId.startsWith('custom-')

  // Get custom word by id
  const getCustomWordById = (id: string): CustomWord | undefined =>
    customWords.find((w) => w.id === id)

  // Handle save from add/edit dialog
  const handleSaveCustomWord = async (word: Omit<CustomWord, 'id' | 'createdAt'>) => {
    if (editingWord) {
      await updateCustomWord({ ...editingWord, ...word })
      setEditingWord(null)
    } else {
      await addCustomWord(word)
      setShowAddDialog(false)
    }
  }

  // Handle delete custom word
  const handleDeleteCustomWord = async (id: string) => {
    if (confirm('Möchtest du diese Vokabel wirklich löschen?')) {
      await deleteCustomWord(id)
    }
  }

  const getBoxStyles = (box: number): string => {
    const styles = [
      'bg-rose-muted/20',
      'bg-clay-light/30',
      'bg-clay/20',
      'bg-olive-light/30',
      'bg-olive/20',
    ]
    // Intern kann die Box über 5 steigen, aber für die Anzeige auf max 5 begrenzen
    const displayBox = Math.min(box, 5)
    return styles[displayBox - 1] || ''
  }

  return (
    <div class="space-y-6">
      {/* Search and filter */}
      <div class="space-y-3">
        <div class="flex gap-2">
          <input
            type="text"
            value={search}
            onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
            placeholder="Suchen..."
            class="input flex-1"
          />
          <button
            onClick={() => setShowAddDialog(true)}
            class="btn btn-primary shrink-0 flex items-center gap-2"
            title="Eigene Vokabel hinzufügen"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span class="hidden sm:inline">Hinzufügen</span>
          </button>
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory((e.target as HTMLSelectElement).value)}
          class="select"
        >
          <option value="all">Alle freigeschalteten Kategorien ({unlockedCategoryIds.length + (customWords.length > 0 ? 1 : 0)})</option>
          {customWords.length > 0 && (
            <option value="custom">{CUSTOM_CATEGORY_NAME} ({customWords.length})</option>
          )}
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
            const isCustom = isCustomWord(word.id)

            return (
              <div
                key={word.id}
                class={`card p-4 ${hasProgress ? getBoxStyles(wp.box) : ''} ${isCustom ? 'border-l-4 border-l-terracotta/50' : ''}`}
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
                      {isVerbWord(word) ? (
                        <button
                          onClick={() => setSelectedVerb(word)}
                          class="font-serif font-medium text-terracotta hover:text-terracotta/80 hover:underline transition-colors cursor-pointer text-left"
                          title="Konjugationen anzeigen"
                        >
                          {word.spanish}
                        </button>
                      ) : (
                        <span class="font-serif font-medium text-terracotta">{word.spanish}</span>
                      )}
                      {isVerbWord(word) && (
                        <button
                          onClick={() => setSelectedVerb(word)}
                          class="text-xs px-2 py-0.5 bg-terracotta/10 text-terracotta rounded hover:bg-terracotta/20 transition-colors"
                          title="Konjugationen anzeigen"
                        >
                          Verb
                        </button>
                      )}
                      {isCustom && (
                        <span class="text-xs px-2 py-0.5 bg-terracotta/10 text-terracotta rounded">
                          Eigene
                        </span>
                      )}
                      {hasProgress && (
                        <span class="text-xs px-2 py-0.5 bg-white/50 text-warm-gray rounded">
                          Stufe {Math.min(wp.box, 5)}
                        </span>
                      )}
                    </div>
                    <p class="text-warm-brown">{word.german}</p>
                    {word.example && (
                      <button
                        onClick={() => speak(word.example)}
                        class="text-sm font-serif text-warm-gray mt-1 italic truncate text-left hover:text-terracotta transition-colors cursor-pointer flex items-center gap-1 group"
                        title="Beispielsatz anhören"
                      >
                        <SpeakerIcon class="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
                        <span class="truncate">„{word.example}"</span>
                      </button>
                    )}
                  </div>
                  <div class="flex flex-col items-end gap-2 shrink-0">
                    {hasProgress && (
                      <div class="text-right text-xs text-warm-gray">
                        <div class="text-olive">{wp.correct} richtig</div>
                        <div class="text-rose-muted">{wp.wrong} falsch</div>
                      </div>
                    )}
                    {isCustom && (
                      <div class="flex gap-1">
                        <button
                          onClick={() => setEditingWord(getCustomWordById(word.id) || null)}
                          class="p-1.5 text-warm-gray hover:text-terracotta hover:bg-white/50 rounded transition-colors"
                          title="Bearbeiten"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteCustomWord(word.id)}
                          class="p-1.5 text-warm-gray hover:text-dusty-rose hover:bg-white/50 rounded transition-colors"
                          title="Löschen"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
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

      {/* Verb Detail Dialog */}
      {selectedVerb && isVerbWord(selectedVerb) && (
        <VerbDetailDialog verb={selectedVerb} onClose={() => setSelectedVerb(null)} />
      )}

      {/* Add Custom Word Dialog */}
      {showAddDialog && (
        <AddCustomWord
          onSave={handleSaveCustomWord}
          onClose={() => setShowAddDialog(false)}
          hasCustomWord={hasCustomWord}
        />
      )}

      {/* Edit Custom Word Dialog */}
      {editingWord && (
        <AddCustomWord
          onSave={handleSaveCustomWord}
          onClose={() => setEditingWord(null)}
          existingWord={editingWord}
          hasCustomWord={hasCustomWord}
        />
      )}
    </div>
  )
}
