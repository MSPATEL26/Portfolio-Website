'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { X, ExternalLink, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { CREDENTIALS } from '@/lib/constants'

const ParticleField = dynamic(() => import('@/components/ParticleField'), { ssr: false })

const ALL_CATEGORIES = ['All', ...Array.from(new Set(CREDENTIALS.map(c => c.category)))]

// Group credentials by year, sorted newest first
function groupByYear(creds: typeof CREDENTIALS) {
  const map: Record<string, typeof CREDENTIALS> = {}
  for (const c of creds) {
    const year = c.date.split(' ').at(-1) ?? 'Unknown'
    if (!map[year]) map[year] = []
    map[year].push(c)
  }
  return Object.entries(map).sort(([a], [b]) => Number(b) - Number(a))
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function CredentialModal({
  cred, onClose, onPrev, onNext, hasPrev, hasNext, index, total,
}: {
  cred: typeof CREDENTIALS[0]
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  hasPrev: boolean
  hasNext: boolean
  index: number
  total: number
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape')     onClose()
      if (e.key === 'ArrowLeft')  onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose, onPrev, onNext])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(16px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-2xl overflow-hidden"
        style={{
          background: '#0e0e0e',
          border: `1px solid ${cred.color}30`,
          boxShadow: `0 0 80px ${cred.color}15`,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
        >
          <X className="w-4 h-4 text-white/60" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Image / Placeholder */}
          <div
            className="w-full md:w-[44%] flex-shrink-0 relative min-h-[240px] overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.02)', borderRight: '1px solid rgba(255,255,255,0.06)' }}
          >
            {cred.image ? (
              <Image src={cred.image} alt={cred.title} fill className="object-contain p-6" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black"
                  style={{ background: `${cred.color}18`, border: `2px solid ${cred.color}35`, color: cred.color, fontFamily: 'monospace' }}
                >
                  {cred.issuerLogo}
                </div>
                <div
                  className="w-full max-w-[220px] rounded-xl p-5 text-center"
                  style={{ border: `1px solid ${cred.color}20`, background: 'rgba(255,255,255,0.02)' }}
                >
                  <p className="text-[9px] tracking-[0.2em] mb-2" style={{ color: `${cred.color}60` }}>CERTIFICATE OF ACCOMPLISHMENT</p>
                  <p className="text-xs text-white/20 mb-1">PRESENTED TO</p>
                  <p className="text-lg font-bold mb-2" style={{ color: cred.color, fontFamily: 'serif', fontStyle: 'italic' }}>Alex Dev</p>
                  <div className="px-3 py-1 rounded-lg text-xs font-bold" style={{ background: `${cred.color}15`, border: `1px solid ${cred.color}30`, color: cred.color }}>
                    {cred.title}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 flex flex-col justify-between p-6 md:p-8">
            <div className="flex flex-wrap gap-1.5 mb-4">
              {cred.tags.map(tag => (
                <span
                  key={tag}
                  className="text-[10px] px-2.5 py-1 rounded-full font-semibold tracking-widest"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.45)' }}
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mb-4">
              <h3 className="text-2xl md:text-3xl font-black text-white leading-tight mb-2" style={{ letterSpacing: '-0.02em' }}>
                {cred.title}
              </h3>
              <p className="text-sm italic" style={{ color: cred.color }}>
                {cred.issuer}<span className="text-white/30 not-italic"> — {cred.date}</span>
              </p>
            </div>

            <p className="text-white/50 text-sm leading-relaxed mb-6">{cred.description}</p>

            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3 h-3 text-white/15" />
                <span className="text-[10px] text-white/20 font-mono">{cred.credentialId}</span>
              </div>
              <Link
                href={cred.verifyUrl}
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105"
                style={{ background: `${cred.color}15`, border: `1px solid ${cred.color}40`, color: cred.color }}
              >
                <ExternalLink className="w-3.5 h-3.5" /> Verify
              </Link>
            </div>
          </div>
        </div>

        {/* Prev / Next */}
        <div
          className="flex items-center justify-between px-6 py-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className="flex items-center gap-1 text-xs font-semibold disabled:opacity-20 transition-opacity"
            style={{ color: cred.color }}
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Previous
          </button>
          <span className="text-[10px] text-white/20 font-mono">{index + 1} / {total} · ← → · Esc</span>
          <button
            onClick={onNext}
            disabled={!hasNext}
            className="flex items-center gap-1 text-xs font-semibold disabled:opacity-20 transition-opacity"
            style={{ color: cred.color }}
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Timeline Row Card ────────────────────────────────────────────────────────
function TimelineCard({
  cred,
  isLast,
  onClick,
}: {
  cred: typeof CREDENTIALS[0]
  isLast: boolean
  onClick: () => void
}) {
  return (
    <div className="relative flex gap-4 group">
      {/* Spine */}
      <div className="flex flex-col items-center flex-shrink-0" style={{ width: 20 }}>
        {/* Dot */}
        <div
          className="w-3 h-3 rounded-full flex-shrink-0 mt-4 z-10 transition-transform duration-200 group-hover:scale-125"
          style={{
            background: cred.color,
            boxShadow: `0 0 8px ${cred.color}60`,
          }}
        />
        {/* Line below dot */}
        {!isLast && (
          <div
            className="flex-1 w-px mt-1"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          />
        )}
      </div>

      {/* Card */}
      <button
        onClick={onClick}
        className="flex-1 mb-4 text-left rounded-2xl overflow-hidden transition-all duration-200"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget
          el.style.borderColor = `${cred.color}40`
          el.style.background = `${cred.color}08`
          el.style.transform = 'translateX(4px)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget
          el.style.borderColor = 'rgba(255,255,255,0.07)'
          el.style.background = 'rgba(255,255,255,0.03)'
          el.style.transform = 'translateX(0px)'
        }}
      >
        <div className="flex items-start gap-4 p-4">
          {/* Logo / Image thumbnail */}
          <div
            className="w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden relative"
            style={{ background: `${cred.color}12`, border: `1px solid ${cred.color}25` }}
          >
            {cred.image ? (
              <Image src={cred.image} alt={cred.title} fill className="object-contain p-1.5" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-base font-black" style={{ color: cred.color, fontFamily: 'monospace' }}>
                {cred.issuerLogo}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-white/90 text-sm font-semibold leading-snug">
                {cred.title}
              </h3>
              <span
                className="text-[10px] font-mono flex-shrink-0 mt-0.5"
                style={{ color: 'rgba(255,255,255,0.25)' }}
              >
                {cred.date}
              </span>
            </div>
            <p className="text-sm mb-2" style={{ color: cred.color, opacity: 0.8 }}>
              {cred.issuer}
            </p>
            <div className="flex flex-wrap gap-1">
              {cred.tags.map(tag => (
                <span
                  key={tag}
                  className="text-[9px] px-1.5 py-0.5 rounded-full font-mono"
                  style={{ background: `${cred.color}12`, border: `1px solid ${cred.color}25`, color: `${cred.color}90` }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Arrow hint */}
          <div
            className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-1"
            style={{ color: cred.color }}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </div>
        </div>
      </button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CredentialsPage() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [selected, setSelected] = useState<typeof CREDENTIALS[0] | null>(null)

  const filtered = activeFilter === 'All'
    ? CREDENTIALS
    : CREDENTIALS.filter(c => c.category === activeFilter)

  const grouped = groupByYear(filtered)

  const selectedIdx = selected ? CREDENTIALS.findIndex(c => c.id === selected.id) : -1

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] pt-24 pb-24">
      <ParticleField />

      <div className="relative z-10 max-w-3xl mx-auto px-6">

        {/* Heading */}
        <div className="mb-10">
          <p className="text-[#00d9ff] text-xs font-semibold tracking-widest mb-2 font-mono">ACHIEVEMENTS</p>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-2">My Credentials</h1>
          <p className="text-white/25 text-sm font-mono">
            {CREDENTIALS.length} certificates · click any entry to expand
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-2 mb-10">
          {ALL_CATEGORIES.map(cat => {
            const count = cat === 'All'
              ? CREDENTIALS.length
              : CREDENTIALS.filter(c => c.category === cat).length
            const accent = cat === 'All'
              ? '#00d9ff'
              : (CREDENTIALS.find(c => c.category === cat)?.color ?? '#00d9ff')
            const active = activeFilter === cat
            return (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                style={
                  active
                    ? { background: `${accent}18`, border: `1px solid ${accent}50`, color: accent, boxShadow: `0 0 12px ${accent}20` }
                    : { background: 'transparent', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.40)' }
                }
              >
                {cat}
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full font-mono"
                  style={{
                    background: active ? `${accent}25` : 'rgba(255,255,255,0.06)',
                    color: active ? accent : 'rgba(255,255,255,0.30)',
                  }}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Timeline */}
        {filtered.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-16 font-mono">No credentials in this category.</p>
        ) : (
          grouped.map(([year, creds]) => (
            <div key={year} className="mb-8">
              {/* Year label */}
              <div className="flex items-center gap-3 mb-4 ml-8">
                <span
                  className="text-xs font-mono px-3 py-1 rounded-full"
                  style={{ background: 'rgba(0,217,255,0.08)', border: '1px solid rgba(0,217,255,0.20)', color: '#00d9ff' }}
                >
                  {year}
                </span>
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <span className="text-[10px] font-mono text-white/20">{creds.length} cert{creds.length > 1 ? 's' : ''}</span>
              </div>

              {/* Cards */}
              <div>
                {creds.map((cred, i) => (
                  <TimelineCard
                    key={cred.id}
                    cred={cred}
                    isLast={i === creds.length - 1}
                    onClick={() => setSelected(cred)}
                  />
                ))}
              </div>
            </div>
          ))
        )}

      </div>

      {/* Modal */}
      {selected && (
        <CredentialModal
          cred={selected}
          onClose={() => setSelected(null)}
          onPrev={() => selectedIdx > 0 && setSelected(CREDENTIALS[selectedIdx - 1])}
          onNext={() => selectedIdx < CREDENTIALS.length - 1 && setSelected(CREDENTIALS[selectedIdx + 1])}
          hasPrev={selectedIdx > 0}
          hasNext={selectedIdx < CREDENTIALS.length - 1}
          index={selectedIdx}
          total={CREDENTIALS.length}
        />
      )}
    </div>
  )
}