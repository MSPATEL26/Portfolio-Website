import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const redis        = Redis.fromEnv()
const REACTIONS_KEY = 'portfolio:lounge:reactions'

const ALLOWED_EMOJIS = ['👍', '❤️', '😂', '🔥', '👀']

export async function POST(req: NextRequest) {
  try {
    const body      = await req.json()
    const messageId = String(body?.messageId || '').trim()
    const emoji     = String(body?.emoji     || '').trim()
    const user      = String(body?.user      || 'Guest').trim().slice(0, 24)

    if (!messageId || !emoji || !ALLOWED_EMOJIS.includes(emoji)) {
      return NextResponse.json({ ok: false, error: 'invalid_input' }, { status: 400 })
    }

    // Get current reactions for this message
    const raw = await redis.hget(REACTIONS_KEY, messageId)
    const reactions: Record<string, string[]> =
      raw
        ? (typeof raw === 'object' ? raw as Record<string, string[]> : JSON.parse(raw as string))
        : {}

    // Toggle: if user already reacted, remove; else add
    const current = reactions[emoji] ?? []
    if (current.includes(user)) {
      reactions[emoji] = current.filter(u => u !== user)
      if (reactions[emoji].length === 0) delete reactions[emoji]
    } else {
      reactions[emoji] = [...current, user]
    }

    await redis.hset(REACTIONS_KEY, { [messageId]: JSON.stringify(reactions) })

    return NextResponse.json({ ok: true, reactions })
  } catch {
    return NextResponse.json({ ok: false, error: 'react_failed' }, { status: 500 })
  }
}