import type { Progress } from '../types'

const DB_NAME = 'spanisch-lernen'
const DB_VERSION = 1
const STORE_NAME = 'progress'
const PROGRESS_KEY = 'user-progress'

let dbInstance: IDBDatabase | null = null

export const defaultProgress: Progress = {
  words: {},
  stats: {
    streak: 0,
    lastPractice: null,
    totalCorrect: 0,
    totalWrong: 0,
  },
}

function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance)

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)

    request.onsuccess = () => {
      dbInstance = request.result
      resolve(request.result)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
  })
}

export async function getProgress(): Promise<Progress> {
  try {
    const db = await openDB()
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(PROGRESS_KEY)

      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result)
        } else {
          // Try to migrate from localStorage
          const migrated = migrateFromLocalStorage()
          if (migrated) {
            saveProgress(migrated).then(() => resolve(migrated))
          } else {
            resolve(defaultProgress)
          }
        }
      }

      request.onerror = () => {
        console.error('IndexedDB read error:', request.error)
        resolve(defaultProgress)
      }
    })
  } catch (error) {
    console.error('IndexedDB not available:', error)
    // Fallback to localStorage
    return getProgressFromLocalStorage()
  }
}

export async function saveProgress(progress: Progress): Promise<void> {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.put(progress, PROGRESS_KEY)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('IndexedDB save error, falling back to localStorage:', error)
    saveProgressToLocalStorage(progress)
  }
}

// localStorage fallback functions
const STORAGE_KEY = 'spanisch-lernen-progress'

function getProgressFromLocalStorage(): Progress {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : defaultProgress
  } catch {
    return defaultProgress
  }
}

function saveProgressToLocalStorage(progress: Progress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch (error) {
    console.error('localStorage save error:', error)
  }
}

function migrateFromLocalStorage(): Progress | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const progress = JSON.parse(saved)
      // Clear localStorage after successful migration
      localStorage.removeItem(STORAGE_KEY)
      console.log('Migrated progress from localStorage to IndexedDB')
      return progress
    }
  } catch (error) {
    console.error('Migration error:', error)
  }
  return null
}

// Export/Import functions
export function exportProgress(progress: Progress): void {
  const dataStr = JSON.stringify(progress, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const date = new Date().toISOString().split('T')[0]
  const filename = `spanisch-lernen-backup-${date}.json`

  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function importProgress(file: File): Promise<Progress> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        const progress = JSON.parse(content) as Progress

        // Validate structure
        if (!progress.words || !progress.stats) {
          throw new Error('Ungültiges Backup-Format')
        }

        resolve(progress)
      } catch (error) {
        reject(new Error('Konnte Backup nicht lesen. Ist die Datei korrekt?'))
      }
    }

    reader.onerror = () => reject(new Error('Fehler beim Lesen der Datei'))
    reader.readAsText(file)
  })
}
