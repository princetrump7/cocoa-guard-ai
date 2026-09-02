import type { DiseaseClass } from '@/lib/types'

// MUST match the Colab folder order (flow_from_directory sorts folder names)
export const CLASS_LABELS: DiseaseClass[] = ['anthracnose', 'black_pod', 'cssvd', 'healthy']

export const MODEL_URL = '/models/model.json'
export const CONFIDENCE_THRESHOLD = 0.55
export const IMG_MODEL_SIZE = 224
export const IMG_UPLOAD_MAX = 1024
