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
      class="w-8 h-8"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
    >
      {/* Stylized waveform bars */}
      <line
        x1="6"
        y1="12"
        x2="6"
        y2="20"
        class={isPlaying ? 'animate-wave-1' : ''}
      />
      <line
        x1="11"
        y1="8"
        x2="11"
        y2="24"
        class={isPlaying ? 'animate-wave-2' : ''}
      />
      <line
        x1="16"
        y1="10"
        x2="16"
        y2="22"
        class={isPlaying ? 'animate-wave-3' : ''}
      />
      <line
        x1="21"
        y1="6"
        x2="21"
        y2="26"
        class={isPlaying ? 'animate-wave-4' : ''}
      />
      <line
        x1="26"
        y1="11"
        x2="26"
        y2="21"
        class={isPlaying ? 'animate-wave-5' : ''}
      />
    </svg>
  )
}

export function AudioPractice({ word, allWords, onResult, onSkip }: Props) {
  const [selected, setSelected] = useState<WordWithCategory | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const { speak, isSpeaking, isSupported } = useSpeech()

  const options = useMemo(() => {
    const distractors = getSmartDistractors(word, allWords, 3)
    return [...distractors, word].sort(() => Math.random() - 0.5)
  }, [word, allWords])

  const handlePlay = (option: WordWithCategory) => {
    if (showResult) return
    setPlayingId(option.id)
    speak(option.spanish)
    // Reset playing state after speech ends (approximate)
    setTimeout(() => setPlayingId(null), 1500)
  }

  const handleSelect = (option: WordWithCategory) => {
    if (showResult) return
    setSelected(option)
    setShowResult(true)
    // Play the correct word
    speak(word.spanish)

    setTimeout(() => {
      const isCorrect = option.id === word.id
      setSelected(null)
      setShowResult(false)
      setPlayingId(null)
      onResult(isCorrect)
    }, 2000)
  }

  const getButtonClass = (option: WordWithCategory): string => {
    const base =
      'flex flex-col items-center justify-center gap-3 p-6 rounded-xl transition-all duration-200'

    if (!showResult) {
      return `${base} bg-white border-2 border-sand-200 text-warm-gray hover:border-terracotta/40 hover:shadow-soft`
    }
    if (option.id === word.id) {
      return `${base} bg-olive/10 border-2 border-olive text-olive-dark`
    }
    if (option.id === selected?.id) {
      return `${base} bg-rose-muted/20 border-2 border-rose-muted text-rose-dark`
    }
    return `${base} bg-sand-100 border-2 border-sand-200 opacity-50`
  }

  // If TTS is not supported, show a message and skip button
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
          <p class="text-lg font-medium text-warm-brown mb-2">
            Audio nicht verfügbar
          </p>
          <p class="text-sm">
            Dein Browser unterstützt leider keine Sprachausgabe.
          </p>
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
        <p class="text-3xl font-serif font-medium text-terracotta">
          {word.german}
        </p>
      </div>

      {/* Audio option buttons - 2x2 grid */}
      <div class="grid grid-cols-2 gap-4">
        {options.map((option) => (
          <div key={option.id} class="space-y-2">
            {/* Audio play button */}
            <button
              onClick={() => handlePlay(option)}
              disabled={showResult}
              class={getButtonClass(option)}
            >
              <AudioWaveIcon isPlaying={playingId === option.id || (isSpeaking && playingId === option.id)} />
              {!showResult ? (
                <span class="text-xs text-warm-gray/70">Anhören</span>
              ) : (
                <span class="text-sm font-medium animate-fade-in">
                  {option.spanish}
                </span>
              )}
            </button>

            {/* Select button - only visible after at least one listen */}
            {!showResult && (
              <button
                onClick={() => handleSelect(option)}
                class="w-full py-2 text-sm text-warm-gray hover:text-terracotta hover:bg-sand-100 rounded-lg transition-colors"
              >
                Das ist es
              </button>
            )}
          </div>
        ))}
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
          {selected?.id === word.id
            ? 'Richtig erkannt!'
            : `Das war "${word.spanish}"`}
        </p>
      )}
    </div>
  )
}
