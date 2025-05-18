"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { getUserCollages, createCollage, deleteCollage } from "@/services/collage-service"
import type { Collage } from "@/types/database"
import { toast } from "@/components/ui/use-toast"

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [collages, setCollages] = useState<Collage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [collageToDelete, setCollageToDelete] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push("/sign-in")
      return
    }

    async function loadCollages() {
      try {
        setIsLoading(true)
        const data = await getUserCollages()
        setCollages(data)
      } catch (err) {
        console.error("Error loading collages:", err)
        toast({
          title: "Error",
          description: "Failed to load collages",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadCollages()
  }, [user, authLoading, router])

  const handleCreateCollage = async () => {
    try {
      const collage = await createCollage()
      router.push(`/collage-editor/${collage.id}`)
    } catch (err) {
      console.error("Error creating collage:", err)
      toast({
        title: "Error",
        description: "Failed to create collage",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCollage = async (id: string) => {
    setCollageToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!collageToDelete) return

    try {
      await deleteCollage(collageToDelete)
      setCollages(collages.filter((collage) => collage.id !== collageToDelete))
      toast({
        title: "Success",
        description: "Collage deleted",
      })
    } catch (err) {
      console.error("Error deleting collage:", err)
      toast({
        title: "Error",
        description: "Failed to delete collage",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setCollageToDelete(null)
    }
  }

  if (authLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Collages</h1>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">Loading...</div>
      ) : collages.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">No collages yet</h2>
          <p className="text-gray-500 mb-4">Create your first collage to get started</p>
          <button onClick={handleCreateCollage} className="px-4 py-2 bg-blue-500 text-white rounded">
            Create New Collage
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collages.map((collage) => (
            <div
              key={collage.id}
              className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="h-40 bg-gray-100 flex items-center justify-center">
                {/* Placeholder for collage preview */}
                <div className="text-gray-400">Preview not available</div>
              </div>
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-1">{collage.title}</h2>
                <p className="text-sm text-gray-500 mb-3">
                  Last edited: {new Date(collage.last_edited_at).toLocaleDateString()}
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => router.push(`/collage-editor/${collage.id}`)}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => router.push(`/collage/${collage.id}`)}
                    className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDeleteCollage(collage.id)}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Delete Collage</h2>
            <p className="mb-6">Are you sure you want to delete this collage? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteDialogOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded"
              >
                Cancel
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-500 text-white rounded">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
