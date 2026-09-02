import type { DiseaseClass } from '@/lib/types'

export interface Advice {
  title: string
  description: string
  immediate_actions: string[]
  prevention_tips: string[]
  isolation_required: 'none' | 'moderate' | 'high' | 'extreme'
  risk_level: 'low' | 'moderate' | 'high' | 'extreme'
  twi_summary: string
}

export const ADVICE: Record<DiseaseClass, Advice> = {
  healthy: {
    title: 'Healthy',
    description:
      'No disease symptoms detected on this leaf/pod. Continue routine farm care and keep scouting, especially during the rainy season.',
    immediate_actions: [
      'No treatment needed.',
      'Keep scouting every 1–2 weeks for early signs of black pod, anthracnose or swollen shoot.',
    ],
    prevention_tips: [
      'Maintain 40–50% shade to balance yield and disease pressure.',
      'Prune regularly and remove chupons to keep the canopy aerated.',
      'Harvest ripe pods every 1–2 weeks and remove empty husks from the farm.',
      "Follow your district extension officer's fertilizer and mulching advice.",
      'Keep the farm free of weeds and mistletoe.',
    ],
    isolation_required: 'none',
    risk_level: 'low',
    twi_summary: 'Wo cocoa dua yɛ papa. Kɔ so hwɛ no yie, na hwɛ no da biara.',
  },

  black_pod: {
    title: 'Black Pod',
    description:
      'Fungal rot caused by Phytophthora (mainly P. megakarya in West Africa). The most destructive cocoa disease in Ghana — brown/black lesions spread fast on pods and, in wet weather, produce white spore masses. Losses can reach 30–90% if untreated.',
    immediate_actions: [
      'Harvest and remove ALL infected pods immediately — pick them at first sign of a brown lesion.',
      'Bury infected pods at least 50 cm deep away from the farm, or burn them. NEVER leave them in the field or heap.',
      'Wash hands and tools after touching diseased pods before handling healthy ones.',
      'If lesions are spreading fast, apply a copper-based fungicide (e.g. copper hydroxide) per label and COCOBOD extension advice.',
    ],
    prevention_tips: [
      "Harvest at the right time every 1–2 weeks so overripe pods don't rot in the canopy.",
      'Inspect the farm weekly during the wet season (May–July and Sep–Oct).',
      'Prune to open the canopy — good air flow and sunlight dry the pods faster.',
      'Keep shade at recommended levels; too much shade raises humidity.',
      'Apply preventative copper sprays at the start of the rains and repeat as advised.',
    ],
    isolation_required: 'high',
    risk_level: 'high',
    twi_summary: 'Black pod yareɛ ma podo no reporɔ. Yi podo a ɔyare no nyinaa, na sie no kɔ akyiri wɔ afuo no mu.',
  },

  cssvd: {
    title: 'Cocoa Swollen Shoot Virus (CSSVD)',
    description:
      'A virus spread by mealybugs. There is NO cure. Symptoms include red vein-banding and mottling on young leaves, swelling of shoots and roots, dieback, and tree death within a few years. It is a notifiable disease.',
    immediate_actions: [
      'Do NOT attempt treatment — there is none.',
      'Mark the tree and report it to your COCOBOD / Cocoa Health and Extension Division (CHED) officer immediately.',
      'Infected trees and close contacts must be cut down and removed (roughing) — this is the only control.',
      'Do not replant cocoa in the same spot immediately.',
      'Control mealybugs: check for ants that protect them and manage the ant–mealybug relationship as advised.',
    ],
    prevention_tips: [
      'Use only certified, virus-free planting material from approved nurseries.',
      'Plant tolerant/resistant varieties recommended for your area.',
      'Remove infected trees as soon as they are confirmed to slow spread.',
      'Keep the farm weed-free and control ant species that farm mealybugs.',
    ],
    isolation_required: 'extreme',
    risk_level: 'extreme',
    twi_summary: 'CSSVD yɛ ntontom yareɛ a ɛnni aduro. Kɔ kɔka wo COCOBOD adwumayɛfoɔ ho na wɔnyae dua no.',
  },

  anthracnose: {
    title: 'Anthracnose',
    description:
      "A fungal disease (Colletotrichum spp.) affecting leaves, pods and young shoots. Look for dark, sunken 'target' lesions on pods, brown/black leaf spots, tip dieback of chupons, and pink/orange spore masses in humid weather.",
    immediate_actions: [
      'Prune and remove infected chupons, shoots and pods.',
      'Destroy removed material (bury or burn) away from the farm.',
      'Avoid wounding pods during harvest — wounds are entry points.',
      'Improve air flow around the affected trees.',
    ],
    prevention_tips: [
      'Manage shade so the canopy is not too dense.',
      'Prune regularly for ventilation.',
      'Apply copper fungicide during wet periods per extension advice.',
      'Keep trees healthy with balanced nutrition to reduce stress.',
      'Remove mummified pods at harvest.',
    ],
    isolation_required: 'moderate',
    risk_level: 'moderate',
    twi_summary: 'Anthracnose yareɛ sisi nhaban ne podo so. Twitwa nhaban a ɔyare no, na sie no.',
  },
}

export const CLASS_META: Record<
  DiseaseClass,
  { label: string; color: string; emoji: string }
> = {
  healthy: { label: 'Healthy', color: '#22c55e', emoji: '🟢' },
  black_pod: { label: 'Black Pod', color: '#6b21a8', emoji: '🟣' },
  cssvd: { label: 'Swollen Shoot (CSSVD)', color: '#ef4444', emoji: '🔴' },
  anthracnose: { label: 'Anthracnose', color: '#f59e0b', emoji: '🟠' },
}

export function getRiskLabel(level: Advice['risk_level'] | Advice['isolation_required']): string {
  return level.charAt(0).toUpperCase() + level.slice(1)
}
