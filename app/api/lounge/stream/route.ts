import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const redis            = Redis.fromEnv()
const HISTORY_KEY      = 'portfolio:lounge:history'
const PRESENCE_PREFIX  = 'portfolio:lounge:presence:'
const TYPING_PREFIX    = 'portfolio:lounge:typing:'
const REACTIONS_KEY    = 'portfolio:lounge:reactions'
const POLL_KEY         = 'portfolio:lounge:poll'
const POLL_VOTES_KEY   = 'portfolio:lounge:poll:votes'
const PRESENCE_TTL_SEC = 45

type LoungeMessage = {
  id: string
  user: string
  text: string
  ts: number
  country?: string
  reactions?: Record<string, string[]>
  replyTo?: { id: string; user: string; text: string }
}

type Poll = {
  id:        string
  question:  string
  options:   string[]
  votes:     number[]
  createdAt: number
  expiresAt: number
}

function parseJSON<T>(x: unknown): T | null {
  if (typeof x === 'object' && x !== null) return x as T
  try { return JSON.parse(x as string) as T } catch { return null }
}

async function getPresenceData(): Promise<{ count: number; users: string[] }> {
  const keys = await redis.keys(`${PRESENCE_PREFIX}*`)
  if (!keys.length) return { count: 0, users: [] }
  const now = Date.now(); const freshMs = PRESENCE_TTL_SEC * 1000
  const users: string[] = []
  for (const k of keys) {
    try {
      const raw = await redis.get(k)
      if (!raw) continue
      const val = (typeof raw === 'object' ? raw : JSON.parse(raw as string)) as { ts?: number; user?: string }
      if (typeof val.ts === 'number' && now - val.ts <= freshMs) {
        if (val.user) users.push(val.user)
      } else { await redis.del(k) }
    } catch { await redis.del(k) }
  }
  return { count: users.length, users }
}

async function getTypingUsers(excludeClientId: string): Promise<string[]> {
  const keys = await redis.keys(`${TYPING_PREFIX}*`)
  if (!keys.length) return []
  const now = Date.now(); const freshMs = 4000
  const typing: string[] = []
  for (const k of keys) {
    if (k.endsWith(excludeClientId)) continue
    try {
      const raw = await redis.get(k)
      if (!raw) continue
      const val = (typeof raw === 'object' ? raw : JSON.parse(raw as string)) as { ts?: number; user?: string }
      if (typeof val.ts === 'number' && now - val.ts <= freshMs) {
        if (val.user) typing.push(val.user)
      }
    } catch {}
  }
  return typing
}

export async function GET(req: NextRequest) {
  try {
    const url      = new URL(req.url)
    const user     = (url.searchParams.get('user') || 'Guest').slice(0, 24)
    const clientId = url.searchParams.get('clientId') || ''

    // Update presence
    if (clientId) {
      await redis.set(
        `${PRESENCE_PREFIX}${clientId}`,
        JSON.stringify({ user, ts: Date.now() }),
        { ex: PRESENCE_TTL_SEC }
      )
    }

    // Messages
    const rawHistory = (await redis.lrange(HISTORY_KEY, -80, -1)) || []
    const messages: LoungeMessage[] = rawHistory
      .map(x => parseJSON<LoungeMessage>(x))
      .filter(Boolean) as LoungeMessage[]

    // Reactions
    const reactionsRaw = (await redis.hgetall(REACTIONS_KEY)) as Record<string, string> | null
    const reactionsMap: Record<string, Record<string, string[]>> = {}
    if (reactionsRaw) {
      for (const [msgId, val] of Object.entries(reactionsRaw)) {
        try { reactionsMap[msgId] = typeof val === 'object' ? val as Record<string, string[]> : JSON.parse(val) } catch {}
      }
    }
    const messagesWithReactions = messages.map(m => ({ ...m, reactions: reactionsMap[m.id] ?? {} }))

    // Poll
    let poll: Poll | null = null
    let hasVoted = false
    let votedOption = -1
    const rawPoll = await redis.get(POLL_KEY)
    if (rawPoll) {
      const p = parseJSON<Poll>(rawPoll)
      if (p && Date.now() <= p.expiresAt) {
        poll = p
        if (clientId) {
          const v = await redis.hget(POLL_VOTES_KEY, clientId)
          if (v !== null && v !== undefined) { hasVoted = true; votedOption = Number(v) }
        }
      } else {
        await redis.del(POLL_KEY)
        await redis.del(POLL_VOTES_KEY)
      }
    }

    // Presence + typing
    const { count, users: activeUsers } = await getPresenceData()
    const typingUsers = await getTypingUsers(clientId)

    return NextResponse.json({
      ok: true,
      messages: messagesWithReactions,
      activeCount: Math.max(1, count),
      activeUsers,
      typingUsers,
      poll,
      hasVoted,
      votedOption,
    })
  } catch {
    return NextResponse.json({
      ok: false, messages: [], activeCount: 1,
      activeUsers: [], typingUsers: [], poll: null, hasVoted: false, votedOption: -1,
    }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get('clientId') || ''
    if (clientId) {
      await redis.del(`${PRESENCE_PREFIX}${clientId}`)
      await redis.del(`${TYPING_PREFIX}${clientId}`)
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}