'use client'

import { AlertTriangle, CheckCircle2, ListChecks, ShieldAlert } from 'lucide-react'
import { ADVICE, getRiskLabel } from '@/lib/advice'
import type { DiseaseClass } from '@/lib/types'

const riskStyles: Record<string, string> = {
  low: 'bg-emerald-100 text-emerald-700',
  moderate: 'bg-amber-100 text-amber-700',
  high: 'bg-orange-100 text-orange-700',
  extreme: 'bg-red-100 text-red-700',
}

export default function AdvicePanel({ diseaseClass }: { diseaseClass: DiseaseClass }) {
  const advice = ADVICE[diseaseClass]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${riskStyles[advice.risk_level]}`}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          Risk: {getRiskLabel(advice.risk_level)}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
          <ShieldAlert className="h-3.5 w-3.5" />
          Isolation: {getRiskLabel(advice.isolation_required)}
        </span>
      </div>

      <p className="text-sm leading-relaxed text-slate-700">{advice.description}</p>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-800">
          <ListChecks className="h-5 w-5 text-emerald-600" />
          Do this now
        </h3>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">
          {advice.immediate_actions.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ol>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-800">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          Prevent it coming back
        </h3>
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
          {advice.prevention_tips.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
