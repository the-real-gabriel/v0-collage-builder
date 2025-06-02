import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types" // Assuming you generate types from your schema

export function getSupabaseServerClient(cookieStore?: ReturnType<typeof cookies>) {
  const store = cookieStore || cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return store.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          store.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          store.delete({ name, ...options })
        },
      },
    },
  )
}

export function getSupabaseServerClientWithServiceRole() {
  // Use this client for operations that require bypassing RLS, e.g., admin tasks.
  // Ensure SUPABASE_SERVICE_ROLE_KEY is set in your environment variables.
  // For most user-specific operations, prefer getSupabaseServerClient() which respects RLS.
  const cookieStore = cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Ensure this env var is available
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.delete({ name, ...options })
        },
      },
    },
  )
}
