import type { ClassificationResult } from '@/lib/types'

const QUEUE_KEY = 'cocoa-guard-offline-scans'

export interface QueuedScan {
  id: string
  modelDataUrl: string
  uploadDataUrl: string
  result: ClassificationResult
  lat: number | null
  lng: number | null
  created_at: string
}

export function enqueueScan(scan: QueuedScan): void {
  const q = readQueue()
  q.push(scan)
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q))
  } catch {
    // quota exceeded — drop oldest
    q.shift()
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q))
  }
}

export function readQueue(): QueuedScan[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    return raw ? (JSON.parse(raw) as QueuedScan[]) : []
  } catch {
    return []
  }
}

export function clearQueue(): void {
  localStorage.removeItem(QUEUE_KEY)
}

/** Returns queued scans removed from the queue (caller re-persists them). */
export function drainQueue(): QueuedScan[] {
  const q = readQueue()
  clearQueue()
  return q
}
