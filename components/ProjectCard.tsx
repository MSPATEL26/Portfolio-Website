'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Github, ExternalLink, Clock, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

import type { Project } from '@/lib/types'

export default function ProjectCard({ project }: { project: Project }) {
  const [activeTab, setActiveTab] = useState<'scope' | 'tech'>('scope')
  const [imgError, setImgError] = useState(false)
  const isComingSoon = project.status === 'coming-soon'
  const isWip = project.status === 'wip'
  const hasImage = !!project.image && !imgError

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="bg-white/5 border border-white/10 hover:border-cyan-500/60 rounded-2xl overflow-hidden transition-colors duration-300 cursor-pointer group relative"
    >
      {/* ── Preview area ─────────────────────────────────────── */}
      <div className="h-44 relative overflow-hidden">

        {/* Background: screenshot OR gradient fallback */}
        {hasImage ? (
          <Image
            src={project.image!}
            alt={`${project.title} preview`}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className={`object-cover object-top transition-transform duration-500 group-hover:scale-105 ${isComingSoon || isWip ? 'blur-sm scale-105' : ''}`}
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: isComingSoon
                ? `linear-gradient(135deg, rgba(245,158,11,0.07) 0%, rgba(180,83,9,0.12) 50%, rgba(0,0,0,0.18) 100%)`
                : isWip
                ? `linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(109,40,217,0.15) 50%, rgba(0,0,0,0.18) 100%)`
                : `linear-gradient(135deg, rgba(0,217,255,0.1) 0%, rgba(59,130,246,0.15) 50%, rgba(245,158,11,0.1) 100%)`,
            }}
          />
        )}

        {/* Gradient vignette — always present */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent z-10" />

        {/* Big project number — shows when no image */}
        {!hasImage && (
          <span className={`absolute inset-0 flex items-center justify-center text-6xl font-black transition-colors z-10 ${isComingSoon || isWip ? 'text-white/[0.07]' : 'text-white/10 group-hover:text-white/20'}`}>
            {String(project.id).padStart(2, '0')}
          </span>
        )}

        {/* Coming Soon overlay */}
        {isComingSoon && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 backdrop-blur-[2px] bg-black/30">
            <div className="flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 backdrop-blur-md text-amber-400 text-[10px] font-semibold px-3 py-1.5 rounded-full tracking-widest uppercase">
              <Clock className="w-3 h-3" />
              Coming Soon
            </div>
          </div>
        )}

        {/* WIP overlay */}
        {isWip && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 backdrop-blur-[2px] bg-black/30">
            <div className="flex items-center gap-2 bg-purple-500/15 border border-purple-500/30 backdrop-blur-md text-purple-300 text-[10px] font-semibold px-3 py-1.5 rounded-full tracking-widest uppercase">
              <Loader2 className="w-3 h-3 animate-spin" />
              In Progress
            </div>
            <p className="text-[10px] text-purple-300/50 tracking-wide">Active Development</p>
          </div>
        )}
      </div>

      {/* ── Card content ─────────────────────────────────────── */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-white mb-2">{project.title}</h3>
        <p className="text-sm text-white/50 mb-4 leading-relaxed">{project.description}</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-3">
          {(['scope', 'tech'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors ${
                activeTab === tab
                  ? isComingSoon
                    ? 'bg-amber-500/70 text-black'
                    : 'bg-[#00d9ff] text-black'
                  : 'bg-white/5 text-white/50 hover:text-white'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="min-h-[60px]">
          {activeTab === 'scope' ? (
            <p className="text-sm text-white/60">{project.scope}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {project.tech.map((t) => (
                <span
                  key={t}
                  className={`text-xs px-2 py-1 rounded-full border ${
                    isComingSoon
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                      : isWip
                      ? 'bg-purple-500/10 border-purple-500/20 text-purple-300'
                      : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                  }`}
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Links */}
        <div className="flex gap-3 mt-4 pt-4 border-t border-white/10">
          <Link
            href={project.github}
            target="_blank"
            className="flex items-center gap-1 text-xs text-white/50 hover:text-white transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Github className="w-3 h-3" />
            Code
          </Link>

          {isComingSoon ? (
            <span className="flex items-center gap-1 text-xs text-amber-500/40 cursor-not-allowed select-none">
              <Clock className="w-3 h-3" />
              In Progress
            </span>
          ) : isWip ? (
            <span className="flex items-center gap-1 text-xs text-purple-500/40 cursor-not-allowed select-none">
              <Loader2 className="w-3 h-3 animate-spin" />
              In Progress
            </span>
          ) : project.live && project.live !== '#' ? (
            <Link
              href={project.live}
              target="_blank"
              className="flex items-center gap-1 text-xs text-white/50 hover:text-[#00d9ff] transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3 h-3" />
              Live
            </Link>
          ) : null}
        </div>
      </div>
    </motion.div>
  )
}