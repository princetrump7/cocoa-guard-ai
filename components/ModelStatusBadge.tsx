'use client'

import { useEffect, useState } from 'react'
import { isModelReady } from '@/lib/classifier'

type Status = 'loading' | 'ready' | 'error'

/**
 * Polls the classifier singleton so the landing /scan pages can show
 * "Loading model… / Model ready" progress.
 */
export default function ModelStatusBadge() {
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    if (isModelReady()) {
      setStatus('ready')
      return
    }
    // Kick off the load so the badge is meaningful even before a scan.
    import('@/lib/classifier')
      .then(({ getModel }) => getModel())
      .then(() => setStatus('ready'))
      .catch(() => setStatus('error'))

    const t = window.setInterval(() => {
      if (isModelReady()) {
        setStatus('ready')
        window.clearInterval(t)
      }
    }, 500)
    return () => window.clearInterval(t)
  }, [])

  if (status === 'ready') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        Model ready
      </span>
    )
  }
  if (status === 'error') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
        <span className="h-2 w-2 rounded-full bg-red-500" />
        Model unavailable
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
      <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
      Loading model…
    </span>
  )
}
