'use client'

import { useEffect, useState } from 'react'
import { CloudRain } from 'lucide-react'
import { DEFAULT_GHANA_COORD, getBlackPodRisk } from '@/lib/weather'
import type { Risk } from '@/lib/types'

const barColors: Record<Risk['level'], string> = {
  low: 'bg-emerald-500',
  moderate: 'bg-amber-500',
  high: 'bg-orange-500',
  extreme: 'bg-red-500',
}

export default function WeatherRiskCard() {
  const [risk, setRisk] = useState<Risk | null>(null)
  const [error, setError] = useState(false)
  const [coord, setCoord] = useState(DEFAULT_GHANA_COORD)

  useEffect(() => {
    let cancelled = false
    const load = (lat: number, lng: number) => {
      getBlackPodRisk(lat, lng)
        .then((r) => {
          if (!cancelled) setRisk(r)
        })
        .catch(() => {
          if (!cancelled) setError(true)
        })
    }

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const c = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          setCoord(c)
          load(c.lat, c.lng)
        },
        () => load(DEFAULT_GHANA_COORD.lat, DEFAULT_GHANA_COORD.lng),
        { timeout: 5000 },
      )
    } else {
      load(DEFAULT_GHANA_COORD.lat, DEFAULT_GHANA_COORD.lng)
    }

    return () => {
      cancelled = true
    }
  }, [])

  if (error) return null

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <CloudRain className="h-5 w-5 text-sky-600" />
        <h3 className="font-semibold text-slate-800">Black-pod weather risk</h3>
      </div>

      {risk ? (
        <>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-800">{risk.score}/100</span>
            <span className="text-xs text-slate-400">
              {coord.lat.toFixed(2)}, {coord.lng.toFixed(2)}
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${barColors[risk.level]}`}
              style={{ width: `${Math.max(risk.score, 4)}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-slate-600">{risk.summary}</p>
          <p className="mt-1 text-xs text-slate-400">
            Based on last 3 days of rain &amp; humidity plus tomorrow&apos;s forecast. Risk peaks in
            the rainy season (May–July, Sep–Oct).
          </p>
        </>
      ) : (
        <p className="text-sm text-slate-400">Fetching weather forecast…</p>
      )}
    </div>
  )
}
