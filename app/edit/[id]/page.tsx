"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useCollageData } from "@/hooks/use-collage-data"
import GridEditor from "@/grid-editor"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { CollageData } from "@/hooks/use-collage-data"

export default function EditCollagePage() {
  const [collage, setCollage] = useState<CollageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { loadCollage } = useCollageData()
  const params = useParams()
  const router = useRouter()
  const collageId = params.id as string

  useEffect(() => {
    let isMounted = true

    const fetchCollage = async () => {
      if (!collageId) {
        setError("No collage ID provided")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const collageData = await loadCollage(collageId)

        if (!isMounted) return

        if (collageData) {
          setCollage(collageData)
        } else {
          setError("Collage not found or you don't have permission to view it")
        }
      } catch (err: any) {
        if (!isMounted) return
        console.error("Failed to load collage:", err)
        setError(err.message || "Failed to load collage")
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchCollage()

    return () => {
      isMounted = false
    }
  }, [collageId, loadCollage])

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <h2 className="text-2xl font-bold">Loading collage...</h2>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto py-8 px-4">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <button onClick={() => router.push("/my-collages")} className="text-blue-600 hover:underline">
            ← Back to My Collages
          </button>
        </div>
      </ProtectedRoute>
    )
  }

  if (!collage) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto py-8 px-4">
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Collage not found</AlertDescription>
          </Alert>
          <button onClick={() => router.push("/my-collages")} className="text-blue-600 hover:underline">
            ← Back to My Collages
          </button>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <GridEditor initialCollage={collage} />
    </ProtectedRoute>
  )
}
