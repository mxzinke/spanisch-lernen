import { useState, useEffect } from 'preact/hooks'

export function useSpeech() {
  const [isSupported, setIsSupported] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  useEffect(() => {
    setIsSupported('speechSynthesis' in window)
  }, [])

  const speak = (text, lang = 'es-ES') => {
    if (!isSupported) return

    // Aktuelle Sprache stoppen
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.rate = 0.9 // Etwas langsamer für Lernende

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }

  const stop = () => {
    if (isSupported) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  return { speak, stop, isSpeaking, isSupported }
}
