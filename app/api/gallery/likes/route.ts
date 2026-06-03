import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'

const redis = Redis.fromEnv()

// GET /api/gallery/likes?ids=photo1,photo2,photo3
// Returns { photo1: 4, photo2: 0, photo3: 12 }
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const ids = searchParams.get('ids')?.split(',').filter(Boolean) ?? []

  if (ids.length === 0) return NextResponse.json({})

  const pipeline = redis.pipeline()
  ids.forEach((id) => pipeline.get(`gallery:likes:${id}`))
  const results = await pipeline.exec()

  const counts: Record<string, number> = {}
  ids.forEach((id, i) => {
    counts[id] = Number(results[i] ?? 0)
  })

  return NextResponse.json(counts)
}