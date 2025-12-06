import { describe, it, expect } from 'vitest'
import {
  getSmartDistractors,
  categoryDifficulty,
  levenshteinDistance,
  calculateSimilarityScore,
} from './vocabulary'
import type { WordWithCategory } from '../types'

// Mock-Daten für Tests
const mockWords: WordWithCategory[] = [
  // Tiere (Level 6)
  { id: 'perro', spanish: 'El perro', german: 'Der Hund', example: '', exampleDe: '', category: 'animals', categoryName: 'Tiere' },
  { id: 'gato', spanish: 'El gato', german: 'Die Katze', example: '', exampleDe: '', category: 'animals', categoryName: 'Tiere' },
  { id: 'conejo', spanish: 'El conejo', german: 'Das Kaninchen', example: '', exampleDe: '', category: 'animals', categoryName: 'Tiere' },
  { id: 'caballo', spanish: 'El caballo', german: 'Das Pferd', example: '', exampleDe: '', category: 'animals', categoryName: 'Tiere' },
  // Wetter (Level 6)
  { id: 'sol', spanish: 'El sol', german: 'Die Sonne', example: '', exampleDe: '', category: 'weather', categoryName: 'Wetter' },
  { id: 'lluvia', spanish: 'La lluvia', german: 'Der Regen', example: '', exampleDe: '', category: 'weather', categoryName: 'Wetter' },
  // Reisen (Level 7)
  { id: 'avion', spanish: 'El avión', german: 'Das Flugzeug', example: '', exampleDe: '', category: 'travel', categoryName: 'Reisen' },
  { id: 'tren', spanish: 'El tren', german: 'Der Zug', example: '', exampleDe: '', category: 'travel', categoryName: 'Reisen' },
  // Politik (Level 15 - weit entfernt)
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
    const target = mockWords[4] // sol (weather, Level 6)

    // Mehrere Durchläufe wegen Zufallskomponente
    let lluviaCount = 0
    let similarLevelTotal = 0

    for (let i = 0; i < 20; i++) {
      const result = getSmartDistractors(target, mockWords, 3)
      expect(result.length).toBe(3)

      if (result.some(w => w.id === 'lluvia')) lluviaCount++

      // Rest sollte aus ähnlichen Levels kommen (Level 4-8)
      const similarLevelWords = result.filter(w => {
        const diff = categoryDifficulty[w.category] || 8
        return Math.abs(diff - 6) <= 2
      })
      similarLevelTotal += similarLevelWords.length
    }

    // lluvia sollte oft dabei sein (gleiche Kategorie + hoher Score)
    expect(lluviaCount).toBeGreaterThanOrEqual(10)
    // Im Durchschnitt sollten mindestens 2 aus ähnlichem Level sein
    expect(similarLevelTotal / 20).toBeGreaterThanOrEqual(2)
  })

  it('sollte weit entfernte Kategorien vermeiden wenn möglich', () => {
    const target = mockWords[0] // perro (animals, Level 6)

    // Mehrere Durchläufe für statistische Sicherheit
    let politicsCount = 0
    let greetingsCount = 0

    for (let i = 0; i < 20; i++) {
      const result = getSmartDistractors(target, mockWords, 3)
      politicsCount += result.filter(w => w.category === 'politics').length
      greetingsCount += result.filter(w => w.category === 'greetings').length
    }

    // Politik (Level 15) und Greetings (Level 1) sind weit von Level 6 entfernt
    // Sollten selten oder nie gewählt werden wenn genug nähere Alternativen existieren
    const animalsAndNearbyCount = mockWords.filter(w => {
      if (w.id === target.id) return false
      const diff = categoryDifficulty[w.category] || 8
      return Math.abs(diff - 6) <= 2
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
