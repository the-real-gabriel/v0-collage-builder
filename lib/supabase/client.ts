import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/lib/database.types" // Assuming you generate types from your schema

// Define a function to create a Supabase client for client-side operations
// This ensures a singleton instance is used.
let client: ReturnType<typeof createBrowserClient<Database>> | undefined

export function getSupabaseBrowserClient() {
  if (client) {
    return client
  }

  client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  return client
}
