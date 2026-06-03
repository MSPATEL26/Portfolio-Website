import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (token !== process.env.LOUNGE_ADMIN_TOKEN) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const ips = await redis.smembers('visitors:ips') as string[]
  
  const visitors = await Promise.all(
    ips.map(ip => redis.hgetall(`visitor:${ip}`))
  )

  return NextResponse.json({ visitors })
}