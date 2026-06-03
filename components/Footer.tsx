'use client'
import { useState, useEffect, useRef } from 'react'
import { Activity, Images, Monitor, Globe, X, ChevronUp } from 'lucide-react'
// @ts-ignore
import Flag from 'react-world-flags'
import LiquidButton from '@/components/LiquidButton'

type StatItem = { name: string; pct: number }
type Analytics = {
  total24h: string
  activeNow: string
  avgSession: string
  countries: StatItem[]
  os: StatItem[]
}

const COUNTRY_CODE: Record<string, string> = {
  India: 'IN', Pakistan: 'PK', Bangladesh: 'BD', Nepal: 'NP',
  'Sri Lanka': 'LK', Afghanistan: 'AF', Maldives: 'MV', Bhutan: 'BT',
  China: 'CN', Japan: 'JP', 'South Korea': 'KR', 'North Korea': 'KP',
  Taiwan: 'TW', Mongolia: 'MN', Vietnam: 'VN', Thailand: 'TH',
  Myanmar: 'MM', Cambodia: 'KH', Laos: 'LA', Malaysia: 'MY',
  Singapore: 'SG', Indonesia: 'ID', Philippines: 'PH', Brunei: 'BN',
  Kazakhstan: 'KZ', Uzbekistan: 'UZ', Turkmenistan: 'TM',
  Tajikistan: 'TJ', Kyrgyzstan: 'KG', Azerbaijan: 'AZ',
  Armenia: 'AM', Georgia: 'GE', Iraq: 'IQ', Iran: 'IR',
  Syria: 'SY', Lebanon: 'LB', Jordan: 'JO', Israel: 'IL',
  Palestine: 'PS', 'Saudi Arabia': 'SA', UAE: 'AE', Qatar: 'QA',
  Kuwait: 'KW', Bahrain: 'BH', Oman: 'OM', Yemen: 'YE',
  Turkey: 'TR', Turkiye: 'TR', Cyprus: 'CY',
  'United Kingdom': 'GB', Germany: 'DE', France: 'FR', Italy: 'IT',
  Spain: 'ES', Portugal: 'PT', Netherlands: 'NL', Belgium: 'BE',
  Switzerland: 'CH', Austria: 'AT', Sweden: 'SE', Norway: 'NO',
  Denmark: 'DK', Finland: 'FI', Iceland: 'IS', Ireland: 'IE',
  Poland: 'PL', Czech: 'CZ', Slovakia: 'SK', Hungary: 'HU',
  Romania: 'RO', Bulgaria: 'BG', Greece: 'GR', Croatia: 'HR',
  Slovenia: 'SI', Serbia: 'RS', Bosnia: 'BA', Montenegro: 'ME',
  Albania: 'AL', 'North Macedonia': 'MK', Kosovo: 'XK',
  Estonia: 'EE', Latvia: 'LV', Lithuania: 'LT', Belarus: 'BY',
  Ukraine: 'UA', Moldova: 'MD', Russia: 'RU', Luxembourg: 'LU',
  Malta: 'MT', Monaco: 'MC', Liechtenstein: 'LI', Andorra: 'AD',
  USA: 'US', 'United States': 'US', 'United States of America': 'US',
  Canada: 'CA', Mexico: 'MX', Brazil: 'BR', Argentina: 'AR',
  Chile: 'CL', Colombia: 'CO', Peru: 'PE', Venezuela: 'VE',
  Ecuador: 'EC', Bolivia: 'BO', Paraguay: 'PY', Uruguay: 'UY',
  'Costa Rica': 'CR', Panama: 'PA', Guatemala: 'GT',
  Honduras: 'HN', 'El Salvador': 'SV', Nicaragua: 'NI',
  Nigeria: 'NG', Ethiopia: 'ET', Egypt: 'EG', 'South Africa': 'ZA',
  Kenya: 'KE', Tanzania: 'TZ', Uganda: 'UG', Ghana: 'GH',
  Morocco: 'MA', Tunisia: 'TN', Algeria: 'DZ', Libya: 'LY',
  Sudan: 'SD', Somalia: 'SO', Mozambique: 'MZ', Madagascar: 'MG',
  Cameroon: 'CM', Angola: 'AO', Zimbabwe: 'ZW', Zambia: 'ZM',
  Rwanda: 'RW', Namibia: 'NA', Botswana: 'BW',
  Australia: 'AU', 'New Zealand': 'NZ', Fiji: 'FJ', 
  'United Arab Emirates': 'AE',
}

const OS_ICONS: Record<string, string> = {
  Windows: '⊞', Mac: '🍎', Android: '⬡', iOS: '🔲',
  Linux: '🐧', 'GNU/Linux': '🐧', Ubuntu: '🔶',
  Chrome: '⊚', Other: '◈',
}

export default function Footer() {
  const [drawerOpen, setDrawerOpen]         = useState(false)
  const [legalOpen, setLegalOpen]           = useState(false)
  const [analytics, setAnalytics]           = useState<Analytics | null>(null)
  const [fetching, setFetching]             = useState(false)
  const [showAllCountries, setShowAllCountries] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)
  const legalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!drawerOpen || analytics) return
    setFetching(true)
    fetch('/api/analytics')
      .then(r => r.json())
      .then(data => { setAnalytics(data); setFetching(false) })
      .catch(() => setFetching(false))
  }, [drawerOpen, analytics])

  useEffect(() => {
    if (!drawerOpen) return
    const handler = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setDrawerOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [drawerOpen])

  useEffect(() => {
    if (!legalOpen) return
    const handler = (e: MouseEvent) => {
      if (legalRef.current && !legalRef.current.contains(e.target as Node)) {
        setLegalOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [legalOpen])

  useEffect(() => {
    document.body.style.overflow = drawerOpen || legalOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen, legalOpen])

  const allCountries     = analytics?.countries ?? []
  const visibleCountries = showAllCountries ? allCountries : allCountries.slice(0, 5)
  const allOS            = analytics?.os ?? []

  return (
    <>
      <style>{`
        @keyframes neonPulse {
          0%,100% { opacity:1; } 50% { opacity:0.35; }
        }
        @keyframes drawerIn {
          from { transform:translateX(100%); opacity:0; }
          to   { transform:translateX(0);    opacity:1; }
        }
        @keyframes overlayIn {
          from { opacity:0; } to { opacity:1; }
        }
        @keyframes modalIn {
          from { transform: translate(-50%, -50%) scale(0.95) translateY(20px); opacity:0; }
          to   { transform: translate(-50%, -50%) scale(1)    translateY(0);    opacity:1; }
        }

        .neon-dot { animation: neonPulse 1.8s ease-in-out infinite; }

        .analytics-drawer {
          animation: drawerIn 0.38s cubic-bezier(0.16,1,0.3,1) forwards;
          position: fixed; top:0; right:0; bottom:0;
          width: 360px; max-width: 100vw;
          z-index: 99990;
          background: rgba(6,6,14,0.97);
          backdrop-filter: blur(32px);
          -webkit-backdrop-filter: blur(32px);
          border-left: 1px solid rgba(255,255,255,0.08);
          display: flex; flex-direction: column;
          box-shadow: -20px 0 60px rgba(0,0,0,0.6), -1px 0 0 rgba(0,217,255,0.08);
        }
        .analytics-drawer::before {
          content:'';
          position:absolute; top:0; left:0; right:0; height:1px;
          background: linear-gradient(90deg, rgba(0,217,255,0.5), transparent);
        }

        .legal-modal {
          animation: modalIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards;
          position: fixed; top:50%; left:50%; transform: translate(-50%, -50%);
          z-index: 99991;
          background: rgba(6,6,14,0.98);
          backdrop-filter: blur(32px);
          -webkit-backdrop-filter: blur(32px);
          border: 1px solid rgba(0,217,255,0.2);
          max-width: 500px; max-height: 80vh;
          width: 90vw;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
           overscroll-behavior: contain;
          box-shadow: 0 20px 60px rgba(0,0,0,0.8), 0 0 60px rgba(0,217,255,0.1);
        }
        .legal-modal::-webkit-scrollbar { width: 3px; }
        .legal-modal::-webkit-scrollbar-thumb { background: rgba(0,217,255,0.3); border-radius: 99px; }

        .drawer-overlay {
          animation: overlayIn 0.3s ease forwards;
          position:fixed; inset:0; z-index:99989;
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(2px);
        }

        .stat-pill {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          padding: 14px 16px;
          position: relative; overflow: hidden;
          transition: border-color 0.2s;
        }
        .stat-pill:hover { border-color: rgba(0,217,255,0.2); }

        .bar-track {
          height: 3px;
          background: rgba(255,255,255,0.06);
          border-radius: 99px; overflow: hidden;
        }
        .bar-fill {
          height: 100%; border-radius: 99px;
          transition: width 0.9s cubic-bezier(0.16,1,0.3,1);
        }

        .sec-lbl {
          font-size: 9px; letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.22);
          font-family: 'DM Mono', monospace;
          display: flex; align-items: center; gap: 6px;
          margin-bottom: 12px;
        }
        .sec-lbl::after {
          content:''; flex:1; height:1px;
          background: rgba(255,255,255,0.05);
        }

        .os-chip {
          display: flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 8px; padding: 8px 10px;
          transition: border-color 0.2s;
        }
        .os-chip:hover { border-color: rgba(167,139,250,0.3); }

        .drawer-scroll::-webkit-scrollbar { width: 3px; }
        .drawer-scroll::-webkit-scrollbar-track { background: transparent; }
        .drawer-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 99px; }

        .country-expand-btn {
          display: flex; align-items: center; gap: 6px;
          margin-top: 8px; width: 100%;
          background: none; border: none; cursor: pointer;
          padding: 4px 0;
        }
        .country-expand-btn:hover .expand-label { color: rgba(0,217,255,0.7); }
        .country-expand-btn:hover .expand-icon  { color: rgba(0,217,255,0.6); }
        .expand-label {
          color: rgba(0,217,255,0.4);
          font-size: 10px; font-family: 'DM Mono', monospace;
          transition: color 0.2s;
        }
        .expand-icon {
          color: rgba(0,217,255,0.3);
          transition: color 0.2s, transform 0.3s;
          width: 12px; height: 12px;
        }
      `}</style>

      {/* ── Footer ── */}
      <footer className="bg-[#080810] border-t border-white/[0.06] py-8 px-6 relative z-40">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Top Section: Copyright + Buttons */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <button 
              onClick={() => setLegalOpen(true)}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#00d9ff] neon-dot" />
              <p className="text-white/30 text-sm font-mono tracking-wider hover:text-white/50">© 2026 MOHAMMED SAQIB PATEL</p>
            </button>
            <div className="flex items-center gap-2.5 flex-wrap justify-center">
              <LiquidButton
                onClick={() => setDrawerOpen(true)}
                variant={drawerOpen ? 'lime' : 'cyan'}
                size="sm"
                icon={<Activity className="w-3.5 h-3.5" />}
              >
                Visitors
              </LiquidButton>
              <LiquidButton href="/gallery" variant="yellow" size="sm" icon={<Images className="w-3.5 h-3.5" />}>
                Gallery
              </LiquidButton>
              <LiquidButton href="/spectrum" variant="cyan" size="sm" icon={<Monitor className="w-3.5 h-3.5" />}>
                Monitor
              </LiquidButton>
            </div>
          </div>

   
        </div>
      </footer>

      {/* ── Legal Modal Overlay ── */}
      {legalOpen && <div className="drawer-overlay" onClick={() => setLegalOpen(false)} />}

      {/* ── Legal Modal ── */}
      {legalOpen && (
        <div ref={legalRef} className="legal-modal p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-cyan">Legal</h2>
            <button
              onClick={() => setLegalOpen(false)}
              className="w-6 h-6 rounded-lg border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-white/30 hover:text-white hover:border-white/20 transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Privacy */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-white/70">Privacy Policy</h3>
            <p className="text-xs text-white/50 leading-relaxed">
               <strong>This site collect:</strong> Contact form (name, email, message via Resend), analytics (page views, country, device), visitor metrics. <strong>Data retention:</strong> All auto-deletes after 30 days. <strong>Usage:</strong> Respond to inquiries & improve experience.
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/[0.08]" />

          {/* Copyright */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-white/70">Copyright & License</h3>
            <p className="text-xs text-white/50 leading-relaxed">
               © 2026 Mohammed Saqib Patel. Portfolio — for commercial use or licensing inquiries: mspatel7721@gmail.com
            </p>
          </div>
        </div>
      )}

      {/* ── Overlay ── */}
      {drawerOpen && <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} />}

      {/* ── Side Drawer ── */}
      {drawerOpen && (
        <div ref={drawerRef} className="analytics-drawer">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07] flex-shrink-0"
            style={{ background: 'linear-gradient(90deg,rgba(0,217,255,0.04),transparent)' }}>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#00d9ff]/10 border border-[#00d9ff]/20 flex items-center justify-center flex-shrink-0">
                <Activity className="w-3.5 h-3.5 text-[#00d9ff]" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold tracking-wide">Live Analytics</p>
                <p className="text-white/25 text-[10px] font-mono">saqibpatel · real-time</p>
              </div>
              <div className="flex items-center gap-1.5 ml-1 px-2 py-0.5 rounded-full bg-[#84cc16]/10 border border-[#84cc16]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#84cc16] neon-dot" />
                <span className="text-[#84cc16] text-[9px] font-mono">LIVE</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setAnalytics(null); setShowAllCountries(false) }}
                className="text-[9px] font-mono text-white/20 hover:text-[#00d9ff] transition-colors px-2 py-1 rounded border border-white/[0.06] hover:border-[#00d9ff]/20"
              >↻</button>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-7 h-7 rounded-lg border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-white/30 hover:text-white hover:border-white/20 transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Scrollable content */}
          <div
            className="flex-1 overflow-y-auto drawer-scroll px-5 py-5 space-y-6"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >

            {/* Stat pills */}
            <div className="grid grid-cols-2 gap-3">
              <div className="stat-pill">
                <div style={{ position:'absolute', bottom:0, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,rgba(132,204,22,0.4),transparent)' }} />
                <p className="text-white/25 text-[9px] font-mono tracking-widest uppercase mb-2">This Month</p>
                <p className="text-2xl font-bold font-mono mb-0.5"
                  style={{ background:'linear-gradient(135deg,#84cc16,#a3e635)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                  {fetching ? '···' : (analytics?.activeNow ?? '—')}
                </p>
                <p className="text-white/20 text-[10px] font-mono">page views</p>
              </div>
              <div className="stat-pill">
                <div style={{ position:'absolute', bottom:0, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,rgba(0,217,255,0.4),transparent)' }} />
                <p className="text-white/25 text-[9px] font-mono tracking-widest uppercase mb-2">All Time</p>
                <p className="text-2xl font-bold font-mono mb-0.5"
                  style={{ background:'linear-gradient(135deg,#00d9ff,#7dd8ff)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                  {fetching ? '···' : (analytics?.avgSession ?? '—')}
                </p>
                <p className="text-white/20 text-[10px] font-mono">total views</p>
              </div>
            </div>

            {/* Countries */}
            <div>
              <div className="sec-lbl">
                <Globe className="w-3 h-3" /> Audience · Countries
              </div>

              {fetching ? (
                <div className="space-y-3">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="h-6 rounded-md bg-white/[0.04] animate-pulse" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {visibleCountries.map((c, i) => (
                      <div key={c.name} className="flex items-center gap-3 group">
                        <span className="text-white/20 text-[9px] font-mono w-3 flex-shrink-0">{i + 1}</span>
                        <Flag
                          code={COUNTRY_CODE[c.name] ?? ''}
                          style={{ width:20, height:13, borderRadius:2, objectFit:'cover', flexShrink:0, opacity:0.85 }}
                        />
                        <span className="text-white/50 text-xs font-mono flex-1 truncate group-hover:text-white/80 transition-colors">
                          {c.name}
                        </span>
                        <div className="w-20 bar-track flex-shrink-0">
                          <div className="bar-fill" style={{
                            width: `${c.pct}%`,
                            background: i === 0
                              ? 'linear-gradient(90deg,#00d9ff,#7dd8ff)'
                              : i === 1
                              ? 'linear-gradient(90deg,#84cc16,#a3e635)'
                              : 'linear-gradient(90deg,rgba(255,255,255,0.25),rgba(255,255,255,0.1))',
                          }} />
                        </div>
                        <span className="text-white/35 text-[10px] font-mono w-7 text-right flex-shrink-0">{c.pct}%</span>
                      </div>
                    ))}
                  </div>

                  {allCountries.length > 5 && (
                    <button
                      className="country-expand-btn"
                      onClick={() => setShowAllCountries(v => !v)}
                    >
                      <span className="text-white/15 text-[9px] font-mono w-3">
                        {showAllCountries ? '−' : '+'}
                      </span>
                      <span className="expand-label">
                        {showAllCountries
                          ? 'show less'
                          : `${allCountries.length - 5} more countries`}
                      </span>
                      <ChevronUp
                        className="expand-icon"
                        style={{ transform: showAllCountries ? 'rotate(0deg)' : 'rotate(180deg)' }}
                      />
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Devices / OS */}
            <div>
              <div className="sec-lbl">
                <Monitor className="w-3 h-3" /> Devices · OS
              </div>

              {fetching ? (
                <div className="grid grid-cols-2 gap-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="h-12 rounded-lg bg-white/[0.04] animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {allOS.map((o, i) => (
                    <div key={o.name} className="os-chip">
                      <span className="text-base flex-shrink-0">{OS_ICONS[o.name] ?? '◈'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/55 text-[11px] font-mono truncate">{o.name}</p>
                        <div className="bar-track mt-1">
                          <div className="bar-fill" style={{
                            width: `${o.pct}%`,
                            background: i === 0
                              ? 'linear-gradient(90deg,#a78bfa,#c4b5fd)'
                              : i === 1
                              ? 'linear-gradient(90deg,#f59e0b,#fbbf24)'
                              : 'linear-gradient(90deg,rgba(255,255,255,0.25),rgba(255,255,255,0.1))',
                          }} />
                        </div>
                      </div>
                      <span className="text-white/30 text-[10px] font-mono flex-shrink-0">{o.pct}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="h-2" />
          </div>
        </div>
      )}
    </>
  )
}