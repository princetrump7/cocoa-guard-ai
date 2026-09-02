'use client'

import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { CLASS_META } from '@/lib/advice'
import type { Scan } from '@/lib/types'

interface Props {
  scans: Scan[]
}

export default function DashboardCharts({ scans }: Props) {
  const counts = (Object.keys(CLASS_META) as Array<keyof typeof CLASS_META>).map((k) => ({
    name: CLASS_META[k].label,
    value: scans.filter((s) => s.predicted_class === k).length,
    color: CLASS_META[k].color,
  }))

  const byDay: Record<string, number> = {}
  for (const s of scans) {
    const day = new Date(s.created_at).toLocaleDateString()
    byDay[day] = (byDay[day] ?? 0) + 1
  }
  const trend = Object.entries(byDay)
    .map(([day, count]) => ({ day: day.slice(0, 10), count }))
    .slice(-14)

  const healthy = scans.filter((s) => s.predicted_class === 'healthy').length
  const infected = scans.length - healthy
  const healthyPct = scans.length ? Math.round((healthy / scans.length) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-1 font-semibold text-slate-800">Disease distribution</h3>
        <p className="mb-4 text-sm text-slate-500">
          {scans.length} scans · {healthyPct}% healthy · {infected} infected
        </p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={counts}
                dataKey="value"
                nameKey="name"
                innerRadius={45}
                outerRadius={80}
                paddingAngle={2}
                label={(e) => (e.value > 0 ? (e.name ?? '').split(' (')[0] : '')}
              >
                {counts.map((c) => (
                  <Cell key={c.name} fill={c.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {trend.length > 1 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-semibold text-slate-800">Scans per day</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend}>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
