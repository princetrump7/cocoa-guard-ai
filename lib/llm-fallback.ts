import type { DiseaseClass } from '@/lib/types'

export interface LLMResult {
  class: DiseaseClass
  confidence: number
  reasoning: string
}

/** Calls the server-only OpenRouter vision route. Throws on failure. */
export async function classifyWithLLM(imageDataUrl: string): Promise<LLMResult> {
  const res = await fetch('/api/classify-llm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageDataUrl }),
  })
  if (!res.ok) throw new Error('LLM fallback failed')
  const data = await res.json()
  return {
    class: data.class as DiseaseClass,
    confidence: Number(data.confidence),
    reasoning: data.reasoning ?? '',
  }
}
