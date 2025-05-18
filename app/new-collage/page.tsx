"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { createCollage } from "@/services/collage-service"
import { toast } from "@/components/ui/use-toast"

export default function NewCollagePage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push("/sign-in")
      return
    }

    async function createNewCollage() {
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
        router.push("/dashboard")
      }
    }

    createNewCollage()
  }, [user, authLoading, router])

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Creating your collage...</h1>
        <p className="text-gray-500">Please wait while we set up your new collage.</p>
      </div>
    </div>
  )
}
