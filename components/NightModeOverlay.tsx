'use client'

import { useEffect, useRef, useCallback } from 'react'

// ─── Tuning ────────────────────────────────────────────────────────────────
const TRAIL   = 16   // number of smear blobs
const BLOB    = 68   // base blob diameter (px)

interface Props { active: boolean }

// ─── Component ─────────────────────────────────────────────────────────────
export default function NightModeOverlay({ active }: Props) {

  /* refs — never trigger re-renders */
  const overlayRef = useRef<HTMLDivElement>(null)
  const coreRef    = useRef<HTMLDivElement>(null)
  const trailEls   = useRef<(HTMLDivElement | null)[]>([])

  const mouse      = useRef({ x: -999, y: -999 })
  const history    = useRef(
    Array.from({ length: TRAIL }, () => ({ x: -999, y: -999 }))
  )
  const raf        = useRef<number>()
  const activeRef  = useRef(active)

  // keep activeRef in sync without re-running the RAF effect
  useEffect(() => { activeRef.current = active }, [active])

  // ── RAF loop — direct DOM only, zero setState ──────────────────────────
  useEffect(() => {
    const loop = () => {
      if (activeRef.current) {
        const cur = mouse.current

        // shift history
        for (let i = TRAIL - 1; i > 0; i--) {
          history.current[i] = history.current[i - 1]
        }
        history.current[0] = cur

        // dark vignette with radial cutout
        if (overlayRef.current) {
          overlayRef.current.style.background = `radial-gradient(
            circle 405px at ${cur.x}px ${cur.y}px,
            transparent 0%,
            rgba(0,0,0,0.38) 52%,
            rgba(0,0,0,0.91) 82%,
            rgba(0,0,0,0.97) 100%
          )`
        }

        // bright cursor core
        if (coreRef.current) {
          coreRef.current.style.transform =
            `translate(${cur.x - 7}px, ${cur.y - 7}px)`
        }

        // smear blobs
        trailEls.current.forEach((el, i) => {
          if (!el) return
          const pt  = history.current[i]
          const age = i / TRAIL                  // 0 = newest … 1 = oldest
          const op  = Math.pow(1 - age, 1.9) * 0.82
          const spd = age * 30                   // channel spread grows with age
          const sz  = BLOB + age * 55            // blob grows with age

          el.style.opacity   = `${op}`
          el.style.width     = `${sz}px`
          el.style.height    = `${sz}px`
          el.style.transform = `translate(${pt.x - sz / 2}px, ${pt.y - sz / 2}px)`

          // shift each colour channel independently for aberration
          const pink = el.children[0] as HTMLElement
          const cyan = el.children[1] as HTMLElement
          const blue = el.children[2] as HTMLElement
          if (pink) pink.style.transform = `translate(${-spd * 0.95}px, ${-spd * 0.3}px)`
          if (cyan) cyan.style.transform = `translate(${spd * 0.3}px,   ${spd * 0.65}px)`
          if (blue) blue.style.transform = `translate(${spd * 0.7}px,   ${-spd * 0.7}px)`
        })
      }

      raf.current = requestAnimationFrame(loop)
    }

    raf.current = requestAnimationFrame(loop)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, []) // runs once — activeRef keeps it live

  // ── Mouse listener ──────────────────────────────────────────────────────
  const onMove = useCallback((e: MouseEvent) => {
    mouse.current = { x: e.clientX, y: e.clientY }
  }, [])

  useEffect(() => {
    if (!active) return
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [active, onMove])

  // ── Render — static DOM, no per-frame re-renders ────────────────────────
  return (
    <div
      className="fixed inset-0 z-[9999] pointer-events-none select-none"
      style={{ display: active ? 'block' : 'none' }}
    >

      {/* Radial dark overlay */}
      <div ref={overlayRef} className="absolute inset-0" />

      {/* ── Chromatic smear trail (screen blend = additive colour) ── */}
      <div
        className="absolute inset-0"
        style={{ mixBlendMode: 'screen', overflow: 'hidden' }}
      >
        {Array.from({ length: TRAIL }, (_, i) => (
          <div
            key={i}
            ref={el => { trailEls.current[i] = el }}
            style={{
              position:      'absolute',
              top:           0,
              left:          0,
              borderRadius:  '50%',
              willChange:    'transform, opacity',
              pointerEvents: 'none',
            }}
          >
            {/* Pink / magenta — "R" */}
            <div style={{
              position:   'absolute', inset: 0, borderRadius: '50%',
              willChange: 'transform',
              background: 'radial-gradient(circle, rgba(255,20,110,0.92) 0%, transparent 62%)',
            }} />
            {/* Cyan / teal — "G" */}
            <div style={{
              position:   'absolute', inset: 0, borderRadius: '50%',
              willChange: 'transform',
              background: 'radial-gradient(circle, rgba(0,255,195,0.92) 0%, transparent 62%)',
            }} />
            {/* Electric blue — "B" */}
            <div style={{
              position:   'absolute', inset: 0, borderRadius: '50%',
              willChange: 'transform',
              background: 'radial-gradient(circle, rgba(75,105,255,0.92) 0%, transparent 62%)',
            }} />
          </div>
        ))}
      </div>

      {/* ── Cursor core — bright white spark ── */}
      <div
        ref={coreRef}
        style={{
          position:     'absolute',
          top:          0,
          left:         0,
          width:        14,
          height:       14,
          borderRadius: '100%',
          willChange:   'transform',
          background:   'rgba(255,255,255,0.97)',
          boxShadow: [
            '0 0 6px  3px rgba(255,255,255,0.9)',
            '0 0 18px 8px rgba(180,150,255,0.6)',
            '0 0 40px 16px rgba(100,80,255,0.3)',
          ].join(', '),
        }}
      />

    </div>
  )
}