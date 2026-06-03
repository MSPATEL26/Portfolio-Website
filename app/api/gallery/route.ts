// app/api/gallery/route.ts
// Scans /public/gallery/ and returns image list with auto-detected categories.
//
// NAMING CONVENTION (optional — raw camera names also work, they just go to Personal):
//   college-*    → College
//   campus-*     → College
//   iit-*        → College
//   hack-*       → Hackathon
//   hackathon-*  → Hackathon
//   event-*      → Hackathon
//   me-*         → Personal
//   personal-*   → Personal
//   <anything>   → Personal  ← raw camera filenames land here automatically

import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const SUPPORTED = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif','.mp4', '.HEIC']

function detectCategory(filename: string): 'college' | 'hackathon' | 'personal' {
  const name = filename.toLowerCase()
  if (
    name.startsWith('college') ||
    name.startsWith('campus') ||
    name.startsWith('iit') ||
    name.startsWith('class') ||
    name.startsWith('lecture')
  ) return 'college'

  if (
    name.startsWith('hack') ||
    name.startsWith('hackathon') ||
    name.startsWith('event') ||
    name.startsWith('competition')
  ) return 'hackathon'

  return 'personal'
}

function toTitle(filename: string): string {
  const noExt = filename.replace(/\.[^.]+$/, '')
  // If it looks like a raw camera name (only digits, underscores, dashes → no real words)
  // return empty string so nothing is shown on the card
  if (/^[\d_\-\s]+$/.test(noExt)) return ''
  return noExt
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim()
}

export async function GET() {
  const galleryDir = path.join(process.cwd(), 'public', 'gallery')

  if (!fs.existsSync(galleryDir)) {
    return NextResponse.json([])
  }

  const files = fs
    .readdirSync(galleryDir)
    .filter((f) => SUPPORTED.includes(path.extname(f).toLowerCase()) && !f.startsWith('.'))

  const items = files.map((filename) => ({
    src:      `/gallery/${filename}`,
    title:    toTitle(filename),
    category: detectCategory(filename),
  }))

  return NextResponse.json(items)
}