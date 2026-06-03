import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'

const redis = Redis.fromEnv()
const KEY = 'gallery:visitors'

// POST → increment and return new count
export async function POST() {
  const count = await redis.incr(KEY)
  return NextResponse.json({ count })
}

// GET → return current count without incrementing
export async function GET() {
  const count = await redis.get<number>(KEY) ?? 0
  return NextResponse.json({ count: Number(count) })
}