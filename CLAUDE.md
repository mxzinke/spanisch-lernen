# Spanisch Lernen - Projektübersicht

Eine einfache Web-App zum täglichen Spanisch-Üben mit Fokus auf Alltagsvokabular.

## Tech-Stack

- **Preact** + **TypeScript** - UI-Komponenten mit Typsicherheit
- **Vite** - Build-Tool & Dev-Server
- **TailwindCSS** - Styling
- **Bun** - JavaScript Runtime & Package Manager
- **Web Speech API** - Text-to-Speech für spanische Aussprache

## Befehle

```bash
bun run dev      # Entwicklungsserver starten
bun run build    # Produktions-Build erstellen
bun run preview  # Build lokal testen
```

## Projektstruktur

```
src/
├── main.tsx           # Entry Point
├── app.tsx            # Haupt-App mit Navigation
├── types.ts           # TypeScript Type-Definitionen
├── components/
│   ├── Navigation.tsx     # Tab-Navigation (Dashboard, Üben, Vokabeln, Settings)
│   ├── Dashboard.tsx      # Statistiken, Streak, Fortschritt
│   ├── Practice.tsx       # Übungsauswahl & -ablauf
│   ├── Flashcard.tsx      # Karteikarten-Übung
│   ├── MultipleChoice.tsx # Multiple-Choice-Übung
│   ├── WriteExercise.tsx  # Schreib-Übung
│   ├── VocabList.tsx      # Vokabel-Übersicht mit Suche
│   └── Settings.tsx       # TTS-Einstellungen, Daten-Reset
├── hooks/
│   ├── useProgress.ts     # Lernfortschritt (LocalStorage)
│   └── useSpeech.ts       # Text-to-Speech mit Stimmenauswahl
├── data/
│   └── vocabulary.ts      # Vokabel-Import & Hilfsfunktionen
└── styles/
    └── index.css          # Tailwind + Custom Styles

data/vocabulary/           # Vokabel-JSON-Dateien
├── greetings.json
├── basics.json
├── numbers.json
├── food.json
└── market.json
```

## Typen (src/types.ts)

```typescript
interface Word {
  id: string
  spanish: string
  german: string
  example: string
  exampleDe: string
}

interface WordProgress {
  box: number      // Leitner-Box (1-5)
  lastSeen: string // ISO Datum
  correct: number
  wrong: number
}
```

## Lernmethodik

- **Leitner-System**: Spaced Repetition mit 5 Boxen
  - Box 1: täglich wiederholen
  - Box 2: alle 2 Tage
  - Box 3: alle 4 Tage
  - Box 4: alle 8 Tage
  - Box 5: alle 16 Tage
- Richtige Antwort → höhere Box, falsche → zurück zu Box 1

## TTS (Text-to-Speech)

Der `useSpeech` Hook wählt automatisch die beste spanische Stimme:
- Priorisiert: Monica (macOS), Paulina, Google español, Microsoft Helena
- Einstellungen (Stimme, Geschwindigkeit) werden in LocalStorage gespeichert
- Settings-Tab erlaubt manuelle Auswahl

## Vokabeln erweitern

Neue JSON-Datei in `data/vocabulary/` anlegen und in `src/data/vocabulary.ts` importieren:

```typescript
import newCategory from '../../data/vocabulary/new-category.json'

export const categories: Category[] = [
  // ... bestehende
  newCategory,
]
```

## Farben

- Spanisch-Rot: `#c60b1e` (spanish-red)
- Spanisch-Gelb: `#ffc400` (spanish-yellow)
