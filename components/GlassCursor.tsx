'use client'

import { useEffect, useRef } from 'react'

export default function GlassCursor() {
  const lensRef   = useRef<HTMLDivElement>(null)
  const trailRef  = useRef<HTMLDivElement>(null)
  const dotRef    = useRef<HTMLDivElement>(null)
  const pos       = useRef({ x: 0, y: 0 })
  const lensXY    = useRef({ x: 0, y: 0 })
  const trailXY   = useRef({ x: 0, y: 0 })
  const raf       = useRef<number>(0)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }

      // Dot follows instantly
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX - 3}px, ${e.clientY - 3}px)`
      }
    }

    const loop = () => {
      // Lens — medium lag
      lensXY.current.x += (pos.current.x - lensXY.current.x) * 0.10
      lensXY.current.y += (pos.current.y - lensXY.current.y) * 0.10

      // Trail — slower lag (outer glow)
      trailXY.current.x += (pos.current.x - trailXY.current.x) * 0.06
      trailXY.current.y += (pos.current.y - trailXY.current.y) * 0.06

      if (lensRef.current) {
        lensRef.current.style.transform =
          `translate(${lensXY.current.x - 20}px, ${lensXY.current.y - 20}px)`
      }
      if (trailRef.current) {
        trailRef.current.style.transform =
          `translate(${trailXY.current.x - 50}px, ${trailXY.current.y - 50}px)`
      }

      raf.current = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', onMove)
    raf.current = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  return (
    <>
      {/* Outer diffused trail */}
      <div
        ref={trailRef}
        style={{
          position:      'fixed',
          top:           0,
          left:          0,
          width:         100,
          height:        100,
          borderRadius:  '50%',
          pointerEvents: 'none',
          zIndex:        99997,
          willChange:    'transform',
          background:    'radial-gradient(circle, rgba(0,217,255,0.07) 0%, transparent 65%)',
          filter:        'blur(4px)',
        }}
      />

      {/* Glass lens */}
      <div
        ref={lensRef}
        style={{
          position:      'fixed',
          top:           0,
          left:          0,
          width:         40,
          height:        40,
          borderRadius:  '50%',
          pointerEvents: 'none',
          zIndex:        999998,
          willChange:    'transform',
          backdropFilter:       'blur(4px) saturate(150%)',
          WebkitBackdropFilter: 'blur(4px) saturate(150%)',
          background:    'rgba(255,255,255,0.03)',
          border:        '1px solid rgba(255,255,255,0.15)',
          boxShadow:     'inset 0 1px 0 rgba(255,255,255,0.18), 0 0 12px rgba(0,217,255,0.06)',
        }}
      >
        {/* Single top specular — thin */}
        <div style={{
          position:     'absolute',
          top:          7,
          left:         9,
          width:        10,
          height:       3,
          borderRadius: '50%',
          background:   'rgba(255,255,255,0.40)',
          filter:       'blur(1.5px)',
          transform:    'rotate(-20deg)',
        }} />
      </div>

      {/* Sharp center dot */}
      <div
        ref={dotRef}
        style={{
          position:      'fixed',
          top:           0,
          left:          0,
          width:         6,
          height:        6,
          borderRadius:  '50%',
          pointerEvents: 'none',
          zIndex:        999999,
          willChange:    'transform',
          background:    'rgba(0,217,255,0.9)',
          boxShadow:     '0 0 6px rgba(0,217,255,0.6)',
        }}
      />
    </>
  )
}