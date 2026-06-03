'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Credential {
  id: number
  title: string
  issuer: string
  date: string
  tags: string[]
  description: string
  credentialId: string
  verifyUrl: string
  color: string
  issuerLogo: string
  image?: string
  
}

export default function CredentialCard({
  credential,
  direction,
}: {
  credential: Credential
  direction: number
}) {
  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={credential.id}
        custom={direction}
        initial={{ opacity: 0, x: direction > 0 ? 60 : -60 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: direction > 0 ? -60 : 60 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        className="flex flex-col md:flex-row gap-0 rounded-2xl overflow-hidden"
        style={{ border: `1px solid rgba(255,255,255,0.08)`, background: '#111' }}
      >
        {/* LEFT — Certificate image */}
        <div
          className="w-full md:w-[48%] flex-shrink-0 relative min-h-[260px] md:min-h-[320px] flex items-center justify-center overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.02)' }}
        >
          {credential.image ? (
            <Image
              src={credential.image}
              alt={credential.title}
              fill
              className="object-contain"
            />
          ) : (
            /* Stylised placeholder that matches each issuer */
            <div
              className="w-full h-full flex flex-col items-center justify-center gap-4 p-8"
              style={{
                background: `linear-gradient(135deg, ${credential.color}08 0%, rgba(0,0,0,0) 100%)`,
                borderRight: `1px solid rgba(255,255,255,0.05)`,
              }}
            >
              {/* Big issuer badge */}
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black"
                style={{
                  background: `${credential.color}18`,
                  border: `2px solid ${credential.color}35`,
                  color: credential.color,
                  fontFamily: 'monospace',
                  letterSpacing: '-0.05em',
                }}
              >
                {credential.issuerLogo}
              </div>

              {/* Certificate-style inner box */}
              <div
                className="w-full max-w-[260px] rounded-xl p-5 text-center"
                style={{
                  border: `1px solid ${credential.color}20`,
                  background: 'rgba(255,255,255,0.02)',
                }}
              >
                <p
                  className="text-[9px] tracking-[0.2em] mb-3"
                  style={{ color: `${credential.color}60` }}
                >
                  CERTIFICATE OF ACCOMPLISHMENT
                </p>
                <p className="text-xs text-white/20 mb-2">PRESENTED TO</p>
                <p
                  className="text-lg font-bold mb-3"
                  style={{ color: credential.color, fontFamily: 'serif', fontStyle: 'italic' }}
                >
                  Alex Dev
                </p>
                <div
                  className="px-4 py-1.5 rounded-lg text-xs font-bold mb-3"
                  style={{
                    background: `${credential.color}15`,
                    border: `1px solid ${credential.color}30`,
                    color: credential.color,
                  }}
                >
                  {credential.title}
                </div>
                <p className="text-[10px] text-white/15 leading-relaxed">
                  {credential.issuer}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3 h-3" style={{ color: `${credential.color}50` }} />
                <span
                  className="text-[10px] font-mono"
                  style={{ color: `${credential.color}40` }}
                >
                  {credential.credentialId}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — Details */}
        <div className="flex-1 flex flex-col justify-between p-8">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-5">
            {credential.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-3 py-1 rounded-full font-semibold tracking-widest"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.5)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <div className="mb-6">
            <h3
              className="text-3xl md:text-4xl font-black text-white leading-tight mb-3"
              style={{ letterSpacing: '-0.02em', fontFamily: "'Comfortaa', cursive" }}
              >
              {credential.title}
            </h3>
            <p className="text-base italic" style={{ color: credential.color }}>
              {credential.issuer}
              <span className="text-white/30 not-italic"> — {credential.date}</span>
            </p>
          </div>

          {/* Description */}
          <p className="text-white/50 text-sm leading-relaxed mb-8">
            {credential.description}
          </p>

          {/* Verify button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-white/15" />
              <span className="text-[11px] text-white/20 font-mono">{credential.credentialId}</span>
            </div>
            <Link
              href={credential.verifyUrl}
              target="_blank"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-105"
              style={{
                background: `${credential.color}15`,
                border: `1px solid ${credential.color}40`,
                color: credential.color,
              }}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Verify Certificate
            </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}