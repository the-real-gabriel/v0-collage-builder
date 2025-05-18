"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"

interface SaveButtonProps {
  onSave: () => Promise<void>
  className?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
}

export function SaveButton({ onSave, className, variant = "outline", size = "sm" }: SaveButtonProps) {
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (isSaving) return

    setIsSaving(true)
    try {
      await onSave()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={`flex items-center gap-2 ${className || ""}`}
      onClick={handleSave}
      disabled={isSaving}
    >
      <Save className="h-3.5 w-3.5" />
      <span>{isSaving ? "Saving..." : "Save"}</span>
    </Button>
  )
}
