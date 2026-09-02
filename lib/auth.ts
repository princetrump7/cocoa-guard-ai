'use client'

import { supabase } from '@/lib/supabase'

/** Zero-friction anonymous sign-in. Returns true when a session is active. */
export async function ensureAnonSession(): Promise<boolean> {
  try {
    const sb = supabase()
    const { data } = await sb.auth.getSession()
    if (data.session) return true
    const { error } = await sb.auth.signInAnonymously()
    return !error
  } catch {
    return false
  }
}
