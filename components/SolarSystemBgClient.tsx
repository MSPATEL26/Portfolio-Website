'use client'

import dynamic from 'next/dynamic'

const FluidRippleBg = dynamic(() => import('./FluidRippleBg'), { ssr: false })

export default function SolarSystemBgClient() {
  return <FluidRippleBg />
}