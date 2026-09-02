'use client'

import { Brain, ScanSearch } from 'lucide-react'
import { CLASS_META } from '@/lib/advice'
import type { ClassificationResult } from '@/lib/types'
import ConfidenceBar from '@/components/ConfidenceBar'

interface Props {
  result: ClassificationResult
}

export default function ResultCard({ result }: Props) {
  const meta = CLASS_META[result.predictedClass]

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-4">
        <h2 className="text-lg font-bold text-slate-800">
          {meta.emoji} {meta.label}
        </h2>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            result.source === 'llm_fallback'
              ? 'bg-violet-100 text-violet-700'
              : 'bg-sky-100 text-sky-700'
          }`}
        >
          {result.source === 'llm_fallback' ? <Brain className="h-3.5 w-3.5" /> : <ScanSearch className="h-3.5 w-3.5" />}
          {result.source === 'llm_fallback' ? 'Expert vision AI' : 'On-device model'}
        </span>
      </div>

      <div className="space-y-4 p-4">
        <ConfidenceBar confidence={result.confidence} />

        {result.source === 'llm_fallback' && (
          <p className="rounded-lg bg-violet-50 p-3 text-sm text-violet-800">
            The on-device model was unsure, so an expert vision AI confirmed this reading
            {result.reasoning ? `: "${result.reasoning}"` : '.'}
          </p>
        )}

        {result.confidence < 0.55 && result.source === 'trained_model' && (
          <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            Low confidence reading. Check the symptoms below against your plant and consult your
            extension officer if unsure.
          </p>
        )}
      </div>
    </div>
  )
}
