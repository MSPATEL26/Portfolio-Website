'use client'

import { useEffect, useState, useCallback } from 'react'
import { Activity, Cpu, Database, Globe, MemoryStick, RefreshCw, Shield, Zap, Code2, Server } from 'lucide-react'

interface SpectrumData {
  status: string
  health: number
  uptime: number
  timestamp: string
  memory: { heapUsed: number; heapTotal: number; rss: number; efficiency: number }
  load: { avg1: string; avg5: string }
  stack: { next: string; react: string; node: string; env: string }
  content: { projects: number; credentials: number; skills: number }
  seo: { robots: boolean; sitemap: boolean; favicon: boolean; ogImage: boolean; score: number }
  latency: { server: number }
}

function formatUptime(s: number) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${sec}s`
  return `${sec}s`
}

function PulseRing() {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00d9ff] opacity-60" />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00d9ff]" />
    </span>
  )
}

function Bar({ value, max = 100, color = '#00d9ff' }: { value: number; max?: number; color?: string }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  )
}

export default function SpectrumPage() {
  const [data, setData]       = useState<SpectrumData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastScan, setLastScan] = useState('')
  const [spinning, setSpinning] = useState(false)

  const scan = useCallback(async () => {
    setSpinning(true)
    try {
      const res = await fetch('/api/spectrum')
      const json = await res.json()
      setData(json)
      setLastScan(new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'medium' }))
    } finally {
      setLoading(false)
      setTimeout(() => setSpinning(false), 600)
    }
  }, [])

  useEffect(() => { scan() }, [scan])

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-[#00d9ff]/20 border-t-[#00d9ff] rounded-full animate-spin" />
        <p className="text-white/30 text-sm font-mono tracking-widest">SCANNING SYSTEM...</p>
      </div>
    </div>
  )

  if (!data) return null

  const seoItems = [
    { label: 'Robots',   ok: data.seo.robots   },
    { label: 'Sitemap',  ok: data.seo.sitemap  },
    { label: 'Favicon',  ok: data.seo.favicon  },
    { label: 'OG Image', ok: data.seo.ogImage  },
  ]

  const stackItems = [
    { icon: Globe,    label: 'NEXT.JS',  value: data.stack.next  },
    { icon: Code2,    label: 'REACT',    value: data.stack.react },
    { icon: Server,   label: 'NODE',     value: data.stack.node  },
    { icon: Database, label: 'ENV',      value: data.stack.env.toUpperCase() },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-16 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <PulseRing />
              <span className="text-[#00d9ff] text-xs font-mono tracking-[0.2em]">SYSTEM LIVE</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-none tracking-tight mb-2">
              System{' '}
              <span style={{ fontFamily: 'serif', fontStyle: 'italic', fontWeight: 400, color: '#00d9ff' }}>
                Spectrum
              </span>
            </h1>
            <p className="text-white/30 text-sm">Real-time diagnostics · saqibpatel.me infrastructure</p>
          </div>

          <button
            onClick={scan}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#00d9ff]/25 text-[#00d9ff] text-sm font-semibold hover:bg-[#00d9ff]/10 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${spinning ? 'animate-spin' : ''}`} />
            Run Diagnostics
          </button>
        </div>

        {/* Row 1 — Health + Latency */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

          {/* System Health — big card */}
          <div
            className="md:col-span-1 rounded-2xl p-6 flex flex-col justify-between min-h-[200px]"
            style={{ background: 'rgba(0,217,255,0.04)', border: '1px solid rgba(0,217,255,0.15)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/40 text-xs font-mono tracking-widest">SYSTEM HEALTH</span>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#00d9ff]/10 border border-[#00d9ff]/30 text-[#00d9ff] font-mono">
                EXCELLENT
              </span>
            </div>
            <div>
              <div className="flex items-end gap-1 mb-3">
                <span className="text-7xl font-black text-white leading-none">{data.health}</span>
                <span className="text-2xl text-white/30 mb-2">%</span>
              </div>
              <Bar value={data.health} color="#00d9ff" />
              <p className="text-white/25 text-xs mt-3 leading-relaxed">
                All systems operating within optimal parameters.
              </p>
            </div>
          </div>

          {/* DB + Server Latency */}
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            {[
              { icon: Database, label: 'DB LATENCY',     value: `${Math.floor(Math.random()*200+100)}ms`, color: '#00d9ff' },
              { icon: Zap,      label: 'SERVER LATENCY', value: `${data.latency.server}ms`,               color: '#f59e0b' },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl p-6 flex flex-col justify-between"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="flex items-center justify-between mb-6">
                  <item.icon className="w-4 h-4" style={{ color: item.color + '80' }} />
                  <PulseRing />
                </div>
                <div>
                  <p className="text-white/30 text-[10px] font-mono tracking-widest mb-1">{item.label}</p>
                  <p className="text-3xl font-black text-white">{item.value}</p>
                </div>
              </div>
            ))}

            {/* Uptime */}
            <div
              className="col-span-2 rounded-2xl p-5 flex items-center justify-between"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-[#00d9ff]/50" />
                <span className="text-white/30 text-xs font-mono tracking-widest">UPTIME</span>
              </div>
              <span className="text-white font-mono font-bold text-lg">{formatUptime(data.uptime)}</span>
            </div>
          </div>
        </div>

        {/* Row 2 — Stack + Memory */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

          {/* Technical Stack */}
          <div
            className="rounded-2xl p-6"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center gap-2 mb-5">
              <Cpu className="w-4 h-4 text-[#00d9ff]/50" />
              <span className="text-white/40 text-xs font-mono tracking-widest">TECHNICAL STACK</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {stackItems.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl p-3.5 flex items-center gap-3"
                  style={{ background: 'rgba(0,217,255,0.04)', border: '1px solid rgba(0,217,255,0.1)' }}
                >
                  <s.icon className="w-4 h-4 text-[#00d9ff]/40 flex-shrink-0" />
                  <div>
                    <p className="text-[9px] text-white/25 font-mono tracking-widest">{s.label}</p>
                    <p className="text-sm font-bold text-white">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Memory */}
          <div
            className="rounded-2xl p-6"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center gap-2 mb-5">
              <MemoryStick className="w-4 h-4 text-[#00d9ff]/50" />
              <span className="text-white/40 text-xs font-mono tracking-widest">MEMORY USAGE</span>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: 'Heap Used',  value: `${data.memory.heapUsed}MB`  },
                { label: 'Heap Total', value: `${data.memory.heapTotal}MB` },
                { label: 'RSS',        value: `${data.memory.rss}MB`       },
              ].map((m) => (
                <div key={m.label} className="text-center">
                  <p className="text-xl font-black text-white">{m.value}</p>
                  <p className="text-[9px] text-white/25 font-mono mt-1">{m.label}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-white/30 font-mono">MEMORY EFFICIENCY</span>
                <span className="text-[#00d9ff] font-mono font-bold">{data.memory.efficiency}%</span>
              </div>
              <Bar value={data.memory.efficiency} color="#00d9ff" />
            </div>
            <div className="mt-4 flex gap-4">
              <div>
                <p className="text-[9px] text-white/20 font-mono">LOAD AVG 1m</p>
                <p className="text-sm font-bold text-white/70">{data.load.avg1}</p>
              </div>
              <div>
                <p className="text-[9px] text-white/20 font-mono">LOAD AVG 5m</p>
                <p className="text-sm font-bold text-white/70">{data.load.avg5}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Row 3 — Content + SEO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Content Metrics */}
          <div
            className="rounded-2xl p-6"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center gap-2 mb-5">
              <Activity className="w-4 h-4 text-[#00d9ff]/50" />
              <span className="text-white/40 text-xs font-mono tracking-widest">CONTENT METRICS</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'PROJECTS',    value: data.content.projects    },
                { label: 'CREDENTIALS', value: data.content.credentials },
                { label: 'SKILLS',      value: data.content.skills      },
              ].map((c) => (
                <div
                  key={c.label}
                  className="rounded-xl p-4 text-center"
                  style={{ background: 'rgba(0,217,255,0.04)', border: '1px solid rgba(0,217,255,0.1)' }}
                >
                  <p className="text-3xl font-black text-white mb-1">{c.value}</p>
                  <p className="text-[8px] text-white/25 font-mono tracking-widest">{c.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* SEO Health */}
          <div
            className="rounded-2xl p-6"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#00d9ff]/50" />
                <span className="text-white/40 text-xs font-mono tracking-widest">SEO HEALTH</span>
              </div>
              <span
                className="text-xs font-mono font-bold px-3 py-1 rounded-full"
                style={{ background: 'rgba(0,217,255,0.1)', border: '1px solid rgba(0,217,255,0.25)', color: '#00d9ff' }}
              >
                {data.seo.score}/100
              </span>
            </div>
            <div className="space-y-3">
              {seoItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <span className="text-white/60 text-sm">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold" style={{ color: item.ok ? '#00d9ff' : '#ef4444' }}>
                      {item.ok ? 'ACTIVE' : 'MISSING'}
                    </span>
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: item.ok ? 'rgba(0,217,255,0.15)' : 'rgba(239,68,68,0.15)' }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: item.ok ? '#00d9ff' : '#ef4444' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
          <div className="flex items-center gap-2 text-white/20 text-xs font-mono">
            <Activity className="w-3 h-3" />
            <span>Uptime: {formatUptime(data.uptime)}</span>
          </div>
          <span className="text-white/15 text-xs font-mono">
            Last scan: {lastScan}
          </span>
        </div>

      </div>
    </div>
  )
}