'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Github, Linkedin, Code2, BarChart3, ExternalLink } from 'lucide-react'
import { SOCIAL_LINKS } from '@/lib/constants'

// ── Streak calculator from raw contributions data ─────────────────────────────
function calculateStreak(contributions: { date: string; count: number }[]): number {
  const sorted = [...contributions].sort((a, b) => (a.date > b.date ? -1 : 1))
  const today = new Date().toISOString().split('T')[0]
  let streak = 0

  for (const entry of sorted) {
    // Skip today if no commits yet (day not over)
    if (entry.date === today && entry.count === 0) continue
    if (entry.count > 0) {
      streak++
    } else {
      break
    }
  }
  return streak
}

// ── Live stats hook ───────────────────────────────────────────────────────────
interface LiveStats {
  projects: number | null
  stars: number | null
  streak: number | null
  leetcode: number | null
  kaggle: number
}

function useLiveStats(): LiveStats {
  const [stats, setStats] = useState<LiveStats>({
    projects: null,
    stars: null,
    streak: null,
    leetcode: null,
    kaggle: 1,
  })

  useEffect(() => {
    // ── GitHub: repos count + total stars ──────────────────────────────────
    fetch('https://api.github.com/users/Saqib-Patel/repos?per_page=100&type=owner')
      .then((r) => r.json())
      .then((repos: { stargazers_count: number; fork: boolean }[]) => {
        if (!Array.isArray(repos)) return
        const owned = repos.filter((r) => !r.fork)
        const stars = owned.reduce((s, r) => s + (r.stargazers_count || 0), 0)
        setStats((prev) => ({ ...prev, projects: owned.length, stars }))
      })
      .catch(() => {})

    // ── GitHub Streak via contributions-api (CORS-open) ────────────────────
    fetch('https://github-contributions-api.jogruber.de/v4/Saqib-Patel?y=last')
      .then((r) => r.json())
      .then((data: { contributions: { date: string; count: number }[] }) => {
        if (!Array.isArray(data?.contributions)) return
        setStats((prev) => ({ ...prev, streak: calculateStreak(data.contributions) }))
      })
      .catch(() => {})

    // ── LeetCode: alfa-leetcode-api (primary, CORS-friendly) ───────────────
    fetch('https://alfa-leetcode-api.onrender.com/saqib_patel/solved')
      .then((r) => {
        if (!r.ok) throw new Error('non-ok')
        return r.json()
      })
      .then((data: { solvedProblem?: number }) => {
        if (typeof data?.solvedProblem === 'number') {
          setStats((prev) => ({ ...prev, leetcode: data.solvedProblem! }))
        } else {
          throw new Error('no data')
        }
      })
      .catch(() => {
        // Fallback: faisalshohag vercel API
        fetch('https://leetcode-api-faisalshohag.vercel.app/saqib_patel')
          .then((r) => r.json())
          .then((data: { totalSolved?: number }) => {
            if (typeof data?.totalSolved === 'number') {
              setStats((prev) => ({ ...prev, leetcode: data.totalSolved! }))
            }
          })
          .catch(() => {})
      })
  }, [])

  return stats
}

function fmt(val: number | null): string {
  if (val === null) return '…'
  if (val >= 1000) return `${(val / 1000).toFixed(1)}k+`
  return `${val}+`
}

// ── GitHub Contribution Heatmap ──────────────────────────────────────────────
function ContributionHeatmap() {
  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderColor: 'rgba(0,217,255,0.15)',
        boxShadow: '0 0 0 1px rgba(0,217,255,0.05), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      <div
        className="px-5 pt-4 pb-3 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(0,217,255,0.08)' }}
      >
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00d9ff]" style={{ boxShadow: '0 0 6px #00d9ff' }} />
          <span className="text-xs font-mono text-white/50 tracking-widest uppercase">GitHub Contributions</span>
        </div>
        <Link
          href={SOCIAL_LINKS.github}
          target="_blank"
          className="flex items-center gap-1 text-[10px] font-mono text-white/30 hover:text-[#00d9ff] transition-colors"
        >
          Saqib-Patel <ExternalLink className="w-2.5 h-2.5" />
        </Link>
      </div>
      <div className="px-5 py-4">
        <img
          src="https://ghchart.rshah.org/00d9ff/Saqib-Patel"
          alt="Saqib's GitHub contribution chart"
          className="w-full rounded-lg opacity-90"
          style={{ filter: 'brightness(1.1) contrast(1.05)' }}
        />
        <div className="flex items-center justify-end gap-2 mt-2">
          <span className="text-[10px] font-mono text-white/25">Less</span>
          {['rgba(0,217,255,0.15)', 'rgba(0,217,255,0.35)', 'rgba(0,217,255,0.60)', 'rgba(0,217,255,0.85)', '#00d9ff'].map(
            (c, i) => <span key={i} className="w-2.5 h-2.5 rounded-sm" style={{ background: c }} />
          )}
          <span className="text-[10px] font-mono text-white/25">More</span>
        </div>
      </div>
    </div>
  )
}

// ── Education card (compact) ──────────────────────────────────────────────────
function EducationCard() {
  return (
    <div
      className="p-5 rounded-2xl border transition-all duration-300 hover:border-[#00d9ff]/35 hover:bg-[#00d9ff]/[0.04]"
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderColor: 'rgba(0,217,255,0.15)',
        boxShadow: '0 0 0 1px rgba(0,217,255,0.05), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border"
          style={{
            background: 'rgba(0,217,255,0.08)',
            borderColor: 'rgba(0,217,255,0.20)',
          }}
        >
          <span className="text-[#00d9ff] font-black text-xs">🎓</span>
        </div>
        <div className="flex-1">
          <h3 className="text-white font-bold text-sm">N.K. Orchid College of Engineering, Solapur</h3>
          <p className="text-[#00d9ff] text-xs mt-0.5">B.Tech — Computer Science & Engineering</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] text-white/35 font-mono uppercase tracking-wider">CGPA</span>
            <span className="text-[#f59e0b] font-black text-base leading-none">7.7</span>
            <span className="text-white/25 text-xs">/10</span>
            <span className="ml-auto text-[10px] font-mono text-white/30">2022 – 2026</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Experience card ───────────────────────────────────────────────────────────
function ExperienceCard() {
  const [hovered, setHovered] = useState(false)
  const techTags = ['HTML', 'CSS', 'JS', 'Bootstrap', 'PHP', 'MySQL']

  return (
    <div
      className="p-5 rounded-2xl border cursor-default transition-all duration-300"
      style={{
        background: hovered ? 'rgba(139,92,246,0.06)' : 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderColor: hovered ? 'rgba(139,92,246,0.35)' : 'rgba(139,92,246,0.15)',
        boxShadow: hovered
          ? '0 0 24px rgba(139,92,246,0.10), inset 0 1px 0 rgba(255,255,255,0.06)'
          : '0 0 0 1px rgba(139,92,246,0.05), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border transition-all duration-300"
          style={{
            background: hovered ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.08)',
            borderColor: hovered ? 'rgba(139,92,246,0.40)' : 'rgba(139,92,246,0.20)',
          }}
        >
          <span className="text-[#8b5cf6] font-black text-xs">💼</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-white font-bold text-sm">SDE Intern</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-[#8b5cf6]/20 text-[#8b5cf6]/60">
              Remote
            </span>
          </div>
          <p className="text-[#8b5cf6] text-xs mt-0.5">ITJOBXS · Internship</p>
          <p className="text-white/30 text-[11px] font-mono mt-1">Dec 2024 – Mar 2025 · 4 mos</p>

          <ul className="mt-3 space-y-1.5">
            {[
              'Designed & developed a fully responsive webpage section for itjobxs.com',
              'Built User Verification/Authentication + bot & fake-post detection systems',
              'Integrated Google reCAPTCHA for website protection layer',
            ].map((item, i) => (
              <li key={i} className="text-white/45 text-xs leading-relaxed flex items-start gap-2">
                <span className="text-[#8b5cf6] mt-0.5 flex-shrink-0">▸</span>
                {item}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {techTags.map((tag) => (
              <span
                key={tag}
                className="text-[9px] font-mono px-2 py-0.5 rounded-full"
                style={{
                  background: 'rgba(139,92,246,0.10)',
                  border: '1px solid rgba(139,92,246,0.25)',
                  color: 'rgba(139,92,246,0.80)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  value,
  label,
  sub,
  loading,
}: {
  value: string
  label: string
  sub?: string
  loading?: boolean
}) {
  return (
    <div
      className="p-4 rounded-xl border text-center group hover:border-[#00d9ff]/30 transition-all duration-200"
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(12px)',
        borderColor: 'rgba(255,255,255,0.08)',
      }}
    >
      <div
        className={`text-2xl font-black text-[#00d9ff] mb-0.5 group-hover:drop-shadow-[0_0_8px_rgba(0,217,255,0.6)] transition-all ${
          loading ? 'animate-pulse opacity-30' : ''
        }`}
      >
        {value}
      </div>
      <div className="text-[11px] text-white/40 leading-tight">{label}</div>
      {sub && <div className="text-[10px] text-white/20 mt-0.5 font-mono">{sub}</div>}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AboutPage() {
  const stats = useLiveStats()

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6">

        {/* Heading */}
        <div className="text-center mb-14">
          <p className="text-[#00d9ff] text-sm font-semibold tracking-widest mb-3">WHO I AM</p>
          <h1 className="text-5xl md:text-6xl font-black text-white">Persona</h1>
        </div>

        {/* ── Bio + Education ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">

          {/* Bio */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Hi, I&apos;m Saqib </h2>
            <div className="space-y-3 text-white/55 text-sm leading-relaxed">
              <p>
                Final-year <span className="text-[#00d9ff]">B.Tech CSE</span> student at{' '}
                <span className="text-[#00d9ff]">N.K. Orchid College of Engineering, Solapur</span> — CGPA{' '}
                <span className="text-[#f59e0b] font-bold">7.7 / 10</span>, graduated in June 2026.
                I build full-stack web applications and deploy scalable DevOps infrastructure.
              </p>
              <p>
                My current focus: production-grade full-stack systems, CI/CD pipelines, containerized deployments,
                and cloud infrastructure automation. Everything I build targets reliability and zero-downtime deployment.
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {[' Pune, Maharashtra, India', ' N.K. Orchid College · 2026'].map((fact) => (
                <span
                  key={fact}
                  className="text-[11px] font-mono text-white/40 px-3 py-1 rounded-full border border-white/08 bg-white/[0.02]"
                >
                  {fact}
                </span>
              ))}
            </div>
          </div>

          {/* Education & Experience */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Education & Experience</h2>
            <div className="space-y-4">
              <EducationCard />
              <ExperienceCard />
            </div>
          </div>
        </div>

        {/* ── Live Stats ── */}
        <div className="mb-10">
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            <StatCard value={fmt(stats.projects)} label="Projects Built"  loading={stats.projects === null} />
            <StatCard value={fmt(stats.stars)}    label="GitHub Stars"    loading={stats.stars === null} />
            <StatCard value={fmt(stats.streak)}   label="GitHub Streak"   sub="days" loading={stats.streak === null} />
            <StatCard value={fmt(stats.leetcode)} label="LeetCode Solved" loading={stats.leetcode === null} />
            <StatCard value={`${stats.kaggle}+`}  label="Kaggle Notebooks" />
          </div>
        </div>

        {/* ── GitHub Contribution Heatmap ── */}
        <div className="mb-10">
          <ContributionHeatmap />
        </div>

        {/* ── Find me on ── */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Find me on</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { name: 'GitHub',     href: SOCIAL_LINKS.github,                 icon: Github,    color: '#ffffff',  handle: 'Saqib-Patel'    },
              { name: 'LinkedIn',   href: SOCIAL_LINKS.linkedin,                icon: Linkedin,  color: '#0077b5',  handle: 'mohammedsaqibpatel' },
              { name: 'LeetCode',   href: SOCIAL_LINKS.leetcode,                icon: Code2,     color: '#ffa116',  handle: 'saqib_patel' },
            ].map((social) => (
              <Link
                key={social.name}
                href={social.href}
                target="_blank"
                className="group flex flex-col gap-2 p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02]"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(12px)',
                  borderColor: 'rgba(255,255,255,0.08)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${social.color}40`
                  e.currentTarget.style.background = `${social.color}08`
                  e.currentTarget.style.boxShadow = `0 0 16px ${social.color}15`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <social.icon className="w-4 h-4" style={{ color: social.color }} />
                <div>
                  <div className="text-white/70 group-hover:text-white text-xs font-semibold transition-colors">{social.name}</div>
                  <div className="text-white/25 text-[10px] font-mono mt-0.5">{social.handle}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}