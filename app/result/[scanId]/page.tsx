'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, MapPin } from 'lucide-react'
import ImagePreview from '@/components/ImagePreview'
import ResultCard from '@/components/ResultCard'
import AdvicePanel from '@/components/AdvicePanel'
import VoiceAdvice from '@/components/VoiceAdvice'
import { supabase } from '@/lib/supabase'
import type { ClassificationResult, Scan } from '@/lib/types'
import type { PostgrestError } from '@supabase/supabase-js'

interface Snapshot extends ClassificationResult {
  imageUrl: string
}

export default function ResultPage() {
  const { scanId } = useParams<{ scanId: string }>()
  const [scan, setScan] = useState<Scan | null>(null)
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!scanId) return
    const raw = sessionStorage.getItem(`scan-snapshot-${scanId}`)
    if (raw) {
      try {
        setSnapshot(JSON.parse(raw) as Snapshot)
      } catch {
        /* ignore malformed snapshot */
      }
    }

    supabase()
      .from('scans')
      .select('*')
      .eq('id', scanId)
      .maybeSingle()
      .then(({ data, error }: { data: Scan | null; error: PostgrestError | null }) => {
        if (error) {
          setNotFound(true)
          return
        }
        if (data) setScan(data as Scan)
        else if (!raw) setNotFound(true)
      })
  }, [scanId])

  const result: ClassificationResult | null = scan
    ? {
        predictedClass: scan.predicted_class,
        confidence: scan.confidence,
        source: scan.source,
      }
    : snapshot

  const imageSrc = scan?.image_url ?? snapshot?.imageUrl ?? null

  if (!result && !notFound) {
    return (
      <main className="flex min-h-screen items-center justify-center text-slate-500">
        Loading result…
      </main>
    )
  }

  if (!result) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Scan not found</h1>
        <p className="mt-2 text-slate-600">
          We could not load this result. It may have been created offline.
        </p>
        <Link href="/scan" className="mt-6 inline-block font-semibold text-emerald-700 hover:underline">
          Scan a new crop
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto min-h-screen max-w-xl px-4 py-8">
      <Link
        href="/scan"
        className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-700"
      >
        <ArrowLeft className="h-4 w-4" /> New scan
      </Link>

      {imageSrc && <ImagePreview src={imageSrc} className="mb-6 h-64 w-full" />}

      <div className="space-y-4">
        <ResultCard result={result} />

        <div>
          <h2 className="mb-2 text-lg font-bold text-slate-900">What to do next</h2>
          <AdvicePanel diseaseClass={result.predictedClass} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-slate-700">Listen to the advice</p>
          <VoiceAdvice diseaseClass={result.predictedClass} />
        </div>

        <Link
          href="/map"
          className="flex items-center justify-center gap-2 rounded-xl border border-emerald-600/30 bg-white px-6 py-3.5 font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
        >
          <MapPin className="h-5 w-5" />
          See this area on the community map
        </Link>
      </div>
    </main>
  )
}
