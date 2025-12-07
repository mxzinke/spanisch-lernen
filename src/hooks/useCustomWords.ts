import { useState, useEffect, useCallback } from 'preact/hooks'
import type { CustomWord, CustomWordWithCategory } from '../types'
import {
  getCustomWords,
  saveCustomWords,
  addCustomWord as dbAddCustomWord,
  updateCustomWord as dbUpdateCustomWord,
  deleteCustomWord as dbDeleteCustomWord,
} from '../lib/db'

export const CUSTOM_CATEGORY_NAME = 'Meine Vokabeln'

export function useCustomWords() {
  const [customWords, setCustomWords] = useState<CustomWord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load custom words from IndexedDB on mount
  useEffect(() => {
    getCustomWords().then((loaded) => {
      setCustomWords(loaded)
      setIsLoading(false)
    })
  }, [])

  // Save custom words to IndexedDB whenever they change
  useEffect(() => {
    if (!isLoading) {
      saveCustomWords(customWords)
    }
  }, [customWords, isLoading])

  const addCustomWord = useCallback(
    async (word: Omit<CustomWord, 'id' | 'createdAt'>) => {
      const newWord: CustomWord = {
        ...word,
        id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        createdAt: new Date().toISOString(),
      }
      setCustomWords((prev) => [...prev, newWord])
      return newWord
    },
    []
  )

  const updateCustomWord = useCallback(async (word: CustomWord) => {
    setCustomWords((prev) => prev.map((w) => (w.id === word.id ? word : w)))
  }, [])

  const deleteCustomWord = useCallback(async (id: string) => {
    setCustomWords((prev) => prev.filter((w) => w.id !== id))
  }, [])

  // Convert custom words to WordWithCategory format for integration
  const customWordsWithCategory: CustomWordWithCategory[] = customWords.map((word) => ({
    ...word,
    category: 'custom' as const,
    categoryName: CUSTOM_CATEGORY_NAME,
  }))

  // Check if a custom word with the same spanish text already exists
  const hasCustomWord = useCallback(
    (spanish: string): boolean => {
      const normalizedSpanish = spanish.toLowerCase().trim()
      return customWords.some((w) => w.spanish.toLowerCase().trim() === normalizedSpanish)
    },
    [customWords]
  )

  return {
    customWords,
    customWordsWithCategory,
    isLoading,
    addCustomWord,
    updateCustomWord,
    deleteCustomWord,
    hasCustomWord,
  }
}
