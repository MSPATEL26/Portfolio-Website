'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, ArrowLeft, ZoomIn, ImageOff,
  Heart, Download, Share2, ChevronLeft, ChevronRight, Eye,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type Category = 'college' | 'hackathon' | 'personal'

type GalleryItem = {
  src: string
  title: string
  category: Category
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORY_META: Record<Category, { accent: string }> = {
  college:   { accent: '#00d9ff' },
  hackathon: { accent: '#f59e0b' },
  personal:  { accent: '#a855f7' },
}

const LIKED_KEY = 'gallery_liked'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getPhotoId(src: string): string {
  return src.split('/').pop()?.replace(/\.[^.]+$/, '') ?? src
}

function getLikedSet(): Set<string> {
  try {
    const raw = localStorage.getItem(LIKED_KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

function saveLikedSet(set: Set<string>) {
  try {
    localStorage.setItem(LIKED_KEY, JSON.stringify(Array.from(set)))
  } catch {}
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function GalleryPage() {
  const [items, setItems]           = useState<GalleryItem[]>([])
  const [loading, setLoading]       = useState(true)
  const [lightbox, setLightbox]     = useState<GalleryItem | null>(null)
  const [likes, setLikes]           = useState<Record<string, number>>({})
  const [likedSet, setLikedSet]     = useState<Set<string>>(new Set())
  const [copied, setCopied]         = useState(false)
  const [visitors, setVisitors]     = useState<number | null>(null)
  const touchStartX                 = useRef<number | null>(null)

  // Sort: most liked first, rest in original order
  const sortedItems = [...items].sort((a, b) => {
    const la = likes[getPhotoId(a.src)] ?? 0
    const lb = likes[getPhotoId(b.src)] ?? 0
    return lb - la
  })

  // Only pin if there's at least 1 like — else keep original order
  const hasAnyLikes = Object.values(likes).some((v) => v > 0)
  const displayItems = hasAnyLikes ? sortedItems : items

  // ── Fetch items + bulk likes ──────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/gallery')
      .then((r) => r.json())
      .then((data: GalleryItem[]) => {
        setItems(data)
        setLoading(false)
        const ids = data.map((i) => getPhotoId(i.src)).join(',')
        if (ids) {
          fetch(`/api/gallery/likes?ids=${ids}`)
            .then((r) => r.json())
            .then(setLikes)
            .catch(() => {})
        }
      })
      .catch(() => setLoading(false))
  }, [])

  // ── Visitor counter — increment once per session ──────────────────────────
  useEffect(() => {
    const SESSION_KEY = 'gallery_visited'
    const alreadyVisited = sessionStorage.getItem(SESSION_KEY)

    if (!alreadyVisited) {
      sessionStorage.setItem(SESSION_KEY, '1')
      fetch('/api/gallery/visitors', { method: 'POST' })
        .then((r) => r.json())
        .then((d) => setVisitors(d.count))
        .catch(() => {})
    } else {
      fetch('/api/gallery/visitors')
        .then((r) => r.json())
        .then((d) => setVisitors(d.count))
        .catch(() => {})
    }
  }, [])

  // ── localStorage liked set ────────────────────────────────────────────────
  useEffect(() => {
    setLikedSet(getLikedSet())
  }, [])

  // ── URL ?photo=index sync ─────────────────────────────────────────────────
  useEffect(() => {
    if (items.length === 0) return
    const params = new URLSearchParams(window.location.search)
    const idx = parseInt(params.get('photo') ?? '', 10)
    if (!isNaN(idx) && items[idx]) setLightbox(items[idx])
  }, [items])

  // ── Keyboard nav ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!lightbox) return
    const handler = (e: KeyboardEvent) => {
      const idx = displayItems.findIndex((i) => i.src === lightbox.src)
      if (e.key === 'ArrowRight' && displayItems[idx + 1]) setLightbox(displayItems[idx + 1])
      if (e.key === 'ArrowLeft'  && displayItems[idx - 1]) setLightbox(displayItems[idx - 1])
      if (e.key === 'Escape') setLightbox(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightbox, displayItems])

  // ── Like handler ─────────────────────────────────────────────────────────
  const handleLike = async (item: GalleryItem, e: React.MouseEvent) => {
    e.stopPropagation()
    const id = getPhotoId(item.src)
    const alreadyLiked = likedSet.has(id)

    setLikes((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] ?? 0) + (alreadyLiked ? -1 : 1)),
    }))
    const newSet = new Set(likedSet)
    alreadyLiked ? newSet.delete(id) : newSet.add(id)
    setLikedSet(newSet)
    saveLikedSet(newSet)

    await fetch('/api/gallery/like', {
      method: alreadyLiked ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoId: id }),
    }).catch(() => {})
  }

  // ── Share handler ────────────────────────────────────────────────────────
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!lightbox) return
    const globalIdx = items.findIndex((i) => i.src === lightbox.src)
    const url = `${window.location.origin}/gallery?photo=${globalIdx}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }

  // ── Touch swipe ───────────────────────────────────────────────────────────
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || !lightbox) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const idx = displayItems.findIndex((i) => i.src === lightbox.src)
    if (dx < -50 && displayItems[idx + 1]) setLightbox(displayItems[idx + 1])
    if (dx >  50 && displayItems[idx - 1]) setLightbox(displayItems[idx - 1])
    touchStartX.current = null
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="min-h-screen bg-[#0a0a0a] pt-16 pb-24 px-6">
        <div className="max-w-6xl mx-auto">

          {/* Back */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/40 hover:text-[#00d9ff] text-xs font-mono tracking-widest transition-colors mb-10 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            BACK TO HOME
          </Link>

          {/* Header */}
          <div className="mb-10">
            <p className="text-[#00d9ff] text-[10px] font-mono tracking-[0.3em] mb-3">VISUAL ARCHIVE</p>

            {/* Title + visitor counter on same line */}
            <div className="flex items-center gap-4 flex-wrap">
              <h1 className="text-4xl md:text-5xl font-black text-white leading-none">
                My{' '}
                <span style={{ fontFamily: 'Comfortaa, serif', fontStyle: 'italic', fontWeight: 400, color: '#00d9ff' }}>
                  Gallery
                </span>
              </h1>

              {/* Visitor counter badge */}
              {visitors !== null && (
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border"
                  style={{
                    borderColor: 'rgba(0,217,255,0.2)',
                    background: 'rgba(0,217,255,0.06)',
                  }}
                >
                  <Eye className="w-3 h-3 text-[#00d9ff]" />
                  <span className="text-[11px] font-mono text-[#00d9ff]">
                    {formatCount(visitors)}
                  </span>
                </div>
              )}
            </div>

            <p className="text-white/30 text-sm mt-3">Academics · Creations · Moments</p>

            {/* Empty state guide */}
            {!loading && items.length === 0 && (
              <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-5 text-xs font-mono text-white/30 space-y-1.5 max-w-md">
                <p className="text-[#00d9ff] mb-2">HOW TO ADD PHOTOS</p>
                <p>Drop images into <span className="text-white/60">/public/gallery/</span></p>
                <p>Prefix filename by category (optional):</p>
                <p className="text-[#00d9ff]/70">college-campus.jpg &nbsp;→ College</p>
                <p className="text-[#f59e0b]/70">hack-team.jpg &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;→ Hackathon</p>
                <p className="text-[#a855f7]/70">me-photo.jpg &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;→ Personal</p>
              </div>
            )}
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={`break-inside-avoid rounded-xl bg-white/[0.03] animate-pulse ${
                    i % 5 === 0 ? 'aspect-[3/4]' : i % 3 === 0 ? 'aspect-square' : 'aspect-[4/3]'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Masonry grid */}
          {!loading && displayItems.length > 0 && (
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
              {displayItems.map((item, i) => {
                const id = getPhotoId(item.src)
                const likeCount = likes[id] ?? 0
                const isPinned = hasAnyLikes && i === 0 && likeCount > 0
                return (
                  <PhotoCard
                    key={item.src}
                    item={item}
                    index={i}
                    likeCount={likeCount}
                    liked={likedSet.has(id)}
                    isPinned={isPinned}
                    onClick={() => setLightbox(item)}
                    onLike={(e) => handleLike(item, e)}
                  />
                )
              })}
            </div>
          )}

          {/* Bottom back */}
          <div className="mt-20 pt-8 border-t border-white/5 flex justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-mono px-6 py-3 rounded-full border border-white/15 text-white/40 hover:border-[#00d9ff] hover:text-[#00d9ff] transition-all group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
          </div>

        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
      {lightbox && (() => {
        const currentIndex = displayItems.findIndex((i) => i.src === lightbox.src)
        const prev  = displayItems[currentIndex - 1] ?? null
        const next  = displayItems[currentIndex + 1] ?? null
        const id    = getPhotoId(lightbox.src)
        const liked = likedSet.has(id)

        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
            onClick={() => setLightbox(null)}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {/* Prev */}
            {prev && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightbox(prev) }}
                className="absolute left-4 w-11 h-11 rounded-full bg-black/70 border border-white/15 flex items-center justify-center text-white/60 hover:text-white hover:border-[#00d9ff] transition-all z-10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {/* Panel */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-3xl w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={() => setLightbox(null)}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/70 border border-white/15 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Image */}
              <div className="relative w-full" style={{ paddingBottom: '66%' }}>
                <Image
                  src={lightbox.src}
                  alt={lightbox.title || lightbox.category}
                  fill
                  className="object-contain bg-[#111]"
                  sizes="(max-width: 768px) 100vw, 768px"
                />
              </div>

              {/* Bottom bar */}
              <div className="px-5 py-3 bg-[#0f0f0f] border-t border-white/5 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3 min-w-0">
                  {lightbox.title && (
                    <p className="text-white font-semibold text-sm truncate">{lightbox.title}</p>
                  )}
                  <span className="text-[10px] font-mono text-white/30 shrink-0">
                    {currentIndex + 1} / {displayItems.length}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Like */}
                  <button
                    onClick={(e) => handleLike(lightbox, e)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all"
                    style={{
                      borderColor: liked ? '#ef4444' : 'rgba(255,255,255,0.1)',
                      color:       liked ? '#ef4444' : 'rgba(255,255,255,0.4)',
                      background:  liked ? '#ef444412' : 'transparent',
                    }}
                  >
                    <Heart className="w-3.5 h-3.5" fill={liked ? '#ef4444' : 'none'} />
                    <span className="text-[11px] font-mono">{likes[id] ?? 0}</span>
                  </button>

                  {/* Share */}
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 text-white/40 hover:border-[#00d9ff] hover:text-[#00d9ff] transition-all"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-mono">{copied ? 'Copied!' : 'Share'}</span>
                  </button>

                  {/* Download */}
                  <a
                    href={lightbox.src}
                    download
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-center w-8 h-8 rounded-full border border-white/10 text-white/40 hover:border-[#00d9ff] hover:text-[#00d9ff] transition-all"
                    title="Download"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Next */}
            {next && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightbox(next) }}
                className="absolute right-4 w-11 h-11 rounded-full bg-black/70 border border-white/15 flex items-center justify-center text-white/60 hover:text-white hover:border-[#00d9ff] transition-all z-10"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </motion.div>
        )
      })()}
      </AnimatePresence>

      {/* Copied toast */}
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] px-5 py-2.5 rounded-full bg-[#00d9ff] text-black text-xs font-mono font-bold pointer-events-none transition-all duration-300"
        style={{ opacity: copied ? 1 : 0, transform: `translateX(-50%) translateY(${copied ? '0' : '12px'})` }}
      >
        Link copied to clipboard
      </div>
    </>
  )
}

// ─── Photo Card ───────────────────────────────────────────────────────────────

function PhotoCard({
  item,
  index,
  likeCount,
  liked,
  isPinned,
  onClick,
  onLike,
}: {
  item: GalleryItem
  index: number
  likeCount: number
  liked: boolean
  isPinned: boolean
  onClick: () => void
  onLike: (e: React.MouseEvent) => void
}) {
  const [imgError, setImgError] = useState(false)
  const accent = CATEGORY_META[item.category].accent
  const aspectClass =
    index % 5 === 0 ? 'aspect-[3/4]' : index % 3 === 0 ? 'aspect-square' : 'aspect-[4/3]'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: (index % 12) * 0.05, ease: 'easeOut' }}
      whileHover={{ scale: 1.02, borderColor: `${accent}88` }}
      className={`break-inside-avoid relative overflow-hidden rounded-xl cursor-pointer group w-full mb-3 inline-block ${aspectClass}`}
      style={{
        border: isPinned ? `1px solid ${accent}55` : '1px solid rgba(255,255,255,0.06)',
      }}
      onClick={onClick}
    >
      {!imgError ? (
        <Image
          src={item.src}
          alt={item.title || item.category}
          fill
          className="object-cover object-[center_20%] transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${accent}10 0%, #0a0a0a 100%)` }}
        >
          <ImageOff className="w-8 h-8" style={{ color: `${accent}40` }} />
        </div>
      )}

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

      {/* Pinned badge */}
      {isPinned && (
        <div
          className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono uppercase"
          style={{ background: `${accent}20`, border: `1px solid ${accent}40`, color: accent }}
        >
          <Heart className="w-2.5 h-2.5" fill={accent} />
          Top
        </div>
      )}

      {/* Zoom icon on hover */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm"
          style={{ background: `${accent}25`, border: `1px solid ${accent}55` }}
        >
          <ZoomIn className="w-4 h-4" style={{ color: accent }} />
        </div>
      </div>

      {/* Like button */}
      <button
        onClick={onLike}
        className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-sm transition-all"
        style={{
          background: liked ? '#ef444420' : 'rgba(0,0,0,0.55)',
          border: `1px solid ${liked ? '#ef4444' : 'rgba(255,255,255,0.15)'}`,
          color: liked ? '#ef4444' : 'rgba(255,255,255,0.6)',
        }}
        data-liked={liked ? 'true' : 'false'}
      >
        <Heart className="w-3 h-3" fill={liked ? '#ef4444' : 'none'} />
        {likeCount > 0 && (
          <span className="text-[10px] font-mono">{likeCount}</span>
        )}
      </button>

      <style>{`
        [data-liked="false"] { opacity: 0; }
        .group:hover [data-liked="false"] { opacity: 1; }
        [data-liked="true"] { opacity: 1; }
      `}</style>
    </motion.div>
  )
}