import { SignupForm } from "@/components/auth/signup-form"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function SignupPage() {
  const supabase = getSupabaseServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect("/dashboard")
  }
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <SignupForm />
    </div>
  )
}
