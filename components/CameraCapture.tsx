'use client'

import { useRef } from 'react'
import { Camera, FolderOpen } from 'lucide-react'

interface Props {
  onFile: (file: File) => void
  disabled?: boolean
}

/**
 * Dual input: native back-camera (phones) + gallery (desktop demo fallback).
 * capture="environment" is unreliable on a few mobile browsers, hence both.
 */
export default function CameraCapture({ onFile, disabled }: Props) {
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFile(file)
    e.target.value = '' // allow re-selecting the same file
  }

  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row">
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />

      <button
        type="button"
        onClick={() => cameraRef.current?.click()}
        disabled={disabled}
        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-emerald-700 disabled:opacity-50"
      >
        <Camera className="h-6 w-6" />
        Take a photo
      </button>

      <button
        type="button"
        onClick={() => galleryRef.current?.click()}
        disabled={disabled}
        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-600/30 bg-white px-6 py-4 text-lg font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50 disabled:opacity-50"
      >
        <FolderOpen className="h-6 w-6" />
        Choose from gallery
      </button>
    </div>
  )
}
