import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const redis = Redis.fromEnv()
const HISTORY_KEY = 'portfolio:lounge:history'

type LoungeMessage = {
  id: string
  user: string
  text: string
  ts: number
}

function parseMessage(x: unknown): LoungeMessage | null {
  if (typeof x === 'object' && x !== null) return x as LoungeMessage
  try { return JSON.parse(x as string) as LoungeMessage } catch { return null }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token || token !== process.env.LOUNGE_ADMIN_TOKEN) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
    }

    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ ok: false, error: 'missing_id' }, { status: 400 })

    const raw = (await redis.lrange(HISTORY_KEY, 0, -1)) || []
    const parsed: LoungeMessage[] = raw
      .map(parseMessage)
      .filter(Boolean) as LoungeMessage[]

    const next = parsed.filter((m) => m.id !== id)

    await redis.del(HISTORY_KEY)
    if (next.length) {
      await redis.rpush(HISTORY_KEY, ...next.map((m) => JSON.stringify(m)))
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'delete_failed' }, { status: 500 })
  }
}