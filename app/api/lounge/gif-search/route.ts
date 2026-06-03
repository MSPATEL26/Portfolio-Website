import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const GIPHY_API_KEY = process.env.GIPHY_API_KEY

export async function GET(req: NextRequest) {
  try {
    if (!GIPHY_API_KEY) {
      return NextResponse.json({ ok: false, error: 'Missing GIPHY_API_KEY' }, { status: 500 })
    }

    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') || '').trim()
    const limit = Math.min(Number(searchParams.get('limit') || 24), 50)

    const endpoint = q
      ? `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(q)}&limit=${limit}&rating=pg-13&lang=en`
      : `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=${limit}&rating=pg-13`

    const r = await fetch(endpoint, { cache: 'no-store' })
    if (!r.ok) return NextResponse.json({ ok: false, error: 'Giphy fetch failed' }, { status: 502 })

    const data = await r.json()

    const gifs = (data?.data || []).map((g: any) => ({
      id: g.id,
      title: g.title || 'GIF',
      preview: g.images?.fixed_width_small?.webp || g.images?.fixed_width_small?.url,
      url: g.images?.original?.url, // send this in chat
      w: Number(g.images?.fixed_width_small?.width || 0),
      h: Number(g.images?.fixed_width_small?.height || 0),
    })).filter((g: any) => g.url)

    return NextResponse.json({ ok: true, gifs })
  } catch {
    return NextResponse.json({ ok: false, error: 'Failed to search GIFs' }, { status: 500 })
  }
}