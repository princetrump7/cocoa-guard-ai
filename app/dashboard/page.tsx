'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ScanLine } from 'lucide-react'
import DashboardCharts from '@/components/DashboardCharts'
import WeatherRiskCard from '@/components/WeatherRiskCard'
import { ensureAnonSession } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { CLASS_META } from '@/lib/advice'
import type { Scan } from '@/lib/types'

export default function DashboardPage() {
  const [scans, setScans] = useState<Scan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      await ensureAnonSession()
      const { data, error } = await supabase()
        .from('scans')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200)
      if (!cancelled) {
        if (!error) setScans((data ?? []) as Scan[])
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-extrabold text-slate-900">Your farm dashboard</h1>
      <p className="mt-2 text-slate-600">Your scan history, disease spread and local weather risk.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <WeatherRiskCard />
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800">Total scans</h3>
          <p className="mt-1 text-3xl font-extrabold text-slate-900">{loading ? '…' : scans.length}</p>
          <p className="mt-1 text-sm text-slate-500">
            {loading ? 'Loading…' : `${scans.filter((s) => s.predicted_class !== 'healthy').length} affected`}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <DashboardCharts scans={scans} />
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-lg font-bold text-slate-900">Recent scans</h2>
        {loading ? (
          <p className="text-slate-400">Loading…</p>
        ) : scans.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-slate-500">No scans yet.</p>
            <Link
              href="/scan"
              className="mt-3 inline-flex items-center gap-1.5 font-semibold text-emerald-700 hover:underline"
            >
              <ScanLine className="h-4 w-4" /> Scan your first crop <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {scans.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/result/${s.id}`}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-emerald-300"
                >
                  <span className="flex items-center gap-2 font-medium text-slate-700">
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{ backgroundColor: CLASS_META[s.predicted_class].color }}
                    />
                    {CLASS_META[s.predicted_class].label}
                  </span>
                  <span className="text-sm text-slate-400">
                    {new Date(s.created_at).toLocaleString()} · {Math.round(s.confidence * 100)}%
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
