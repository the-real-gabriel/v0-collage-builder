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
    console.log(`EditCollagePage: useEffect triggered for collageId: ${collageId}. Mounted: ${isMounted}`)

    const fetchCollage = async () => {
      if (!collageId) {
        console.log("EditCollagePage: No collage ID provided.")
        if (isMounted) {
          setError("No collage ID provided")
          setIsLoading(false)
        }
        return
      }

      console.log(`EditCollagePage: Starting fetchCollage for ID: ${collageId}`)
      try {
        if (isMounted) {
          setIsLoading(true)
          setError(null)
        }
        console.log(`EditCollagePage: Calling loadCollage for ID: ${collageId}`)
        const collageData = await loadCollage(collageId)
        console.log(`EditCollagePage: loadCollage returned for ID: ${collageId}`, collageData)

        if (!isMounted) {
          console.log(`EditCollagePage: Component unmounted after loadCollage for ID: ${collageId}`)
          return
        }

        if (collageData) {
          console.log(`EditCollagePage: Collage data found for ID: ${collageId}`)
          setCollage(collageData)
        } else {
          console.log(`EditCollagePage: Collage data NOT found for ID: ${collageId}. Setting error.`)
          // Error might be set by loadCollage hook, or we set a generic one here
          setError((prevError) => prevError || "Collage not found or you don't have permission to view it.")
        }
      } catch (err: any) {
        if (!isMounted) {
          console.log(`EditCollagePage: Component unmounted during catch for ID: ${collageId}`)
          return
        }
        console.error(`EditCollagePage: Error in fetchCollage for ID: ${collageId}`, err)
        setError(err.message || "Failed to load collage")
      } finally {
        if (isMounted) {
          console.log(`EditCollagePage: fetchCollage finally block for ID: ${collageId}. Setting isLoading to false.`)
          setIsLoading(false)
        } else {
          console.log(
            `EditCollagePage: Component unmounted, skipping final setIsLoading in fetchCollage for ID: ${collageId}`,
          )
        }
      }
    }

    fetchCollage()

    return () => {
      console.log(`EditCollagePage: useEffect cleanup for collageId: ${collageId}. Setting isMounted to false.`)
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
