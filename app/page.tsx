'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Camera, MapPin, BarChart3, WifiOff, Volume2, CloudRain } from 'lucide-react'
import { ensureAnonSession } from '@/lib/auth'
import ModelStatusBadge from '@/components/ModelStatusBadge'

const features = [
  {
    icon: Camera,
    title: 'Snap a photo',
    text: 'Point your phone at a cocoa leaf or pod. The AI works on-device — no internet needed for the diagnosis.',
  },
  {
    icon: Volume2,
    title: 'Get treatment steps',
    text: 'Immediate actions, prevention tips and isolation guidance, plus Twi voice advice.',
  },
  {
    icon: MapPin,
    title: 'Community disease map',
    text: 'Every scan adds an anonymous marker. Spot outbreaks and help extension agents act faster.',
  },
  {
    icon: BarChart3,
    title: 'Live analytics',
    text: 'Track your farm health over time and see the weather-driven black-pod risk for your area.',
  },
  {
    icon: WifiOff,
    title: 'Works offline',
    text: 'The model and advice are cached after your first visit — diagnose in the field with no signal.',
  },
  {
    icon: CloudRain,
    title: 'Weather aware',
    text: 'Rain + humidity risk scoring tells you when black pod is most likely to strike.',
  },
]

export default function LandingPage() {
  useEffect(() => {
    // Background: anonymous session + model preload so /scan is instant.
    ensureAnonSession()
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        import('@/lib/classifier').then(({ getModel }) => getModel().catch(() => {}))
      })
    } else {
      setTimeout(() => import('@/lib/classifier').then(({ getModel }) => getModel().catch(() => {})), 500)
    }
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white">
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 pt-16 pb-12 text-center">
        <div className="mb-4 flex items-center justify-center gap-2">
          <ModelStatusBadge />
        </div>
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
          Know what&apos;s hurting your <span className="text-emerald-600">cocoa</span> before it
          hurts your harvest.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
          Photograph a leaf or pod, get an instant disease diagnosis with a confidence score, and
          the treatment steps to act today.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/scan"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            <Camera className="h-5 w-5" />
            Scan a crop now
          </Link>
          <Link
            href="/map"
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-600/30 bg-white px-8 py-4 text-lg font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
          >
            <MapPin className="h-5 w-5" />
            View disease map
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <f.icon className="mb-3 h-7 w-7 text-emerald-600" />
              <h3 className="mb-1.5 font-semibold text-slate-800">{f.title}</h3>
              <p className="text-sm leading-relaxed text-slate-600">{f.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-center gap-3 text-center">
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-emerald-700 underline-offset-4 hover:underline"
          >
            Open your farm dashboard →
          </Link>
        </div>
      </section>
    </main>
  )
}
