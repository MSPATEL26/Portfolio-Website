import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'

const redis = Redis.fromEnv()

// POST → increment like
export async function POST(req: NextRequest) {
  const { photoId } = await req.json()
  if (!photoId || typeof photoId !== 'string') {
    return NextResponse.json({ error: 'invalid photoId' }, { status: 400 })
  }
  const count = await redis.incr(`gallery:likes:${photoId}`)
  return NextResponse.json({ count })
}

// DELETE → decrement like (floor 0)
export async function DELETE(req: NextRequest) {
  const { photoId } = await req.json()
  if (!photoId || typeof photoId !== 'string') {
    return NextResponse.json({ error: 'invalid photoId' }, { status: 400 })
  }
  const current = await redis.get<number>(`gallery:likes:${photoId}`) ?? 0
  const count = Math.max(0, Number(current) - 1)
  await redis.set(`gallery:likes:${photoId}`, count)
  return NextResponse.json({ count })
}