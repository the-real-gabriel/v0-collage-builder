"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { useCollageData } from "@/hooks/use-collage-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { AlertCircle, Save } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { CollageData } from "@/hooks/use-collage-data"

interface SaveCollageDialogProps {
  isOpen: boolean
  onClose: () => void
  collageData: CollageData
}

export function SaveCollageDialog({ isOpen, onClose, collageData }: SaveCollageDialogProps) {
  const [name, setName] = useState(collageData.name || "Untitled Collage")
  const [description, setDescription] = useState(collageData.description || "")
  const [isPublic, setIsPublic] = useState(collageData.isPublic || false)
  const [error, setError] = useState<string | null>(null)
  const { saveCollage, isLoading } = useCollageData()
  const router = useRouter()
  const { user } = useAuth()

  const handleSave = async () => {
    if (!user) {
      setError("You must be logged in to save a collage")
      return
    }

    if (!name.trim()) {
      setError("Please enter a name for your collage")
      return
    }

    setError(null)

    try {
      const updatedCollageData = {
        ...collageData,
        name,
        description,
        isPublic,
      }

      const collageId = await saveCollage(updatedCollageData)

      if (collageId) {
        onClose()
        if (!collageData.id) {
          // If it's a new collage (collageData.id was undefined before saving)
          router.push(`/edit/${collageId}`) // Navigate to the new edit page
        } else {
          // If it's an existing collage
          router.refresh() // Refresh the current page's data (e.g., /edit/[id] or /my-collages)
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to save collage")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Save Collage</DialogTitle>
          <DialogDescription>Save your collage to your account. You can edit it later.</DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome Collage"
              maxLength={50}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for your collage"
              rows={3}
              maxLength={200}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="public" checked={isPublic} onCheckedChange={setIsPublic} />
            <Label htmlFor="public">Make this collage public</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Saving..." : "Save Collage"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
