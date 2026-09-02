'use client'

import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | null = null

/** Lazy singleton browser client — reuse across the app, never re-create. */
export function supabase() {
  if (client) return client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  if (!url || !anon) throw new Error('Missing Supabase env vars')
  client = createBrowserClient(url, anon)
  return client
}
