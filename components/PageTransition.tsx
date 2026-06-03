'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const FLICKERS = [0, 0.08, 0.14, 0.22, 0.28, 0.36]

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [displayChildren, setDisplayChildren] = useState(children)
  const [glitching, setGlitching] = useState(false)
  const [offsetX, setOffsetX] = useState(0)
  const [isFirstLoad, setIsFirstLoad] = useState(true)

  useEffect(() => {
    if (isFirstLoad) { setIsFirstLoad(false); return }

    setGlitching(true)
    let frame = 0
    const flicker = () => {
      setOffsetX((Math.random() - 0.5) * 12)
      frame++
      if (frame < 6) setTimeout(flicker, 60)
      else {
        setDisplayChildren(children)
        setOffsetX(0)
        setTimeout(() => setGlitching(false), 120)
      }
    }
    flicker()
  }, [pathname])

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        transform: glitching ? `translateX(${offsetX}px)` : 'none',
        transition: glitching ? 'none' : 'transform 0.1s ease',
        filter: glitching ? `hue-rotate(${Math.abs(offsetX) * 8}deg) saturate(2)` : 'none',
      }}>
        {displayChildren}
      </div>

      {glitching && (
        <>
          {/* Cyan ghost */}
          <div style={{
            position: 'fixed', inset: 0, zIndex: 99998, pointerEvents: 'none',
            background: 'transparent',
            boxShadow: `inset ${offsetX * 2}px 0 0 #00d9ff22`,
            mixBlendMode: 'screen',
          }} />
          {/* Scanlines */}
          <div style={{
            position: 'fixed', inset: 0, zIndex: 99999, pointerEvents: 'none',
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,217,255,0.03) 2px, rgba(0,217,255,0.03) 4px)',
          }} />
        </>
      )}
    </div>
  )
}