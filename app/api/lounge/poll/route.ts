import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const redis          = Redis.fromEnv()
const POLL_KEY       = 'portfolio:lounge:poll'
const POLL_VOTES_KEY = 'portfolio:lounge:poll:votes'
const ADMIN_TOKEN    = process.env.LOUNGE_ADMIN_TOKEN ?? ''

type Poll = {
  id:        string
  question:  string
  options:   string[]
  votes:     number[]
  createdAt: number
  expiresAt: number
}

function parsePoll(x: unknown): Poll | null {
  if (typeof x === 'object' && x !== null) return x as Poll
  try { return JSON.parse(x as string) as Poll } catch { return null }
}

// GET — fetch active poll + vote count
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get('clientId') || ''

    const raw  = await redis.get(POLL_KEY)
    const poll = raw ? parsePoll(raw) : null

    // Expired?
    if (poll && Date.now() > poll.expiresAt) {
      await redis.del(POLL_KEY)
      await redis.del(POLL_VOTES_KEY)
      return NextResponse.json({ ok: true, poll: null })
    }

    // Has this client voted?
    let hasVoted = false
    let votedOption = -1
    if (poll && clientId) {
      const v = await redis.hget(POLL_VOTES_KEY, clientId)
      if (v !== null && v !== undefined) {
        hasVoted    = true
        votedOption = Number(v)
      }
    }

    return NextResponse.json({ ok: true, poll, hasVoted, votedOption })
  } catch {
    return NextResponse.json({ ok: false, poll: null }, { status: 500 })
  }
}

// POST — create poll (admin) or vote (visitors)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // ── Vote ──────────────────────────────────────────────────
    if (body?.action === 'vote') {
      const clientId    = String(body?.clientId || '').trim()
      const optionIndex = Number(body?.optionIndex)

      if (!clientId) return NextResponse.json({ ok: false, error: 'missing_clientId' }, { status: 400 })

      const raw  = await redis.get(POLL_KEY)
      const poll = raw ? parsePoll(raw) : null
      if (!poll) return NextResponse.json({ ok: false, error: 'no_active_poll' }, { status: 404 })
      if (Date.now() > poll.expiresAt) return NextResponse.json({ ok: false, error: 'poll_expired' }, { status: 410 })
      if (optionIndex < 0 || optionIndex >= poll.options.length) return NextResponse.json({ ok: false, error: 'invalid_option' }, { status: 400 })

      // Check already voted
      const existing = await redis.hget(POLL_VOTES_KEY, clientId)
      if (existing !== null && existing !== undefined) {
        return NextResponse.json({ ok: false, error: 'already_voted' }, { status: 409 })
      }

      // Record vote
      poll.votes[optionIndex] = (poll.votes[optionIndex] || 0) + 1
      await redis.set(POLL_KEY, JSON.stringify(poll))
      await redis.hset(POLL_VOTES_KEY, { [clientId]: optionIndex })

      return NextResponse.json({ ok: true, poll })
    }

    // ── Create (admin only) ────────────────────────────────────
    const token = String(body?.token || '').trim()
    if (!token || token !== ADMIN_TOKEN) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
    }

    const question = String(body?.question || '').trim().slice(0, 120)
    const options  = (body?.options as string[])?.map(o => String(o).trim().slice(0, 60)).filter(Boolean)
    const durationH = Math.min(Math.max(Number(body?.durationHours || 24), 1), 168)

    if (!question || !options || options.length < 2 || options.length > 4) {
      return NextResponse.json({ ok: false, error: 'invalid_poll: need question + 2-4 options' }, { status: 400 })
    }

    const poll: Poll = {
      id:        crypto.randomUUID(),
      question,
      options,
      votes:     new Array(options.length).fill(0),
      createdAt: Date.now(),
      expiresAt: Date.now() + durationH * 3600 * 1000,
    }

    await redis.set(POLL_KEY, JSON.stringify(poll))
    await redis.del(POLL_VOTES_KEY) // reset votes for new poll

    return NextResponse.json({ ok: true, poll })
  } catch {
    return NextResponse.json({ ok: false, error: 'failed' }, { status: 500 })
  }
}

// DELETE — remove poll (admin only)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token') || ''
    if (!token || token !== ADMIN_TOKEN) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
    }
    await redis.del(POLL_KEY)
    await redis.del(POLL_VOTES_KEY)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}