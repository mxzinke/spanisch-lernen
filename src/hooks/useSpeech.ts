import { useState, useEffect, useCallback } from 'preact/hooks'
import type { SpeechSettings } from '../types'

const SETTINGS_KEY = 'spanisch-lernen-speech'

// Priorisierte spanische Stimmen (Qualität variiert je nach System)
const PREFERRED_VOICES = [
  'Monica', // macOS - sehr natürlich
  'Paulina', // macOS - mexikanisch
  'Jorge', // macOS - männlich
  'Google español', // Chrome
  'Microsoft Helena', // Windows
  'Microsoft Laura', // Windows
  'Microsoft Pablo', // Windows männlich
]

function getDefaultSettings(): SpeechSettings {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY)
    if (saved) return JSON.parse(saved)
  } catch {
    // ignore
  }
  return { rate: 0.85, voiceName: null }
}

interface SpeakOptions {
  voice?: SpeechSynthesisVoice
  rate?: number
  pitch?: number
}

export function useSpeech() {
  const [isSupported, setIsSupported] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [spanishVoices, setSpanishVoices] = useState<SpeechSynthesisVoice[]>([])
  const [settings, setSettings] = useState<SpeechSettings>(getDefaultSettings)
  const [lastSpokenText, setLastSpokenText] = useState<string | null>(null)
  const [speakSlow, setSpeakSlow] = useState(false)

  // Stimmen laden
  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false)
      return
    }

    setIsSupported(true)

    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices()

      // Spanische Stimmen filtern und sortieren
      const spanish = allVoices
        .filter((v) => v.lang.startsWith('es'))
        .sort((a, b) => {
          // Bevorzugte Stimmen zuerst
          const aIndex = PREFERRED_VOICES.findIndex((p) =>
            a.name.toLowerCase().includes(p.toLowerCase())
          )
          const bIndex = PREFERRED_VOICES.findIndex((p) =>
            b.name.toLowerCase().includes(p.toLowerCase())
          )

          if (aIndex !== -1 && bIndex === -1) return -1
          if (aIndex === -1 && bIndex !== -1) return 1
          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex

          // Lokale Stimmen bevorzugen (nicht "remote")
          if (a.localService && !b.localService) return -1
          if (!a.localService && b.localService) return 1

          return a.name.localeCompare(b.name)
        })

      setSpanishVoices(spanish)
    }

    // Stimmen können asynchron geladen werden
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
  }, [])

  // Einstellungen speichern
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  }, [settings])

  // Beste Stimme finden
  const getBestVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (spanishVoices.length === 0) return null

    // Gespeicherte Stimme bevorzugen
    if (settings.voiceName) {
      const saved = spanishVoices.find((v) => v.name === settings.voiceName)
      if (saved) return saved
    }

    // Sonst erste (beste) aus sortierter Liste
    return spanishVoices[0]
  }, [spanishVoices, settings.voiceName])

  const speak = useCallback(
    (text: string, options: SpeakOptions = {}) => {
      if (!isSupported) return

      window.speechSynthesis.cancel()

      // Prüfen ob gleicher Text erneut abgespielt wird
      const isSameText = text === lastSpokenText
      const shouldSpeakSlow = isSameText ? !speakSlow : false

      // State aktualisieren
      setLastSpokenText(text)
      setSpeakSlow(shouldSpeakSlow)

      const utterance = new SpeechSynthesisUtterance(text)

      // Stimme setzen
      const voice = options.voice || getBestVoice()
      if (voice) {
        utterance.voice = voice
        utterance.lang = voice.lang
      } else {
        utterance.lang = 'es-ES'
      }

      // Einstellungen anwenden - bei langsamem Modus halbe Geschwindigkeit
      const baseRate = options.rate ?? settings.rate
      utterance.rate = shouldSpeakSlow ? baseRate * 0.5 : baseRate
      utterance.pitch = options.pitch ?? 1

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      window.speechSynthesis.speak(utterance)
    },
    [isSupported, getBestVoice, settings.rate, lastSpokenText, speakSlow]
  )

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [isSupported])

  const setRate = useCallback((rate: number) => {
    setSettings((prev) => ({ ...prev, rate }))
  }, [])

  const setVoice = useCallback((voiceName: string) => {
    setSettings((prev) => ({ ...prev, voiceName }))
  }, [])

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
    voices: spanishVoices,
    currentVoice: getBestVoice(),
    rate: settings.rate,
    setRate,
    setVoice,
  }
}
