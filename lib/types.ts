export type DiseaseClass = 'healthy' | 'black_pod' | 'cssvd' | 'anthracnose'

export type ScanSource = 'trained_model' | 'llm_fallback'

export interface RawScore {
  index: number
  label: DiseaseClass
  score: number
}

export interface ClassificationResult {
  predictedClass: DiseaseClass
  confidence: number
  source: ScanSource
  reasoning?: string
}

export interface Scan {
  id: string
  user_id: string
  image_url: string | null
  predicted_class: DiseaseClass
  confidence: number
  source: ScanSource
  lat: number | null
  lng: number | null
  is_public: boolean
  created_at: string
}

/** Sanitized public shape exposed by the community_scans view. */
export interface CommunityScan {
  id: string
  predicted_class: DiseaseClass
  confidence: number
  source: ScanSource
  lat: number
  lng: number
  created_at: string
}

export interface Risk {
  score: number
  level: 'low' | 'moderate' | 'high' | 'extreme'
  summary: string
}
