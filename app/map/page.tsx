'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'
import type { CommunityScan } from '@/lib/types'
import type { PostgrestError } from '@supabase/supabase-js'

// react-leaflet is not SSR-safe — load the map only on the client.
const MapView = dynamic(() => import('@/components/MapView'), { ssr: false })

export default function MapPage() {
  const [scans, setScans] = useState<CommunityScan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    supabase()
      .from('community_scans')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500)
      .then(({ data, error }: { data: CommunityScan[] | null; error: PostgrestError | null }) => {
        setLoading(false)
        if (error) {
          setError(true)
          return
        }
        setScans((data ?? []) as CommunityScan[])
      })
  }, [])

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-extrabold text-slate-900">Community disease map</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Anonymous, live disease sightings from farmers across Ghana — a real-time picture extension
        agents can act on.
      </p>
      <p className="mt-1 text-sm text-slate-400">{scans.length} public markers</p>

      <div className="mt-6">
        {loading && (
          <div className="flex h-[70vh] items-center justify-center rounded-2xl border border-slate-200 text-slate-500">
            Loading markers…
          </div>
        )}
        {error && (
          <div className="flex h-[70vh] items-center justify-center rounded-2xl border border-slate-200 text-slate-500">
            Could not load the map. Check your connection.
          </div>
        )}
        {!loading && !error && <MapView scans={scans} />}
      </div>
    </main>
  )
}
