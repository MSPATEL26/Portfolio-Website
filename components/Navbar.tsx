'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Moon, MoonStar, Menu, X, Home, Bot } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import NightModeOverlay from '@/components/NightModeOverlay'

const navLinks = [
  { href: '/projects',    label: 'PROJECTS'    },
  { href: '/credentials', label: 'CREDENTIALS' },
  { href: '/skills',      label: 'FORGE'       },
  { href: '/about',       label: 'PERSONA'     },
]

// ── Per-link ripple state ────────────────────────────────────────────────────
type Ripple = { x: number; y: number; id: number }

function NavLinkWithRipple({
  href,
  label,
  active,
}: {
  href: string
  label: string
  active: boolean
}) {
  const [ripples, setRipples] = useState<Ripple[]>([])
  const linkRef = useRef<HTMLAnchorElement>(null)
  const counterRef = useRef(0)

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!linkRef.current) return
    const rect = linkRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = counterRef.current++
    setRipples(prev => [...prev, { x, y, id }])
    // Remove ripple after animation completes
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id))
    }, 600)
  }

  return (
    <Link
      ref={linkRef}
      href={href}
      onMouseEnter={handleMouseEnter}
      className={`relative overflow-hidden text-xs font-semibold tracking-wider px-3 py-1.5 rounded-xl transition-colors duration-200 ${
        active
          ? 'text-[#00d9ff] bg-[#00d9ff]/10'
          : 'text-white/70 hover:text-[#00d9ff]'
      }`}
    >
      {/* Ripple layers */}
      {ripples.map(r => (
        <span
          key={r.id}
          className="nav-ripple"
          style={{
            left: r.x,
            top:  r.y,
          }}
        />
      ))}
      {label}
    </Link>
  )
}

// ── Home icon with ripple ────────────────────────────────────────────────────
function HomeWithRipple({ active }: { active: boolean }) {
  const [ripples, setRipples] = useState<Ripple[]>([])
  const btnRef = useRef<HTMLAnchorElement>(null)
  const counterRef = useRef(0)

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = counterRef.current++
    setRipples(prev => [...prev, { x, y, id }])
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600)
  }

  return (
    <Link
      ref={btnRef}
      href="/"
      onMouseEnter={handleMouseEnter}
      className={`relative overflow-hidden p-2 rounded-xl transition-colors duration-200 mr-2 ${
        active
          ? 'bg-[#00d9ff]/15 text-[#00d9ff]'
          : 'text-white/50 hover:text-[#00d9ff] hover:bg-white/5'
      }`}
      aria-label="Home"
    >
      {ripples.map(r => (
        <span key={r.id} className="nav-ripple" style={{ left: r.x, top: r.y }} />
      ))}
      <Home className="w-4 h-4 relative z-10" />
    </Link>
  )
}

// ── Kiro link with ripple ────────────────────────────────────────────────────
function KiroWithRipple({ active }: { active: boolean }) {
  const [ripples, setRipples] = useState<Ripple[]>([])
  const linkRef = useRef<HTMLAnchorElement>(null)
  const counterRef = useRef(0)

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!linkRef.current) return
    const rect = linkRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = counterRef.current++
    setRipples(prev => [...prev, { x, y, id }])
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600)
  }

  return (
    <Link
      ref={linkRef}
      href="/kiro"
      onMouseEnter={handleMouseEnter}
      className={`relative overflow-hidden ml-1 flex items-center gap-1.5 text-xs font-semibold tracking-wider px-3 py-1.5 rounded-xl border transition-all duration-200 ${
        active
          ? 'text-[#00d9ff] bg-[#00d9ff]/10 border-[#00d9ff]/40 shadow-[0_0_10px_rgba(0,217,255,0.2)]'
          : 'text-[#00d9ff]/70 border-[#00d9ff]/20 hover:text-[#00d9ff] hover:border-[#00d9ff]/50 hover:bg-[#00d9ff]/5'
      }`}
    >
      {ripples.map(r => (
        <span key={r.id} className="nav-ripple" style={{ left: r.x, top: r.y }} />
      ))}
      <Bot className="w-3 h-3 relative z-10" />
      <span className="relative z-10">KIRO</span>
    </Link>
  )
}

// ── Main Navbar ──────────────────────────────────────────────────────────────
export default function Navbar() {
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [nightMode, setNightMode] = useState(false)
  const [mounted,   setMounted]   = useState(false)
  const [glowStyle, setGlowStyle] = useState({})
  const [isHovered, setIsHovered] = useState(false)
  const [isIdle,    setIsIdle]    = useState(false)
  const navRef    = useRef<HTMLDivElement>(null)
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pathname  = usePathname()

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('night-mode')
    if (saved === 'true') setNightMode(true)
    idleTimer.current = setTimeout(() => setIsIdle(true), 3000)
    return () => { if (idleTimer.current) clearTimeout(idleTimer.current) }
  }, [])

  const resetIdle = () => {
    setIsIdle(false)
    if (idleTimer.current) clearTimeout(idleTimer.current)
    idleTimer.current = setTimeout(() => setIsIdle(true), 4000)
  }

  const toggleNight = () => {
    resetIdle()
    setNightMode(prev => {
      localStorage.setItem('night-mode', String(!prev))
      return !prev
    })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    resetIdle()
    if (!navRef.current) return
    const rect = navRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const w = rect.width
    const h = rect.height
    const dLeft = x, dRight = w - x, dTop = y, dBottom = h - y
    const minDist = Math.min(dLeft, dRight, dTop, dBottom)
    const THRESHOLD = 60
    if (minDist > THRESHOLD) { setIsHovered(false); return }
    setIsHovered(true)
    const pctX = Math.round((x / w) * 100)
    const pctY = Math.round((y / h) * 100)
    const intensity = Math.round((1 - minDist / THRESHOLD) * 100)
    setGlowStyle({
      '--glow-x':       `${pctX}%`,
      '--glow-y':       `${pctY}%`,
      '--glow-opacity': intensity / 100,
    } as React.CSSProperties)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setGlowStyle({})
    resetIdle()
  }

  return (
    <>
      <style>{`
        @keyframes navBreathe {
          0%, 100% { opacity: 0.15; }
          50%       { opacity: 0.55; }
        }
        .nav-breathing {
          animation: navBreathe 3s ease-in-out infinite;
        }

        /* ── Glow ripple ── */
        @keyframes navRippleExpand {
          0%   { transform: translate(-50%, -50%) scale(0);   opacity: 0.55; }
          60%  { opacity: 0.2; }
          100% { transform: translate(-50%, -50%) scale(4.5); opacity: 0;    }
        }
        .nav-ripple {
          position: absolute;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          pointer-events: none;
          background: radial-gradient(circle, rgba(0,217,255,0.55) 0%, rgba(0,217,255,0.15) 50%, transparent 70%);
          transform: translate(-50%, -50%) scale(0);
          animation: navRippleExpand 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          z-index: 0;
          /* Keep text above ripple */
        }
      `}</style>

      {mounted && <NightModeOverlay active={nightMode} />}

      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-[10000] w-[90%] max-w-4xl">
        <div
          ref={navRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative rounded-2xl"
          style={glowStyle}
        >

          {/* Breathing border glow */}
          <div
            className={`pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-1000 ${
              isIdle && !isHovered ? 'nav-breathing' : ''
            }`}
            style={{
              opacity: isIdle && !isHovered ? undefined : 0,
              background: `radial-gradient(ellipse 80% 100% at 50% 50%, rgba(0,217,255,0.45), transparent 70%)`,
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              padding: '1px',
            }}
          />

          {/* Edge hover glow */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
            style={{
              opacity: isHovered ? (glowStyle as Record<string, unknown>)['--glow-opacity'] as number ?? 0 : 0,
              background: `radial-gradient(120px circle at var(--glow-x, 50%) var(--glow-y, 50%), rgba(0,217,255,0.55), transparent 80%)`,
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              padding: '1px',
            }}
          />

          {/* ── Glass navbar ── */}
          <div className="bg-black/20 dark:bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-3 flex items-center justify-between">

            <Link href="/" className="text-xl font-bold text-[#00d9ff] cyan-glow">
              Saqib Patel
            </Link>

            <div className="hidden md:flex items-center gap-1">

              <HomeWithRipple active={pathname === '/'} />

              <div className="w-px h-4 bg-white/10 mr-3" />

              {navLinks.map(link => (
                <NavLinkWithRipple
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  active={pathname === link.href}
                />
              ))}

              <KiroWithRipple active={pathname === '/kiro'} />
            </div>

            <div className="flex items-center gap-3">
              {mounted && (
                <button
                  onClick={toggleNight}
                  className={`p-2 rounded-xl transition-all duration-300 ${
                    nightMode
                      ? 'bg-[#00d9ff]/15 text-[#00d9ff] shadow-[0_0_12px_rgba(0,217,255,0.4)]'
                      : 'bg-white/5 hover:bg-white/10 text-white/50 hover:text-white'
                  }`}
                  aria-label="Toggle night mode"
                  title={nightMode ? 'Exit night mode' : 'Enter night mode'}
                >
                  {nightMode ? <MoonStar className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              )}

              <button
                className="md:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                onClick={() => { resetIdle(); setMenuOpen(!menuOpen) }}
                aria-label="Toggle menu"
              >
                {menuOpen
                  ? <X    className="w-4 h-4 text-white" />
                  : <Menu className="w-4 h-4 text-white" />
                }
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu — unchanged */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden mt-2 bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col gap-3"
            >
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 text-sm font-semibold tracking-wider transition-colors py-2 px-4 rounded-xl ${
                  pathname === '/'
                    ? 'text-[#00d9ff] bg-[#00d9ff]/10'
                    : 'text-white/70 hover:text-[#00d9ff] hover:bg-white/5'
                }`}
              >
                <Home className="w-4 h-4" /> HOME
              </Link>

              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`text-sm font-semibold tracking-wider transition-colors py-2 px-4 rounded-xl ${
                    pathname === link.href
                      ? 'text-[#00d9ff] bg-[#00d9ff]/10'
                      : 'text-white/70 hover:text-[#00d9ff] hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <Link
                href="/kiro"
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 text-sm font-semibold tracking-wider transition-colors py-2 px-4 rounded-xl border ${
                  pathname === '/kiro'
                    ? 'text-[#00d9ff] bg-[#00d9ff]/10 border-[#00d9ff]/30'
                    : 'text-[#00d9ff]/70 border-[#00d9ff]/15 hover:text-[#00d9ff] hover:bg-[#00d9ff]/5'
                }`}
              >
                <Bot className="w-4 h-4" /> KIRO
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  )
}