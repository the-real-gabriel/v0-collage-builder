"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useCollageData } from "@/hooks/use-collage-data"
import GridEditor from "@/grid-editor"
import { AlertCircle } from "lucide-react"
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
    const fetchCollage = async () => {
      try {
        const collageData = await loadCollage(collageId)
        if (collageData) {
          setCollage(collageData)
        } else {
          setError("Collage not found")
        }
      } catch (err: any) {
        setError(err.message || "Failed to load collage")
      } finally {
        setIsLoading(false)
      }
    }

    if (collageId) {
      fetchCollage()
    }
  }, [collageId, loadCollage])

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
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
            Back to My Collages
          </button>
        </div>
      </ProtectedRoute>
    )
  }

  return <ProtectedRoute>{collage ? <GridEditor initialCollage={collage} /> : null}</ProtectedRoute>
}
