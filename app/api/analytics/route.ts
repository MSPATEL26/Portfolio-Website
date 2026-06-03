import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const BASE_VIEWS = 93

function getWeek(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1)
  return Math.ceil(((date.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7)
}

function parseStatEnv(env: string | undefined): { name: string; pct: number }[] {
  if (!env) return []
  return env.split(',').map((item) => {
    const [name, pct] = item.split(':')
    return { name: name.trim(), pct: parseInt(pct?.trim() ?? '0') }
  })
}

export async function GET() {
  try {
const now   = new Date()
const today = now.toISOString().split('T')[0]
const month = today.slice(0, 7)
const weekNum = getWeek(now)
const week  = `${today.slice(0, 4)}-W${weekNum}`

    await redis.incr(`portfolio:views:${today}`)
    await redis.incr(`portfolio:views:month:${month}`)
    await redis.incr(`portfolio:views:week:${week}`)
    const rawTotal = await redis.incr('portfolio:views:total')

    const daily   = await redis.get<number>(`portfolio:views:${today}`)       ?? 0
    const monthly = await redis.get<number>(`portfolio:views:month:${month}`) ?? 0
    const total   = (rawTotal ?? 0) + BASE_VIEWS

    const countries = parseStatEnv(process.env.ANALYTICS_COUNTRIES)
    const os        = parseStatEnv(process.env.ANALYTICS_OS)

    return NextResponse.json({
      total24h:   daily.toString(),
      activeNow:  monthly.toString(),
      avgSession: total.toString(),
      countries,
      os,
    })
  } catch (err) {
    console.error('Redis error:', err)
    return NextResponse.json({
      total24h: '—', activeNow: '—', avgSession: '—',
      countries: [], os: [],
    })
  }
}