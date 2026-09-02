import * as tf from '@tensorflow/tfjs'
import { CLASS_LABELS, IMG_MODEL_SIZE, MODEL_URL } from '@/lib/model'
import type { RawScore } from '@/lib/types'

let model: tf.GraphModel | null = null
let loading: Promise<tf.GraphModel> | null = null

/** Load once, warm up the WebGL backend + shaders so the first real scan is fast. */
export function getModel(): Promise<tf.GraphModel> {
  if (model) return Promise.resolve(model)
  if (!loading) {
    loading = (async () => {
      try {
        await tf.setBackend('webgl')
      } catch {
        await tf.setBackend('cpu')
      }
      await tf.ready()
      const m = await tf.loadGraphModel(MODEL_URL)
      const dummy = tf.zeros([1, IMG_MODEL_SIZE, IMG_MODEL_SIZE, 3])
      m.predict(dummy)
      tf.dispose(dummy)
      model = m
      return m
    })().catch((err) => {
      loading = null // allow retry on failure
      throw err
    })
  }
  return loading
}

export function isModelReady(): boolean {
  return model !== null
}

/**
 * The exported model bakes preprocessing into the graph
 * (Rescaling(1/127.5, offset=-1) as the first layer), so the browser only
 * needs fromPixels -> resize -> predict on raw [0,255] input.
 */
export async function classify(
  source: ImageBitmap | HTMLImageElement | HTMLCanvasElement,
): Promise<RawScore[]> {
  const m = await getModel()
  const out = tf.tidy(() => {
    const t = tf.browser.fromPixels(source, 3) // [H,W,3] int32 in [0,255]
    const r = tf.image.resizeBilinear(t, [IMG_MODEL_SIZE, IMG_MODEL_SIZE])
    return m.predict(r.expandDims(0)) as tf.Tensor // [1, 4]
  })
  const values = Array.from(await out.data()) as number[]
  tf.dispose(out)
  return values
    .map((score, index) => ({ index, label: CLASS_LABELS[index], score }))
    // A 1000-class placeholder MobileNet has no cocoa classes at indices >= 4;
    // ignore them so the pipeline runs until the real 4-class model lands.
    .filter((r) => r.label !== undefined)
    .sort((a, b) => b.score - a.score)
}
