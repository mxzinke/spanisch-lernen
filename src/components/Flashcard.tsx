import { useState } from 'preact/hooks'
import type { WordWithCategory } from '../types'
import { useSpeech } from '../hooks/useSpeech'
import { SpeakerIcon } from './SpeakerIcon'

interface Props {
  word: WordWithCategory
  onResult: (correct: boolean) => void
  onSkip: () => void
}

export function Flashcard({ word, onResult, onSkip }: Props) {
  const [flipped, setFlipped] = useState(false)
  const { speak, isSpeaking } = useSpeech()

  const handleSpeak = (e: Event) => {
    e.stopPropagation()
    speak(word.spanish)
  }

  const handleResult = (correct: boolean) => {
    setFlipped(false)
    // Small delay to let the flip animation complete before moving to next card
    setTimeout(() => onResult(correct), 100)
  }

  const handleFlip = () => {
    if (!flipped) {
      setFlipped(true)
      // Play audio when revealing the answer
      setTimeout(() => speak(word.spanish), 300)
    }
  }

  return (
    <div class="space-y-6">
      {/* Card with flip animation */}
      <div class="flashcard-container min-h-[280px]">
        <div
          onClick={handleFlip}
          class={`flashcard-inner min-h-[280px] cursor-pointer ${flipped ? 'flipped' : ''}`}
        >
          {/* Front face - German word */}
          <div class="flashcard-face flashcard-front p-6 text-center bg-white">
            <p class="text-sm text-warm-gray mb-3">Wie heißt das auf Spanisch?</p>
            <p class="text-3xl font-serif font-medium text-warm-brown">{word.german}</p>
            <p class="text-sm text-warm-gray/60 mt-6">Tippen zum Umdrehen</p>
          </div>

          {/* Back face - Spanish word */}
          <div class="flashcard-face flashcard-back p-6 text-center bg-white">
            <p class="text-sm text-warm-gray mb-3">Spanisch</p>
            <p class="text-3xl font-serif font-medium text-terracotta">{word.spanish}</p>
            <button
              onClick={handleSpeak}
              class="mt-4 px-4 py-2 text-sm text-warm-gray hover:text-warm-brown hover:bg-sand-100 rounded-lg transition-colors inline-flex items-center gap-2"
              disabled={isSpeaking}
            >
              <SpeakerIcon class="w-4 h-4" />
              Anhören
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                speak(word.example)
              }}
              class="mt-4 p-4 bg-sand-50 hover:bg-sand-100 rounded-lg w-full max-w-sm text-center transition-colors group"
              title="Beispielsatz anhören"
            >
              <p class="w-fit mx-auto text-sm font-serif text-warm-gray group-hover:text-terracotta italic flex items-center gap-2 transition-colors">
                <SpeakerIcon class="w-3 h-3 opacity-50 group-hover:opacity-100 shrink-0" />
                <span>„{word.example}"</span>
              </p>
              <p class="text-xs text-warm-gray/70 mt-1 ml-5">{word.exampleDe}</p>
            </button>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      {flipped ? (
        <div class="flex gap-3">
          <button onClick={() => handleResult(false)} class="btn btn-danger flex-1 py-3">
            Nochmal üben
          </button>
          <button onClick={() => handleResult(true)} class="btn btn-success flex-1 py-3">
            Gewusst
          </button>
        </div>
      ) : (
        <button onClick={onSkip} class="btn btn-secondary w-full">
          Überspringen
        </button>
      )}
    </div>
  )
}
