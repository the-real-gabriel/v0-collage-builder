import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function RootPage() {
  const supabase = getSupabaseServerClient()
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) {
    console.error("Error getting session:", error)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Error loading application. Please try again later.</p>
      </div>
    )
  }

  if (session) {
    redirect("/dashboard")
  } else {
    redirect("/login")
  }

  // Fallback, should ideally not be reached if redirects work.
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Loading...</p>
    </div>
  )
}
