import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const redis          = Redis.fromEnv()
const TYPING_PREFIX  = 'portfolio:lounge:typing:'
const TYPING_TTL_SEC = 4

export async function POST(req: NextRequest) {
  try {
    const body     = await req.json()
    const user     = String(body?.user     || 'Guest').trim().slice(0, 24)
    const clientId = String(body?.clientId || '').trim()

    if (!clientId) {
      return NextResponse.json({ ok: false, error: 'missing_clientId' }, { status: 400 })
    }

    await redis.set(
      `${TYPING_PREFIX}${clientId}`,
      JSON.stringify({ user, ts: Date.now() }),
      { ex: TYPING_TTL_SEC }
    )

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'typing_failed' }, { status: 500 })
  }
}