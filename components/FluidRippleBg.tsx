'use client'

import { useEffect } from 'react'

/**
 * GalaxyBg — Overlay-only, transparent background
 * ─────────────────────────────────────────────────────────────────
 * Canvas is 100% transparent — your existing page background and
 * hero icons are NOT affected at all. Only cyan FX are drawn on top.
 *
 * Layers drawn (no background fill, ever):
 *  1. Faint cyan star dots   — 120 static dots, cached offscreen
 *  2. 2 subtle nebula orbs   — very low alpha, won't wash out icons
 *  3. Rotating spiral arms   — 160 pts × 2 arms, Float32Array
 *  4. Shooting stars          — up to 2 active at a time
 *  5. Cursor aura             — ultra-faint glow
 *  6. Ripples on move/click
 *  7. Cursor dot
 */
export default function GalaxyBg() {
  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.id = 'galaxy-bg'
    canvas.style.cssText = `
      position: fixed !important;
      top: 0 !important; left: 0 !important;
      width: 100vw !important; height: 100vh !important;
      pointer-events: none !important;
      z-index: 1 !important;
      display: block !important;
      background: transparent !important;
    `
    document.body.appendChild(canvas)
    const ctx = canvas.getContext('2d')!

    interface Ripple {
      x: number; y: number
      radius: number; maxRadius: number
      speed: number; alpha: number
      lineWidth: number; color: string
      rings: number; ringGap: number
    }
    interface Debris { x: number; y: number; vx: number; vy: number; alpha: number; r: number }
    interface ShootingStar { x: number; y: number; vx: number; vy: number; length: number; alpha: number; active: boolean; fading: boolean }
    interface Nebula { x: number; y: number; vx: number; vy: number; radius: number; color: string; alpha: number }

    let W = 0, H = 0, dpr = 1, raf = 0
    let mouse = { x: -9999, y: -9999 }, lastMove = 0
    let ripples: Ripple[] = [], debris: Debris[] = []
    let nebulae: Nebula[] = [], shootingStars: ShootingStar[] = []
    let starCache: HTMLCanvasElement | null = null
    let armX: Float32Array, armY: Float32Array, armHue: Float32Array
    let armCount = 0, spiralAngle = 0

    const setSize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = window.innerWidth; H = window.innerHeight
      canvas.width = W * dpr; canvas.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      buildStarCache(); buildNebulae(); buildSpiral(); buildShootingStars()
    }

    // Stars drawn on transparent canvas — NO background fill
    const buildStarCache = () => {
      const c = document.createElement('canvas')
      c.width = W * dpr; c.height = H * dpr
      const cx = c.getContext('2d')!
      cx.setTransform(dpr, 0, 0, dpr, 0, 0)
      // NO fillRect — canvas stays transparent

      for (let i = 0; i < 120; i++) {
        const x = Math.random() * W, y = Math.random() * H
        const big = Math.random() < 0.05
        const r = big ? Math.random() * 1.4 + 0.8 : Math.random() * 0.6 + 0.1
        const a = big ? Math.random() * 0.45 + 0.25 : Math.random() * 0.25 + 0.08
        const hue = 180 + Math.random() * 30
        cx.beginPath(); cx.arc(x, y, r, 0, Math.PI * 2)
        cx.fillStyle = `hsla(${hue},80%,88%,${a})`; cx.fill()
        if (big) {
          const spike = r * 3
          cx.strokeStyle = `hsla(${hue},80%,88%,${a * 0.3})`; cx.lineWidth = 0.4
          cx.beginPath(); cx.moveTo(x - spike, y); cx.lineTo(x + spike, y)
          cx.moveTo(x, y - spike); cx.lineTo(x, y + spike); cx.stroke()
        }
      }
      starCache = c
    }

    // Very faint nebulae — alpha kept very low so icons are never obscured
    const buildNebulae = () => {
      nebulae = [
        { x: W * 0.15, y: H * 0.25, vx: 0.05, vy: 0.025, radius: 260, color: '0,200,220',  alpha: 0.025 },
        { x: W * 0.8,  y: H * 0.6,  vx: -0.04, vy: 0.06,  radius: 220, color: '0,225,210',  alpha: 0.020 },
      ]
    }

    // 2 arms × 160 pts
    const buildSpiral = () => {
      const ARMS = 2, PTS = 160
      armCount = ARMS * PTS
      armX = new Float32Array(armCount); armY = new Float32Array(armCount); armHue = new Float32Array(armCount)
      let idx = 0
      for (let arm = 0; arm < ARMS; arm++) {
        const offset = (arm / ARMS) * Math.PI * 2
        for (let i = 0; i < PTS; i++) {
          const frac = i / PTS, angle = frac * Math.PI * 4.2 + offset
          const spread = (Math.random() - 0.5) * 28 * frac
          const dist = frac * Math.min(W, H) * 0.34
          armX[idx] = Math.cos(angle) * dist + spread
          armY[idx] = Math.sin(angle) * dist + spread
          armHue[idx] = 175 + Math.random() * 35; idx++
        }
      }
    }

    const makeShootingStar = (): ShootingStar => {
      const angle = Math.PI * 0.15 + Math.random() * Math.PI * 0.35
      const speed = 6 + Math.random() * 8
      return { x: Math.random() * W * 0.8, y: Math.random() * H * 0.4, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, length: 50 + Math.random() * 90, alpha: 0, fading: false, active: false }
    }
    const buildShootingStars = () => { shootingStars = Array.from({ length: 2 }, makeShootingStar) }
    let nextShoot = 2500 + Math.random() * 6000

    const spawnRipple = (x: number, y: number, big: boolean) => {
      if (big) {
        const specs = [
          { maxRadius: 260, speed: 4.5, lineWidth: 1.8, color: '0,220,240',   rings: 3, ringGap: 16, alpha: 0.78 },
          { maxRadius: 190, speed: 3.3, lineWidth: 1.3, color: '180,240,255', rings: 2, ringGap: 12, alpha: 0.58 },
          { maxRadius: 130, speed: 5.2, lineWidth: 0.8, color: '0,200,230',   rings: 1, ringGap: 0,  alpha: 0.42 },
        ]
        specs.forEach(s => ripples.push({ x, y, radius: 0, ...s } as Ripple))
        for (let i = 0; i < 14; i++) {
          const a = Math.random() * Math.PI * 2, sp = 1.0 + Math.random() * 3.5
          debris.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, alpha: 0.80, r: 0.5 + Math.random() * 1.6 })
        }
        if (debris.length > 70) debris = debris.slice(-70)
      } else {
        ripples.push({ x, y, radius: 0, maxRadius: 55 + Math.random() * 20, speed: 2.3 + Math.random() * 0.9, lineWidth: 0.7, color: '0,210,235', rings: 1, ringGap: 0, alpha: 0.38 })
      }
      if (ripples.length > 25) ripples = ripples.slice(-25)
    }

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX; mouse.y = e.clientY
      const now = performance.now()
      if (now - lastMove > 200) { lastMove = now; spawnRipple(e.clientX, e.clientY, false) }
    }
    

    window.addEventListener('mousemove', onMove)
    window.addEventListener('resize', setSize)
    setSize()

    let prevNow = 0
    const draw = (now: number) => {
      const dt = Math.min(now - prevNow, 32); prevNow = now

      // CRITICAL: clearRect only — no fillRect, no background
      ctx.clearRect(0, 0, W, H)

      // Star dots (transparent cache blit)
      ctx.drawImage(starCache!, 0, 0, W * dpr, H * dpr, 0, 0, W, H)

      // Nebulae — very faint
      for (const n of nebulae) {
        n.x += n.vx; n.y += n.vy
        if (n.x < -n.radius || n.x > W + n.radius) n.vx *= -1
        if (n.y < -n.radius || n.y > H + n.radius) n.vy *= -1
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius)
        g.addColorStop(0,   `rgba(${n.color},${n.alpha})`)
        g.addColorStop(0.5, `rgba(${n.color},${n.alpha * 0.35})`)
        g.addColorStop(1,   `rgba(${n.color},0)`)
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2); ctx.fill()
      }

      // Spiral arms
      spiralAngle += 0.00032
      const cx = W / 2, cy = H / 2
      const cosA = Math.cos(spiralAngle), sinA = Math.sin(spiralAngle)
      for (let i = 0; i < armCount; i++) {
        const rx = armX[i] * cosA - armY[i] * sinA + cx
        const ry = armX[i] * sinA + armY[i] * cosA + cy
        if (rx < -4 || rx > W + 4 || ry < -4 || ry > H + 4) continue
        let wx = rx, wy = ry
        const mdx = mouse.x - rx, mdy = mouse.y - ry
        const md2 = mdx * mdx + mdy * mdy
        if (md2 < 20000 && md2 > 1) {
          const pull = (1 - md2 / 20000) * 9, md = Math.sqrt(md2)
          wx += (mdx / md) * pull; wy += (mdy / md) * pull
        }
        const frac = i / armCount
        const a = (0.15 + frac * 0.32) * 0.80   // kept subtle
        ctx.beginPath(); ctx.arc(wx, wy, 0.75, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${armHue[i]},85%,72%,${a})`; ctx.fill()
      }

      // Core glow — soft, centered, low alpha
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60)
      core.addColorStop(0,   'rgba(160,240,255,0.30)')
      core.addColorStop(0.4, 'rgba(0,220,240,0.08)')
      core.addColorStop(1,   'rgba(0,200,230,0)')
      ctx.fillStyle = core; ctx.beginPath(); ctx.arc(cx, cy, 60, 0, Math.PI * 2); ctx.fill()

      // Shooting stars
      nextShoot -= dt
      if (nextShoot <= 0) {
        const ss = shootingStars.find(s => !s.active)
        if (ss) { Object.assign(ss, makeShootingStar()); ss.active = true }
        nextShoot = 6000 + Math.random() * 6000
      }
      for (const ss of shootingStars) {
        if (!ss.active) continue
        if (!ss.fading) { ss.alpha = Math.min(ss.alpha + 0.07, 1); if (ss.alpha >= 1) ss.fading = true }
        else ss.alpha -= 0.02
        if (ss.alpha <= 0 || ss.x > W + 200 || ss.y > H + 200) { ss.active = false; continue }
        ss.x += ss.vx; ss.y += ss.vy
        const tl = ss.length / Math.max(Math.abs(ss.vx), 1)
        const tail = ctx.createLinearGradient(ss.x, ss.y, ss.x - ss.vx * tl, ss.y - ss.vy * tl)
        tail.addColorStop(0, `rgba(200,245,255,${ss.alpha})`); tail.addColorStop(1, 'rgba(0,220,240,0)')
        ctx.beginPath(); ctx.moveTo(ss.x, ss.y); ctx.lineTo(ss.x - ss.vx * tl, ss.y - ss.vy * tl)
        ctx.strokeStyle = tail; ctx.lineWidth = 1.1; ctx.stroke()
      }

      // Ripples
      ripples = ripples.filter(r => r.alpha > 0.01)
      for (const r of ripples) {
        r.radius += r.speed
        const progress = r.radius / r.maxRadius, a = r.alpha * (1 - progress)
        for (let ring = 0; ring < r.rings; ring++) {
          const rr = r.radius - ring * r.ringGap; if (rr <= 0) continue
          ctx.beginPath(); ctx.arc(r.x, r.y, rr, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(${r.color},${(a * (1 - ring * 0.3)).toFixed(3)})`
          ctx.lineWidth = r.lineWidth * (1 - ring * 0.2)
          ctx.shadowColor = `rgba(${r.color},0.4)`; ctx.shadowBlur = 6
          ctx.stroke(); ctx.shadowBlur = 0
        }
        if (r.radius >= r.maxRadius) r.alpha *= 0.82
      }

      // Debris
      debris = debris.filter(d => d.alpha > 0.02)
      for (const d of debris) {
        d.x += d.vx; d.y += d.vy; d.vy += 0.03; d.vx *= 0.97; d.vy *= 0.97; d.alpha *= 0.96
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0,220,240,${d.alpha.toFixed(2)})`; ctx.fill()
      }

      // Cursor — ultra faint aura so icons behind it are visible
      if (mouse.x > 0) {
        const aura = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 80)
        aura.addColorStop(0, 'rgba(0,220,240,0.055)'); aura.addColorStop(1, 'rgba(0,200,230,0)')
        ctx.fillStyle = aura; ctx.beginPath(); ctx.arc(mouse.x, mouse.y, 80, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.arc(mouse.x, mouse.y, 11, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(0,220,240,0.45)'; ctx.lineWidth = 0.8; ctx.stroke()
        ctx.beginPath(); ctx.arc(mouse.x, mouse.y, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(0,235,255,0.90)'; ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', setSize)
      window.removeEventListener('mousemove', onMove)
      canvas.remove()
    }
  }, [])

  return null
}