import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()
const HISTORY_KEY = 'portfolio:lounge:history'
const CHANNEL = 'portfolio:lounge:messages'

type LoungeMessage = {
  id: string
  user: string
  text: string
  ts: number
}

export async function DELETE(req: NextRequest) {
  try {
    const adminKey = req.headers.get('x-admin-key')
    if (!adminKey || adminKey !== process.env.LOUNGE_ADMIN_KEY) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ ok: false, error: 'missing_id' }, { status: 400 })

    const raw = (await redis.lrange<string>(HISTORY_KEY, 0, -1)) || []
    const parsed: LoungeMessage[] = raw
      .map((x) => { try { return JSON.parse(x) as LoungeMessage } catch { return null } })
      .filter(Boolean) as LoungeMessage[]

    const next = parsed.filter((m) => m.id !== id)

    await redis.del(HISTORY_KEY)
    if (next.length) {
      await redis.rpush(HISTORY_KEY, ...next.map((m) => JSON.stringify(m)))
    }

    await redis.publish(CHANNEL, JSON.stringify({ type: 'delete', payload: { id } }))

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'delete_failed' }, { status: 500 })
  }
}