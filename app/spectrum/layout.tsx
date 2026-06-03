import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'System Spectrum',
  description:
    'Real-time system diagnostics and infrastructure monitoring for Saqib Patel\'s portfolio — health, memory, latency, stack info, and SEO status.',
}

export default function SpectrumLayout({ children }: { children: React.ReactNode }) {
  return children
}
