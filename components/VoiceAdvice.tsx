'use client'

import { useEffect, useState } from 'react'
import { Volume2 } from 'lucide-react'
import { ADVICE } from '@/lib/advice'
import type { DiseaseClass } from '@/lib/types'

/**
 * SpeechSynthesis advice. There is no reliable free Twi TTS engine, so:
 *  - "Listen (Twi)" uses a `tw` voice if the device has one, else an English
 *    voice reads the short Twi text phonetically (imperfect but demonstrates
 *    the concept).
 *  - "Listen (English)" always reads the English summary.
 */
export default function VoiceAdvice({ diseaseClass }: { diseaseClass: DiseaseClass }) {
  const [speaking, setSpeaking] = useState<'tw' | 'en' | null>(null)
  const [hasTwiVoice, setHasTwiVoice] = useState(false)

  useEffect(() => {
    const check = () => {
      const twi = window.speechSynthesis
        .getVoices()
        .some((v) => v.lang.toLowerCase().startsWith('tw'))
      setHasTwiVoice(twi)
    }
    check()
    window.speechSynthesis.addEventListener('voiceschanged', check)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', check)
  }, [])

  const speak = (lang: 'tw' | 'en') => {
    window.speechSynthesis.cancel()
    const synth = window.speechSynthesis
    const text = lang === 'tw' ? ADVICE[diseaseClass].twi_summary : ADVICE[diseaseClass].description
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang === 'tw' ? 'tw' : 'en-GH'
    if (lang === 'tw') {
      const twiVoice = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith('tw'))
      if (twiVoice) u.voice = twiVoice
    }
    u.onend = () => setSpeaking(null)
    u.onerror = () => setSpeaking(null)
    setSpeaking(lang)
    synth.speak(u)
  }

  const btn = (lang: 'tw' | 'en', label: string, note?: string) => (
    <button
      type="button"
      onClick={() => speak(lang)}
      disabled={speaking !== null}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
    >
      <Volume2 className="h-4 w-4 text-emerald-600" />
      {label}
      {note && <span className="text-xs font-normal text-slate-400">{note}</span>}
    </button>
  )

  return (
    <div className="flex flex-wrap gap-2">
      {btn('en', 'Listen (English)')}
      {btn('tw', 'Listen (Twi)', hasTwiVoice ? undefined : '· text fallback')}
    </div>
  )
}
