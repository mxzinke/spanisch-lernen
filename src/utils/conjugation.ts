import type {
  VerbWord,
  VerbEnding,
  ConjugationForms,
  Person,
  Tense,
  WordWithCategory,
} from '../types'

// Regelmäßige Endungen für Presente
const presenteEndings: Record<VerbEnding, ConjugationForms> = {
  ar: {
    yo: 'o',
    tú: 'as',
    'él/ella': 'a',
    nosotros: 'amos',
    vosotros: 'áis',
    ellos: 'an',
  },
  er: {
    yo: 'o',
    tú: 'es',
    'él/ella': 'e',
    nosotros: 'emos',
    vosotros: 'éis',
    ellos: 'en',
  },
  ir: {
    yo: 'o',
    tú: 'es',
    'él/ella': 'e',
    nosotros: 'imos',
    vosotros: 'ís',
    ellos: 'en',
  },
}

// Regelmäßige Endungen für Pretérito Indefinido
const indefinidoEndings: Record<VerbEnding, ConjugationForms> = {
  ar: {
    yo: 'é',
    tú: 'aste',
    'él/ella': 'ó',
    nosotros: 'amos',
    vosotros: 'asteis',
    ellos: 'aron',
  },
  er: {
    yo: 'í',
    tú: 'iste',
    'él/ella': 'ió',
    nosotros: 'imos',
    vosotros: 'isteis',
    ellos: 'ieron',
  },
  ir: {
    yo: 'í',
    tú: 'iste',
    'él/ella': 'ió',
    nosotros: 'imos',
    vosotros: 'isteis',
    ellos: 'ieron',
  },
}

// Regelmäßige Endungen für Pretérito Imperfecto
const imperfectoEndings: Record<VerbEnding, ConjugationForms> = {
  ar: {
    yo: 'aba',
    tú: 'abas',
    'él/ella': 'aba',
    nosotros: 'ábamos',
    vosotros: 'abais',
    ellos: 'aban',
  },
  er: {
    yo: 'ía',
    tú: 'ías',
    'él/ella': 'ía',
    nosotros: 'íamos',
    vosotros: 'íais',
    ellos: 'ían',
  },
  ir: {
    yo: 'ía',
    tú: 'ías',
    'él/ella': 'ía',
    nosotros: 'íamos',
    vosotros: 'íais',
    ellos: 'ían',
  },
}

// Futuro verwendet Infinitiv + Endungen (für alle Verbtypen gleich)
const futuroEndings: ConjugationForms = {
  yo: 'é',
  tú: 'ás',
  'él/ella': 'á',
  nosotros: 'emos',
  vosotros: 'éis',
  ellos: 'án',
}

// Alle Personen in der richtigen Reihenfolge
export const allPersons: Person[] = [
  'yo',
  'tú',
  'él/ella',
  'nosotros',
  'vosotros',
  'ellos',
]

// Deutsche Übersetzungen für Personen
export const personLabels: Record<Person, string> = {
  yo: 'ich',
  tú: 'du',
  'él/ella': 'er/sie',
  nosotros: 'wir',
  vosotros: 'ihr',
  ellos: 'sie (Plural)',
}

// Personen mit männlich/weiblich Varianten
export const personWithGender: Record<Person, string> = {
  yo: 'yo',
  tú: 'tú',
  'él/ella': 'él / ella / usted',
  nosotros: 'nosotros/-as',
  vosotros: 'vosotros/-as',
  ellos: 'ellos / ellas / ustedes',
}

// Zeiten auf Deutsch
export const tenseLabels: Record<Tense, string> = {
  presente: 'Presente (Gegenwart)',
  indefinido: 'Pretérito Indefinido (Vergangenheit)',
  imperfecto: 'Pretérito Imperfecto (Gewohnheit/Beschreibung)',
  futuro: 'Futuro Simple (Zukunft)',
}

// Extrahiere den Stamm eines Verbs
export function getVerbStem(infinitive: string, ending: VerbEnding): string {
  return infinitive.slice(0, -ending.length)
}

// Wende Stammvokaländerung an (nur für bestimmte Personen)
function applyStemChange(
  stem: string,
  change: VerbWord['stemChange'],
  person: Person
): string {
  // Stammvokaländerung gilt nicht für nosotros und vosotros
  if (person === 'nosotros' || person === 'vosotros' || !change) {
    return stem
  }

  const [from, to] = change.split('>') as [string, string]

  // Finde den letzten Vokal im Stamm und ändere ihn
  const vowelPattern = new RegExp(`${from}(?=[^aeiou]*$)`, 'i')
  return stem.replace(vowelPattern, to)
}

// Konjugiere ein Verb für eine bestimmte Zeitform
export function conjugateVerb(
  verb: VerbWord | WordWithCategory,
  tense: Tense
): ConjugationForms {
  const infinitive = verb.spanish.toLowerCase()
  const ending = verb.verbEnding as VerbEnding
  const stem = getVerbStem(infinitive, ending)
  const irregularForms = verb.irregularForms?.[tense]

  const result: ConjugationForms = {
    yo: '',
    tú: '',
    'él/ella': '',
    nosotros: '',
    vosotros: '',
    ellos: '',
  }

  for (const person of allPersons) {
    // Prüfe ob es eine irreguläre Form gibt
    if (irregularForms?.[person]) {
      result[person] = irregularForms[person]!
      continue
    }

    // Berechne regelmäßige Form
    let conjugatedStem = stem

    // Wende Stammvokaländerung an (nur für Presente)
    if (tense === 'presente' && verb.stemChange) {
      conjugatedStem = applyStemChange(stem, verb.stemChange, person)
    }

    // Wähle die richtige Endung
    let endingToUse: string
    switch (tense) {
      case 'presente':
        endingToUse = presenteEndings[ending][person]
        break
      case 'indefinido':
        endingToUse = indefinidoEndings[ending][person]
        break
      case 'imperfecto':
        endingToUse = imperfectoEndings[ending][person]
        break
      case 'futuro':
        // Futuro: Infinitiv + Endung
        result[person] = infinitive + futuroEndings[person]
        continue
    }

    result[person] = conjugatedStem + endingToUse
  }

  return result
}

// Konjugiere alle Zeitformen für ein Verb
export function conjugateAllTenses(
  verb: VerbWord | WordWithCategory
): Record<Tense, ConjugationForms> {
  return {
    presente: conjugateVerb(verb, 'presente'),
    indefinido: conjugateVerb(verb, 'indefinido'),
    imperfecto: conjugateVerb(verb, 'imperfecto'),
    futuro: conjugateVerb(verb, 'futuro'),
  }
}

// Generiere Erklärungstext für die Konjugation
export function getConjugationExplanation(
  verb: VerbWord | WordWithCategory,
  tense: Tense = 'presente'
): string {
  const infinitive = verb.spanish
  const ending = verb.verbEnding as VerbEnding
  const stem = getVerbStem(infinitive.toLowerCase(), ending)

  if (!verb.isRegular) {
    if (verb.stemChange) {
      const changeExplanation: Record<NonNullable<VerbWord['stemChange']>, string> = {
        'e>ie': 'e wird zu ie',
        'o>ue': 'o wird zu ue',
        'e>i': 'e wird zu i',
        'u>ue': 'u wird zu ue',
      }
      return `${infinitive} ist ein Verb mit Stammvokaländerung (${changeExplanation[verb.stemChange]}). Der Stammvokal ändert sich bei yo, tú, él/ella und ellos, aber NICHT bei nosotros und vosotros.`
    }
    return `${infinitive} ist ein unregelmäßiges Verb. Die Formen müssen einzeln gelernt werden.`
  }

  const endingExplanation: Record<VerbEnding, Record<Tense, string>> = {
    ar: {
      presente: `-o, -as, -a, -amos, -áis, -an`,
      indefinido: `-é, -aste, -ó, -amos, -asteis, -aron`,
      imperfecto: `-aba, -abas, -aba, -ábamos, -abais, -aban`,
      futuro: `Infinitiv + -é, -ás, -á, -emos, -éis, -án`,
    },
    er: {
      presente: `-o, -es, -e, -emos, -éis, -en`,
      indefinido: `-í, -iste, -ió, -imos, -isteis, -ieron`,
      imperfecto: `-ía, -ías, -ía, -íamos, -íais, -ían`,
      futuro: `Infinitiv + -é, -ás, -á, -emos, -éis, -án`,
    },
    ir: {
      presente: `-o, -es, -e, -imos, -ís, -en`,
      indefinido: `-í, -iste, -ió, -imos, -isteis, -ieron`,
      imperfecto: `-ía, -ías, -ía, -íamos, -íais, -ían`,
      futuro: `Infinitiv + -é, -ás, -á, -emos, -éis, -án`,
    },
  }

  return `${infinitive} ist ein regelmäßiges -${ending.toUpperCase()} Verb.\n\nRegel: Stamm „${stem}-" + Endungen:\n${endingExplanation[ending][tense]}`
}

// Prüfe ob eine Antwort korrekt ist (mit Toleranz für Akzente)
export function checkConjugationAnswer(
  userAnswer: string,
  correctAnswer: string
): 'correct' | 'almost' | 'wrong' {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')

  const normalizedUser = normalize(userAnswer)
  const normalizedCorrect = normalize(correctAnswer)

  if (normalizedUser === normalizedCorrect) {
    // Prüfe ob Akzente korrekt sind
    if (userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase()) {
      return 'correct'
    }
    return 'almost' // Richtig aber Akzente fehlen
  }

  return 'wrong'
}

// Wähle zufällig 2 Personen zum Abfragen (ohne vosotros)
export function selectRandomPersons(count: number = 2): Person[] {
  const availablePersons: Person[] = ['yo', 'tú', 'él/ella', 'nosotros', 'ellos']
  const shuffled = [...availablePersons].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}
