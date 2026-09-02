import type { Metadata } from 'next'
import './globals.css'
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'

export const metadata: Metadata = {
  title: 'CocoaGuard AI',
  description:
    'Photograph a cocoa leaf or pod, get an instant disease diagnosis, treatment steps and a community outbreak map — for cocoa farmers in Ghana.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
