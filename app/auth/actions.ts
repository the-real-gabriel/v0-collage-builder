"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

const emailSchema = z.string().email({ message: "Invalid email address." })
const passwordSchema = z.string().min(6, { message: "Password must be at least 6 characters." })

const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "Password is required." }),
})

export async function signUpWithEmail(prevState: any, formData: FormData) {
  const supabase = getSupabaseServerClient()
  const result = signupSchema.safeParse(Object.fromEntries(formData))

  if (!result.success) {
    return { message: "Invalid form data.", errors: result.error.flatten().fieldErrors }
  }

  const { email, password } = result.data

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`, // Use NEXT_PUBLIC_APP_URL
    },
  })

  if (error) {
    console.error("Sign up error:", error)
    return { message: `Sign up failed: ${error.message}`, errors: null }
  }

  // Supabase sends a confirmation email by default.
  // Revalidate and redirect or show a message to check email.
  revalidatePath("/", "layout")
  // For now, redirect to login, assuming auto-confirmation or testing.
  // In production, you'd show a "check your email" message.
  return { message: "Sign up successful! Please check your email to confirm.", success: true }
  // redirect("/login"); // Or redirect after confirmation
}

export async function signInWithEmail(prevState: any, formData: FormData) {
  const supabase = getSupabaseServerClient()
  const result = loginSchema.safeParse(Object.fromEntries(formData))

  if (!result.success) {
    return { message: "Invalid form data.", errors: result.error.flatten().fieldErrors }
  }

  const { email, password } = result.data

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("Sign in error:", error)
    return { message: `Sign in failed: ${error.message}`, errors: null }
  }

  revalidatePath("/", "layout")
  redirect("/dashboard")
}

export async function signOut() {
  const supabase = getSupabaseServerClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error("Sign out error:", error)
    // Handle error appropriately, maybe show a toast
    return { message: "Sign out failed." }
  }
  revalidatePath("/", "layout")
  redirect("/login")
}
