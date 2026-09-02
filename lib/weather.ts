import type { Risk } from '@/lib/types'

/**
 * Open-Meteo black-pod risk score (rain + humidity + tomorrow's forecast).
 * No API key required.
 */
export async function getBlackPodRisk(lat: number, lng: number): Promise<Risk> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
    `&past_days=3&forecast_days=3&daily=precipitation_sum,relative_humidity_2m_mean,temperature_2m_max&timezone=auto`

  const res = await fetch(url)
  if (!res.ok) throw new Error('Weather request failed')
  const d = await res.json()

  const rain3d = (d.daily.precipitation_sum.slice(0, 3) as number[]).reduce(
    (a: number, b: number) => a + (b ?? 0),
    0,
  )
  const hum =
    (d.daily.relative_humidity_2m_mean.slice(0, 3) as number[]).reduce(
      (a: number, b: number) => a + (b ?? 0),
      0,
    ) / 3
  const rainTomorrow = (d.daily.precipitation_sum[3] ?? 0) > 0

  let score = 0
  if (rain3d >= 5) score += 30
  if (rain3d >= 15) score += 20
  if (hum >= 75) score += 25
  if (hum >= 85) score += 15
  if (rainTomorrow) score += 10

  const level = score >= 70 ? 'extreme' : score >= 50 ? 'high' : score >= 25 ? 'moderate' : 'low'
  return { score, level, summary: `${level.toUpperCase()} black-pod risk in your area` }
}

/** Kumasi, Ghana — demo fallback when geolocation is denied. */
export const DEFAULT_GHANA_COORD = { lat: 6.7, lng: -1.63 }
