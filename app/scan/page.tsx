'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import CameraCapture from '@/components/CameraCapture'
import ImagePreview from '@/components/ImagePreview'
import ModelStatusBadge from '@/components/ModelStatusBadge'
import { ensureAnonSession } from '@/lib/auth'
import { classify } from '@/lib/classifier'
import { CONFIDENCE_THRESHOLD } from '@/lib/model'
import { classifyWithLLM } from '@/lib/llm-fallback'
import { createImageVersions, dataUrlToBlob } from '@/lib/image'
import { supabase } from '@/lib/supabase'
import { enqueueScan } from '@/lib/offline-queue'
import type { ClassificationResult } from '@/lib/types'

type Phase = 'idle' | 'classifying' | 'saving' | 'error'

/** Load a data URL into an HTMLImageElement for tf.browser.fromPixels. */
function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not load image for model'))
    img.src = dataUrl
  })
}

function getPosition(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) return resolve(null)
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => resolve(null),
      { timeout: 5000, maximumAge: 300000 },
    )
  })
}

export default function ScanPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('idle')
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const busyRef = useRef(false)

  useEffect(() => {
    ensureAnonSession()
  }, [])

  const handleFile = async (file: File) => {
    if (busyRef.current) return
    busyRef.current = true
    setError(null)
    setPhase('classifying')
    try {
      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)

      const { modelDataUrl, uploadDataUrl } = await createImageVersions(file)

      // ---- Classify ----
      let result: ClassificationResult
      try {
        const img = await loadImage(modelDataUrl)
        const scores = await classify(img)
        const top = scores[0]
        if (top && top.score >= CONFIDENCE_THRESHOLD) {
          result = {
            predictedClass: top.label,
            confidence: top.score,
            source: 'trained_model',
          }
        } else {
          // Low confidence — ask the expert vision model. If it is unavailable or
          // unconfigured, still give the farmer the model's best guess; ResultCard
          // flags it as a low-confidence reading so the demo never breaks.
          const llm = await classifyWithLLM(uploadDataUrl).catch(() => null)
          result = llm
            ? {
                predictedClass: llm.class,
                confidence: llm.confidence,
                source: 'llm_fallback',
                reasoning: llm.reasoning,
              }
            : {
                predictedClass: top?.label ?? 'healthy',
                confidence: top?.score ?? 0,
                source: 'trained_model',
              }
        }
      } catch {
        // Model path failed — go straight to the LLM so the demo never breaks.
        const llm = await classifyWithLLM(uploadDataUrl).catch(() => null)
        if (!llm) throw new Error('Neither the on-device model nor the expert review is available')
        result = {
          predictedClass: llm.class,
          confidence: llm.confidence,
          source: 'llm_fallback',
          reasoning: llm.reasoning,
        }
      }

      // ---- Persist ----
      setPhase('saving')
      const scanId =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`

      // Snapshot first so /result renders even if offline / save fails.
      sessionStorage.setItem(
        `scan-snapshot-${scanId}`,
        JSON.stringify({ ...result, imageUrl: uploadDataUrl }),
      )

      const sb = supabase()
      const {
        data: { session },
      } = await sb.auth.getSession()
      const uid = session?.user?.id
      const [geo, up] = await Promise.allSettled([
        getPosition(),
        uid
          ? sb.storage
              .from('scan-images')
              .upload(`${uid}/${scanId}.jpg`, new File([dataUrlToBlob(uploadDataUrl)], `${scanId}.jpg`, { type: 'image/jpeg' }))
          : Promise.resolve(null),
      ])

      const pos = geo.status === 'fulfilled' ? geo.value : null
      const image_url =
        up.status === 'fulfilled' && up.value?.data?.path
          ? sb.storage.from('scan-images').getPublicUrl(up.value.data.path).data.publicUrl
          : null

      if (uid) {
        const { error: insertErr } = await sb.from('scans').insert({
          id: scanId,
          user_id: uid,
          image_url,
          predicted_class: result.predictedClass,
          confidence: Number(result.confidence.toFixed(3)),
          source: result.source,
          lat: pos?.lat ?? null,
          lng: pos?.lng ?? null,
          is_public: true,
        })
        if (insertErr && !navigator.onLine) {
          enqueueScan({
            id: scanId,
            modelDataUrl,
            uploadDataUrl,
            result,
            lat: pos?.lat ?? null,
            lng: pos?.lng ?? null,
            created_at: new Date().toISOString(),
          })
        }
      }

      router.push(`/result/${scanId}`)
    } catch (e) {
      console.error(e)
      setPhase('error')
      setError('Something went wrong. Please try a clearer photo of the leaf or pod.')
    } finally {
      busyRef.current = false
    }
  }

  const busy = phase === 'classifying' || phase === 'saving'

  return (
    <main className="mx-auto min-h-screen max-w-xl px-4 py-10">
      <h1 className="text-center text-3xl font-extrabold text-slate-900">Scan your cocoa</h1>
      <p className="mt-2 text-center text-slate-600">
        Photograph a leaf or pod — ideally close up and in good light.
      </p>

      <div className="mt-4 flex justify-center">
        <ModelStatusBadge />
      </div>

      <div className="mt-8">
        {preview && phase !== 'idle' ? (
          <ImagePreview src={preview} className="h-72 w-full" />
        ) : (
          <div className="flex h-72 w-full items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400">
            <span className="text-sm">No photo yet</span>
          </div>
        )}
      </div>

      {busy && (
        <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-emerald-50 p-4 text-emerald-700">
          <Loader2 className="h-5 w-5 animate-spin" />
          {phase === 'classifying' ? 'Analyzing symptoms…' : 'Saving your scan…'}
        </div>
      )}

      {phase === 'error' && error && (
        <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {phase === 'idle' || phase === 'error' ? (
        <div className="mt-6">
          <CameraCapture onFile={handleFile} disabled={busy} />
        </div>
      ) : null}
    </main>
  )
}
