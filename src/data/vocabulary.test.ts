import { describe, it, expect } from 'vitest'
import {
  getSmartDistractors,
  categoryDifficulty,
  levenshteinDistance,
  calculateSimilarityScore,
  getSemanticGroup,
  allWords,
} from './vocabulary'
import type { WordWithCategory } from '../types'

// Mock-Daten für Tests
const mockWords: WordWithCategory[] = [
  // Tiere (Level 8)
  { id: 'perro', spanish: 'El perro', german: 'Der Hund', example: '', exampleDe: '', category: 'animals', categoryName: 'Tiere' },
  { id: 'gato', spanish: 'El gato', german: 'Die Katze', example: '', exampleDe: '', category: 'animals', categoryName: 'Tiere' },
  { id: 'conejo', spanish: 'El conejo', german: 'Das Kaninchen', example: '', exampleDe: '', category: 'animals', categoryName: 'Tiere' },
  { id: 'caballo', spanish: 'El caballo', german: 'Das Pferd', example: '', exampleDe: '', category: 'animals', categoryName: 'Tiere' },
  // Wetter (Level 8)
  { id: 'sol', spanish: 'El sol', german: 'Die Sonne', example: '', exampleDe: '', category: 'weather', categoryName: 'Wetter' },
  { id: 'lluvia', spanish: 'La lluvia', german: 'Der Regen', example: '', exampleDe: '', category: 'weather', categoryName: 'Wetter' },
  // Reisen (Level 9)
  { id: 'avion', spanish: 'El avión', german: 'Das Flugzeug', example: '', exampleDe: '', category: 'travel', categoryName: 'Reisen' },
  { id: 'tren', spanish: 'El tren', german: 'Der Zug', example: '', exampleDe: '', category: 'travel', categoryName: 'Reisen' },
  // Politik (Level 17 - weit entfernt)
  { id: 'gobierno', spanish: 'El gobierno', german: 'Die Regierung', example: '', exampleDe: '', category: 'politics', categoryName: 'Politik' },
  { id: 'eleccion', spanish: 'La elección', german: 'Die Wahl', example: '', exampleDe: '', category: 'politics', categoryName: 'Politik' },
  // Greetings (Level 1 - weit entfernt)
  { id: 'hola', spanish: 'Hola', german: 'Hallo', example: '', exampleDe: '', category: 'greetings', categoryName: 'Begrüßung' },
  { id: 'adios', spanish: 'Adiós', german: 'Tschüss', example: '', exampleDe: '', category: 'greetings', categoryName: 'Begrüßung' },
]

describe('getSmartDistractors', () => {
  it('sollte 3 Distraktoren zurückgeben', () => {
    const target = mockWords[0] // perro
    const result = getSmartDistractors(target, mockWords, 3)
    expect(result.length).toBe(3)
  })

  it('sollte das Zielwort nicht enthalten', () => {
    const target = mockWords[0] // perro
    const result = getSmartDistractors(target, mockWords, 3)
    expect(result.some(w => w.id === target.id)).toBe(false)
  })

  it('sollte Wörter aus gleicher Kategorie bevorzugen', () => {
    const target = mockWords[0] // perro (animals)

    // Mehrere Durchläufe wegen Zufallskomponente
    let sameCategoryTotal = 0
    for (let i = 0; i < 20; i++) {
      const result = getSmartDistractors(target, mockWords, 3)
      sameCategoryTotal += result.filter(w => w.category === 'animals').length
    }

    // Im Durchschnitt sollte mindestens 1 aus der gleichen Kategorie sein
    expect(sameCategoryTotal / 20).toBeGreaterThanOrEqual(1)
  })

  it('sollte bei wenig Kategorie-Wörtern auf ähnliche Schwierigkeit zurückfallen', () => {
    // Wetter hat nur 2 Wörter
    const target = mockWords[4] // sol (weather, Level 8)

    // Mehrere Durchläufe wegen Zufallskomponente
    let lluviaCount = 0
    let similarLevelTotal = 0

    for (let i = 0; i < 20; i++) {
      const result = getSmartDistractors(target, mockWords, 3)
      expect(result.length).toBe(3)

      if (result.some(w => w.id === 'lluvia')) lluviaCount++

      // Rest sollte aus ähnlichen Levels kommen (Level 6-10)
      const similarLevelWords = result.filter(w => {
        const diff = categoryDifficulty[w.category] || 8
        return Math.abs(diff - 8) <= 2
      })
      similarLevelTotal += similarLevelWords.length
    }

    // lluvia sollte oft dabei sein (gleiche Kategorie + hoher Score)
    expect(lluviaCount).toBeGreaterThanOrEqual(5)
    // Im Durchschnitt sollten mindestens 2 aus ähnlichem Level sein
    expect(similarLevelTotal / 20).toBeGreaterThanOrEqual(2)
  })

  it('sollte weit entfernte Kategorien vermeiden wenn möglich', () => {
    const target = mockWords[0] // perro (animals, Level 8)

    // Mehrere Durchläufe für statistische Sicherheit
    let politicsCount = 0
    let greetingsCount = 0

    for (let i = 0; i < 20; i++) {
      const result = getSmartDistractors(target, mockWords, 3)
      politicsCount += result.filter(w => w.category === 'politics').length
      greetingsCount += result.filter(w => w.category === 'greetings').length
    }

    // Politik (Level 17) und Greetings (Level 1) sind weit von Level 8 entfernt
    // Sollten selten oder nie gewählt werden wenn genug nähere Alternativen existieren
    const animalsAndNearbyCount = mockWords.filter(w => {
      if (w.id === target.id) return false
      const diff = categoryDifficulty[w.category] || 8
      return Math.abs(diff - 8) <= 2
    }).length

    // Wenn genug nahegelegene Wörter existieren (>= 3), sollten entfernte selten gewählt werden
    if (animalsAndNearbyCount >= 3) {
      // Im Durchschnitt sollten weit entfernte Kategorien kaum vorkommen
      expect(politicsCount + greetingsCount).toBeLessThan(20) // Weniger als 1 pro Durchlauf im Schnitt
    }
  })

  it('sollte mit count = 1 funktionieren', () => {
    const target = mockWords[0]
    const result = getSmartDistractors(target, mockWords, 1)
    expect(result.length).toBe(1)
  })

  it('sollte mit wenigen Wörtern umgehen können', () => {
    const smallSet: WordWithCategory[] = [
      { id: 'a', spanish: 'A', german: 'A', example: '', exampleDe: '', category: 'test', categoryName: 'Test' },
      { id: 'b', spanish: 'B', german: 'B', example: '', exampleDe: '', category: 'test', categoryName: 'Test' },
    ]
    const target = smallSet[0]
    const result = getSmartDistractors(target, smallSet, 3)

    // Kann nur 1 Distraktor zurückgeben (b)
    expect(result.length).toBe(1)
    expect(result[0].id).toBe('b')
  })

  it('sollte keine Duplikate enthalten', () => {
    const target = mockWords[0]

    for (let i = 0; i < 10; i++) {
      const result = getSmartDistractors(target, mockWords, 3)
      const ids = result.map(w => w.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    }
  })

  it('sollte phonetisch ähnliche Wörter bevorzugen', () => {
    // Test mit Wörtern die phonetisch ähnlich sind
    const phoneticallySimlarWords: WordWithCategory[] = [
      { id: 'perro', spanish: 'El perro', german: 'Der Hund', example: '', exampleDe: '', category: 'animals', categoryName: 'Tiere' },
      { id: 'pero', spanish: 'Pero', german: 'Aber', example: '', exampleDe: '', category: 'connectors', categoryName: 'Konnektoren' },
      { id: 'perra', spanish: 'La perra', german: 'Die Hündin', example: '', exampleDe: '', category: 'animals', categoryName: 'Tiere' },
      { id: 'perla', spanish: 'La perla', german: 'Die Perle', example: '', exampleDe: '', category: 'materials', categoryName: 'Materialien' },
      { id: 'casa', spanish: 'La casa', german: 'Das Haus', example: '', exampleDe: '', category: 'home', categoryName: 'Zuhause' },
      { id: 'mesa', spanish: 'La mesa', german: 'Der Tisch', example: '', exampleDe: '', category: 'home', categoryName: 'Zuhause' },
    ]

    const target = phoneticallySimlarWords[0] // perro
    let similarCount = 0

    for (let i = 0; i < 20; i++) {
      const result = getSmartDistractors(target, phoneticallySimlarWords, 3)
      // pero, perra, perla sind phonetisch ähnlich zu perro
      const phoneticallySimlar = result.filter(w =>
        ['pero', 'perra', 'perla'].includes(w.id)
      )
      similarCount += phoneticallySimlar.length
    }

    // Im Durchschnitt sollten mindestens 2 von 3 phonetisch ähnlich sein
    expect(similarCount / 20).toBeGreaterThanOrEqual(1.5)
  })
})

describe('levenshteinDistance', () => {
  it('sollte 0 für identische Strings zurückgeben', () => {
    expect(levenshteinDistance('perro', 'perro')).toBe(0)
    expect(levenshteinDistance('', '')).toBe(0)
  })

  it('sollte korrekte Distanz für einfache Änderungen berechnen', () => {
    // Eine Substitution
    expect(levenshteinDistance('perro', 'perlo')).toBe(1)
    // Eine Insertion
    expect(levenshteinDistance('perro', 'perrro')).toBe(1)
    // Eine Deletion
    expect(levenshteinDistance('perro', 'pero')).toBe(1)
  })

  it('sollte korrekte Distanz für mehrere Änderungen berechnen', () => {
    // perro → gato: p→g, e→a, rr→t, o bleibt = 4 Änderungen
    expect(levenshteinDistance('perro', 'gato')).toBe(4)
    // hola → adios: Distanz ist 5 (verschiedene Transformationen möglich)
    expect(levenshteinDistance('hola', 'adios')).toBe(5)
  })

  it('sollte für leere Strings die Länge des anderen zurückgeben', () => {
    expect(levenshteinDistance('', 'hola')).toBe(4)
    expect(levenshteinDistance('hola', '')).toBe(4)
  })

  it('sollte symmetrisch sein', () => {
    expect(levenshteinDistance('perro', 'pero')).toBe(levenshteinDistance('pero', 'perro'))
    expect(levenshteinDistance('gato', 'pato')).toBe(levenshteinDistance('pato', 'gato'))
  })
})

describe('calculateSimilarityScore', () => {
  it('sollte höheren Score für ähnliche Wörter zurückgeben', () => {
    const scorePerroPerla = calculateSimilarityScore('El perro', 'La perla')
    const scorePerroGato = calculateSimilarityScore('El perro', 'El gato')

    // perro/perla sind ähnlicher als perro/gato
    expect(scorePerroPerla).toBeGreaterThan(scorePerroGato)
  })

  it('sollte Bonus für gleichen Anfangsbuchstaben geben', () => {
    const scoreSameStart = calculateSimilarityScore('El carro', 'La casa')
    const scoreDiffStart = calculateSimilarityScore('El carro', 'La mesa')

    expect(scoreSameStart).toBeGreaterThan(scoreDiffStart)
  })

  it('sollte Bonus für gleiche Endungen geben', () => {
    // Beide enden auf -ción
    const scoreVerbs = calculateSimilarityScore('La canción', 'La emoción')
    // Unterschiedliche Endungen
    const scoreMixed = calculateSimilarityScore('La canción', 'El amor')

    expect(scoreVerbs).toBeGreaterThan(scoreMixed)
  })

  it('sollte Artikel bei Vergleich ignorieren', () => {
    // Gleiches Wort mit verschiedenen Artikeln sollte gleichen Score ergeben
    const elPerro = calculateSimilarityScore('El perro', 'El gato')
    const laPerro = calculateSimilarityScore('La perro', 'El gato')

    // Beide sollten identische Scores haben (Artikel ignoriert)
    expect(elPerro).toBe(laPerro)
  })

  it('sollte höheren Score für kürzere Levenshtein-Distanz geben', () => {
    // perro vs pero: Distanz 1
    const closeScore = calculateSimilarityScore('perro', 'pero')
    // perro vs gato: Distanz 5
    const farScore = calculateSimilarityScore('perro', 'gato')

    expect(closeScore).toBeGreaterThan(farScore)
  })
})

describe('getSemanticGroup', () => {
  it('sollte Fragewörter erkennen', () => {
    expect(getSemanticGroup('¿Cómo?')).toBe('question_word')
    expect(getSemanticGroup('¿Qué?')).toBe('question_word')
    expect(getSemanticGroup('¿Cuándo?')).toBe('question_word')
    expect(getSemanticGroup('¿Dónde?')).toBe('question_word')
    expect(getSemanticGroup('¿Por qué?')).toBe('question_word')
    expect(getSemanticGroup('¿Quién?')).toBe('question_word')
  })

  it('sollte Zeitadverbien erkennen', () => {
    expect(getSemanticGroup('Hoy')).toBe('time_adverb')
    expect(getSemanticGroup('Mañana')).toBe('time_adverb')
    expect(getSemanticGroup('Ayer')).toBe('time_adverb')
    expect(getSemanticGroup('Ahora')).toBe('time_adverb')
    expect(getSemanticGroup('Siempre')).toBe('time_adverb')
    expect(getSemanticGroup('Nunca')).toBe('time_adverb')
  })

  it('sollte Wochentage erkennen', () => {
    expect(getSemanticGroup('Lunes')).toBe('weekday')
    expect(getSemanticGroup('Martes')).toBe('weekday')
    expect(getSemanticGroup('Miércoles')).toBe('weekday')
    expect(getSemanticGroup('Domingo')).toBe('weekday')
  })

  it('sollte Monate erkennen', () => {
    expect(getSemanticGroup('Enero')).toBe('month')
    expect(getSemanticGroup('Febrero')).toBe('month')
    expect(getSemanticGroup('Diciembre')).toBe('month')
  })

  it('sollte Farben erkennen', () => {
    expect(getSemanticGroup('Rojo')).toBe('color')
    expect(getSemanticGroup('Azul')).toBe('color')
    expect(getSemanticGroup('Verde')).toBe('color')
    expect(getSemanticGroup('Amarillo')).toBe('color')
  })

  it('sollte Begrüßungen erkennen', () => {
    expect(getSemanticGroup('Hola')).toBe('greeting')
    expect(getSemanticGroup('Adiós')).toBe('greeting')
    expect(getSemanticGroup('Buenos días')).toBe('greeting')
  })

  it('sollte Richtungen erkennen', () => {
    expect(getSemanticGroup('Norte')).toBe('direction')
    expect(getSemanticGroup('Izquierda')).toBe('direction')
    expect(getSemanticGroup('Derecha')).toBe('direction')
  })

  it('sollte null für unbekannte Wörter zurückgeben', () => {
    expect(getSemanticGroup('El perro')).toBe(null)
    expect(getSemanticGroup('La casa')).toBe(null)
    expect(getSemanticGroup('Comer')).toBe(null)
  })
})

describe('getSmartDistractors mit semantischen Gruppen', () => {
  it('sollte Fragewörter mit anderen Fragewörtern kombinieren', () => {
    const questionWords: WordWithCategory[] = [
      { id: 'como', spanish: '¿Cómo?', german: 'Wie?', example: '', exampleDe: '', category: 'basics', categoryName: 'Grundlagen' },
      { id: 'que', spanish: '¿Qué?', german: 'Was?', example: '', exampleDe: '', category: 'basics', categoryName: 'Grundlagen' },
      { id: 'cuando', spanish: '¿Cuándo?', german: 'Wann?', example: '', exampleDe: '', category: 'basics', categoryName: 'Grundlagen' },
      { id: 'donde', spanish: '¿Dónde?', german: 'Wo?', example: '', exampleDe: '', category: 'basics', categoryName: 'Grundlagen' },
      { id: 'porque', spanish: '¿Por qué?', german: 'Warum?', example: '', exampleDe: '', category: 'basics', categoryName: 'Grundlagen' },
      { id: 'perro', spanish: 'El perro', german: 'Der Hund', example: '', exampleDe: '', category: 'animals', categoryName: 'Tiere' },
      { id: 'casa', spanish: 'La casa', german: 'Das Haus', example: '', exampleDe: '', category: 'home', categoryName: 'Zuhause' },
    ]

    const target = questionWords[0] // ¿Cómo?
    let questionWordCount = 0

    for (let i = 0; i < 20; i++) {
      const result = getSmartDistractors(target, questionWords, 3)
      // Zähle wie viele Fragewörter in den Distraktoren sind
      const questions = result.filter(w => w.spanish.startsWith('¿'))
      questionWordCount += questions.length
    }

    // Im Durchschnitt sollten mindestens 2 von 3 Fragewörter sein
    expect(questionWordCount / 20).toBeGreaterThanOrEqual(2)
  })

  it('sollte Wochentage mit anderen Wochentagen kombinieren', () => {
    const weekdayWords: WordWithCategory[] = [
      { id: 'lunes', spanish: 'Lunes', german: 'Montag', example: '', exampleDe: '', category: 'daily', categoryName: 'Alltag' },
      { id: 'martes', spanish: 'Martes', german: 'Dienstag', example: '', exampleDe: '', category: 'daily', categoryName: 'Alltag' },
      { id: 'miercoles', spanish: 'Miércoles', german: 'Mittwoch', example: '', exampleDe: '', category: 'daily', categoryName: 'Alltag' },
      { id: 'jueves', spanish: 'Jueves', german: 'Donnerstag', example: '', exampleDe: '', category: 'daily', categoryName: 'Alltag' },
      { id: 'viernes', spanish: 'Viernes', german: 'Freitag', example: '', exampleDe: '', category: 'daily', categoryName: 'Alltag' },
      { id: 'perro', spanish: 'El perro', german: 'Der Hund', example: '', exampleDe: '', category: 'animals', categoryName: 'Tiere' },
      { id: 'casa', spanish: 'La casa', german: 'Das Haus', example: '', exampleDe: '', category: 'home', categoryName: 'Zuhause' },
    ]

    const target = weekdayWords[0] // Lunes
    let weekdayCount = 0

    for (let i = 0; i < 20; i++) {
      const result = getSmartDistractors(target, weekdayWords, 3)
      const weekdays = result.filter(w => getSemanticGroup(w.spanish) === 'weekday')
      weekdayCount += weekdays.length
    }

    // Im Durchschnitt sollten mindestens 2 von 3 Wochentage sein
    expect(weekdayCount / 20).toBeGreaterThanOrEqual(2)
  })
})

describe('getSmartDistractors mit echten Daten', () => {
  it('sollte für ¿Cómo? andere Fragewörter anzeigen', () => {
    // Finde ¿Cómo? in den echten Daten
    const como = allWords.find(w => w.spanish === '¿Cómo?')
    expect(como).toBeDefined()

    if (!como) return

    // Sammle Statistiken über 10 Durchläufe
    const distractorStats: Record<string, number> = {}

    for (let i = 0; i < 10; i++) {
      const result = getSmartDistractors(como, allWords, 3)

      result.forEach(w => {
        distractorStats[w.spanish] = (distractorStats[w.spanish] || 0) + 1
      })
    }

    // Logge die häufigsten Distraktoren
    const sorted = Object.entries(distractorStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)

    console.log('Häufigste Distraktoren für ¿Cómo?:')
    sorted.forEach(([word, count]) => {
      const group = getSemanticGroup(word)
      console.log(`  ${word}: ${count}x (Gruppe: ${group})`)
    })

    // Prüfe, dass mindestens 2 Fragewörter in den Top 5 sind
    const top5 = sorted.slice(0, 5).map(([word]) => word)
    const questionWordsInTop5 = top5.filter(w => getSemanticGroup(w) === 'question_word')
    expect(questionWordsInTop5.length).toBeGreaterThanOrEqual(2)
  })

  it('sollte für Hoy andere Zeitadverbien anzeigen', () => {
    const hoy = allWords.find(w => w.spanish === 'Hoy')
    expect(hoy).toBeDefined()

    if (!hoy) return

    const distractorStats: Record<string, number> = {}

    for (let i = 0; i < 10; i++) {
      const result = getSmartDistractors(hoy, allWords, 3)
      result.forEach(w => {
        distractorStats[w.spanish] = (distractorStats[w.spanish] || 0) + 1
      })
    }

    const sorted = Object.entries(distractorStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)

    console.log('Häufigste Distraktoren für Hoy:')
    sorted.forEach(([word, count]) => {
      const group = getSemanticGroup(word)
      console.log(`  ${word}: ${count}x (Gruppe: ${group})`)
    })

    // Prüfe, dass mindestens 2 Zeitadverbien in den Top 5 sind
    const top5 = sorted.slice(0, 5).map(([word]) => word)
    const timeAdverbsInTop5 = top5.filter(w => getSemanticGroup(w) === 'time_adverb')
    expect(timeAdverbsInTop5.length).toBeGreaterThanOrEqual(2)
  })

  it('sollte für El perro andere Tiere anzeigen', () => {
    // Explizit nach dem Tier suchen (category: 'animals')
    const perro = allWords.find(w => w.spanish === 'El perro' && w.category === 'animals')
    expect(perro).toBeDefined()

    if (!perro) return

    const distractorStats: Record<string, { count: number; category: string }> = {}

    for (let i = 0; i < 10; i++) {
      const result = getSmartDistractors(perro, allWords, 3)
      result.forEach(w => {
        if (!distractorStats[w.spanish]) {
          distractorStats[w.spanish] = { count: 0, category: w.category }
        }
        distractorStats[w.spanish].count++
      })
    }

    const sorted = Object.entries(distractorStats)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)

    console.log('Häufigste Distraktoren für El perro (animals):')
    sorted.forEach(([word, { count, category }]) => {
      console.log(`  ${word}: ${count}x (Kategorie: ${category})`)
    })

    // Prüfe, dass mindestens 2 Tiere in den Top 5 sind
    const top5 = sorted.slice(0, 5)
    const animalsInTop5 = top5.filter(([, { category }]) => category === 'animals')
    expect(animalsInTop5.length).toBeGreaterThanOrEqual(2)
  })
})
