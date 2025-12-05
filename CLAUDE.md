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

### Design-Philosophie
Warme und ruhige Farben für eine entspannte Lernumgebung. Die Farbpalette soll Konzentration fördern und nicht ablenken.

### Empfohlene Farbpalette

| Name | Hex | Verwendung |
|------|-----|------------|
| Sand | `#f5f0e8` | Hintergrund |
| Warm Cream | `#faf6f0` | Karten, Container |
| Terracotta | `#c77b58` | Primär-Akzent, Buttons |
| Soft Clay | `#d4a574` | Sekundär-Akzent |
| Olive | `#8b9a6d` | Erfolg, positive Aktionen |
| Dusty Rose | `#c9a9a6` | Fehler (sanft) |
| Warm Gray | `#6b635b` | Text |
| Deep Brown | `#4a4039` | Überschriften |

### Akzentfarben (sparsam verwenden)
- Gedämpftes Gold: `#d4a84b` (Highlights, Streak-Anzeige)
- Weiches Weinrot: `#a65d57` (wichtige Hinweise)

## Playwright MCP - Visuelles Testing

Der Playwright MCP kann verwendet werden, um die Webseite visuell zu inspizieren und iterativ zu verbessern.

### Verwendung
```
URL: http://localhost:5173/
```

### Workflow
1. `bun run dev` starten (Dev-Server läuft auf Port 5173)
2. Mit `mcp__playwright__browser_navigate` zur URL navigieren
3. Mit `mcp__playwright__browser_snapshot` den aktuellen Zustand erfassen
4. Interaktiv testen: Buttons klicken, Navigation prüfen, Formulare ausfüllen
5. Screenshots mit `mcp__playwright__browser_take_screenshot` für Dokumentation

### Typische Anwendungsfälle
- UI-Änderungen visuell verifizieren
- Responsiveness prüfen (mit `browser_resize`)
- Interaktive Flows durchspielen (Übungen, Navigation)
- Visuelle Regressionen erkennen
