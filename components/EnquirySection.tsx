'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Mail, X, Loader2, CheckCircle2, ChevronDown, Send } from 'lucide-react'
import LiquidButton from '@/components/LiquidButton'

// Formspree Form ID: mojbzorg
// Guide to set up or change Formspree:
// 1. Sign up/Log in at https://formspree.io
// 2. Create a new form project (e.g., "Contact Form") and select your target email address.
// 3. Formspree will provide a form endpoint URL like: https://formspree.io/f/mojbzorg
// 4. Update the FORMSPREE_ID constant below with the unique ID at the end of your URL (e.g., 'mojbzorg').
const FORMSPREE_ID = 'mojbzorg'

type Status = 'idle' | 'sending' | 'success' | 'error'

export default function EnquiryModal() {
  const [open, setOpen]       = useState(false)
  const [status, setStatus]   = useState<Status>('idle')
  const [form, setForm]       = useState({ name: '', email: '', message: '' })
  const [mounted, setMounted] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => setMounted(true), [])
  useEffect(() => {
    if (open) setTimeout(() => nameRef.current?.focus(), 200)
  }, [open])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
    if (status === 'error') setStatus('idle')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return
    setStatus('sending')
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setStatus('success')
        setForm({ name: '', email: '', message: '' })
        setTimeout(() => { setStatus('idle'); setOpen(false) }, 3000)
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (!mounted) return null

  return createPortal(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;700&display=swap');

        .eq-panel {
          position: fixed; bottom: 160px; right: 28px; z-index: 99999;
          width: 320px; background: #0e0e14;
          border: 1px solid rgba(0,217,255,0.18); border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 8px 48px rgba(0,0,0,0.6), 0 0 40px rgba(0,217,255,0.06);
          transform-origin: bottom right;
          transition: opacity .25s ease, transform .25s cubic-bezier(.34,1.56,.64,1);
          font-family: 'Comfortaa', cursive;
        }
        .eq-panel.closed { opacity: 0; transform: scale(0.88) translateY(12px); pointer-events: none; }
        .eq-panel.open   { opacity: 1; transform: scale(1) translateY(0); }

        .eq-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 18px;
          background: rgba(0,217,255,0.05);
          border-bottom: 1px solid rgba(0,217,255,0.1);
        }
        .eq-header-left { display: flex; align-items: center; gap: 8px; }
        .eq-dot {
          width: 7px; height: 7px; border-radius: 50%; background: #00d9ff;
          animation: eqDotPulse 1.4s ease-in-out infinite;
        }
        @keyframes eqDotPulse {
          0%,100% { opacity: 1; } 50% { opacity: 0.35; }
        }
        .eq-title { font-size: 13px; font-weight: 700; color: #fff; letter-spacing: 0.03em; }
        .eq-close {
          width: 26px; height: 26px; border-radius: 50%;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: rgba(255,255,255,0.4);
          transition: background .15s, color .15s;
        }
        .eq-close:hover { background: rgba(255,255,255,0.1); color: #fff; }

        .eq-body { padding: 18px; display: flex; flex-direction: column; gap: 12px; }
        .eq-row   { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .eq-field { display: flex; flex-direction: column; gap: 5px; }
        .eq-lbl   { font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255,255,255,0.28); }

        .eq-inp, .eq-ta {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 9px; color: #fff;
          font-family: 'Comfortaa', cursive; font-size: 12px;
          padding: 9px 11px; outline: none; width: 100%; box-sizing: border-box;
          transition: border-color .2s, box-shadow .2s;
        }
        .eq-inp::placeholder, .eq-ta::placeholder { color: rgba(255,255,255,0.18); }
        .eq-inp:focus, .eq-ta:focus {
          border-color: rgba(0,217,255,0.4);
          box-shadow: 0 0 0 3px rgba(0,217,255,0.07);
        }
        .eq-ta { resize: none; height: 80px; line-height: 1.5; }

        .eq-success {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; gap: 10px; padding: 32px 18px;
          text-align: center; animation: eqFadeIn .3s ease;
        }
        @keyframes eqFadeIn {
          from { opacity:0; transform:translateY(6px); }
          to   { opacity:1; transform:none; }
        }
        .eq-success-icon  { color: #00d9ff; }
        .eq-success-title { font-size: 14px; font-weight: 700; color: #fff; }
        .eq-success-sub   { font-size: 11px; color: rgba(255,255,255,0.3); line-height: 1.5; }
        .eq-error         { font-size: 11px; color: rgba(255,120,120,0.85); text-align: center; }

        .eq-liquid-wrap { width: 100%; display: flex; }
        .eq-liquid-wrap > * { flex: 1; justify-content: center; border-radius: 9px !important; }

        @keyframes liqRip { to { transform: scale(24); opacity: 0; } }
        @keyframes spin    { to { transform: rotate(360deg); } }

        @media (max-width: 520px) {
          .eq-fab-wrap { right: 14px !important; bottom: 88px !important; }
          .eq-panel    { right: 14px; bottom: 152px; width: calc(100vw - 28px); max-width: 360px; }
        }
      `}</style>

      {/* ── FAB ── */}
      <div
        className="eq-fab-wrap"
        style={{ position: 'fixed', bottom: 96, right: 28, zIndex: 99999 }}
      >
        {/* overflow:hidden clips LiquidButton's square bg to the circle */}
        <div style={{ borderRadius: '50%', overflow: 'hidden', width: 52, height: 52 }}>
          <LiquidButton
            onClick={() => setOpen(o => !o)}
            variant="cyan"
            size="md"
            icon={
              open
                ? <ChevronDown style={{ width: 20, height: 20 }} />
                : <Mail        style={{ width: 20, height: 20 }} />
            }
            style={{
              borderRadius: '50%',
              width:        '52px',
              height:       '52px',
              padding:      '0',
              border:       '1.5px solid rgba(0,217,255,0.5)',
              boxShadow:    '0 0 20px rgba(0,217,255,0.18)',
            }}
          />
        </div>
      </div>

      {/* ── Panel ── */}
      <div className={`eq-panel ${open ? 'open' : 'closed'}`} role="dialog" aria-modal="true" aria-label="Send a message">

        {/* Header */}
        <div className="eq-header">
          <div className="eq-header-left">
            <div className="eq-dot" />
            <span className="eq-title">Send a Message</span>
          </div>
          <button className="eq-close" onClick={() => setOpen(false)} aria-label="Close">
            <X style={{ width: 13, height: 13 }} />
          </button>
        </div>

        {/* Success state */}
        {status === 'success' ? (
          <div className="eq-success">
            <CheckCircle2 className="eq-success-icon" style={{ width: 36, height: 36 }} />
            <p className="eq-success-title">Message sent!</p>
            <p className="eq-success-sub">Thanks for reaching out. I&apos;ll get back to you within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="eq-body">

              <div className="eq-row">
                <div className="eq-field">
                  <label className="eq-lbl">Name</label>
                  <input
                    ref={nameRef} name="name" className="eq-inp"
                    placeholder="Your name" value={form.name}
                    onChange={handleChange} required disabled={status === 'sending'}
                  />
                </div>
                <div className="eq-field">
                  <label className="eq-lbl">Email</label>
                  <input
                    name="email" type="email" className="eq-inp"
                    placeholder="you@mail.com" value={form.email}
                    onChange={handleChange} required disabled={status === 'sending'}
                  />
                </div>
              </div>

              <div className="eq-field">
                <label className="eq-lbl">Message</label>
                <textarea
                  name="message" className="eq-ta"
                  placeholder="What's on your mind?" value={form.message}
                  onChange={handleChange} required disabled={status === 'sending'}
                />
              </div>

              {status === 'error' && (
                <p className="eq-error">Something went wrong — please try again.</p>
              )}

              <div className="eq-liquid-wrap">
                <LiquidButton
                  onClick={handleSubmit as unknown as () => void}
                  variant="cyan"
                  size="sm"
                  icon={
                    status === 'sending'
                      ? <Loader2 style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} />
                      : <Send style={{ width: 13, height: 13 }} />
                  }
                >
                  {status === 'sending' ? 'Sending…' : 'Send Message'}
                </LiquidButton>
              </div>

            </div>
          </form>
        )}
      </div>
    </>,
    document.body
  )
}