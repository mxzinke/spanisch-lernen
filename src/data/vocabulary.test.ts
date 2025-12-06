import { describe, it, expect } from 'vitest'
import { getSmartDistractors, categoryDifficulty } from './vocabulary'
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
    const result = getSmartDistractors(target, mockWords, 3)

    // Bei 4 Tieren (minus 1 Ziel) sollten mindestens 2-3 aus "animals" sein
    const sameCategoryCount = result.filter(w => w.category === 'animals').length
    expect(sameCategoryCount).toBeGreaterThanOrEqual(2)
  })

  it('sollte bei wenig Kategorie-Wörtern auf ähnliche Schwierigkeit zurückfallen', () => {
    // Wetter hat nur 2 Wörter
    const target = mockWords[4] // sol (weather, Level 6)
    const result = getSmartDistractors(target, mockWords, 3)

    expect(result.length).toBe(3)
    // Sollte lluvia (gleiche Kategorie) enthalten
    expect(result.some(w => w.id === 'lluvia')).toBe(true)

    // Rest sollte aus ähnlichen Levels kommen (Level 4-8)
    // animals (6), travel (7), weather (6), health (8), etc.
    const similarLevelWords = result.filter(w => {
      const diff = categoryDifficulty[w.category] || 8
      return Math.abs(diff - 6) <= 2
    })
    expect(similarLevelWords.length).toBeGreaterThanOrEqual(2)
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
})
