'use client'

interface Props {
  confidence: number // 0..1
}

export default function ConfidenceBar({ confidence }: Props) {
  const pct = Math.round(confidence * 100)
  const color = confidence >= 0.8 ? 'bg-emerald-500' : confidence >= 0.55 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-slate-500">Confidence</span>
        <span className="font-semibold text-slate-700">{pct}%</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${Math.max(pct, 4)}%` }}
        />
      </div>
    </div>
  )
}
