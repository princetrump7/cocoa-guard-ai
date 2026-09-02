'use client'

import { useEffect } from 'react'

/** Registers the hand-rolled service worker (offline model + advice cache). */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    if (process.env.NODE_ENV !== 'production' && !location.hostname.includes('localhost')) return
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // SW registration failure must never break the app.
    })
  }, [])
  return null
}
