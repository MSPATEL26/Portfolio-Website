import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  if (ip === 'unknown') return NextResponse.json({ ok: false })

  // Fetch geolocation data with error handling
  let geo: { city?: string; country_name?: string } = {}
  try {
    const geoRes = await fetch(`https://ipapi.co/${ip}/json/`)
    if (geoRes.ok) {
      geo = await geoRes.json()
    }
  } catch {
    // Geolocation unavailable — continue with defaults
  }

  const key = `visitor:${ip}`
  const existing = await redis.hget<number>(key, 'visit_count') ?? 0

  await redis.hset(key, {
    city: geo.city ?? 'Unknown',
    country: geo.country_name ?? 'Unknown',
    visit_count: existing + 1,
    last_seen: new Date().toISOString(),
  })

  // Maintain the set of all visitor IPs
  await redis.sadd('visitors:ips', ip)

  return NextResponse.json({ ok: true })
}