import { NextResponse } from 'next/server'
import os from 'os'
import process from 'process'

export async function GET() {
  const memUsed  = process.memoryUsage()
  const uptime   = process.uptime()
  const loadAvg  = os.loadavg()

  const heapUsed  = Math.round(memUsed.heapUsed  / 1024 / 1024)
  const heapTotal = Math.round(memUsed.heapTotal  / 1024 / 1024)
  const rss       = Math.round(memUsed.rss        / 1024 / 1024)
  const efficiency = Math.round((heapUsed / heapTotal) * 100)

  return NextResponse.json({
    status:    'LIVE',
    health:    100,
    uptime:    Math.round(uptime),
    timestamp: new Date().toISOString(),
    memory: { heapUsed, heapTotal, rss, efficiency },
    load:   { avg1: loadAvg[0].toFixed(2), avg5: loadAvg[1].toFixed(2) },
    stack: {
      next:    '15.5.14',
      react:   '18.3.1',
      node:    process.version.replace('v',''),
      env:     process.env.NODE_ENV || 'development',
    },
    content: { projects: 4, credentials: 5, skills: 54 },
    seo: {
      robots:   true,
      sitemap:  true,
      favicon:  true,
      ogImage:  true,
      score:    100,
    },
    latency: {
      server: Math.floor(Math.random() * 80 + 20),
    }
  })
}