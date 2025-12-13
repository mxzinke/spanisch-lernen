import { useState, useMemo } from 'preact/hooks'
import type { WordWithCategory } from '../types'
import { useSpeech } from '../hooks/useSpeech'
import { getSmartDistractors } from '../data/vocabulary'

interface Props {
  word: WordWithCategory
  allWords: WordWithCategory[]
  onResult: (correct: boolean) => void
  onSkip: () => void
}

function AudioWaveIcon({ isPlaying }: { isPlaying: boolean }) {
  return (
    <svg
      class="w-10 h-10"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
    >
      <line x1="6" y1="12" x2="6" y2="20" class={isPlaying ? 'animate-wave-1' : ''} />
      <line x1="11" y1="8" x2="11" y2="24" class={isPlaying ? 'animate-wave-2' : ''} />
      <line x1="16" y1="10" x2="16" y2="22" class={isPlaying ? 'animate-wave-3' : ''} />
      <line x1="21" y1="6" x2="21" y2="26" class={isPlaying ? 'animate-wave-4' : ''} />
      <line x1="26" y1="11" x2="26" y2="21" class={isPlaying ? 'animate-wave-5' : ''} />
    </svg>
  )
}

function CheckCircle({ checked, disabled }: { checked: boolean; disabled: boolean }) {
  return (
    <div
      class={`
        w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200
        ${checked
          ? 'bg-terracotta border-terracotta text-white'
          : disabled
            ? 'border-sand-300 bg-sand-100'
            : 'border-sand-300 bg-white hover:border-terracotta/50'
        }
      `}
    >
      {checked && (
        <svg class="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M3 8.5l3 3 7-7" />
        </svg>
      )}
    </div>
  )
}

export function AudioPractice({ word, allWords, onResult, onSkip }: Props) {
  const [selected, setSelected] = useState<WordWithCategory | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const { speak, isSupported } = useSpeech()

  const options = useMemo(() => {
    const distractors = getSmartDistractors(word, allWords, 3)
    return [...distractors, word].sort(() => Math.random() - 0.5)
  }, [word, allWords])

  const handlePlay = (option: WordWithCategory, e: Event) => {
    e.stopPropagation()
    if (showResult) return
    setPlayingId(option.id)
    speak(option.spanish)
    setTimeout(() => setPlayingId(null), 1500)
  }

  const handleSelect = (option: WordWithCategory) => {
    if (showResult) return
    setSelected(option)
    setShowResult(true)
    speak(word.spanish)

    setTimeout(() => {
      const isCorrect = option.id === word.id
      setSelected(null)
      setShowResult(false)
      setPlayingId(null)
      onResult(isCorrect)
    }, 2000)
  }

  const getCardClass = (option: WordWithCategory): string => {
    const base = 'relative flex flex-col rounded-xl transition-all duration-200 overflow-hidden'

    if (!showResult) {
      return `${base} bg-white border-2 border-sand-200 hover:border-terracotta/40 hover:shadow-soft`
    }
    if (option.id === word.id) {
      return `${base} bg-olive/10 border-2 border-olive`
    }
    if (option.id === selected?.id) {
      return `${base} bg-rose-muted/20 border-2 border-rose-muted`
    }
    return `${base} bg-sand-100 border-2 border-sand-200 opacity-50`
  }

  if (!isSupported) {
    return (
      <div class="card text-center py-12 space-y-6">
        <div class="text-warm-gray">
          <svg
            class="w-16 h-16 mx-auto mb-4 opacity-40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
          <p class="text-lg font-medium text-warm-brown mb-2">Audio nicht verfügbar</p>
          <p class="text-sm">Dein Browser unterstützt leider keine Sprachausgabe.</p>
        </div>
        <button onClick={onSkip} class="btn btn-secondary">
          Andere Übung wählen
        </button>
      </div>
    )
  }

  return (
    <div class="space-y-6">
      {/* Question card */}
      <div class="card text-center py-8">
        <p class="text-sm text-warm-gray mb-3">Höre und finde...</p>
        <p class="text-3xl font-serif font-medium text-terracotta">{word.german}</p>
      </div>

      {/* Audio option cards - 2x2 grid */}
      <div class="grid grid-cols-2 gap-3">
        {options.map((option) => {
          const isPlaying = playingId === option.id
          const isCorrect = option.id === word.id
          const isSelected = option.id === selected?.id

          return (
            <div key={option.id} class={getCardClass(option)}>
              {/* Play audio area */}
              <button
                onClick={(e) => handlePlay(option, e)}
                disabled={showResult}
                class="flex-1 flex flex-col items-center justify-center py-6 px-4 text-warm-gray"
              >
                <AudioWaveIcon isPlaying={isPlaying} />
                {showResult ? (
                  <span
                    class={`text-base font-medium mt-3 animate-fade-in ${
                      isCorrect ? 'text-olive-dark' : isSelected ? 'text-rose-dark' : 'text-warm-gray'
                    }`}
                  >
                    {option.spanish}
                  </span>
                ) : (
                  <span class="text-xs text-warm-gray/60 mt-2">Anhören</span>
                )}
              </button>

              {/* Selection footer */}
              <button
                onClick={() => handleSelect(option)}
                disabled={showResult}
                class={`
                  flex items-center justify-center gap-2 py-3 px-4 border-t transition-colors
                  ${showResult
                    ? isCorrect
                      ? 'border-olive/30 bg-olive/5'
                      : isSelected
                        ? 'border-rose-muted/30 bg-rose-muted/5'
                        : 'border-sand-200 bg-sand-50'
                    : 'border-sand-200 hover:bg-sand-50'
                  }
                `}
              >
                <CheckCircle
                  checked={showResult && (isCorrect || isSelected)}
                  disabled={showResult && !isCorrect && !isSelected}
                />
                <span
                  class={`text-sm font-medium ${
                    showResult
                      ? isCorrect
                        ? 'text-olive-dark'
                        : isSelected
                          ? 'text-rose-dark'
                          : 'text-warm-gray/50'
                      : 'text-warm-gray'
                  }`}
                >
                  {showResult ? (isCorrect ? 'Richtig' : isSelected ? 'Falsch' : '') : 'Auswählen'}
                </span>
              </button>
            </div>
          )
        })}
      </div>

      {/* Skip button */}
      {!showResult && (
        <div class="text-center pt-2">
          <button
            onClick={onSkip}
            class="text-sm text-warm-gray/60 hover:text-warm-gray transition-colors"
          >
            Kann gerade nicht hören
          </button>
        </div>
      )}

      {/* Result feedback */}
      {showResult && (
        <p class="text-center text-sm text-warm-gray animate-fade-in">
          {selected?.id === word.id ? 'Gut gehört!' : `Die Antwort war "${word.spanish}"`}
        </p>
      )}
    </div>
  )
}
