/**
 * Downscales an image File to a JPEG data URL no larger than maxDim px.
 * Uses <img>.decode() (which renders EXIF-oriented in modern browsers),
 * then canvas -> toDataURL('image/jpeg', 0.85).
 */
export function fileToDownscaledJpeg(file: File, maxDim: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = async () => {
      try {
        const { width, height } = scaleToFit(img.width, img.height, maxDim)
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('Canvas 2D context unavailable')
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      } catch (e) {
        reject(e)
      } finally {
        URL.revokeObjectURL(url)
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read image file'))
    }
    img.src = url
  })
}

function scaleToFit(w: number, h: number, maxDim: number): { width: number; height: number } {
  if (w <= maxDim && h <= maxDim) return { width: w, height: h }
  const scale = maxDim / Math.max(w, h)
  return { width: Math.round(w * scale), height: Math.round(h * scale) }
}

/** Produce both image versions used by the scan flow in one pass over a File. */
export interface ImageVersions {
  /** ≤512px, model input. */
  modelDataUrl: string
  /** ≤1024px, upload + LLM fallback. */
  uploadDataUrl: string
}

export async function createImageVersions(file: File): Promise<ImageVersions> {
  const [modelDataUrl, uploadDataUrl] = await Promise.all([
    fileToDownscaledJpeg(file, 512),
    fileToDownscaledJpeg(file, 1024),
  ])
  return { modelDataUrl, uploadDataUrl }
}

/** dataURL (e.g. "data:image/jpeg;base64,...") -> Blob for storage upload. */
export function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, b64] = dataUrl.split(',')
  const mime = /data:([^;]+);/.exec(meta)?.[1] ?? 'image/jpeg'
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}
