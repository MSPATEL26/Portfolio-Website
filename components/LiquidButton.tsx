'use client'

import Link from 'next/link'
import React, { useRef, useEffect, useCallback } from 'react'

type LiquidVariant =
  | 'white' | 'dark' | 'cyan' | 'red' | 'blue'
  | 'purple' | 'lime' | 'amber' | 'pink' | 'teal' | 'yellow'

interface LiquidButtonProps {
  children?: React.ReactNode
  href?: string
  onClick?: () => void
  variant?: LiquidVariant
  size?: 'sm' | 'md' | 'lg'
  className?: string
  target?: string
  rel?: string
  icon?: React.ReactNode
  style?: React.CSSProperties   // ← added
}

export default function LiquidButton({
  children,
  href,
  onClick,
  variant = 'dark',
  size = 'md',
  className = '',
  target,
  rel,
  icon,
  style: styleProp,             // ← added
}: LiquidButtonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef   = useRef<number>(0)
  const phaseRef  = useRef(0)
  const fillRef   = useRef(0)
  const targetRef = useRef(0)
  const isHovRef  = useRef(false)
  const textRef   = useRef<HTMLSpanElement>(null)
  const btnRef    = useRef<HTMLElement>(null)

  const COLORS: Record<LiquidVariant, { wave: string; bg: string; text: string; border: string; textHov: string }> = {
    white:  { wave: 'rgba(255,255,255,0.95)', bg: 'rgba(255,255,255,0.10)', text: 'rgba(255,255,255,0.85)', border: 'rgba(255,255,255,0.22)', textHov: '#0a1a28' },
    dark:   { wave: 'rgba(255,255,255,0.18)', bg: 'rgba(255,255,255,0.05)', text: 'rgba(255,255,255,0.70)', border: 'rgba(255,255,255,0.14)', textHov: 'rgba(255,255,255,1)' },
    cyan:   { wave: 'rgba(0,217,255,0.55)',   bg: 'rgba(0,217,255,0.05)',   text: 'rgba(0,217,255,0.80)',  border: 'rgba(0,217,255,0.28)',  textHov: '#fff' },
    red:    { wave: 'rgba(234,67,53,0.70)',   bg: 'rgba(234,67,53,0.07)',   text: 'rgba(234,67,53,0.80)',  border: 'rgba(234,67,53,0.22)',  textHov: '#fff' },
    blue:   { wave: 'rgba(10,102,194,0.70)',  bg: 'rgba(10,102,194,0.07)', text: 'rgba(10,102,194,0.85)', border: 'rgba(10,102,194,0.24)', textHov: '#fff' },
    purple: { wave: 'rgba(168,85,247,0.72)',  bg: 'rgba(168,85,247,0.08)', text: 'rgba(196,181,253,0.95)', border: 'rgba(168,85,247,0.28)', textHov: '#fff' },
    lime:   { wave: 'rgba(132,204,22,0.72)',  bg: 'rgba(132,204,22,0.08)', text: 'rgba(190,242,100,0.95)', border: 'rgba(132,204,22,0.28)', textHov: '#0b1204' },
    amber:  { wave: 'rgba(245,158,11,0.75)',  bg: 'rgba(245,158,11,0.08)', text: 'rgba(252,211,77,0.95)',  border: 'rgba(245,158,11,0.28)', textHov: '#1a1205' },
    pink:   { wave: 'rgba(236,72,153,0.72)',  bg: 'rgba(236,72,153,0.08)', text: 'rgba(249,168,212,0.95)', border: 'rgba(236,72,153,0.28)', textHov: '#fff' },
    teal:   { wave: 'rgba(20,184,166,0.72)',  bg: 'rgba(20,184,166,0.08)', text: 'rgba(94,234,212,0.95)',  border: 'rgba(20,184,166,0.28)', textHov: '#04201c' },
    yellow: { wave: 'rgba(250,204,21,0.78)',  bg: 'rgba(250,204,21,0.09)', text: 'rgba(254,240,138,0.98)', border: 'rgba(250,204,21,0.30)', textHov: '#1a1602' },
  }

  const PAD = { sm: '10px 20px', md: '12px 28px', lg: '14px 36px' }
  const FS  = { sm: '11px',      md: '13px',       lg: '15px' }
  const c   = COLORS[variant]

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const W = canvas.width, H = canvas.height

    const speed = isHovRef.current ? 0.045 : 0.06
    fillRef.current += (targetRef.current - fillRef.current) * speed
    phaseRef.current += isHovRef.current ? 0.055 : 0.03

    ctx.clearRect(0, 0, W, H)
    const f = fillRef.current
    if (f < 0.002) { animRef.current = requestAnimationFrame(draw); return }

    const waveH = H * 0.22
    const baseY = H - f * (H + waveH * 2) + waveH

    ctx.beginPath()
    ctx.moveTo(0, H)
    const segments = 6
    for (let x = 0; x <= W; x += 2) {
      const t = x / W
      const y = baseY
        + Math.sin(t * Math.PI * segments + phaseRef.current) * waveH * (1 - f * 0.6)
        + Math.sin(t * Math.PI * (segments + 1) + phaseRef.current * 1.3) * waveH * 0.4 * (1 - f * 0.5)
      ctx.lineTo(x, y)
    }
    ctx.lineTo(W, H)
    ctx.closePath()
    ctx.fillStyle = c.wave
    ctx.fill()

    const grad = ctx.createLinearGradient(0, 0, 0, H)
    grad.addColorStop(0, 'rgba(255,255,255,0.12)')
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = grad
    ctx.fill()

    if (textRef.current) {
      textRef.current.style.color = f > 0.55 ? c.textHov : c.text
    }

    animRef.current = requestAnimationFrame(draw)
  }, [c])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ro = new ResizeObserver(() => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    })
    ro.observe(canvas)
    canvas.width  = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    animRef.current = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(animRef.current); ro.disconnect() }
  }, [draw])

  const onEnter = () => { isHovRef.current = true;  targetRef.current = 1 }
  const onLeave = () => { isHovRef.current = false; targetRef.current = 0 }

  const addRipple = (e: React.MouseEvent) => {
    const el = btnRef.current; if (!el) return
    const r    = document.createElement('span')
    const rect = el.getBoundingClientRect()
    r.style.cssText = `position:absolute;width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,0.45);pointer-events:none;transform:scale(0);animation:liqRip 0.6s ease-out forwards;left:${e.clientX-rect.left-4}px;top:${e.clientY-rect.top-4}px;z-index:4`
    el.appendChild(r)
    setTimeout(() => r.remove(), 700)
  }

  // ── base style + spread caller's overrides at the end ──
  const commonStyle: React.CSSProperties = {
    position:       'relative',
    display:        'inline-flex',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            '7px',
    padding:        PAD[size],
    borderRadius:   '100px',
    border:         `1px solid ${c.border}`,
    background:     c.bg,
    cursor:         'pointer',
    overflow:       'hidden',
    fontFamily:     'DM Sans,sans-serif',
    fontSize:       FS[size],
    fontWeight:     600,
    letterSpacing:  '0.3px',
    textDecoration: 'none',
    transition:     'transform 0.2s cubic-bezier(.34,1.56,.64,1), border-color 0.2s ease, box-shadow 0.2s ease',
    boxShadow:      '0 2px 12px rgba(0,0,0,0.25)',
    ...styleProp,   // ← caller overrides (borderRadius, width, height, etc.)
  }

  const innerContent = (
    <>
      <canvas
        ref={canvasRef}
        style={{ position:'absolute', inset:0, width:'100%', height:'100%', zIndex:1,
          borderRadius: (styleProp?.borderRadius as string) ?? '100px' }}
      />
      <span style={{ position:'absolute', top:'3px', left:'12%', right:'12%', height:'35%',
        background:'linear-gradient(to bottom,rgba(255,255,255,0.18) 0%,transparent 100%)',
        borderRadius:'100px', zIndex:2, pointerEvents:'none' }} />
      <span ref={textRef} style={{ position:'relative', zIndex:3, display:'flex',
        alignItems:'center', gap:'7px', transition:'color 0.15s ease', color: c.text }}>
        {icon}{children}
      </span>
    </>
  )

  if (href) {
    return (
      <Link href={href} target={target} rel={rel}
        ref={btnRef as React.Ref<HTMLAnchorElement>}
        style={commonStyle} className={className}
        onMouseEnter={onEnter} onMouseLeave={onLeave} onClick={addRipple}>
        {innerContent}
      </Link>
    )
  }

  return (
    <button ref={btnRef as React.Ref<HTMLButtonElement>}
      style={commonStyle} className={className}
      onMouseEnter={onEnter} onMouseLeave={onLeave}
      onClick={(e) => { addRipple(e); onClick?.() }}>
      {innerContent}
    </button>
  )
}