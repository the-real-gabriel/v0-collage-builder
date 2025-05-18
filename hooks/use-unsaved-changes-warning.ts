"use client"

import { useEffect } from "react"

export function useUnsavedChangesWarning(hasUnsavedChanges: boolean) {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        // Standard way of showing a confirmation dialog before page unload
        e.preventDefault()
        e.returnValue = "" // This is required for the confirmation dialog to show
        return "" // This is required for older browsers
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [hasUnsavedChanges])
}
