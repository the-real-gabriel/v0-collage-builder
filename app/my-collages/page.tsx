"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useCollageData } from "@/hooks/use-collage-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft, Edit, Grid, Plus, Trash } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Collage } from "@/types/database"

export default function MyCollagesPage() {
  const [collages, setCollages] = useState<Collage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { getUserCollages, deleteCollage } = useCollageData()
  const router = useRouter()

  useEffect(() => {
    const fetchCollages = async () => {
      try {
        const userCollages = await getUserCollages()
        setCollages(userCollages)
      } catch (err: any) {
        setError(err.message || "Failed to load collages")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCollages()
  }, [getUserCollages])

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this collage? This action cannot be undone.")) {
      try {
        const success = await deleteCollage(id)
        if (success) {
          setCollages((prev) => prev.filter((collage) => collage.id !== id))
        }
      } catch (err: any) {
        setError(err.message || "Failed to delete collage")
      }
    }
  }

  const handleEdit = (id: string) => {
    router.push(`/edit/${id}`)
  }

  const handleNewCollage = () => {
    router.push("/")
  }

  const handleBack = () => {
    router.push("/")
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button variant="ghost" onClick={handleBack} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">My Collages</h1>
          </div>
          <Button onClick={handleNewCollage}>
            <Plus className="h-4 w-4 mr-2" />
            New Collage
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-lg">Loading your collages...</p>
          </div>
        ) : collages.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Grid className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No collages yet</h2>
            <p className="text-gray-500 mb-6">Create your first collage to see it here</p>
            <Button onClick={handleNewCollage}>
              <Plus className="h-4 w-4 mr-2" />
              Create Collage
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collages.map((collage) => (
              <Card key={collage.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="truncate">{collage.name}</CardTitle>
                  <CardDescription>
                    {collage.is_public ? "Public" : "Private"} • Updated {formatDate(collage.updated_at)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="h-40 bg-gray-100 rounded-md flex items-center justify-center">
                    <div
                      className="w-full h-full bg-contain bg-center bg-no-repeat"
                      style={{
                        backgroundImage: `url(/placeholder.svg?height=160&width=320&query=collage)`,
                      }}
                    />
                  </div>
                  {collage.description && (
                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">{collage.description}</p>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm" onClick={() => handleDelete(collage.id)}>
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                  <Button size="sm" onClick={() => handleEdit(collage.id)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
