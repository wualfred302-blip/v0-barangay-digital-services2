import { createClient as createSupabaseClient } from "@supabase/supabase-js"

let clientInstance: ReturnType<typeof createSupabaseClient> | null = null

export function createClient() {
  if (!clientInstance) {
    clientInstance = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        db: {
          schema: "public",
        },
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      },
    )
  }
  return clientInstance
}

export function resetSupabaseClient() {
  clientInstance = null
}
