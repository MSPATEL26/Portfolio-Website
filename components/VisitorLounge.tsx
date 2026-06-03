'use client'

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import {
  Send, Trash2, Shield, Volume2, VolumeX, Search, X, Reply, CornerUpLeft, BarChart2, Plus, Check,
  Zap, Moon, Wind, Flame, Sparkles, Star, Eye, Target, Smile, Sun, Anchor, Waves,
  Crosshair, Dumbbell, Crown, Ghost, Heart, Feather, Activity, Atom, Brain,
  Leaf, Mountain, Rocket, Network, Snowflake, Compass, Cloud, Satellite,
  Pin, PinOff, Copy, CheckCheck, MessageSquare, Clock, Globe,
  Paperclip, FileText, FileImage, File, Download, AlertCircle,
} from 'lucide-react'

type ReplyTo   = { id: string; user: string; text: string }
type Poll      = { id: string; question: string; options: string[]; votes: number[]; createdAt: number; expiresAt: number }

// ── File attachment type ──────────────────────────────────────────────────────
type AttachedFile = {
  name: string
  type: string       // MIME type
  size: number       // bytes
  data: string       // base64 data URL
}

type LoungeMessage = {
  id: string
  user: string
  text: string
  ts: number
  country?: string
  reactions?: Record<string, string[]>
  replyTo?: ReplyTo
  file?: AttachedFile   // ── NEW
}

type VisitorLoungeProps = {
  open: boolean
  onActiveChange?: (count: number) => void
}

// ── File constraints (same for everyone — visitor & admin) ───────────────────
const MAX_FILE_BYTES   = 500 * 1024          // 500 KB hard limit
const ACCEPTED_TYPES = [
  'image/jpeg','image/png','image/gif','image/webp','image/svg+xml',
  'application/pdf',
  'text/plain','text/markdown','application/json',

  'text/typescript',
  'application/typescript',
  'application/x-typescript',

  'text/x-python',
  'application/x-python-code',

  'text/javascript',
  'application/javascript'
]
const ACCEPTED_ATTR = '.jpg,.jpeg,.png,.gif,.webp,.svg,.pdf,.txt,.md,.json,.tsx,.ts,.js,.py,.java,.cpp,.c,.cs,.go,.rs,.php'

const POLL_INTERVAL = 3000
const MAX_CHARS     = 280
const EMOJIS        = ['👍', '❤️', '😂', '🔥', '👀']
const AVATAR_COLORS = [
  '#e74c3c','#e67e22','#f1c40f','#2ecc71',
  '#1abc9c','#3498db','#9b59b6','#e91e63',
  '#00bcd4','#ff5722','#8bc34a','#673ab7',
]

const CHARACTER_POOL = [
  'IronMan','SpiderMan','Thor','Hulk','Wolverine','BlackPanther','CaptainAmerica','DrStrange',
  'BlackWidow','ScarletWitch','Loki','Deadpool','GhostRider','Punisher','DareDevil',
  'Venom','Thanos','MoonKnight','ShangChi','MilesMorales','StarLord','Gamora',
  'AntMan','Vision','Magneto','Cyclops','Storm',
  'DoctorDoom','Nova','Blade','Taskmaster','Shuri',
  'Batman','Superman','TheFlash','Joker','WonderWoman','Aquaman','GreenArrow',
  'GreenLantern','Nightwing','HarleyQuinn','Deathstroke','Cyborg','Shazam',
  'BlackAdam','Constantine','Catwoman','Darkseid','RedHood','Starfire','Raven',
  'BeastBoy','Lobo','BlueBeetle','DrFate','Zatanna',
  'Naruto','Goku','Luffy','Levi','Sasuke','Zoro','Ichigo','Gojo',
  'Vegeta','Saitama','Deku','Bakugo','Todoroki','AllMight','Madara',
  'Itachi','Kakashi','Minato','Aizen','Kenpachi','Mikasa','Eren',
  'Edward','RoyMustang','Spike','Natsu','Erza','Meliodas','Gilthunder',
  'Ainz','Rimuru','Subaru','Emilia','Killua','Gon','Kurapika','Leorio',
  'LightYagami','LLawliet','Ryuk','Mugen','Jin',
]

type GifItem = {
  id: string
  title: string
  preview: string
  url: string
  w: number
  h: number
}

import type { LucideIcon } from 'lucide-react'
type IconComp = LucideIcon

const CHARACTER_ICONS: Record<string, IconComp> = {
  IronMan:       Zap,        SpiderMan:    Target,     Thor:          Zap,
  Hulk:          Dumbbell,   Wolverine:    Flame,      BlackPanther:  Eye,
  CaptainAmerica:Shield,     DrStrange:    Sparkles,   BlackWidow:    Crosshair,
  ScarletWitch:  Sparkles,   Loki:         Crown,      Deadpool:      Smile,
  GhostRider:    Flame,      Punisher:     Crosshair,  DareDevil:     Target,
  Venom:         Ghost,      Thanos:       Crown,      MoonKnight:    Moon,
  ShangChi:      Activity,   MilesMorales: Zap,        StarLord:      Rocket,
  Gamora:        Leaf,       AntMan:       Mountain,   Vision:        Brain,
  Mystique:      Eye,        Sabretooth:   Flame,      Electro:       Zap,
  DoctorDoom:    Crown,      Nova:         Satellite,  Blade:         Moon,
  Taskmaster:    Target,     Shuri:        Atom,
  Batman:        Moon,       Superman:     Star,       TheFlash:      Zap,
  Joker:         Smile,      WonderWoman:  Shield,     Aquaman:       Waves,
  GreenArrow:    Target,     GreenLantern: Atom,       Nightwing:     Feather,
  HarleyQuinn:   Heart,      Deathstroke:  Crosshair,  Cyborg:        Network,
  Shazam:        Zap,        BlackAdam:    Crown,      Constantine:   Ghost,
  Catwoman:      Eye,        Darkseid:     Crown,      RedHood:       Target,
  Starfire:      Star,       Raven:        Moon,       BeastBoy:      Leaf,
  Lobo:          Rocket,     BlueBeetle:   Atom,       DrFate:        Sparkles,
  Zatanna:       Sparkles,
  Naruto:        Wind,       Goku:         Sun,        Luffy:         Anchor,
  Levi:          Zap,        Sasuke:       Flame,      Zoro:          Compass,
  Ichigo:        Flame,      Gojo:         Sparkles,   Vegeta:        Crown,
  Saitama:       Star,       Deku:         Zap,        Bakugo:        Flame,
  Todoroki:      Snowflake,  AllMight:     Shield,     Madara:        Eye,
  Itachi:        Eye,        Kakashi:      Brain,      Minato:        Zap,
  Aizen:         Crown,      Kenpachi:     Zap,        Mikasa:        Crosshair,
  Eren:          Target,     Edward:       Atom,       RoyMustang:    Flame,
  Spike:         Rocket,     Natsu:        Flame,      Erza:          Shield,
  Meliodas:      Crown,      Gilthunder:   Zap,        Ainz:          Ghost,
  Rimuru:        Sparkles,   Subaru:       Activity,   Emilia:        Snowflake,
  Killua:        Zap,        Gon:          Leaf,       Kurapika:      Eye,
  Leorio:        Heart,      LightYagami:  Brain,      LLawliet:      Brain,
  Ryuk:          Ghost,      Mugen:        Wind,       Jin:           Feather,
}

function getAvatarContent(username: string): { Icon: IconComp | null; initials: string; color: string } {
  const base = username.replace(/-\d+$/, '')
  const Icon = CHARACTER_ICONS[base] ?? null
  return { Icon, initials: getInitials(username), color: getUserColor(username) }
}

function normalizeGifUrl(text: string): string {
  const url = text.trim()
  if (!/^https?:\/\//i.test(url)) return url

  try {
    const u = new URL(url)

    if (u.hostname.includes('tenor.com') && !u.hostname.startsWith('media.')) {
      const idMatch = u.pathname.match(/-(\d+)(?:$|\/)/)
      if (idMatch?.[1]) return `https://media.tenor.com/${idMatch[1]}/tenor.gif`
    }

    if (u.hostname.includes('giphy.com') && !u.hostname.startsWith('media.')) {
      const idMatch = u.pathname.match(/-([a-zA-Z0-9]+)(?:$|\/)/)
      if (idMatch?.[1]) return `https://media.giphy.com/media/${idMatch[1]}/giphy.gif`
    }

    return url
  } catch {
    return url
  }
}

function isGifUrl(text: string): boolean {
  const t = normalizeGifUrl(text)
  if (!t.startsWith('https://') && !t.startsWith('http://')) return false
  return (
    t.endsWith('.gif') || t.endsWith('.webp') ||
    t.includes('tenor.com') || t.includes('giphy.com') ||
    t.includes('media.tenor') || t.includes('i.imgur.com') ||
    t.includes('c.tenor.com') || t.includes('media1.tenor') ||
    t.includes('media2.tenor') || t.includes('media3.tenor') ||
    t.includes('media.giphy.com')
  )
}

// ── File helpers ──────────────────────────────────────────────────────────────
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(mime: string): IconComp {
  if (mime.startsWith('image/')) return FileImage
  if (mime === 'application/pdf') return FileText
  return File
}

function isImageMime(mime: string): boolean {
  return mime.startsWith('image/')
}

// ── Read file as base64 data URL ──────────────────────────────────────────────
function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

const SYSTEM_NOTE = {
  id: '__system__', user: 'SYSTEM',
  text: " You're chatting with real visitors worldwide ·  Keep it friendly, no spam or offensive content ·  Messages are visible to everyone · /gif <url> to share a GIF · 📎 attach files up to 500 KB",
  ts: 0,
}

function getUserColor(u: string): string {
  let h = 0
  for (let i = 0; i < u.length; i++) h = u.charCodeAt(i) + ((h << 5) - h)
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}
function getInitials(u: string): string {
  const p = u.trim().split(/[-_\s]/)
  if (p.length >= 2) return (p[0][0] + p[1][0]).toUpperCase()
  return u.slice(0, 2).toUpperCase()
}
function getRelativeTime(ts: number): string {
  const d = Date.now() - ts
  if (d < 60000) return 'just now'
  if (d < 3600000) return `${Math.floor(d/60000)}m ago`
  if (d < 86400000) return `${Math.floor(d/3600000)}h ago`
  const days = Math.floor(d/86400000)
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days/30)}mo ago`
}
function getCountryCode(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (tz.includes('Calcutta') || tz.includes('Kolkata')) return 'IN'
    const m: Record<string,string> = {
      'America/New_York':'US','America/Chicago':'US','America/Denver':'US','America/Los_Angeles':'US',
      'America/Toronto':'CA','America/Vancouver':'CA','America/Sao_Paulo':'BR','Europe/London':'GB',
      'Europe/Paris':'FR','Europe/Berlin':'DE','Europe/Madrid':'ES','Europe/Rome':'IT',
      'Europe/Moscow':'RU','Asia/Tokyo':'JP','Asia/Shanghai':'CN','Asia/Hong_Kong':'HK',
      'Asia/Seoul':'KR','Asia/Singapore':'SG','Asia/Dubai':'AE','Asia/Karachi':'PK',
      'Asia/Dhaka':'BD','Asia/Bangkok':'TH','Asia/Jakarta':'ID','Australia/Sydney':'AU',
      'Africa/Cairo':'EG','Africa/Lagos':'NG',
    }
    const found = Object.entries(m).find(([k]) => tz.includes(k))
    return found ? found[1] : 'IN'
  } catch { return 'IN' }
}
function playPing() {
  try {
    const ctx  = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const osc  = ctx.createOscillator(); const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.12)
    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.35)
  } catch {}
}

function renderText(text: string, query: string): React.ReactNode {
  const parts = text.split(/(@\w+)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (/^@\w+$/.test(part)) {
          return <span key={i} style={{ color:'#00d9ff', fontWeight:600 }}>{part}</span>
        }
        if (query.trim()) {
          const idx = part.toLowerCase().indexOf(query.toLowerCase())
          if (idx !== -1) {
            return (
              <span key={i}>
                {part.slice(0, idx)}
                <mark style={{ background:'rgba(0,217,255,0.25)', color:'#00d9ff', borderRadius:3, padding:'0 1px' }}>
                  {part.slice(idx, idx + query.length)}
                </mark>
                {part.slice(idx + query.length)}
              </span>
            )
          }
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

// ── File message renderer ─────────────────────────────────────────────────────
function FileMessageRenderer({ file }: { file: AttachedFile }) {
  const FileIcon = getFileIcon(file.type)
  const isImage  = isImageMime(file.type)

  if (isImage) {
    return (
      <div className="lounge-file-img-wrap">
        <img
          src={file.data}
          alt={file.name}
          className="lounge-file-img"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
        <div className="lounge-file-img-label">
          <FileImage size={9} style={{ flexShrink: 0 }} />
          <span>{file.name}</span>
          <span style={{ opacity: 0.5 }}>· {formatBytes(file.size)}</span>
        </div>
      </div>
    )
  }

  // Non-image: download card
  return (
    <a
      href={file.data}
      download={file.name}
      className="lounge-file-card"
      onClick={e => e.stopPropagation()}
    >
      <div className="lounge-file-card-icon">
        <FileIcon size={18} color="#00d9ff" strokeWidth={1.5} />
      </div>
      <div className="lounge-file-card-info">
        <span className="lounge-file-card-name">{file.name}</span>
        <span className="lounge-file-card-meta">{formatBytes(file.size)} · click to download</span>
      </div>
      <Download size={13} color="rgba(0,217,255,0.5)" style={{ flexShrink: 0, marginLeft: 'auto' }} />
    </a>
  )
}

export default function VisitorLounge({ open, onActiveChange }: VisitorLoungeProps) {
  const [messages, setMessages]       = useState<LoungeMessage[]>([])
  const [input, setInput]             = useState('')
  const [activeCount, setActiveCount] = useState(1)
  const [activeUsers, setActiveUsers] = useState<string[]>([])
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [me, setMe]                   = useState('Guest')
  const [connected, setConnected]     = useState(false)
  const [isAdmin, setIsAdmin]         = useState(false)
  const [adminToken, setAdminToken]   = useState('')
  const [myCountry, setMyCountry]     = useState('IN')
  const [soundOn, setSoundOn]         = useState(true)
  const [hoveredMsg, setHoveredMsg]   = useState<string | null>(null)
  const [replyTo, setReplyTo]         = useState<ReplyTo | null>(null)
  const [searchOpen, setSearchOpen]   = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [, forceUpdate]               = useState(0)

  const [pinnedMsgId, setPinnedMsgId] = useState<string | null>(null)
  const [copiedId, setCopiedId]       = useState<string | null>(null)

  // ── Profile card ─────────────────────────────────────────────────────────
  const [profileUser, setProfileUser] = useState<string | null>(null)
  const [profilePos,  setProfilePos]  = useState({ x: 0, y: 0 })

  // ── Reaction tooltip ──────────────────────────────────────────────────────
  const [hoveredReaction, setHoveredReaction] = useState<{ msgId: string; emoji: string } | null>(null)

  // ── File attachment state ─────────────────────────────────────────────────
  const [pendingFile,   setPendingFile]   = useState<AttachedFile | null>(null)
  const [fileError,     setFileError]     = useState<string | null>(null)
  const [fileUploading, setFileUploading] = useState(false)

  // ── GIF picker state ───────────────────────────────────────────────────────
  const [gifOpen, setGifOpen]       = useState(false)
  const [gifQuery, setGifQuery]     = useState('')
  const [gifLoading, setGifLoading] = useState(false)
  const [gifItems, setGifItems]     = useState<GifItem[]>([])
  const [gifErr, setGifErr]         = useState<string | null>(null)

  // Poll state
  const [poll, setPoll]               = useState<Poll | null>(null)
  const [hasVoted, setHasVoted]       = useState(false)
  const [votedOption, setVotedOption] = useState(-1)
  const [showPollCreate, setShowPollCreate] = useState(false)
  const [pollQuestion, setPollQuestion]     = useState('')
  const [pollOptions, setPollOptions]       = useState(['', ''])
  const [pollDuration, setPollDuration]     = useState(24)
  const [pollVoting, setPollVoting]         = useState(false)

  const scrollRef          = useRef<HTMLDivElement>(null)
  const isUserScrollingRef = useRef(false)
  const pollRef            = useRef<NodeJS.Timeout | null>(null)
  const typingTimerRef     = useRef<NodeJS.Timeout | null>(null)
  const clientIdRef        = useRef<string>(crypto.randomUUID())
  const knownMsgIdsRef     = useRef<Set<string>>(new Set())
  const soundOnRef         = useRef(true)
  const inputRef           = useRef<HTMLInputElement>(null)
  const searchRef          = useRef<HTMLInputElement>(null)
  const profileCardRef     = useRef<HTMLDivElement>(null)
  const fileInputRef       = useRef<HTMLInputElement>(null)

  const adminName = 'Admin'

  const pinnedMsg = useMemo(
    () => messages.find(m => m.id === pinnedMsgId) ?? null,
    [messages, pinnedMsgId]
  )
  const charsLeft = MAX_CHARS - input.length
  const charsNear = charsLeft <= 40
  const charsOver = charsLeft < 0

  // ── Profile stats ─────────────────────────────────────────────────────────
  const profileStats = useMemo(() => {
    if (!profileUser) return null
    const userMsgs = messages.filter(m => m.user === profileUser)
    const firstMsg = userMsgs.length > 0 ? Math.min(...userMsgs.map(m => m.ts)) : null
    const country  = userMsgs.find(m => m.country)?.country ?? null
    return {
      count:   userMsgs.length,
      joined:  firstMsg ? getRelativeTime(firstMsg) : 'unknown',
      country: country ?? '—',
    }
  }, [profileUser, messages])

  // ── Close profile card on outside click ──────────────────────────────────
  useEffect(() => {
    if (!profileUser) return
    const handler = (e: MouseEvent) => {
      if (profileCardRef.current && !profileCardRef.current.contains(e.target as Node)) {
        setProfileUser(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [profileUser])

  useEffect(() => { soundOnRef.current = soundOn }, [soundOn])
  useEffect(() => {
    const i = setInterval(() => forceUpdate(n => n + 1), 30000)
    return () => clearInterval(i)
  }, [])
  useEffect(() => { setMyCountry(getCountryCode()) }, [])
  useEffect(() => {
    const saved = localStorage.getItem('portfolio_lounge_name')
    const isOldGuestName = saved && /^Guest-\d+$/.test(saved)
    if (saved && !isOldGuestName) {
      setMe(saved)
    } else {
      const pick = CHARACTER_POOL[Math.floor(Math.random() * CHARACTER_POOL.length)]
      const gen  = `${pick}-${Math.floor(Math.random() * 900 + 100)}`
      setMe(gen); localStorage.setItem('portfolio_lounge_name', gen)
    }
    const params = new URLSearchParams(window.location.search)
    const secret = params.get('admin') ?? ''
    setIsAdmin(!!process.env.NEXT_PUBLIC_LOUNGE_ADMIN_TOKEN && secret === process.env.NEXT_PUBLIC_LOUNGE_ADMIN_TOKEN)
    setAdminToken(secret)
  }, [])

  useEffect(() => {
    if (!scrollRef.current || !open) return
    if (isUserScrollingRef.current) return
    setTimeout(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight }, 50)
  }, [messages, open])

  useEffect(() => { if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50); else setSearchQuery('') }, [searchOpen])
  useEffect(() => { if (replyTo) setTimeout(() => inputRef.current?.focus(), 50) }, [replyTo])

  const fetchPoll = useCallback(async () => {
    try {
      const r = await fetch(`/api/lounge/poll?clientId=${clientIdRef.current}`)
      const d = await r.json()
      if (d.ok) { setPoll(d.poll); setHasVoted(d.hasVoted); setVotedOption(d.votedOption ?? -1) }
    } catch {}
  }, [])

  const pollFetch = useCallback(async () => {
    try {
      const myName = isAdmin ? adminName : me
      const res    = await fetch(`/api/lounge/stream?user=${encodeURIComponent(myName)}&clientId=${clientIdRef.current}`)
      if (!res.ok) throw new Error('poll failed')
      const data = await res.json() as {
        ok: boolean; messages: LoungeMessage[]; activeCount: number
        activeUsers: string[]; typingUsers: string[]
        poll: Poll | null; hasVoted: boolean; votedOption: number
      }
      setConnected(true)
      const newMsgs = data.messages.filter(m => !knownMsgIdsRef.current.has(m.id) && m.user !== myName)
      if (newMsgs.length > 0 && soundOnRef.current && knownMsgIdsRef.current.size > 0) playPing()
      knownMsgIdsRef.current = new Set(data.messages.map(m => m.id))
      setMessages(data.messages.slice(-120))
      setActiveUsers(data.activeUsers ?? [])
      setTypingUsers((data.typingUsers ?? []).filter(u => u !== myName))
      const count = Math.max(1, data.activeCount)
      setActiveCount(count); onActiveChange?.(count)
      if (data.poll !== undefined) { setPoll(data.poll); setHasVoted(data.hasVoted); setVotedOption(data.votedOption ?? -1) }
    } catch { setConnected(false) }
  }, [me, isAdmin, adminName, onActiveChange])

  const deregister = useCallback(async () => {
    try { await fetch(`/api/lounge/stream?clientId=${clientIdRef.current}`, { method: 'DELETE' }) } catch {}
  }, [])

  useEffect(() => {
    if (!open || !me) return
    pollFetch()
    pollRef.current = setInterval(pollFetch, POLL_INTERVAL)
    return () => { if (pollRef.current) clearInterval(pollRef.current); setConnected(false); void deregister() }
  }, [open, me, pollFetch, deregister])

  // ── canSend: text OR file is ready ───────────────────────────────────────
  const canSend = useMemo(
    () => (input.trim().length > 0 || pendingFile !== null) && !charsOver && !fileUploading,
    [input, pendingFile, charsOver, fileUploading]
  )

  const sendTyping = useCallback(() => {
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    fetch('/api/lounge/typing', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: isAdmin ? adminName : me, clientId: clientIdRef.current }),
    }).catch(() => {})
  }, [me, isAdmin, adminName])

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setFileError(null)

    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    const ACCEPTED_EXTS = new Set([
      'jpg','jpeg','png','gif','webp','svg',
      'pdf','txt','md','json',
      'tsx','ts','js','jsx','py',
      'java','cpp','c','cs','go','rs','php',
    ])

    const mimeOk = ACCEPTED_TYPES.includes(file.type)
    const extOk  = ACCEPTED_EXTS.has(ext)

    if (!mimeOk && !extOk) {
      setFileError(`Unsupported file type. Allowed: images, PDF, txt, md, json, code files`)
      return
    }

    if (file.size > MAX_FILE_BYTES) {
      setFileError(`File too large (${formatBytes(file.size)}). Max is 500 KB.`)
      return
    }

    setFileUploading(true)
    try {
      const data = await readFileAsDataURL(file)
      setPendingFile({ name: file.name, type: file.type || 'text/plain', size: file.size, data })
      setTimeout(() => inputRef.current?.focus(), 50)
    } catch {
      setFileError('Failed to read file. Please try again.')
    } finally {
      setFileUploading(false)
    }
  }, [])

  // ── GIF fetch ───────────────────────────────────────────────────────────────
  const fetchGifs = useCallback(async (q: string) => {
    setGifLoading(true)
    setGifErr(null)
    try {
      const r = await fetch(`/api/lounge/gif-search?q=${encodeURIComponent(q)}&limit=24`)
      const d = await r.json()
      if (!d.ok) throw new Error(d.error || 'GIF fetch failed')
      setGifItems(d.gifs || [])
    } catch {
      setGifErr('Could not load GIFs')
      setGifItems([])
    } finally {
      setGifLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!gifOpen) return
    const t = setTimeout(() => { void fetchGifs(gifQuery) }, 250)
    return () => clearTimeout(t)
  }, [gifOpen, gifQuery, fetchGifs])

  const onSelectGif = async (gifUrl: string) => {
    setGifOpen(false)
    setGifQuery('')
    setGifItems([])
    setInput(gifUrl)
    setTimeout(() => { void onSend() }, 0)
  }

  // ── Dismiss file error after 4 seconds ───────────────────────────────────
  useEffect(() => {
    if (!fileError) return
    const t = setTimeout(() => setFileError(null), 4000)
    return () => clearTimeout(t)
  }, [fileError])

  const onSend = async () => {
    let text = input.trim()
    if (!text && !pendingFile) return
    if (charsOver) return

    if (text.startsWith('/gif ')) {
      text = text.slice(5).trim()
      if (!text.startsWith('http')) return
    }

    text = normalizeGifUrl(text)

    const currentReply = replyTo
    const currentFile  = pendingFile

    setInput('')
    setReplyTo(null)
    setPendingFile(null)
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)

    await fetch('/api/lounge/send', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user:    isAdmin ? adminName : me,
        text:    text || '',
        country: myCountry,
        ...(currentReply ? { replyTo: currentReply } : {}),
        ...(currentFile  ? { file: currentFile }     : {}),
      }),
    })
    isUserScrollingRef.current = false
    await pollFetch()
  }

  const onReact = async (messageId: string, emoji: string) => {
    await fetch('/api/lounge/react', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId, emoji, user: isAdmin ? adminName : me }),
    }); await pollFetch()
  }

  const onDelete = async (id: string) => {
    if (pinnedMsgId === id) setPinnedMsgId(null)
    await fetch(`/api/lounge/delete?id=${encodeURIComponent(id)}&token=${encodeURIComponent(adminToken)}`, { method: 'DELETE' })
    await pollFetch()
  }

  const onCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const onPin = (id: string) => setPinnedMsgId(prev => prev === id ? null : id)

  const handleUserClick = (username: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setProfileUser(prev => {
      if (prev === username) return null
      setProfilePos({ x: rect.left, y: rect.bottom + 6 })
      return username
    })
  }

  const onVote = async (optionIndex: number) => {
    if (hasVoted || pollVoting || !poll) return
    setPollVoting(true)
    try {
      const r = await fetch('/api/lounge/poll', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'vote', clientId: clientIdRef.current, optionIndex }),
      })
      const d = await r.json()
      if (d.ok) { setPoll(d.poll); setHasVoted(true); setVotedOption(optionIndex) }
    } catch {} finally { setPollVoting(false) }
  }

  const onCreatePoll = async () => {
    const opts = pollOptions.filter(o => o.trim())
    if (!pollQuestion.trim() || opts.length < 2) return
    await fetch('/api/lounge/poll', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: adminToken, question: pollQuestion.trim(), options: opts, durationHours: pollDuration }),
    })
    setPollQuestion(''); setPollOptions(['', '']); setShowPollCreate(false)
    await fetchPoll()
  }

  const onDeletePoll = async () => {
    await fetch(`/api/lounge/poll?token=${encodeURIComponent(adminToken)}`, { method: 'DELETE' })
    setPoll(null); setHasVoted(false); setVotedOption(-1)
  }

  const displayMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages
    const q = searchQuery.toLowerCase()
    return messages.filter(m => m.text.toLowerCase().includes(q) || m.user.toLowerCase().includes(q))
  }, [messages, searchQuery])

  const totalVotes   = poll ? poll.votes.reduce((a, b) => a + b, 0) : 0
  const shownAvatars = Array.from(new Set(activeUsers)).slice(0, 4)
  const extraCount   = Math.max(0, activeCount - shownAvatars.length)

  return (
    <>
      <style>{`
        .lounge-scroll::-webkit-scrollbar { width:3px; }
        .lounge-scroll::-webkit-scrollbar-track { background:transparent; }
        .lounge-scroll::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.08); border-radius:99px; }
        .msg-row { transition:background 0.15s; border-radius:12px; position:relative; }
        .msg-row:hover { background:rgba(255,255,255,0.03); }
        .admin-msg { background:rgba(0,217,255,0.04); border-left:2px solid rgba(0,217,255,0.35); border-radius:0 12px 12px 0; }
        .pinned-row { outline:1px solid rgba(0,217,255,0.2); outline-offset:-1px; border-radius:12px; }

        .reaction-bar {
          position:absolute; right:8px; top:-22px; display:flex; align-items:center; gap:2px;
          background:#1a1a24; border:1px solid rgba(255,255,255,0.1); border-radius:20px;
          padding:3px 6px; z-index:10; box-shadow:0 4px 16px rgba(0,0,0,0.5);
          animation:reactionBarIn 0.15s ease;
        }
        @keyframes reactionBarIn { from{opacity:0;transform:translateY(4px) scale(0.92);} to{opacity:1;transform:none;} }
        .reaction-btn { background:none; border:none; cursor:pointer; font-size:14px; padding:2px 3px; border-radius:6px; transition:transform 0.12s,background 0.12s; line-height:1; }
        .reaction-btn:hover { transform:scale(1.3); background:rgba(255,255,255,0.08); }
        .icon-action-btn { background:none; border:none; cursor:pointer; color:rgba(255,255,255,0.3); padding:2px 4px; border-radius:6px; transition:color 0.15s,background 0.15s; display:flex; align-items:center; }
        .icon-action-btn:hover { color:rgba(0,217,255,0.8); background:rgba(0,217,255,0.08); }
        .icon-action-btn.cyan { color:#00d9ff; }
        .reply-btn-hover { background:none; border:none; cursor:pointer; color:rgba(255,255,255,0.3); padding:2px 5px; border-radius:6px; transition:color 0.15s,background 0.15s; display:flex; align-items:center; gap:3px; font-size:9px; font-family:'DM Mono',monospace; }
        .reply-btn-hover:hover { color:rgba(0,217,255,0.8); background:rgba(0,217,255,0.08); }
        .bar-divider { width:1px; height:14px; background:rgba(255,255,255,0.1); margin:0 2px; flex-shrink:0; }

        .reaction-pill-wrap { position:relative; display:inline-flex; }
        .reaction-pill { display:inline-flex; align-items:center; gap:3px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.09); border-radius:99px; padding:2px 7px; font-size:11px; cursor:pointer; transition:background 0.15s,border-color 0.15s; font-family:inherit; color:rgba(255,255,255,0.6); }
        .reaction-pill:hover { background:rgba(255,255,255,0.09); border-color:rgba(0,217,255,0.2); }
        .reaction-pill.reacted { background:rgba(0,217,255,0.08); border-color:rgba(0,217,255,0.25); color:#00d9ff; }
        .reaction-tooltip {
          position:absolute; bottom:calc(100% + 6px); left:50%; transform:translateX(-50%);
          background:#1a1a24; border:1px solid rgba(255,255,255,0.12); border-radius:8px;
          padding:5px 8px; white-space:nowrap; font-size:10px; font-family:'DM Mono',monospace;
          color:rgba(255,255,255,0.6); z-index:50; pointer-events:none;
          animation:reactionBarIn 0.12s ease; box-shadow:0 4px 16px rgba(0,0,0,0.6);
        }
        .reaction-tooltip::after {
          content:''; position:absolute; top:100%; left:50%; transform:translateX(-50%);
          border:4px solid transparent; border-top-color:#1a1a24;
        }

        .reply-preview { background:rgba(0,217,255,0.05); border-left:2px solid rgba(0,217,255,0.4); border-radius:4px 8px 8px 4px; padding:5px 10px; margin-bottom:5px; }
        .reply-preview-user { font-size:9px; color:#00d9ff; font-family:'DM Mono',monospace; margin-bottom:2px; }
        .reply-preview-text { font-size:11px; color:rgba(255,255,255,0.4); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .reply-strip { display:flex; align-items:center; gap:8px; background:rgba(0,217,255,0.04); border-top:1px solid rgba(0,217,255,0.12); padding:6px 12px; animation:replyStripIn 0.18s ease; }
        @keyframes replyStripIn { from{opacity:0;transform:translateY(4px);} to{opacity:1;transform:none;} }

        .pinned-banner { display:flex; align-items:center; gap:8px; background:rgba(0,217,255,0.05); border:1px solid rgba(0,217,255,0.18); border-radius:10px; padding:7px 11px; margin-bottom:8px; animation:replyStripIn 0.2s ease; }

        @keyframes typingDot { 0%,80%,100%{transform:translateY(0);opacity:0.4;} 40%{transform:translateY(-4px);opacity:1;} }
        .typing-dot { width:4px; height:4px; border-radius:50%; background:rgba(255,255,255,0.4); display:inline-block; animation:typingDot 1.2s ease-in-out infinite; }
        .typing-dot:nth-child(2){animation-delay:0.15s;} .typing-dot:nth-child(3){animation-delay:0.30s;}

        .avatar-stack { display:flex; align-items:center; }
        .avatar-mini { width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:7px; font-weight:700; font-family:'DM Mono',monospace; border:1.5px solid #0e0e14; margin-left:-5px; flex-shrink:0; }
        .avatar-mini:first-child { margin-left:0; }

        .search-bar { animation:searchBarIn 0.2s cubic-bezier(0.16,1,0.3,1); }
        @keyframes searchBarIn { from{opacity:0;transform:translateY(-4px);} to{opacity:1;transform:none;} }

        .system-msg { background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:10px; padding:8px 12px; margin-bottom:8px; }

        .poll-card { background:rgba(0,217,255,0.04); border:1px solid rgba(0,217,255,0.15); border-radius:14px; padding:12px 14px; margin-bottom:8px; }
        .poll-option { width:100%; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:9px; padding:8px 12px; cursor:pointer; position:relative; overflow:hidden; transition:border-color 0.2s; text-align:left; }
        .poll-option:hover:not(:disabled) { border-color:rgba(0,217,255,0.3); }
        .poll-option.voted { border-color:rgba(0,217,255,0.4); background:rgba(0,217,255,0.06); }
        .poll-option.my-vote { border-color:rgba(0,217,255,0.6); }
        .poll-bar { position:absolute; top:0; left:0; bottom:0; background:rgba(0,217,255,0.08); transition:width 0.8s cubic-bezier(0.16,1,0.3,1); border-radius:9px; }
        .poll-create { background:rgba(0,217,255,0.03); border:1px solid rgba(0,217,255,0.12); border-radius:14px; padding:12px 14px; margin-bottom:8px; animation:reactionBarIn 0.2s ease; }
        .poll-inp { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:8px; color:#fff; font-size:12px; padding:7px 10px; outline:none; width:100%; box-sizing:border-box; transition:border-color 0.2s; font-family:inherit; }
        .poll-inp:focus { border-color:rgba(0,217,255,0.4); }
        .poll-inp::placeholder { color:rgba(255,255,255,0.2); }

        .username-btn { cursor:pointer; transition:color 0.15s; }
        .username-btn:hover { color:#00d9ff !important; text-decoration:underline; text-underline-offset:2px; }

        @keyframes profileCardIn { from{opacity:0;transform:translateY(-6px) scale(0.95);} to{opacity:1;transform:none;} }
        .profile-card {
          position:fixed; z-index:9999;
          background:#13131e; border:1px solid rgba(255,255,255,0.12);
          border-radius:14px; padding:14px 16px; width:200px;
          box-shadow:0 8px 32px rgba(0,0,0,0.7);
          animation:profileCardIn 0.18s cubic-bezier(0.16,1,0.3,1);
        }

        .lounge-gif { max-width:100%; max-height:180px; border-radius:10px; display:block; margin-top:4px; object-fit:contain; }

        /* ── File attachment: image ── */
        .lounge-file-img-wrap { display:inline-flex; flex-direction:column; gap:4px; margin-top:4px; max-width:220px; }
        .lounge-file-img { width:100%; max-height:180px; border-radius:10px; object-fit:cover; border:1px solid rgba(255,255,255,0.08); display:block; }
        .lounge-file-img-label { display:flex; align-items:center; gap:4px; font-size:9px; font-family:'DM Mono',monospace; color:rgba(255,255,255,0.3); }

        /* ── File attachment: download card ── */
        .lounge-file-card {
          display:flex; align-items:center; gap:10px; margin-top:4px;
          background:rgba(0,217,255,0.04); border:1px solid rgba(0,217,255,0.15);
          border-radius:10px; padding:9px 11px; text-decoration:none;
          transition:background 0.15s, border-color 0.15s; cursor:pointer; max-width:240px;
        }
        .lounge-file-card:hover { background:rgba(0,217,255,0.08); border-color:rgba(0,217,255,0.3); }
        .lounge-file-card-icon { width:32px; height:32px; border-radius:8px; background:rgba(0,217,255,0.08); border:1px solid rgba(0,217,255,0.2); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .lounge-file-card-info { display:flex; flex-direction:column; gap:2px; min-width:0; flex:1; }
        .lounge-file-card-name { font-size:11px; font-family:'DM Mono',monospace; color:rgba(255,255,255,0.75); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .lounge-file-card-meta { font-size:9px; font-family:'DM Mono',monospace; color:rgba(255,255,255,0.3); }

        /* ── File preview strip (pending) ── */
        @keyframes fileStripIn { from{opacity:0;transform:translateY(4px);} to{opacity:1;transform:none;} }
        .file-preview-strip {
          display:flex; align-items:center; gap:8px;
          background:rgba(0,217,255,0.04); border-top:1px solid rgba(0,217,255,0.12);
          padding:6px 12px; animation:fileStripIn 0.18s ease;
        }
        .file-preview-thumb { width:32px; height:32px; border-radius:6px; object-fit:cover; border:1px solid rgba(0,217,255,0.2); flex-shrink:0; }
        .file-preview-icon { width:32px; height:32px; border-radius:6px; background:rgba(0,217,255,0.08); border:1px solid rgba(0,217,255,0.2); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .file-preview-info { display:flex; flex-direction:column; gap:1px; min-width:0; flex:1; }
        .file-preview-name { font-size:10px; font-family:'DM Mono',monospace; color:rgba(255,255,255,0.6); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .file-preview-size { font-size:9px; font-family:'DM Mono',monospace; color:rgba(255,255,255,0.25); }

        /* ── Paperclip button ── */
        .clip-btn { display:flex; align-items:center; justify-content:center; width:36px; height:36px; border-radius:9px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.03); cursor:pointer; transition:border-color 0.15s,background 0.15s,color 0.15s; color:rgba(255,255,255,0.3); flex-shrink:0; }
        .clip-btn:hover { border-color:rgba(0,217,255,0.3); background:rgba(0,217,255,0.06); color:#00d9ff; }
        .clip-btn.has-file { border-color:rgba(0,217,255,0.4); background:rgba(0,217,255,0.08); color:#00d9ff; }
        .clip-btn:disabled { opacity:0.4; cursor:not-allowed; }

        /* ── File error toast ── */
        @keyframes fileErrIn { from{opacity:0;transform:translateY(6px);} to{opacity:1;transform:none;} }
        .file-error-toast {
          display:flex; align-items:center; gap:6px;
          background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.25);
          border-radius:8px; padding:5px 10px; margin:0 12px 6px;
          animation:fileErrIn 0.18s ease;
        }

        @keyframes counterPulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
        .char-danger { animation:counterPulse 0.8s ease-in-out infinite; }

        /* ── GIF picker ── */
        .gif-overlay {
          position: fixed; inset: 0; z-index: 9998;
          background: rgba(0,0,0,0.6);
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
        }
        .gif-modal {
          width: min(760px, 100%);
          max-height: 80vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          background: #11131a;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 14px;
          .gif-scroll::-webkit-scrollbar { width: 40px; }
.gif-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); border-radius: 99px; }
.gif-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 99px; border: 2px solid transparent; background-clip: padding-box; }
.gif-scroll::-webkit-scrollbar-thumb:hover { background: rgba(0,217,255,0.4); border: 2px solid transparent; background-clip: padding-box; }
        }
        .gif-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; }
        @media (min-width:640px){ .gif-grid { grid-template-columns:repeat(3,minmax(0,1fr)); } }
        @media (min-width:768px){ .gif-grid { grid-template-columns:repeat(4,minmax(0,1fr)); } }
      `}</style>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_ATTR}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {gifOpen && (
        <div className="gif-overlay" onClick={() => setGifOpen(false)}>
          <div className="gif-modal" onClick={(e) => e.stopPropagation()}>
            <div className="px-3 py-2 border-b border-white/10 flex items-center gap-2">
              <Search className="w-4 h-4 text-white/35" />
              <input
                value={gifQuery}
                onChange={(e) => setGifQuery(e.target.value)}
                placeholder="Search GIFs..."
                className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
              />
              <button onClick={() => setGifOpen(false)} className="text-white/35 hover:text-white/70">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div
               className="p-3 overflow-y-auto gif-scroll"
               style={{ flex: 1, minHeight: 0, WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}
            >
              {gifLoading && <p className="text-xs font-mono text-white/40">Loading GIFs...</p>}
              {gifErr && <p className="text-xs font-mono text-red-300">{gifErr}</p>}
              {!gifLoading && !gifErr && (
                <div className="gif-grid">
                  {gifItems.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => onSelectGif(g.url)}
                      className="rounded-lg overflow-hidden border border-white/10 hover:border-[#00d9ff]/40 transition"
                      title={g.title}
                    >
                      <img src={g.preview || g.url} alt={g.title} className="w-full h-28 object-cover block" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {profileUser && profileStats && (
        <div
          ref={profileCardRef}
          className="profile-card"
          style={{ left: Math.min(profilePos.x, window.innerWidth - 220), top: profilePos.y }}
        >
          {(() => {
            const { Icon: PIcon, initials, color } = getAvatarContent(profileUser)
            return (
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: PIcon ? 'rgba(0,217,255,0.1)' : `${color}22`, border: PIcon ? '1px solid rgba(0,217,255,0.25)' : `1px solid ${color}44` }}>
                  {PIcon
                    ? <PIcon size={18} color="#00d9ff" strokeWidth={2} />
                    : <span className="text-sm font-bold font-mono" style={{ color }}>{initials}</span>
                  }
                </div>
                <div>
                  <p className="text-[12px] font-mono font-semibold text-white/80 leading-tight">{profileUser}</p>
                  <p className="text-[9px] font-mono text-white/25 mt-0.5">
                    {profileUser === adminName ? 'Admin' : 'Visitor'}
                  </p>
                </div>
              </div>
            )
          })()}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Globe className="w-3 h-3 text-white/25 flex-shrink-0" />
              <span className="text-[10px] font-mono text-white/35">Country</span>
              <span className="text-[10px] font-mono text-white/60 ml-auto">{profileStats.country}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-white/25 flex-shrink-0" />
              <span className="text-[10px] font-mono text-white/35">Joined</span>
              <span className="text-[10px] font-mono text-white/60 ml-auto">{profileStats.joined}</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-3 h-3 text-white/25 flex-shrink-0" />
              <span className="text-[10px] font-mono text-white/35">Messages</span>
              <span className="text-[10px] font-mono text-[#00d9ff]/70 ml-auto">{profileStats.count}</span>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-none border-0 bg-transparent overflow-hidden">
        <div className="px-4 py-2 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background:connected?'#84cc16':'#f59e0b', boxShadow:connected?'0 0 6px #84cc16':'0 0 6px #f59e0b' }} />
              <span className={`text-[10px] font-mono ${connected?'text-[#84cc16]':'text-amber-400'}`}>{connected?'LIVE':'CONNECTING'}</span>
            </div>
            {shownAvatars.length > 0 && (
              <div className="avatar-stack ml-1">
                {shownAvatars.map(u => {
                  const { Icon: MiniIcon, initials, color } = getAvatarContent(u)
                  return (
                    <div key={u} className="avatar-mini" title={u}
                      style={{ background:MiniIcon?'rgba(0,217,255,0.12)':`${color}22`, color:MiniIcon?'#00d9ff':color, borderColor:'#0e0e14' }}>
                      {MiniIcon ? <MiniIcon size={10} color="#00d9ff" strokeWidth={2.5} /> : initials}
                    </div>
                  )
                })}
                {extraCount > 0 && <div className="avatar-mini" style={{ background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.4)', borderColor:'#0e0e14' }}>+{extraCount}</div>}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <span className="flex items-center gap-1 text-[#00d9ff] border border-[#00d9ff]/40 px-1.5 py-0.5 rounded text-[9px] font-mono">
                <Shield className="w-2.5 h-2.5" /> ADMIN
              </span>
            )}
            {isAdmin && (
              <button onClick={() => setShowPollCreate(v => !v)} title="Create poll"
                className={`transition-colors ${showPollCreate?'text-[#00d9ff]':'text-white/25 hover:text-white/60'}`}>
                <BarChart2 className="w-3 h-3" />
              </button>
            )}
            <button onClick={() => setSearchOpen(v => !v)} title="Search"
              className={`transition-colors ${searchOpen?'text-[#00d9ff]':'text-white/25 hover:text-white/60'}`}>
              <Search className="w-3 h-3" />
            </button>
            <button onClick={() => setSoundOn(v => !v)} title={soundOn?'Mute':'Unmute'}
              className="text-white/25 hover:text-white/60 transition-colors">
              {soundOn ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
            </button>
            <span className="text-[10px] font-mono text-white/30">{activeCount} ACTIVE</span>
          </div>
        </div>

        {searchOpen && (
          <div className="search-bar px-3 py-2 border-b border-white/[0.06] flex items-center gap-2">
            <Search className="w-3 h-3 text-white/25 flex-shrink-0" />
            <input ref={searchRef} value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search messages..." className="flex-1 bg-transparent text-xs text-white placeholder:text-white/25 outline-none font-mono" />
            {searchQuery && <span className="text-[9px] font-mono text-white/25">{displayMessages.length} result{displayMessages.length!==1?'s':''}</span>}
            <button onClick={() => { setSearchOpen(false); setSearchQuery('') }} className="text-white/25 hover:text-white/60"><X className="w-3 h-3" /></button>
          </div>
        )}

        <div ref={scrollRef} className="h-96 overflow-y-auto px-3 py-3 lounge-scroll"
          onWheel={e => e.stopPropagation()}
          onScroll={e => { const el=e.currentTarget; isUserScrollingRef.current = el.scrollHeight-el.scrollTop-el.clientHeight > 60 }}>

          {showPollCreate && isAdmin && (
            <div className="poll-create">
              <p className="text-[9px] font-mono text-[#00d9ff]/60 mb-2 flex items-center gap-1"><BarChart2 className="w-2.5 h-2.5" /> CREATE POLL</p>
              <input className="poll-inp mb-2" placeholder="Your question..." value={pollQuestion} onChange={e => setPollQuestion(e.target.value)} />
              {pollOptions.map((opt, i) => (
                <div key={i} className="flex gap-1.5 mb-1.5">
                  <input className="poll-inp flex-1" placeholder={`Option ${i+1}...`} value={opt}
                    onChange={e => { const n=[...pollOptions]; n[i]=e.target.value; setPollOptions(n) }} />
                  {pollOptions.length > 2 && (
                    <button onClick={() => setPollOptions(p => p.filter((_,j) => j!==i))} className="text-white/25 hover:text-red-400"><X className="w-3 h-3" /></button>
                  )}
                </div>
              ))}
              {pollOptions.length < 4 && (
                <button onClick={() => setPollOptions(p => [...p, ''])} className="text-[10px] font-mono text-white/30 hover:text-[#00d9ff] flex items-center gap-1 mb-2">
                  <Plus className="w-3 h-3" /> Add option
                </button>
              )}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[9px] font-mono text-white/25">Duration:</span>
                {[12,24,48].map(h => (
                  <button key={h} onClick={() => setPollDuration(h)}
                    className={`text-[9px] font-mono px-2 py-0.5 rounded border transition-colors ${pollDuration===h?'border-[#00d9ff]/40 text-[#00d9ff]':'border-white/10 text-white/30 hover:border-white/20'}`}>
                    {h}h
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={onCreatePoll} className="flex-1 py-1.5 rounded-lg bg-[#00d9ff]/10 border border-[#00d9ff]/30 text-[#00d9ff] text-[11px] font-mono hover:bg-[#00d9ff]/20 transition">Launch Poll</button>
                <button onClick={() => setShowPollCreate(false)} className="px-3 py-1.5 rounded-lg border border-white/10 text-white/30 text-[11px] font-mono hover:border-white/20 transition">Cancel</button>
              </div>
            </div>
          )}

          {poll && !showPollCreate && (
            <div className="poll-card">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <BarChart2 className="w-3 h-3 text-[#00d9ff]/60 flex-shrink-0" />
                  <p className="text-[11px] font-semibold text-white/80">{poll.question}</p>
                </div>
                {isAdmin && <button onClick={onDeletePoll} className="text-white/20 hover:text-red-400 transition-colors flex-shrink-0 ml-2"><X className="w-3 h-3" /></button>}
              </div>
              <div className="space-y-1.5">
                {poll.options.map((opt, i) => {
                  const pct = totalVotes > 0 ? Math.round((poll.votes[i] / totalVotes) * 100) : 0
                  const isMyVote = hasVoted && votedOption === i
                  return (
                    <button key={i} disabled={hasVoted || pollVoting} onClick={() => onVote(i)}
                      className={`poll-option ${hasVoted?'voted':''} ${isMyVote?'my-vote':''}`}>
                      {hasVoted && <div className="poll-bar" style={{ width:`${pct}%` }} />}
                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {isMyVote && <Check className="w-3 h-3 text-[#00d9ff]" />}
                          <span className={`text-[12px] font-mono ${isMyVote?'text-[#00d9ff]':'text-white/65'}`}>{opt}</span>
                        </div>
                        {hasVoted && <span className="text-[10px] font-mono text-white/35">{pct}%</span>}
                      </div>
                    </button>
                  )
                })}
              </div>
              <p className="text-[9px] font-mono text-white/20 mt-2">
                {totalVotes} vote{totalVotes!==1?'s':''} · expires {getRelativeTime(poll.expiresAt - (Date.now() - poll.expiresAt + (poll.expiresAt - poll.createdAt)))}
              </p>
            </div>
          )}

          {pinnedMsg && !searchQuery && (
            <div className="pinned-banner">
              <Pin className="w-3 h-3 text-[#00d9ff]/60 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-mono text-[#00d9ff]/50 block mb-0.5">{pinnedMsg.user}</span>
                <span className="text-[11px] text-white/50 truncate block">{pinnedMsg.text || (pinnedMsg.file ? `📎 ${pinnedMsg.file.name}` : '')}</span>
              </div>
              {isAdmin && (
                <button onClick={() => setPinnedMsgId(null)} className="text-white/20 hover:text-white/50 flex-shrink-0 ml-2">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-1.5 opacity-40">
              <p className="text-xs font-mono text-white/50">No messages yet</p>
              <p className="text-[10px] font-mono text-white/30">Say hi to visitors 👋</p>
            </div>
          ) : (
            <>
              {!searchQuery && (
                <div className="system-msg mb-2">
                  <p className="text-[10px] font-mono text-white/30 leading-relaxed">{SYSTEM_NOTE.text}</p>
                </div>
              )}
              {displayMessages.length === 0 && searchQuery && (
                <div className="flex flex-col items-center justify-center h-24 gap-1.5 opacity-40">
                  <p className="text-xs font-mono text-white/50">No results for &quot;{searchQuery}&quot;</p>
                </div>
              )}

              <div className="space-y-1">
                {displayMessages.map((m) => {
                  const { Icon: AvatarIcon, initials, color } = getAvatarContent(m.user)
                  const isAdminMsg      = m.user === adminName
                  const isMe            = m.user === (isAdmin ? adminName : me)
                  const myName          = isAdmin ? adminName : me
                  const reactions       = m.reactions ?? {}
                  const reactionEntries = Object.entries(reactions).filter(([,u]) => u.length > 0)
                  const isPinned        = m.id === pinnedMsgId
                  const isCopied        = copiedId === m.id
                  const seenCount       = isAdminMsg && activeCount > 1 ? activeCount - 1 : 0
                  const isGif           = isGifUrl(m.text)
                  const hasText         = m.text.trim().length > 0

                  return (
                    <div key={m.id}
                      className={`msg-row flex gap-2.5 px-2 py-2 group ${isAdminMsg?'admin-msg':''} ${isPinned?'pinned-row':''}`}
                      onMouseEnter={() => setHoveredMsg(m.id)}
                      onMouseLeave={() => setHoveredMsg(null)}>

                      {hoveredMsg === m.id && !searchQuery && (
                        <div className="reaction-bar">
                          {EMOJIS.map(emoji => (
                            <button key={emoji} className="reaction-btn" onClick={() => onReact(m.id, emoji)}>{emoji}</button>
                          ))}
                          <div className="bar-divider" />
                          <button className="reply-btn-hover" onClick={() => setReplyTo({ id:m.id, user:m.user, text: m.text || (m.file ? m.file.name : '') })}>
                            <CornerUpLeft style={{ width:10, height:10 }} /> reply
                          </button>
                          <div className="bar-divider" />
                          {hasText && (
                            <button className={`icon-action-btn ${isCopied?'cyan':''}`} onClick={() => onCopy(m.id, m.text)} title="Copy message">
                              {isCopied
                                ? <CheckCheck style={{ width:10, height:10 }} />
                                : <Copy style={{ width:10, height:10 }} />
                              }
                            </button>
                          )}
                          {isAdmin && (
                            <button className={`icon-action-btn ${isPinned?'cyan':''}`} onClick={() => onPin(m.id)} title={isPinned?'Unpin':'Pin message'}>
                              {isPinned
                                ? <PinOff style={{ width:10, height:10 }} />
                                : <Pin style={{ width:10, height:10 }} />
                              }
                            </button>
                          )}
                        </div>
                      )}

                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{
                          background: AvatarIcon ? 'rgba(0,217,255,0.08)' : `${color}22`,
                          border:     AvatarIcon ? '1px solid rgba(0,217,255,0.2)' : `1px solid ${color}44`,
                        }}>
                        {AvatarIcon
                          ? <AvatarIcon size={15} color="#00d9ff" strokeWidth={2} />
                          : <span className="text-[11px] font-bold font-mono" style={{ color }}>{initials}</span>
                        }
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span
                            className="username-btn text-[11px] font-semibold font-mono truncate max-w-[100px]"
                            style={{ color: isMe ? '#00d9ff' : 'rgba(255,255,255,0.75)' }}
                            onClick={(e) => handleUserClick(m.user, e)}
                          >
                            {m.user}{isMe && <span className="text-[9px] text-white/25 ml-1">(you)</span>}
                          </span>
                          {m.country && <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm bg-white/[0.06] border border-white/[0.08] text-white/35">{m.country}</span>}
                          {isAdminMsg && (
                            <span className="flex items-center gap-0.5 text-[9px] font-mono px-1.5 py-0.5 rounded-sm bg-[#00d9ff]/10 border border-[#00d9ff]/25 text-[#00d9ff]">
                              <Shield className="w-2 h-2" /> ADMIN
                            </span>
                          )}
                          {isPinned && <Pin className="w-2.5 h-2.5 text-[#00d9ff]/40" />}
                          {m.file && !hasText && (
                            <span className="flex items-center gap-0.5 text-[9px] font-mono px-1.5 py-0.5 rounded-sm bg-white/[0.04] border border-white/[0.08] text-white/30">
                              <Paperclip className="w-2 h-2" /> file
                            </span>
                          )}
                          <span className="text-[9px] font-mono text-white/20 ml-auto">{getRelativeTime(m.ts)}</span>
                          {isAdmin && (
                            <button onClick={() => onDelete(m.id)} className="opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 transition-opacity ml-1">
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>

                        {m.replyTo && (
                          <div className="reply-preview">
                            <div className="reply-preview-user">↩ {m.replyTo.user}</div>
                            <div className="reply-preview-text">{m.replyTo.text}</div>
                          </div>
                        )}

                        {hasText && !isGif && (
                          <div className="rounded-xl px-3 py-2 text-sm text-white/75 leading-relaxed"
                            style={{
                              background: isAdminMsg?'rgba(0,217,255,0.06)':isMe?'rgba(255,255,255,0.05)':'rgba(255,255,255,0.03)',
                              border:     isAdminMsg?'1px solid rgba(0,217,255,0.15)':'1px solid rgba(255,255,255,0.07)',
                            }}>
                            {renderText(m.text, searchQuery)}
                          </div>
                        )}

                        {isGif && (
                          <img
                            src={normalizeGifUrl(m.text)}
                            alt="gif"
                            className="lounge-gif"
                            loading="lazy"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                          />
                        )}

                        {m.file && <FileMessageRenderer file={m.file} />}

                        {seenCount > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <CheckCheck className="w-3 h-3 text-[#00d9ff]/40" />
                            <span className="text-[9px] font-mono text-[#00d9ff]/35">
                              seen by {seenCount} {seenCount === 1 ? 'person' : 'people'}
                            </span>
                          </div>
                        )}

                        {reactionEntries.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {reactionEntries.map(([emoji, users]) => (
                              <div key={emoji} className="reaction-pill-wrap"
                                onMouseEnter={() => setHoveredReaction({ msgId: m.id, emoji })}
                                onMouseLeave={() => setHoveredReaction(null)}>
                                {hoveredReaction?.msgId === m.id && hoveredReaction?.emoji === emoji && (
                                  <div className="reaction-tooltip">
                                    {users.slice(0, 5).join(', ')}{users.length > 5 ? ` +${users.length - 5}` : ''}
                                  </div>
                                )}
                                <button
                                  className={`reaction-pill ${users.includes(myName) ? 'reacted' : ''}`}
                                  onClick={() => onReact(m.id, emoji)}
                                >
                                  {emoji}<span className="text-[10px] font-mono">{users.length}</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {typingUsers.length > 0 && (
            <div className="flex items-center gap-2 px-2 py-1 mt-1">
              <div className="flex gap-1"><span className="typing-dot"/><span className="typing-dot"/><span className="typing-dot"/></div>
              <span className="text-[10px] font-mono text-white/30">
                {typingUsers.slice(0,2).join(', ')} {typingUsers.length===1?'is':'are'} typing
              </span>
            </div>
          )}
        </div>

        {replyTo && (
          <div className="reply-strip">
            <Reply className="w-3 h-3 text-[#00d9ff]/50 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-mono text-[#00d9ff]/60">{replyTo.user}</span>
              <p className="text-[10px] text-white/35 truncate">{replyTo.text}</p>
            </div>
            <button onClick={() => setReplyTo(null)} className="text-white/25 hover:text-white/60 flex-shrink-0"><X className="w-3 h-3" /></button>
          </div>
        )}

        {pendingFile && (
          <div className="file-preview-strip">
            {isImageMime(pendingFile.type) ? (
              <img src={pendingFile.data} alt={pendingFile.name} className="file-preview-thumb" />
            ) : (
              <div className="file-preview-icon">
                {(() => { const FIcon = getFileIcon(pendingFile.type); return <FIcon size={16} color="#00d9ff" strokeWidth={1.5} /> })()}
              </div>
            )}
            <div className="file-preview-info">
              <span className="file-preview-name">{pendingFile.name}</span>
              <span className="file-preview-size">{formatBytes(pendingFile.size)} · ready to send</span>
            </div>
            <button
              onClick={() => setPendingFile(null)}
              className="text-white/25 hover:text-red-400 transition-colors flex-shrink-0 ml-auto"
              title="Remove file"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {fileError && (
          <div className="file-error-toast">
            <AlertCircle className="w-3 h-3 text-red-400 flex-shrink-0" />
            <span className="text-[10px] font-mono text-red-300 flex-1">{fileError}</span>
            <button onClick={() => setFileError(null)} className="text-red-400/50 hover:text-red-400"><X className="w-3 h-3" /></button>
          </div>
        )}

        <div className="p-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-2">
            <button
              className={`clip-btn ${pendingFile ? 'has-file' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              disabled={fileUploading}
              title={pendingFile ? `${pendingFile.name} attached` : 'Attach file (max 500 KB)'}
            >
              {fileUploading
                ? <Cloud className="w-3.5 h-3.5 animate-pulse" />
                : <Paperclip className="w-3.5 h-3.5" />
              }
            </button>

            <button
              className="clip-btn"
              onClick={() => setGifOpen(true)}
              title="Pick a GIF"
              type="button"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>

            <input ref={inputRef} value={input}
              onChange={e => { if (e.target.value.length <= MAX_CHARS + 10) { setInput(e.target.value); if(e.target.value) sendTyping() } }}
              onKeyDown={e => e.key==='Enter' && canSend && onSend()}
              placeholder={
                pendingFile
                  ? `Add a caption... (optional)`
                  : isAdmin ? 'Message as Admin...' : 'Say hi · /gif <url> to share a gif'
              }
              className="flex-1 h-9 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#00d9ff]/40 transition-colors"
              style={ pendingFile ? { borderColor: 'rgba(0,217,255,0.25)' } : {} }
            />
            <button onClick={onSend} disabled={!canSend}
              className="h-9 w-9 rounded-lg border border-[#00d9ff]/30 bg-[#00d9ff]/[0.08] text-[#00d9ff] hover:bg-[#00d9ff]/15 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center justify-center">
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between mt-1.5 px-0.5">
            {isAdmin
              ? <p className="text-[9px] font-mono text-[#00d9ff]/40">Sending as · {adminName}</p>
              : <p className="text-[9px] font-mono text-white/15">
                  {pendingFile
                    ? <span style={{ color:'rgba(0,217,255,0.4)' }}>📎 {pendingFile.name} · press Enter or ➤ to send</span>
                    : 'type @name to mention · GIF button for picker · 📎 files up to 500 KB'
                  }
                </p>
            }
            {charsNear && (
              <span className={`text-[9px] font-mono tabular-nums ${charsOver ? 'text-red-400 char-danger' : charsLeft <= 15 ? 'text-amber-400' : 'text-white/30'}`}>
                {charsLeft}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  )
}