import { describe, it, expect } from 'vitest'
import { levenshtein, normalize, checkAnswer } from './answerCheck'

describe('levenshtein', () => {
  it('should return 0 for identical strings', () => {
    expect(levenshtein('hola', 'hola')).toBe(0)
  })

  it('should return string length for empty comparison', () => {
    expect(levenshtein('hola', '')).toBe(4)
    expect(levenshtein('', 'hola')).toBe(4)
  })

  it('should return correct distance for single character difference', () => {
    expect(levenshtein('hola', 'holo')).toBe(1)
    expect(levenshtein('casa', 'cosa')).toBe(1)
  })

  it('should return correct distance for insertions', () => {
    expect(levenshtein('hola', 'holas')).toBe(1)
    expect(levenshtein('casa', 'casas')).toBe(1)
  })

  it('should return correct distance for deletions', () => {
    expect(levenshtein('holas', 'hola')).toBe(1)
  })

  it('should handle completely different strings', () => {
    expect(levenshtein('abc', 'xyz')).toBe(3)
  })
})

describe('normalize', () => {
  it('should convert to lowercase', () => {
    expect(normalize('HOLA')).toBe('hola')
    expect(normalize('Me Llamo')).toBe('me llamo')
  })

  it('should trim whitespace', () => {
    expect(normalize('  hola  ')).toBe('hola')
    expect(normalize('\thola\n')).toBe('hola')
  })

  it('should remove accents', () => {
    expect(normalize('adiós')).toBe('adios')
    expect(normalize('mañana')).toBe('manana')
    expect(normalize('España')).toBe('espana')
    expect(normalize('niño')).toBe('nino')
  })

  it('should remove leading ¿ and ¡', () => {
    expect(normalize('¿Cómo estás?')).toBe('como estas')
    expect(normalize('¡Hola!')).toBe('hola')
    expect(normalize('¿¿Qué??')).toBe('que')
  })

  it('should remove trailing ? and !', () => {
    expect(normalize('hola!')).toBe('hola')
    expect(normalize('qué?')).toBe('que')
    expect(normalize('hola!!')).toBe('hola')
  })

  it('should remove ellipsis (...)', () => {
    expect(normalize('Me llamo...')).toBe('me llamo')
    expect(normalize('Ich heiße...')).toBe('ich heisse')
  })

  it('should remove unicode ellipsis (…)', () => {
    expect(normalize('Me llamo…')).toBe('me llamo')
    expect(normalize('Ich heiße…')).toBe('ich heisse')
  })

  it('should remove multiple dots', () => {
    expect(normalize('hola..')).toBe('hola')
    expect(normalize('hola....')).toBe('hola')
  })

  it('should normalize multiple spaces to single space', () => {
    expect(normalize('me  llamo')).toBe('me llamo')
    expect(normalize('buenos   días')).toBe('buenos dias')
  })

  it('should handle combined normalizations', () => {
    expect(normalize('  ¿Cómo estás?  ')).toBe('como estas')
    expect(normalize('¡Me llamo María!')).toBe('me llamo maria')
    expect(normalize('Me llamo...')).toBe('me llamo')
  })
})

describe('checkAnswer', () => {
  describe('correct answers', () => {
    it('should return correct for exact match', () => {
      expect(checkAnswer('hola', 'hola')).toBe('correct')
    })

    it('should return correct ignoring case', () => {
      expect(checkAnswer('HOLA', 'hola')).toBe('correct')
      expect(checkAnswer('Hola', 'hola')).toBe('correct')
    })

    it('should return correct ignoring accents', () => {
      expect(checkAnswer('adios', 'adiós')).toBe('correct')
      expect(checkAnswer('manana', 'mañana')).toBe('correct')
    })

    it('should return correct ignoring punctuation', () => {
      expect(checkAnswer('Hola', '¡Hola!')).toBe('correct')
      expect(checkAnswer('Como estas', '¿Cómo estás?')).toBe('correct')
    })

    it('should return correct ignoring ellipsis', () => {
      expect(checkAnswer('Me llamo', 'Me llamo...')).toBe('correct')
      expect(checkAnswer('Me llamo', 'Me llamo…')).toBe('correct')
    })

    it('should return correct ignoring extra whitespace', () => {
      expect(checkAnswer('me  llamo', 'me llamo')).toBe('correct')
      expect(checkAnswer('  hola  ', 'hola')).toBe('correct')
    })
  })

  describe('close answers', () => {
    it('should return close for small typos', () => {
      expect(checkAnswer('holla', 'hola')).toBe('close')
      expect(checkAnswer('gracias', 'gracais')).toBe('close')
    })

    it('should return close for one missing character', () => {
      expect(checkAnswer('hol', 'hola')).toBe('close')
    })

    it('should return close for one extra character', () => {
      expect(checkAnswer('holaa', 'hola')).toBe('close')
    })

    it('should allow up to 20% error for longer words', () => {
      // "buenos dias" = 11 chars, 20% = 2.2, floor = 2, max(2, 2) = 2
      expect(checkAnswer('buenas dias', 'buenos dias')).toBe('close')
    })
  })

  describe('wrong answers', () => {
    it('should return wrong for completely different answers', () => {
      expect(checkAnswer('hola', 'adiós')).toBe('wrong')
      expect(checkAnswer('buenos días', 'buenas noches')).toBe('wrong')
    })

    it('should return wrong for too many errors', () => {
      expect(checkAnswer('xyz', 'hola')).toBe('wrong')
    })

    it('should return wrong for empty input vs word', () => {
      expect(checkAnswer('', 'hola')).toBe('wrong')
    })
  })

  describe('real-world examples', () => {
    it('should handle "Ich heiße..." example correctly', () => {
      expect(checkAnswer('Me llamo', 'Me llamo...')).toBe('correct')
      expect(checkAnswer('me llamo', 'Me llamo...')).toBe('correct')
      expect(checkAnswer('Me llamo', 'Me llamo…')).toBe('correct')
    })

    it('should handle greetings', () => {
      expect(checkAnswer('Buenos dias', '¡Buenos días!')).toBe('correct')
      expect(checkAnswer('como estas', '¿Cómo estás?')).toBe('correct')
    })

    it('should handle common vocabulary', () => {
      expect(checkAnswer('gracias', 'Gracias')).toBe('correct')
      expect(checkAnswer('por favor', 'Por favor')).toBe('correct')
      expect(checkAnswer('de nada', 'De nada')).toBe('correct')
    })
  })
})
