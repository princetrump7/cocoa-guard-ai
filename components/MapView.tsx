'use client'

import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { CLASS_META } from '@/lib/advice'
import type { CommunityScan } from '@/lib/types'

interface Props {
  scans: CommunityScan[]
  center?: [number, number]
  zoom?: number
  heightClass?: string
}

export default function MapView({
  scans,
  center = [7.0, -1.5],
  zoom = 7,
  heightClass = 'h-[70vh]',
}: Props) {
  return (
    <div className={`relative overflow-hidden rounded-2xl ${heightClass} shadow-sm`}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom
        className="h-full w-full"
        attributionControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {scans.map((s) => (
          <CircleMarker
            key={s.id}
            center={[s.lat, s.lng]}
            radius={8}
            pathOptions={{ color: CLASS_META[s.predicted_class].color, fillOpacity: 0.55 }}
          >
            <Popup>
              <strong>{CLASS_META[s.predicted_class].label}</strong>
              <br />
              Confidence: {Math.round(s.confidence * 100)}%
              <br />
              {new Date(s.created_at).toLocaleDateString()}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="pointer-events-none absolute bottom-4 left-4 rounded-xl bg-white/95 p-3 shadow-lg backdrop-blur">
        <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">Disease</p>
        <ul className="space-y-1 text-xs font-medium text-slate-700">
          {(Object.keys(CLASS_META) as Array<keyof typeof CLASS_META>).map((k) => (
            <li key={k} className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: CLASS_META[k].color }}
              />
              {CLASS_META[k].label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
