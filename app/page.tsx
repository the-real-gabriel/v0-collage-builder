"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Grid } from "lucide-react"
import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function MarketingSplashPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClientComponentClient()
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Auth error:", error)
          setError("Failed to check authentication status")
        } else {
          setIsAuthenticated(!!data.session)
        }
      } catch (err) {
        console.error("Unexpected error:", err)
        setError("An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center flex-col gap-4">
        <p className="text-red-500">Error: {error}</p>
        <Button asChild>
          <Link href="/login">Go to Login</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="w-full border-b bg-background p-4">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Grid className="h-6 w-6" />
            <span className="font-bold text-lg">Collage Builder</span>
          </div>
          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
              <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content - Simplified */}
      <main className="flex-1 p-4">
        <section className="container mx-auto py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Create Beautiful Photo Collages</h1>
          <p className="max-w-2xl mx-auto mb-8">
            Design stunning photo arrangements with our intuitive drag-and-drop collage builder.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Button asChild size="lg">
                <Link href="/dashboard">Open Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg">
                  <Link href="/signup">Get Started Free</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </section>
      </main>

      {/* Footer - Simplified */}
      <footer className="border-t p-4">
        <div className="container mx-auto text-center">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Collage Builder</p>
        </div>
      </footer>
    </div>
  )
}
