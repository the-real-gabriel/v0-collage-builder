"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface UseAutosaveProps {
  onSave: () => Promise<boolean | void>
  interval?: number
  enabled?: boolean
  minInterval?: number
}

export function useAutosave({
  onSave,
  interval = 30000, // 30 seconds default
  enabled = true,
  minInterval = 5000, // Minimum time between saves to prevent rapid saving
}: UseAutosaveProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const lastSaveAttemptRef = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Clear the timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // The save function that will be exposed
  const save = useCallback(async () => {
    if (isSaving) return false

    const now = Date.now()
    const timeSinceLastSave = now - lastSaveAttemptRef.current

    // Prevent rapid saving
    if (timeSinceLastSave < minInterval) {
      console.log(`Skipping save attempt - too soon (${timeSinceLastSave}ms since last attempt)`)
      return false
    }

    lastSaveAttemptRef.current = now
    setIsSaving(true)

    try {
      const result = await onSave()
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
      return result
    } catch (error) {
      console.error("Error saving:", error)
      return false
    } finally {
      setIsSaving(false)
    }
  }, [isSaving, onSave, minInterval])

  // Set up the autosave interval
  useEffect(() => {
    if (!enabled) return

    // Set up the autosave interval
    const setupAutosave = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(async () => {
        if (hasUnsavedChanges) {
          try {
            await save()
          } finally {
            // Restart the timer regardless of success or failure
            setupAutosave()
          }
        } else {
          setupAutosave()
        }
      }, interval)
    }

    setupAutosave()

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [enabled, hasUnsavedChanges, interval, save])

  // Mark that we have unsaved changes whenever the save function changes
  useEffect(() => {
    setHasUnsavedChanges(true)
  }, [onSave])

  return { isSaving, lastSaved, save, hasUnsavedChanges, setHasUnsavedChanges }
}
