'use client'

import Link from 'next/link'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import {
  ArrowRight, FileText, MapPin, Briefcase,
  Lightbulb, ClipboardList, Brain, Code2, Search, FlaskConical, BookOpen, X,
} from 'lucide-react'
import { motion, useInView } from 'framer-motion'
import ResumeModal from '@/components/ResumeModal'
import EnquiryModal from '@/components/EnquirySection'
import VisitorLounge from '@/components/VisitorLounge'

// ─── Constants ────────────────────────────────────────────────────────────────
const ROLES = [

  'FULL STACK DEVELOPER',

  'DEVOPS ENGINEER', 

  'SOFTWARE ENGINEER',

  

  'OPEN SOURCE CONTRIBUTOR'

]

function getCirclePos(index: number, total: number, radiusX = 380, radiusY = 280) {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2
  return {
    top: '50%', left: '50%',
    transform: `translate(calc(-50% + ${radiusX * Math.cos(angle)}px), calc(-50% + ${radiusY * Math.sin(angle)}px))`,
  }
}

const iconDefs = [
  { id: 'react',      label: 'React',      color: '#61DAFB', svg: <svg viewBox="0 0 24 24" fill="none" className="w-full h-full"><circle cx="12" cy="12" r="2.5" fill="#61DAFB"/><ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1.2" fill="none"/><ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1.2" fill="none" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1.2" fill="none" transform="rotate(120 12 12)"/></svg> },
  { id: 'nextjs',     label: 'Next.js',    color: '#ffffff', svg: <svg viewBox="0 0 24 24" fill="none" className="w-full h-full"><circle cx="12" cy="12" r="10" fill="#ffffff10" stroke="#ffffff40" strokeWidth="1"/><path d="M7 17V7l8 10V7" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 7h3" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round"/></svg> },
  { id: 'typescript', label: 'TypeScript', color: '#3178C6', svg: <svg viewBox="0 0 24 24" className="w-full h-full"><rect x="2" y="2" width="20" height="20" rx="3" fill="#3178C6"/><path d="M13.5 11H10v1.5h1.5V17h1.5v-4.5H14.5V11H13.5z" fill="white"/><path d="M8 11v1h1.5v5h1.5v-5H12.5v-1H8z" fill="white"/></svg> },
  { id: 'python',     label: 'Python',     color: '#3776AB', svg: <svg viewBox="0 0 24 24" fill="none" className="w-full h-full"><path d="M12 2C9.5 2 7.5 3 7.5 5v2H12v1H5.5C3.5 8 2 9.5 2 12s1.5 4 3.5 4H7v-2.5C7 11.5 9 10 12 10s5 1.5 5 3.5V16h1.5c2 0 3.5-1.5 3.5-4s-1.5-4-3.5-4H17V5C17 3 15 2 12 2z" fill="#3776AB"/><path d="M12 22c2.5 0 4.5-1 4.5-3v-2H12v-1h6.5c2 0 3.5-1.5 3.5-4s-1.5-4-3.5-4H17v2.5C17 12.5 15 14 12 14s-5-1.5-5-3.5V8H5.5C3.5 8 2 9.5 2 12s1.5 4 3.5 4H7v3c0 2 2 3 5 3z" fill="#FFD43B"/><circle cx="10" cy="5.5" r="1" fill="white"/><circle cx="14" cy="18.5" r="1" fill="white"/></svg> },
  { id: 'docker',     label: 'Docker',     color: '#2496ED', svg: <svg viewBox="0 0 24 24" fill="none" className="w-full h-full"><path d="M13 8h2v2h-2V8zM10 8h2v2h-2V8zM7 8h2v2H7V8zM10 5h2v2h-2V5zM13 5h2v2h-2V5z" fill="#2496ED"/><path d="M22 11.5c-.5-.5-1.5-.7-2.3-.5-.2-.8-.8-1.5-1.7-1.8l-.4-.1-.2.4c-.3.6-.3 1.5 0 2.1-.4.2-1 .4-1.5.4H2.1l-.1.4c-.2 1.1 0 2.5.8 3.5.8 1 2 1.5 3.6 1.5 3.4 0 5.9-1.5 7.1-4.3.5.1 1.5.1 2-.5.3-.3.5-.8.5-1.3l-.1-.4-.4.1z" fill="#2496ED"/></svg> },
  { id: 'git',        label: 'Git',        color: '#F05032', svg: <svg viewBox="0 0 24 24" fill="none" className="w-full h-full"><path d="M21.7 11.3l-9-9a1 1 0 00-1.4 0l-2 2 2.5 2.5a1.2 1.2 0 011.5 1.5l2.4 2.4a1.2 1.2 0 011.1 2 1.2 1.2 0 01-2.3-.5l-2.3-2.3v6a1.2 1.2 0 01.8 2.2 1.2 1.2 0 01-2.4 0 1.2 1.2 0 01.8-1.1V10a1.2 1.2 0 01-.8-1.6L9.9 6 2.3 13.7a1 1 0 000 1.4l9 9a1 1 0 001.4 0l9-9a1 1 0 000-1.7z" fill="#F05032"/></svg> },
  { id: 'fastapi',    label: 'Flask',      color: '#009688', svg: <svg viewBox="0 0 24 24" fill="none" className="w-full h-full"><circle cx="12" cy="12" r="10" fill="#009688"/><path d="M13 4l-5 9h4l-1 7 5-9h-4l1-7z" fill="white"/></svg> },
  { id: 'nodejs',     label: 'Node.js',    color: '#339933', svg: <svg viewBox="0 0 24 24" fill="none" className="w-full h-full"><path d="M12 2L3 7v10l9 5 9-5V7L12 2z" fill="#339933" fillOpacity="0.2" stroke="#339933" strokeWidth="1.2"/><path d="M12 6v6l5 3" stroke="#339933" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { id: 'tailwind',   label: 'Tailwind',   color: '#06B6D4', svg: <svg viewBox="0 0 24 24" fill="none" className="w-full h-full"><path d="M12 6c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.3.74 1.91 1.35C13.37 10.8 14.33 12 16 12c2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.3-.74-1.91-1.35C14.63 7.2 13.67 6 12 6zm-5 6c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.3.74 1.91 1.35C8.37 16.8 9.33 18 11 18c2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.3-.74-1.91-1.35C9.63 13.2 8.67 12 7 12z" fill="#06B6D4"/></svg> },
  { id: 'mongodb',    label: 'MongoDB',    color: '#47A248', svg: <svg viewBox="0 0 24 24" fill="none" className="w-full h-full"><path d="M12 2C12 2 8 6 8 12s4 10 4 10 4-4 4-10S12 2 12 2z" fill="#47A248" fillOpacity="0.7" stroke="#47A248" strokeWidth="1"/><path d="M12 6v12" stroke="#47A248" strokeWidth="1.5" strokeLinecap="round"/></svg> },
]
const icons = iconDefs.map((def, i) => ({ ...def, pos: getCirclePos(i, iconDefs.length, 380, 280) }))

// ─── Data ─────────────────────────────────────────────────────────────────────
const FEATURED_PROJECTS = [
  { name: 'RealityCheck AI', desc: '3-model EfficientNet ensemble + 7-channel forensic engine for deepfake & AI-generated image detection. Real-time WebSocket progress, batch processing, zero data persistence.', tags: ['Next.js 15','PyTorch','OpenCV','Socket.IO'], color: '#00d9ff' },
  { name: 'Streakly',        desc: 'Mobile-first habit tracker with streak logic, calendar heatmap, stats dashboard, and Supabase Row-Level Security for complete user data isolation at the database level.', tags: ['React','Supabase','PostgreSQL','Vite'], color: '#f59e0b' },
  { name: 'InkBoard',        desc: 'Infinite canvas whiteboard with pressure-aware drawing, shape/text annotation, laser pointer presentation mode, and minimap navigation — engineered for 60fps interactions.', tags: ['React','Fabric.js','TypeScript','Vite'], color: '#a78bfa' },
]

const WORKFLOW = [
  { icon: Lightbulb,     label: 'IDEA',    color: '#f59e0b' },
  { icon: ClipboardList, label: 'PLAN',    color: '#f97316' },
  { icon: Brain,         label: 'AI HELP', color: '#a78bfa' },
  { icon: Code2,         label: 'CODE',    color: '#00d9ff' },
  { icon: Search,        label: 'REVIEW',  color: '#ec4899' },
  { icon: FlaskConical,  label: 'TEST',    color: '#f43f5e' },
  { icon: BookOpen,      label: 'LEARN',   color: '#ffffff' },
]

const PERSONA_CARDS = [
  { label: 'SHIP',   desc: 'Every project deployed and live. Production-grade or it doesn\'t count.', color: '#a78bfa' },
  { label: 'SCALE',  desc: 'Infrastructure that doesn\'t sleep — CI/CD, containers, cloud-first.',    color: '#00d9ff' },
  { label: 'SECURE', desc: 'Privacy-first design. Row-Level Security. Zero data persistence.',        color: '#f59e0b' },
]

// ─── Liquid Button ────────────────────────────────────────────────────────────
interface LiquidButtonProps {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  variant?: 
  | 'white'
  | 'dark'
  | 'cyan'
  | 'red'
  | 'blue'
  | 'emerald'
  | 'lime'
  | 'teal'
  | 'indigo'
  | 'violet'
  | 'purple'
  | 'pink'
  | 'rose'
  | 'orange'
  | 'amber'
  | 'yellow'
  | 'slate'
  | 'gray'
  | 'zinc'
  | 'sky'
  | 'azure'
  | 'gold'
  | 'silver'
  | 'navy'
  | 'charcoal'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  target?: string
  rel?: string
  icon?: React.ReactNode
}

function LiquidButton({ children, href, onClick, variant = 'dark', size = 'md', className = '', target, rel, icon }: LiquidButtonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef   = useRef<number>(0)
  const phaseRef  = useRef(0)
  const fillRef   = useRef(0)
  const targetRef = useRef(0)
  const isHovRef  = useRef(false)

const COLORS: Record<string, { wave: string; bg: string; text: string; border: string; textHov: string }> = {
  white: { wave: 'rgba(255,255,255,0.95)', bg: 'rgba(255,255,255,0.10)', text: 'rgba(255,255,255,0.85)', border: 'rgba(255,255,255,0.22)', textHov: '#0a1a28' },
  dark:  { wave: 'rgba(255,255,255,0.18)', bg: 'rgba(255,255,255,0.05)', text: 'rgba(255,255,255,0.70)', border: 'rgba(255,255,255,0.14)', textHov: 'rgba(255,255,255,1)' },
  cyan:  { wave: 'rgba(0,217,255,0.55)',   bg: 'rgba(0,217,255,0.05)',   text: 'rgba(0,217,255,0.80)',  border: 'rgba(0,217,255,0.28)',  textHov: '#fff' },
  red:   { wave: 'rgba(234,67,53,0.70)',   bg: 'rgba(234,67,53,0.07)',   text: 'rgba(234,67,53,0.80)',  border: 'rgba(234,67,53,0.22)',  textHov: '#fff' },
  blue:  { wave: 'rgba(10,102,194,0.70)',  bg: 'rgba(10,102,194,0.07)',  text: 'rgba(10,102,194,0.85)', border: 'rgba(10,102,194,0.24)', textHov: '#fff' },
  emerald: { wave: 'rgba(16,185,129,0.65)', bg: 'rgba(16,185,129,0.06)', text: 'rgba(16,185,129,0.85)', border: 'rgba(16,185,129,0.25)', textHov: '#fff' },
  lime:    { wave: 'rgba(132,204,22,0.65)', bg: 'rgba(132,204,22,0.06)', text: 'rgba(132,204,22,0.85)', border: 'rgba(132,204,22,0.25)', textHov: '#000' },
  teal:    { wave: 'rgba(20,184,166,0.65)', bg: 'rgba(20,184,166,0.06)', text: 'rgba(20,184,166,0.85)', border: 'rgba(20,184,166,0.25)', textHov: '#fff' },
  indigo:  { wave: 'rgba(99,102,241,0.70)', bg: 'rgba(99,102,241,0.06)', text: 'rgba(99,102,241,0.85)', border: 'rgba(99,102,241,0.25)', textHov: '#fff' },
  violet:  { wave: 'rgba(139,92,246,0.70)', bg: 'rgba(139,92,246,0.06)', text: 'rgba(139,92,246,0.85)', border: 'rgba(139,92,246,0.25)', textHov: '#fff' },
  purple:  { wave: 'rgba(168,85,247,0.70)', bg: 'rgba(168,85,247,0.06)', text: 'rgba(168,85,247,0.85)', border: 'rgba(168,85,247,0.25)', textHov: '#fff' },
  pink:    { wave: 'rgba(236,72,153,0.70)', bg: 'rgba(236,72,153,0.06)', text: 'rgba(236,72,153,0.85)', border: 'rgba(236,72,153,0.25)', textHov: '#fff' },
  rose:    { wave: 'rgba(244,63,94,0.70)',  bg: 'rgba(244,63,94,0.06)',  text: 'rgba(244,63,94,0.85)',  border: 'rgba(244,63,94,0.25)',  textHov: '#fff' },
  orange:  { wave: 'rgba(249,115,22,0.70)', bg: 'rgba(249,115,22,0.06)', text: 'rgba(249,115,22,0.85)', border: 'rgba(249,115,22,0.25)', textHov: '#fff' },
  amber:   { wave: 'rgba(245,158,11,0.70)', bg: 'rgba(245,158,11,0.06)', text: 'rgba(245,158,11,0.85)', border: 'rgba(245,158,11,0.25)', textHov: '#000' },
  yellow:  { wave: 'rgba(234,179,8,0.70)',  bg: 'rgba(234,179,8,0.06)',  text: 'rgba(234,179,8,0.85)',  border: 'rgba(234,179,8,0.25)',  textHov: '#000' },
  slate:   { wave: 'rgba(100,116,139,0.60)', bg: 'rgba(100,116,139,0.06)', text: 'rgba(148,163,184,0.85)', border: 'rgba(100,116,139,0.25)', textHov: '#fff' },
  gray:    { wave: 'rgba(156,163,175,0.60)', bg: 'rgba(156,163,175,0.06)', text: 'rgba(156,163,175,0.85)', border: 'rgba(156,163,175,0.25)', textHov: '#fff' },
  zinc:    { wave: 'rgba(113,113,122,0.60)', bg: 'rgba(113,113,122,0.06)', text: 'rgba(161,161,170,0.85)', border: 'rgba(113,113,122,0.25)', textHov: '#fff' },
  sky:     { wave: 'rgba(56,189,248,0.70)', bg: 'rgba(56,189,248,0.06)', text: 'rgba(56,189,248,0.85)', border: 'rgba(56,189,248,0.25)', textHov: '#fff' },
  azure:   { wave: 'rgba(0,127,255,0.70)',  bg: 'rgba(0,127,255,0.06)',  text: 'rgba(0,127,255,0.85)',  border: 'rgba(0,127,255,0.25)',  textHov: '#fff' },
  gold:    { wave: 'rgba(255,215,0,0.70)',  bg: 'rgba(255,215,0,0.06)',  text: 'rgba(255,215,0,0.85)',  border: 'rgba(255,215,0,0.25)',  textHov: '#000' },
  silver:  { wave: 'rgba(192,192,192,0.70)',bg: 'rgba(192,192,192,0.06)',text: 'rgba(192,192,192,0.85)',border: 'rgba(192,192,192,0.25)',textHov: '#000' },
  navy:    { wave: 'rgba(15,23,42,0.80)',   bg: 'rgba(15,23,42,0.10)',   text: 'rgba(148,163,184,0.85)', border: 'rgba(15,23,42,0.30)', textHov: '#fff' },
  charcoal:{ wave: 'rgba(30,41,59,0.80)',   bg: 'rgba(30,41,59,0.10)',   text: 'rgba(203,213,225,0.85)', border: 'rgba(30,41,59,0.30)', textHov: '#fff' },
};

  const PAD = { sm: '10px 20px', md: '12px 28px', lg: '14px 36px' }
  const FS  = { sm: '11px', md: '13px', lg: '15px' }
  const c = COLORS[variant]

  const textRef = useRef<HTMLSpanElement>(null)

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
      textRef.current.style.mixBlendMode = 'normal'
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

  const btnRef = useRef<HTMLElement>(null)
  const addRipple = (e: React.MouseEvent) => {
    const el = btnRef.current; if (!el) return
    const r = document.createElement('span')
    const rect = el.getBoundingClientRect()
    r.style.cssText = `position:absolute;width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,0.45);pointer-events:none;transform:scale(0);animation:liqRip 0.6s ease-out forwards;left:${e.clientX-rect.left-4}px;top:${e.clientY-rect.top-4}px;z-index:4`
    el.appendChild(r)
    setTimeout(() => r.remove(), 700)
  }

  const commonStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '7px',
    padding: PAD[size],
    borderRadius: '100px',
    border: `1px solid ${c.border}`,
    background: c.bg,
    cursor: 'pointer',
    overflow: 'hidden',
    fontFamily: 'DM Sans,sans-serif',
    fontSize: FS[size],
    fontWeight: 600,
    letterSpacing: '0.3px',
    textDecoration: 'none',
    transition: 'transform 0.2s cubic-bezier(.34,1.56,.64,1), border-color 0.2s ease, box-shadow 0.2s ease',
    boxShadow: `0 2px 12px rgba(0,0,0,0.25)`,
  }

  const innerContent = (
    <>
      <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%', zIndex:1, borderRadius:'100px' }} />
      <span style={{ position:'absolute', top:'3px', left:'12%', right:'12%', height:'35%', background:'linear-gradient(to bottom,rgba(255,255,255,0.18) 0%,transparent 100%)', borderRadius:'100px', zIndex:2, pointerEvents:'none' }} />
      <span ref={textRef} style={{ position:'relative', zIndex:3, display:'flex', alignItems:'center', gap:'7px', transition:'color 0.15s ease', color: c.text }}>
        {icon}{children}
      </span>
    </>
  )

  if (href) {
    return (
      <Link
        href={href}
        target={target}
        rel={rel}
        ref={btnRef as React.Ref<HTMLAnchorElement>}
        style={commonStyle}
        className={className}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onClick={addRipple}
      >
        {innerContent}
      </Link>
    )
  }

  return (
    <button
      ref={btnRef as React.Ref<HTMLButtonElement>}
      style={commonStyle}
      className={className}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={(e) => { addRipple(e); onClick?.() }}
    >
      {innerContent}
    </button>
  )
}

// ─── Reusable components ──────────────────────────────────────────────────────
function FadeSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 44 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}>
      {children}
    </motion.div>
  )
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-10">
      <p className="text-white/25 text-xs tracking-[0.35em] uppercase mb-2" style={{ fontFamily: 'DM Sans,sans-serif' }}>{eyebrow}</p>
      <h2 style={{ fontFamily: 'Comfortaa,cursive', fontWeight: 700, color: '#fff', fontSize: 'clamp(2rem,5vw,3rem)' }}>{title}</h2>
    </div>
  )
}

function ViewMore({ href, label }: { href: string; label: string; color?: string }) {
  return (
    <div className="flex justify-center mt-10">
      <LiquidButton href={href} variant="cyan" size="md" icon={null}>
        {label} <ArrowRight className="w-4 h-4" />
      </LiquidButton>
    </div>
  )
}

function Divider() {
  return <div className="w-full max-w-4xl mx-auto h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
}

// ─── India Hover Card ─────────────────────────────────────────────────────────
function IndiaHoverCard() {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="rounded-2xl relative overflow-hidden select-none"
      style={{
        background: '#0d0d0d',
        border: `1px solid ${hovered ? 'rgba(0,217,255,0.25)' : 'rgba(255,255,255,0.06)'}`,
        minHeight: 200,
        transition: 'border-color .3s',
        cursor: 'default',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        className="absolute inset-0 p-6 flex flex-col justify-between z-10"
        animate={{ opacity: hovered ? 0 : 1, y: hovered ? -8 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 70% 60%,rgba(0,217,255,0.1) 0%,transparent 65%)' }} />
        <div className="relative flex items-center gap-1.5 text-white/30 text-xs" style={{ fontFamily: 'DM Mono,monospace' }}>
          <MapPin className="w-3 h-3" /> LOCATION · HOVER TO EXPLORE
        </div>
        <div className="relative">
          <div className="text-white font-bold text-3xl mb-1.5" style={{ fontFamily: 'Comfortaa,cursive' }}>PUNE</div>
          <div className="text-white/35 text-xs mb-0.5" style={{ fontFamily: 'DM Mono,monospace' }}>18.5204° N, 73.8567° E</div>
          <div className="text-white/25 text-xs" style={{ fontFamily: 'DM Mono,monospace' }}>GMT+5:30</div>
        </div>
      </motion.div>

      <motion.div
        className="absolute inset-0 rounded-2xl overflow-hidden"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* HD Pune Landscape Background Image */}
        <img
          src="/pune.png"
          alt="Pune Landscape"
          className="w-full h-full object-cover"
        />
        {/* Dark overlay for contrast and grid line pattern overlay */}
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(0,217,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,217,255,0.04) 1px,transparent 1px)', backgroundSize: '20px 20px' }} />
        {hovered && (
          <motion.div
            className="absolute left-0 right-0 h-0.5 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(90deg,transparent,rgba(0,217,255,0.7),transparent)' }}
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 3, ease: 'linear', repeat: Infinity }}
          >
            <div style={{ height: 50, marginTop: -50, background: 'linear-gradient(to bottom,transparent,rgba(0,217,255,0.06))' }} />
          </motion.div>
        )}
        <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end z-20">
          <span className="text-[#00d9ff]/60 text-[10px]" style={{ fontFamily: 'DM Mono,monospace' }}>PUNE · GMT+5:30</span>
          <span className="text-[#00d9ff]/35 text-[9px]" style={{ fontFamily: 'DM Mono,monospace' }}>18.52°N 73.86°E</span>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [roleIndex, setRoleIndex]     = useState(0)
  const [visible, setVisible]         = useState(true)
  const [resumeOpen, setResumeOpen]   = useState(false)
  const [loungeOpen, setLoungeOpen]   = useState(false)
  const [loungeActiveCount, setLoungeActiveCount] = useState(1)
  const [devforgeOpen, setDevforgeOpen] = useState(false)
  const wordRef = useRef<HTMLSpanElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  const fitWord = useCallback(() => {
    const wrap = wrapRef.current, word = wordRef.current
    if (!wrap || !word) return
    let size = 120; word.style.fontSize = size + 'px'
    while (word.scrollWidth > wrap.offsetWidth && size > 32) { size -= 2; word.style.fontSize = size + 'px' }
  }, [])

  useEffect(() => { fitWord(); window.addEventListener('resize', fitWord); return () => window.removeEventListener('resize', fitWord) }, [fitWord])
  useEffect(() => { fitWord() }, [roleIndex, fitWord])
  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false)
      setTimeout(() => { setRoleIndex(i => (i + 1) % ROLES.length); setVisible(true) }, 350)
    }, 2600)
    return () => clearInterval(t)
  }, [])
  useEffect(() => {
    fetch('/api/track', { method: 'POST' })
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;700&display=swap');
        .hero-name{font-family:'Comfortaa',cursive;font-weight:700;color:#fff}
        .hero-sub{font-family:'Comfortaa',cursive;font-weight:300}
        .hero-role{font-family:'Comfortaa',cursive;font-weight:700;background:linear-gradient(90deg,#f59e0b,#00d9ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;white-space:nowrap;display:block;text-align:center;width:100%;line-height:1;letter-spacing:-0.02em}
        .role-word-wrap{width:100%;display:flex;justify-content:center;overflow:hidden}
        .icon-float{animation:floatIcon var(--dur,5s) ease-in-out infinite;animation-delay:var(--delay,0s);position:absolute}
        @keyframes floatIcon{0%,100%{margin-top:0}33%{margin-top:-10px}66%{margin-top:5px}}
        .role-in{opacity:1;transform:translateY(0) scale(1);transition:opacity .35s ease,transform .35s ease}
        .role-out{opacity:0;transform:translateY(12px) scale(0.97);transition:opacity .35s ease,transform .35s ease}
        .dot-pill{transition:width .35s ease,background .35s ease}
        .circle-bg{position:absolute;border-radius:50%;border:1px solid rgba(255,255,255,0.04);pointer-events:none}
        .proj-card{transition:border-color .25s ease,transform .25s ease,box-shadow .25s ease}
        .proj-card:hover{transform:translateY(-4px);box-shadow:0 16px 48px rgba(0,0,0,0.5)}
        @keyframes liqRip{to{transform:scale(24);opacity:0}}
        @keyframes dfScroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes dfPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.3;transform:scale(0.75)}}
        @keyframes dfFadeUp{from{opacity:0;transform:translateY(16px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
      `}</style>

      <div className="bg-[#0a0a0a] text-white">

        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {[300,520,760,1000].map(s => (
            <div key={s} className="circle-bg" style={{ width:s, height:s, top:'50%', left:'50%', transform:'translate(-50%,-50%)' }} />
          ))}
          {icons.map((icon, i) => (
            <div key={icon.id} className="icon-float flex flex-col items-center gap-1.5"
              style={{ top:icon.pos.top, left:icon.pos.left, transform:icon.pos.transform,
                '--dur':`${4.5+(i%4)*0.8}s`, '--delay':`${i*0.4}s` } as React.CSSProperties}>
              <div className="w-10 h-10 rounded-xl p-1.5" style={{ background:`${icon.color}12`, border:`1px solid ${icon.color}30` }}>{icon.svg}</div>
              <span className="text-xs hero-sub" style={{ color:`${icon.color}80` }}>{icon.label}</span>
            </div>
          ))}
          <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pt-16 w-full">
            <p className="hero-sub text-white/30 text-lg md:text-xl tracking-[0.25em] uppercase mb-4">Hello! I&apos;m</p>
            <h1 className="hero-name text-5xl md:text-7xl mb-2 leading-none tracking-tight">Saqib Patel</h1>
            <p className="hero-sub text-white/30 text-base md:text-xl tracking-wide mb-6">
              A passionate <span className="text-[#00d9ff]/70">Full-Stack</span> &amp; <span className="text-[#f59e0b]/70">DevOps</span> Engineer
            </p>
            <div ref={wrapRef} className="role-word-wrap mb-4">
              <span ref={wordRef} className={`hero-role ${visible?'role-in':'role-out'}`}>{ROLES[roleIndex]}</span>
            </div>
            <div className="flex items-center justify-center gap-2 mb-10">
              {ROLES.map((_,i) => (
                <div key={i} className="dot-pill rounded-full"
                  style={{ height:'5px', width:i===roleIndex?'28px':'5px', background:i===roleIndex?'#00d9ff':'rgba(255,255,255,0.15)' }} />
              ))}
            </div>
            <p className="hero-sub text-white/35 text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Building full-stack products and deploying <span className="text-white/60">infrastructure that doesn&apos;t sleep</span>. Crafting scalable <span className="text-white/60">web applications</span> and <span className="text-white/60">DevOps pipelines</span>.
            </p>

            {/* ── CTA Buttons ── */}
            <div className="flex justify-center items-center gap-4 flex-wrap">

              {/* Lounge Button */}
              <div className="relative inline-flex">
                <LiquidButton
                  onClick={() => setLoungeOpen(true)}
                  variant="navy"
                  size="lg"
                  icon={
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  }
                >
                  Lounge
                </LiquidButton>

                {loungeActiveCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex items-center gap-1 bg-[#0a0a0a] border border-[#00d9ff]/40 text-[#00d9ff] text-[9px] px-1.5 py-0.5 rounded-full z-10">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00D9FF] animate-pulse inline-block" />
                    {loungeActiveCount}
                  </span>
                )}
              </div>

              {/* Resume Button */}
              <LiquidButton
                onClick={() => setResumeOpen(true)}
                variant="cyan"
                size="lg"
                icon={<FileText className="w-3.5 h-3.5" />}
              >
                Resume &amp; CV
              </LiquidButton>

              {/* GitHub Button */}
              <LiquidButton
                href="https://github.com/Saqib-Patel"
                target="_blank"
                rel="noopener noreferrer"
                variant="emerald"
                size="lg"
                icon={<Code2 className="w-3.5 h-3.5" />}
              >
                GitHub
              </LiquidButton>

            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-25 pointer-events-none">
            <span className="text-white text-[10px] tracking-[0.2em] uppercase" style={{ fontFamily:'DM Sans,sans-serif' }}></span>
            <motion.div className="w-px h-8 bg-white" animate={{ scaleY:[0.2,1,0.2], opacity:[0.2,0.6,0.2] }} transition={{ duration:2, repeat:Infinity }} />
          </div>
        </section>

        <section className="py-28 px-6">
          <FadeSection className="w-full max-w-4xl mx-auto">
            <SectionHeader eyebrow="Featured Work" title="Projects" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {FEATURED_PROJECTS.map(p => (
                <div key={p.name} className="proj-card rounded-2xl p-5 flex flex-col gap-3"
                  style={{ background:'#0d0d0d', border:`1px solid ${p.color}18` }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor=`${p.color}45`)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor=`${p.color}18`)}>
                  <div className="w-8 h-0.5 rounded-full" style={{ background:p.color }} />
                  <h3 className="text-white font-semibold text-lg" style={{ fontFamily:'DM Sans,sans-serif' }}>{p.name}</h3>
                  <p className="text-white/40 text-sm leading-relaxed flex-1" style={{ fontFamily:'DM Sans,sans-serif' }}>{p.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.tags.map(t => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background:`${p.color}08`, color:`${p.color}90`, border:`1px solid ${p.color}18`, fontFamily:'DM Mono,monospace' }}>{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <ViewMore href="/projects" label="View All Projects" color="#00d9ff" />
          </FadeSection>
        </section>

        <Divider />

        <section className="py-28 px-6">
          <FadeSection className="w-full max-w-4xl mx-auto">
            <SectionHeader eyebrow="Who I Am" title="About Me" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <IndiaHoverCard />
              <div className="rounded-2xl p-6 flex flex-col justify-between gap-4"
                style={{ background:'#0d0d0d', border:'1px solid rgba(255,255,255,0.06)', minHeight:200 }}>
                <div>
                  <p className="text-white/20 text-xs tracking-widest mb-3" style={{ fontFamily:'DM Mono,monospace' }}>/ ABOUT</p>
                  <p className="text-white/60 text-sm leading-relaxed" style={{ fontFamily:'DM Sans,sans-serif' }}>
                    I&apos;m Saqib — a Full Stack Developer &amp; DevOps Engineer based in Pune, India. I build production-grade web applications and deploy scalable infrastructure. I care deeply about clean architecture, automation, and shipping products that work.
                  </p>
                </div>
                <p className="text-white/15 text-xs italic border-t border-white/5 pt-4" style={{ fontFamily:'DM Sans,sans-serif' }}>
                  &quot;Building full-stack products and deploying infrastructure that doesn&apos;t sleep.&quot;
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {PERSONA_CARDS.map((c) => (
                <div key={c.label} className="rounded-xl p-4"
                  style={{ background:`${c.color}0d`, border:`1px solid ${c.color}30` }}>
                  <div className="text-xs font-bold tracking-widest mb-2"
                    style={{ color:c.color, fontFamily:'DM Mono,monospace' }}>{c.label}</div>
                  <p className="text-xs leading-relaxed"
                    style={{ color:'rgba(255,255,255,0.55)', fontFamily:'DM Sans,sans-serif' }}>
                    {c.desc}
                  </p>
                </div>
              ))}
            </div>
            <ViewMore href="/about" label="View Persona" color="#00d9ff" />
          </FadeSection>
        </section>

        <Divider />

        <section className="py-28 px-6">
          <FadeSection className="w-full max-w-4xl mx-auto">
            <SectionHeader eyebrow="Education & Work" title="Experience" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-5">
                <div className="relative pl-5 border-l border-white/10">
                  <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#00d9ff]"
                    style={{ boxShadow:'0 0 8px rgba(0,217,255,0.5)' }} />
                  <span className="text-[#00d9ff]/60 text-xs tracking-widest" style={{ fontFamily:'DM Mono,monospace' }}>2022 — 2026</span>
                  <h3 className="text-white font-semibold text-lg mt-1" style={{ fontFamily:'DM Sans,sans-serif' }}>Bachelor of Technology</h3>
                  <p className="text-white/50 text-sm" style={{ fontFamily:'DM Sans,sans-serif' }}>Computer Science & Engineering</p>
                  <p className="text-white/30 text-xs mt-0.5" style={{ fontFamily:'DM Sans,sans-serif' }}>N.K. Orchid College of Engineering, Solapur</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[#f59e0b] font-bold text-sm">CGPA: 7.7</span>
                    <span className="text-white/20 text-xs">/10</span>
                  </div>
                </div>

                <div className="w-full overflow-hidden rounded-xl border border-white/10 hover:border-[#00d9ff]/30 transition-all duration-500"
                  style={{ height: 150 }}>
                  <img
                    src="/college.png"
                    alt="N.K. Orchid College of Engineering"
                    className="w-full h-full object-cover grayscale brightness-[0.6] contrast-[1.1] hover:grayscale-0 hover:brightness-[0.9] hover:scale-[1.02] transition-all duration-700 ease-out cursor-pointer"
                  />
                </div>
              </div>

              <div className="rounded-2xl p-6 h-fit" style={{ background:'#0d0d0d', border:'1px solid rgba(139,92,246,0.18)' }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-[#8b5cf6]/55 text-xs tracking-widest" style={{ fontFamily:'DM Mono,monospace' }}>INTERN EXPERIENCE</span>
                    <h3 className="text-white font-semibold text-xl mt-1.5 leading-snug" style={{ fontFamily:'DM Sans,sans-serif' }}>SDE Intern</h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background:'rgba(139,92,246,0.08)', border:'1px solid rgba(139,92,246,0.18)' }}>
                    <Briefcase className="w-4 h-4 text-[#8b5cf6]/70" />
                  </div>
                </div>
                <p className="text-[#8b5cf6]/80 text-sm font-semibold mb-1" style={{ fontFamily:'DM Sans,sans-serif' }}>ITJOBXS · Internship</p>
                <p className="text-white/30 text-xs mb-4" style={{ fontFamily:'DM Mono,monospace' }}>Feb 2026 – May 2026 · Remote</p>
                <ul className="space-y-2 mb-5">
                  {[
                    'Designed & developed a fully responsive webpage section for itjobxs.com',
                    'Built User Verification/Authentication + bot & fake-post detection systems',
                    'Integrated Google reCAPTCHA — website protection layer',
                  ].map((item, i) => (
                    <li key={i} className="text-white/40 text-sm leading-relaxed flex items-start gap-2" style={{ fontFamily:'DM Sans,sans-serif' }}>
                      <span className="text-[#8b5cf6] mt-0.5 flex-shrink-0">▸</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-1.5">
                  {['HTML','CSS','JS','Bootstrap','PHP','MySQL'].map(t => (
                    <span key={t} className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background:'rgba(139,92,246,0.07)', color:'rgba(139,92,246,0.65)', border:'1px solid rgba(139,92,246,0.14)', fontFamily:'DM Mono,monospace' }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </FadeSection>
        </section>

        <Divider />

        <section className="py-28 px-6">
          <FadeSection className="w-full max-w-4xl mx-auto">
            <SectionHeader eyebrow="Skills · Workflow · Identity" title="Reach Out" />

            <div className="rounded-2xl p-6 relative overflow-hidden"
              style={{ background:'#0d0d0d', border:'1px solid rgba(255,255,255,0.06)' }}>
              <div className="absolute inset-0 pointer-events-none"
                style={{ background:'radial-gradient(ellipse at 50% 50%,rgba(167,139,250,0.04) 0%,transparent 70%)' }} />

              <p className="text-white/20 text-xs tracking-[0.3em] uppercase mb-6 relative z-10"
                style={{ fontFamily:'DM Mono,monospace' }}>WORKFLOW</p>

              <div className="flex items-center justify-between gap-1 overflow-x-auto relative z-10">
                {WORKFLOW.map((w, i) => {
                  const Icon = w.icon
                  return (
                    <React.Fragment key={w.label}>
                      <motion.div className="flex flex-col items-center gap-2.5 min-w-[52px] cursor-pointer group"
                        whileHover={{ scale:1.12 }} transition={{ type:'spring', stiffness:400, damping:20 }}>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:shadow-[0_0_18px_rgba(255,255,255,0.07)] transition-all duration-300"
                          style={{ background:`${w.color}0d`, border:`1px solid ${w.color}22` }}>
                          <Icon className="w-5 h-5" style={{ color:w.color }} />
                        </div>
                        <span className="text-white/30 text-[10px] tracking-wider whitespace-nowrap group-hover:text-white/65 transition-colors duration-200"
                          style={{ fontFamily:'DM Sans,sans-serif' }}>{w.label}</span>
                      </motion.div>
                      {i < WORKFLOW.length-1 && (
                        <motion.div className="flex-1 h-px min-w-[8px]"
                          style={{ background:`linear-gradient(90deg,${WORKFLOW[i].color}40,${WORKFLOW[i+1].color}40)` }}
                          initial={{ scaleX:0, opacity:0 }} whileInView={{ scaleX:1, opacity:1 }}
                          transition={{ duration:0.4, delay:i*0.1 }} viewport={{ once:true }} />
                      )}
                    </React.Fragment>
                  )
                })}
              </div>

              <div className="mt-7 mb-6 h-px w-full relative z-10"
                style={{ background:'rgba(255,255,255,0.05)' }} />

              <p className="text-white/20 text-xs tracking-[0.3em] uppercase mb-4 relative z-10"
                style={{ fontFamily:'DM Mono,monospace' }}>Hit Me Up</p>

              <div className="flex items-center gap-3 flex-wrap relative z-10">
                <LiquidButton
                  href="mailto:mspatel7721@gmail.com"
                  variant="red"
                  size="sm"
                  icon={
                    <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                  }
                >Mail</LiquidButton>

                <LiquidButton
                  href="https://github.com/saqib-patel"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="charcoal"
                  size="sm"
                  icon={
                    <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                    </svg>
                  }
                >GitHub</LiquidButton>

                <LiquidButton
                  href="https://linkedin.com/in/mohammedsaqibpatel"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="blue"
                  size="sm"
                  icon={
                    <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  }
                >LinkedIn</LiquidButton>
              </div>
            </div>
          </FadeSection>
        </section>
      </div>

      {loungeOpen && (
        <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6 pt-16">
          <div
            className="relative w-full h-[calc(100vh-64px)] sm:h-auto sm:w-[min(980px,95vw)] rounded-t-2xl sm:rounded-2xl border border-cyan-400/20 bg-[#070b14]/95 overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.7)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLoungeOpen(false)}
              className="absolute top-14 right-3 z-[130] h-9 w-9 rounded-xl border border-white/15 bg-white/5 text-white/60 hover:text-white hover:border-cyan-300/40 transition"
              aria-label="Close lounge"
            >
              <X className="w-4 h-4 mx-auto" />
            </button>

            <VisitorLounge open={loungeOpen} onActiveChange={setLoungeActiveCount} />
          </div>

          <button
            className="absolute inset-0 -z-10 cursor-default"
            onClick={() => setLoungeOpen(false)}
            aria-label="Close overlay"
          />
        </div>
      )}

      <ResumeModal open={resumeOpen} onClose={() => setResumeOpen(false)} />
      <EnquiryModal />
    </>
  )
}