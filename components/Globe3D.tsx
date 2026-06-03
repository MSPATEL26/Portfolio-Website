'use client'

import { useRef, useEffect } from 'react'

const techLabels = [
  { name: 'React',        angle: 0,    elevation: 0.3,  color: '#61DAFB', icon: 'https://cdn.simpleicons.org/react/61DAFB' },
  { name: 'Python',       angle: 1.2,  elevation: 0.8,  color: '#3776AB', icon: 'https://cdn.simpleicons.org/python/3776AB' },
  { name: 'Next.js',      angle: 2.4,  elevation: -0.3, color: '#ffffff', icon: 'https://cdn.simpleicons.org/nextdotjs/ffffff' },
  { name: 'TypeScript',   angle: 3.6,  elevation: 0.5,  color: '#3178C6', icon: 'https://cdn.simpleicons.org/typescript/3178C6' },
  { name: 'FastAPI',      angle: 4.8,  elevation: -0.6, color: '#009688', icon: 'https://cdn.simpleicons.org/fastapi/009688' },
  { name: 'Docker',       angle: 0.6,  elevation: -0.9, color: '#2496ED', icon: 'https://cdn.simpleicons.org/docker/2496ED' },
  { name: 'LangChain',    angle: 1.8,  elevation: 1.0,  color: '#00d9ff', icon: 'https://cdn.simpleicons.org/langchain/00d9ff' },
  { name: 'PostgreSQL',   angle: 3.0,  elevation: -0.1, color: '#4169E1', icon: 'https://cdn.simpleicons.org/postgresql/4169E1' },
  { name: 'TailwindCSS',  angle: 5.4,  elevation: 0.2,  color: '#06B6D4', icon: 'https://cdn.simpleicons.org/tailwindcss/06B6D4' },
  { name: 'Git',          angle: 4.2,  elevation: 0.7,  color: '#F05032', icon: 'https://cdn.simpleicons.org/git/F05032' },
  { name: 'Redis',        angle: 2.0,  elevation: -0.5, color: '#FF4438', icon: 'https://cdn.simpleicons.org/redis/FF4438' },
  { name: 'Vercel',       angle: 5.0,  elevation: -0.8, color: '#ffffff', icon: 'https://cdn.simpleicons.org/vercel/ffffff' },
  { name: 'NumPy',        angle: 0.3,  elevation: -0.4, color: '#4DABCF', icon: 'https://cdn.simpleicons.org/numpy/4DABCF' },
  { name: 'Pandas',       angle: 1.5,  elevation: 0.1,  color: '#e0e0e0', icon: 'https://cdn.simpleicons.org/pandas/white' },
  { name: 'Scikit-Learn', angle: 2.7,  elevation: 0.65, color: '#F7931E', icon: 'https://cdn.simpleicons.org/scikitlearn/F7931E' },
  { name: 'XGBoost',      angle: 3.9,  elevation: -0.75,color: '#189AB4', icon: 'https://cdn.simpleicons.org/xgboost/189AB4' },
  { name: 'TensorFlow',   angle: 5.1,  elevation: 0.45, color: '#FF6F00', icon: 'https://cdn.simpleicons.org/tensorflow/FF6F00' },
  { name: 'Power BI',     angle: 0.9,  elevation: 0.85, color: '#F2C811', icon: 'https://cdn.simpleicons.org/powerbi/F2C811' },
  { name: 'Jupyter',      angle: 2.2,  elevation: -0.85,color: '#F37626', icon: 'https://cdn.simpleicons.org/jupyter/F37626' },
  { name: 'HuggingFace',  angle: 3.4,  elevation: 0.25, color: '#FFD21E', icon: 'https://cdn.simpleicons.org/huggingface/FFD21E' },
  { name: 'MongoDB',      angle: 4.6,  elevation: -0.2, color: '#47A248', icon: 'https://cdn.simpleicons.org/mongodb/47A248' },
  { name: 'Supabase',     angle: 5.8,  elevation: 0.6,  color: '#3ECF8E', icon: 'https://cdn.simpleicons.org/supabase/3ECF8E' },
  { name: 'GitHub',       angle: 1.1,  elevation: -0.65,color: '#ffffff', icon: 'https://cdn.simpleicons.org/github/ffffff' },
  { name: 'Plotly',       angle: 3.3,  elevation: 0.95, color: '#636EFA', icon: 'https://cdn.simpleicons.org/plotly/636EFA' },
]

interface Point3D { x: number; y: number; z: number }

// ─── Unit-sphere wireframe segs built ONCE at module level ───────────────────
// Stored as unit vectors; scaled by RADIUS at draw time → resize-safe
const unitSegs: [Point3D, Point3D][] = (() => {
  const LINES_H = 12
  const LINES_V = 16
  const segs: [Point3D, Point3D][] = []

  for (let h = 0; h <= LINES_H; h++) {
    const phi = (h / LINES_H) * Math.PI
    const pts: Point3D[] = []
    for (let v = 0; v <= 64; v++) {
      const theta = (v / 64) * Math.PI * 2
      pts.push({
        x: Math.sin(phi) * Math.cos(theta),
        y: Math.cos(phi),
        z: Math.sin(phi) * Math.sin(theta),
      })
    }
    for (let i = 0; i < pts.length - 1; i++) segs.push([pts[i], pts[i + 1]])
  }

  for (let v = 0; v < LINES_V; v++) {
    const theta = (v / LINES_V) * Math.PI * 2
    const pts: Point3D[] = []
    for (let h = 0; h <= 48; h++) {
      const phi = (h / 48) * Math.PI
      pts.push({
        x: Math.sin(phi) * Math.cos(theta),
        y: Math.cos(phi),
        z: Math.sin(phi) * Math.sin(theta),
      })
    }
    for (let i = 0; i < pts.length - 1; i++) segs.push([pts[i], pts[i + 1]])
  }

  return segs
})()
// ─────────────────────────────────────────────────────────────────────────────

// Parses '#rrggbb' → [r, g, b] — used for constellation gradient stops
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '').padEnd(6, 'f')
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}

function rotateY(p: Point3D, a: number): Point3D {
  return {
    x:  p.x * Math.cos(a) + p.z * Math.sin(a),
    y:  p.y,
    z: -p.x * Math.sin(a) + p.z * Math.cos(a),
  }
}

function rotateX(p: Point3D, a: number): Point3D {
  return {
    x: p.x,
    y: p.y * Math.cos(a) - p.z * Math.sin(a),
    z: p.y * Math.sin(a) + p.z * Math.cos(a),
  }
}

function project(p: Point3D, cx: number, cy: number, fov: number) {
  const z     = p.z + fov
  const scale = fov / z
  return { x: cx + p.x * scale, y: cy + p.y * scale, scale }
}

export default function Globe3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rotYRef   = useRef(0)
  const rotXRef   = useRef(0.18)
  const dragRef   = useRef({ active: false, lastX: 0, lastY: 0 })
  const velYRef   = useRef(0.004)
  const velXRef   = useRef(0)
  const rafRef    = useRef<number>(0)
  const imagesRef = useRef<Map<string, HTMLImageElement>>(new Map())

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Preload icons
    techLabels.forEach(lbl => {
      const img    = new Image()
      img.crossOrigin = 'anonymous'
      img.src      = lbl.icon
      imagesRef.current.set(lbl.name, img)
    })

    // ── Resize: use setTransform to avoid compounding ctx.scale calls ────────
    const resize = () => {
      const dpr  = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width  = rect.width  * dpr
      canvas.height = rect.height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0) // ← fixed: was ctx.scale (compounds on repeated calls)
    }
    resize()
    window.addEventListener('resize', resize)
    // ─────────────────────────────────────────────────────────────────────────

    const draw = () => {
      const rect = canvas.getBoundingClientRect()
      const W    = rect.width
      const H    = rect.height
      const cx   = W / 2
      const cy   = H / 2

      // ── Responsive constants computed per-frame ───────────────────────────
      const isMobile = W < 600
      // Globe fills ~38% of the smaller dimension — leaves room for labels
      const RADIUS   = Math.min(W, H) * (isMobile ? 0.30 : 0.36)
      const FOV      = RADIUS * 2.3
      // Label sizing that scales with the globe
      const BASE_ICON   = isMobile ? 14 : 22
      const MAX_ICON    = isMobile ? 20 : 28
      const BASE_FONT   = isMobile ? 7  : 9
      const MAX_FONT    = isMobile ? 8  : 10
      const PILL_PAD    = isMobile ? 3  : 5
      // ─────────────────────────────────────────────────────────────────────

      ctx.clearRect(0, 0, W, H)

      // Ambient glow
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, RADIUS * 1.2)
      grd.addColorStop(0,   'rgba(0,217,255,0.06)')
      grd.addColorStop(0.7, 'rgba(0,80,160,0.03)')
      grd.addColorStop(1,   'transparent')
      ctx.fillStyle = grd
      ctx.beginPath()
      ctx.arc(cx, cy, RADIUS * 1.5, 0, Math.PI * 2)
      ctx.fill()

      const ry = rotYRef.current
      const rx = rotXRef.current

      // Wireframe — scale unit segs by RADIUS here
      for (const [a, b] of unitSegs) {
        const sa: Point3D = { x: a.x * RADIUS, y: a.y * RADIUS, z: a.z * RADIUS }
        const sb: Point3D = { x: b.x * RADIUS, y: b.y * RADIUS, z: b.z * RADIUS }
        const ra   = rotateX(rotateY(sa, ry), rx)
        const rb   = rotateX(rotateY(sb, ry), rx)
        const pa   = project(ra, cx, cy, FOV)
        const pb   = project(rb, cx, cy, FOV)
        const avgZ = (ra.z + rb.z) / 2
        const t    = (avgZ + RADIUS) / (2 * RADIUS)
        ctx.beginPath()
        ctx.moveTo(pa.x, pa.y)
        ctx.lineTo(pb.x, pb.y)
        ctx.strokeStyle = `rgba(0,180,220,${0.06 + t * 0.5})`
        ctx.lineWidth   = 0.55
        ctx.stroke()
      }

      type LabelDraw = {
        lbl: typeof techLabels[0]
        px: number; py: number
        alpha: number; projScale: number
        z: number
        rot3d: Point3D   // ← needed for constellation distance calc
      }
      const toDraw: LabelDraw[] = []

      for (const lbl of techLabels) {
        const r   = RADIUS * 1.28
        const raw: Point3D = {
          x: r * Math.cos(lbl.angle) * Math.cos(lbl.elevation),
          y: r * Math.sin(lbl.elevation),
          z: r * Math.sin(lbl.angle) * Math.cos(lbl.elevation),
        }
        const rot3d = rotateX(rotateY(raw, ry), rx)
        const { x, y, scale } = project(rot3d, cx, cy, FOV)

        const depthT = (rot3d.z + RADIUS * 1.3) / (RADIUS * 2.6)
        if (depthT < 0.08) continue

        toDraw.push({
          lbl,
          px: x, py: y,
          alpha: Math.min(1, depthT * 1.4),
          projScale: scale,
          z: rot3d.z,
          rot3d,
        })
      }

      toDraw.sort((a, b) => a.z - b.z)

      // ── Constellation lines ─────────────────────────────────────────────────
      // Drawn before pills so pills always render on top.
      // Tighter threshold on mobile to avoid clutter on small screens.
      const CONST_DIST = RADIUS * (isMobile ? 0.88 : 1.15)

      for (let i = 0; i < toDraw.length; i++) {
        for (let j = i + 1; j < toDraw.length; j++) {
          const A = toDraw[i]
          const B = toDraw[j]

          const dx   = A.rot3d.x - B.rot3d.x
          const dy   = A.rot3d.y - B.rot3d.y
          const dz   = A.rot3d.z - B.rot3d.z
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
          if (dist > CONST_DIST) continue

          // Alpha: weaker when either label is near the horizon, weaker when far apart
          const proximity = 1 - dist / CONST_DIST        // 1 = very close, 0 = at threshold
          const lineAlpha = Math.min(A.alpha, B.alpha) * proximity * 0.38
          if (lineAlpha < 0.04) continue

          // Gradient from label-A color → label-B color
          // Guard: skip non-finite or zero-length gradients (labels at same pixel)
          if (!isFinite(A.px) || !isFinite(A.py) || !isFinite(B.px) || !isFinite(B.py)) continue
          if (A.px === B.px && A.py === B.py) continue

          const [r1, g1, b1] = hexToRgb(A.lbl.color)
          const [r2, g2, b2] = hexToRgb(B.lbl.color)
          const grad = ctx.createLinearGradient(A.px, A.py, B.px, B.py)
          grad.addColorStop(0, `rgba(${r1},${g1},${b1},${lineAlpha})`)
          grad.addColorStop(1, `rgba(${r2},${g2},${b2},${lineAlpha})`)

          ctx.save()
          ctx.beginPath()
          ctx.moveTo(A.px, A.py)
          ctx.lineTo(B.px, B.py)
          ctx.strokeStyle = grad
          ctx.lineWidth   = 0.65
          ctx.stroke()
          ctx.restore()
        }
      }
      // ───────────────────────────────────────────────────────────────────────

      for (const { lbl, px, py, alpha, projScale } of toDraw) {
        const clampedScale = Math.min(projScale * 1.1, 1.35)
        const iconSz  = Math.max(BASE_ICON, MAX_ICON * clampedScale)
        const fontSize= Math.max(BASE_FONT, MAX_FONT * Math.min(projScale, 1.25))

        ctx.font = `600 ${fontSize}px monospace`
        const textW  = ctx.measureText(lbl.name).width
        const pillW  = iconSz + PILL_PAD * 2 + textW + 8
        const pillH  = iconSz + PILL_PAD
        const pillX  = px - pillW / 2
        const pillY  = py - pillH / 2
        const pillR  = pillH / 2

        // ── Bounds guard: skip labels that overflow the canvas edge ──────────
        if (pillX < 0 || pillX + pillW > W) continue
        if (pillY < 0 || pillY + pillH > H) continue
        // ─────────────────────────────────────────────────────────────────────

        const img = imagesRef.current.get(lbl.name)

        ctx.save()
        ctx.globalAlpha = alpha

        // Pill background
        ctx.fillStyle   = 'rgba(4,16,30,0.82)'
        ctx.strokeStyle = `${lbl.color}55`
        ctx.lineWidth   = 1
        ctx.beginPath()
        ctx.moveTo(pillX + pillR, pillY)
        ctx.lineTo(pillX + pillW - pillR, pillY)
        ctx.quadraticCurveTo(pillX + pillW, pillY, pillX + pillW, pillY + pillR)
        ctx.lineTo(pillX + pillW, pillY + pillH - pillR)
        ctx.quadraticCurveTo(pillX + pillW, pillY + pillH, pillX + pillW - pillR, pillY + pillH)
        ctx.lineTo(pillX + pillR, pillY + pillH)
        ctx.quadraticCurveTo(pillX, pillY + pillH, pillX, pillY + pillH - pillR)
        ctx.lineTo(pillX, pillY + pillR)
        ctx.quadraticCurveTo(pillX, pillY, pillX + pillR, pillY)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()

        // Icon
        const iconX = pillX + PILL_PAD
        const iconY = py - iconSz / 2
        if (img && img.complete && img.naturalWidth > 0) {
          try {
            ctx.drawImage(img, iconX, iconY, iconSz, iconSz)
          } catch {
            ctx.fillStyle = lbl.color
            ctx.beginPath()
            ctx.arc(iconX + iconSz / 2, iconY + iconSz / 2, iconSz * 0.35, 0, Math.PI * 2)
            ctx.fill()
          }
        } else {
          ctx.fillStyle = lbl.color
          ctx.beginPath()
          ctx.arc(iconX + iconSz / 2, iconY + iconSz / 2, iconSz * 0.35, 0, Math.PI * 2)
          ctx.fill()
        }

        // Label text
        ctx.font         = `600 ${fontSize}px monospace`
        ctx.fillStyle    = lbl.color
        ctx.textAlign    = 'left'
        ctx.textBaseline = 'middle'
        ctx.fillText(lbl.name, iconX + iconSz + 4, py)

        ctx.restore()
      }

      // Auto-rotate with momentum decay
      if (!dragRef.current.active) {
        rotYRef.current += velYRef.current
        rotXRef.current += velXRef.current
        velYRef.current *= 0.96
        velXRef.current *= 0.94
        if (Math.abs(velYRef.current) < 0.0005) velYRef.current = 0.004
        rotXRef.current = Math.max(-1.1, Math.min(1.1, rotXRef.current))
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    draw()

    // ── Pointer / touch events ───────────────────────────────────────────────
    const onMouseDown = (e: MouseEvent) => {
      dragRef.current = { active: true, lastX: e.clientX, lastY: e.clientY }
      velYRef.current = 0
      velXRef.current = 0
    }
    const onMouseMove = (e: MouseEvent) => {
      if (!dragRef.current.active) return
      const dx = e.clientX - dragRef.current.lastX
      const dy = e.clientY - dragRef.current.lastY
      rotYRef.current += dx * 0.007
      rotXRef.current  = Math.max(-1.1, Math.min(1.1, rotXRef.current + dy * 0.007))
      velYRef.current  = dx * 0.007
      velXRef.current  = dy * 0.007
      dragRef.current.lastX = e.clientX
      dragRef.current.lastY = e.clientY
    }
    const onMouseUp = () => {
      dragRef.current.active = false
      if (Math.abs(velYRef.current) < 0.001) velYRef.current = 0.004
    }
    const onTouchStart = (e: TouchEvent) => {
      dragRef.current = { active: true, lastX: e.touches[0].clientX, lastY: e.touches[0].clientY }
      velYRef.current = 0
      velXRef.current = 0
    }
    const onTouchMove = (e: TouchEvent) => {
      if (!dragRef.current.active) return
      const dx = e.touches[0].clientX - dragRef.current.lastX
      const dy = e.touches[0].clientY - dragRef.current.lastY
      rotYRef.current += dx * 0.007
      rotXRef.current  = Math.max(-1.1, Math.min(1.1, rotXRef.current + dy * 0.007))
      velYRef.current  = dx * 0.007
      velXRef.current  = dy * 0.007
      dragRef.current.lastX = e.touches[0].clientX
      dragRef.current.lastY = e.touches[0].clientY
    }
    const onTouchEnd = () => {
      dragRef.current.active = false
      if (Math.abs(velYRef.current) < 0.001) velYRef.current = 0.004
    }

    canvas.addEventListener('mousedown',  onMouseDown)
    window.addEventListener('mousemove',  onMouseMove)
    window.addEventListener('mouseup',    onMouseUp)
    canvas.addEventListener('touchstart', onTouchStart, { passive: true })
    canvas.addEventListener('touchmove',  onTouchMove,  { passive: true })
    canvas.addEventListener('touchend',   onTouchEnd)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize',    resize)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup',   onMouseUp)
      canvas.removeEventListener('mousedown',  onMouseDown)
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove',  onTouchMove)
      canvas.removeEventListener('touchend',   onTouchEnd)
    }
  }, [])

  return (
    <div className="w-full h-full relative select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
      />
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-white/30 text-[10px] pointer-events-none">
        <span>⊕</span>
        <span>Drag to rotate</span>
      </div>
    </div>
  )
}