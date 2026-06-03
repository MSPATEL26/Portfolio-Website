import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import webpush from 'web-push'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const redis       = Redis.fromEnv()
const CHANNEL     = 'portfolio:lounge:messages'
const HISTORY_KEY = 'portfolio:lounge:history'
const SUB_KEY     = 'push:admin:subscription'
const MAX_HISTORY = 80

const hasVapidKeys = !!(
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
  process.env.VAPID_PRIVATE_KEY
)

if (hasVapidKeys) {
  webpush.setVapidDetails(
    'mailto:admin@yourportfolio.dev',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )
}

type ReplyTo = {
  id: string
  user: string
  text: string
}

type AttachedFile = {
  name: string
  type: string
  size: number
  data: string
}

type LoungeMessage = {
  id: string
  user: string
  text: string
  ts: number
  country?: string
  replyTo?: ReplyTo
  file?: AttachedFile
}

export async function POST(req: NextRequest) {
  try {
    const body    = await req.json()
    const user    = String(body?.user    || 'Guest').trim().slice(0, 24)
    const text    = String(body?.text    || '').trim().slice(0, 350)
    const country = String(body?.country || '').trim().slice(0, 2).toUpperCase()

    let replyTo: ReplyTo | undefined
    if (body?.replyTo && typeof body.replyTo === 'object') {
      const r = body.replyTo
      if (r.id && r.user && r.text) {
        replyTo = {
          id:   String(r.id).trim(),
          user: String(r.user).trim().slice(0, 24),
          text: String(r.text).trim().slice(0, 100),
        }
      }
    }

    let file: AttachedFile | undefined
    if (body?.file && typeof body.file === 'object') {
      const f = body.file
      if (f.name && f.type && f.size && f.data) {
        file = {
          name: String(f.name).slice(0, 128),
          type: String(f.type).slice(0, 64),
          size: Number(f.size),
          data: String(f.data),
        }
      }
    }

    if (!text && !file) {
      return NextResponse.json({ ok: false, error: 'Message or file required' }, { status: 400 })
    }

    const message: LoungeMessage = {
      id:      crypto.randomUUID(),
      user:    user || 'Guest',
      text,
      ts:      Date.now(),
      ...(country ? { country } : {}),
      ...(replyTo ? { replyTo } : {}),
      ...(file    ? { file }    : {}),
    }

    await redis.rpush(HISTORY_KEY, JSON.stringify(message))
    await redis.ltrim(HISTORY_KEY, -MAX_HISTORY, -1)
    await redis.publish(CHANNEL, JSON.stringify({ type: 'message', payload: message }))

    // ── Push notification — inline, no self HTTP call ─────────────────────
    const isAdmin = body?.adminKey && body.adminKey === process.env.LOUNGE_ADMIN_KEY
    if (!isAdmin && hasVapidKeys) {
      try {
        const raw = await redis.get<string>(SUB_KEY)
        if (raw) {
          const subscription = typeof raw === 'string' ? JSON.parse(raw) : raw
          await webpush.sendNotification(
            subscription,
            JSON.stringify({
              title: `💬 ${message.user}`,
              body:  message.text?.slice(0, 100) || '📎 Sent a file',
              url:   '/',
            })
          )
        }
      } catch (pushErr) {
        console.error('Push notification failed:', pushErr)
      }
    }

    return NextResponse.json({ ok: true, message })
  } catch {
    return NextResponse.json({ ok: false, error: 'Failed to send message' }, { status: 500 })
  }
}