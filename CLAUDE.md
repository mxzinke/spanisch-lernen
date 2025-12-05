# Spanisch Lernen - Projektübersicht

Eine einfache Web-App zum täglichen Spanisch-Üben mit Fokus auf Alltagsvokabular.

## Tech-Stack

- **Preact** - UI-Komponenten
- **Vite** - Build-Tool & Dev-Server
- **TailwindCSS** - Styling
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
├── main.jsx           # Entry Point
├── app.jsx            # Haupt-App mit Navigation
├── components/
│   ├── Navigation.jsx      # Tab-Navigation (Dashboard, Üben, Vokabeln)
│   ├── Dashboard.jsx       # Statistiken, Streak, Fortschritt
│   ├── Practice.jsx        # Übungsauswahl & -ablauf
│   ├── Flashcard.jsx       # Karteikarten-Übung
│   ├── MultipleChoice.jsx  # Multiple-Choice-Übung
│   ├── WriteExercise.jsx   # Schreib-Übung
│   └── VocabList.jsx       # Vokabel-Übersicht mit Suche
├── hooks/
│   ├── useProgress.js      # Lernfortschritt (LocalStorage)
│   └── useSpeech.js        # Text-to-Speech
├── data/
│   └── vocabulary.js       # Vokabel-Import & Hilfsfunktionen
└── styles/
    └── index.css           # Tailwind + Custom Styles

data/vocabulary/           # Vokabel-JSON-Dateien
├── greetings.json
├── basics.json
├── numbers.json
├── food.json
└── market.json
```

## Lernmethodik

- **Leitner-System**: Spaced Repetition mit 5 Boxen
  - Box 1: täglich wiederholen
  - Box 2: alle 2 Tage
  - Box 3: alle 4 Tage
  - Box 4: alle 8 Tage
  - Box 5: alle 16 Tage
- Richtige Antwort → höhere Box, falsche → zurück zu Box 1

## Datenformate

### Vokabel (JSON)
```json
{
  "id": "hola",
  "spanish": "Hola",
  "german": "Hallo",
  "example": "¡Hola! ¿Cómo estás?",
  "exampleDe": "Hallo! Wie geht es dir?"
}
```

### Fortschritt (LocalStorage: "spanisch-lernen-progress")
```json
{
  "words": {
    "hola": { "box": 3, "lastSeen": "2025-12-05", "correct": 5, "wrong": 1 }
  },
  "stats": {
    "streak": 7,
    "lastPractice": "2025-12-05",
    "totalCorrect": 150,
    "totalWrong": 30
  }
}
```

## Vokabeln erweitern

Neue JSON-Datei in `data/vocabulary/` anlegen und in `src/data/vocabulary.js` importieren:

```javascript
import newCategory from '../../data/vocabulary/new-category.json'

export const categories = [
  // ... bestehende
  newCategory,
]
```

## Farben

- Spanisch-Rot: `#c60b1e` (spanish-red)
- Spanisch-Gelb: `#ffc400` (spanish-yellow)
