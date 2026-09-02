import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Permissive session refresh for an anonymous demo — no redirect guard.
 * The scan flow self-signs-in anonymously on the client.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  // Degrade gracefully before Supabase is configured (placeholder env in .env.local).
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon || url.includes('<') || anon.includes('<')) return response

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  await supabase.auth.getUser() // refresh token/session
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|models|sw.js|api).*)'],
}
