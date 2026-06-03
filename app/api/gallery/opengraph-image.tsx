import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Alex Dev — Gallery'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          background: '#0a0a0a',
          padding: '60px 70px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Grid pattern background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(0,217,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,217,255,0.04) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Glow */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,217,255,0.12) 0%, transparent 70%)',
          }}
        />

        {/* Domain */}
        <div
          style={{
            position: 'absolute',
            top: '48px',
            left: '70px',
            color: '#00d9ff',
            fontSize: '18px',
            letterSpacing: '0.2em',
            fontWeight: 600,
          }}
        >
          your-username.me
        </div>

        {/* Label */}
        <div
          style={{
            color: '#00d9ff',
            fontSize: '14px',
            letterSpacing: '0.3em',
            marginBottom: '16px',
            fontWeight: 400,
          }}
        >
          VISUAL ARCHIVE
        </div>

        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '20px' }}>
          <span style={{ color: '#ffffff', fontSize: '80px', fontWeight: 900, lineHeight: 1 }}>
            My
          </span>
          <span
            style={{
              color: '#00d9ff',
              fontSize: '80px',
              fontWeight: 400,
              fontStyle: 'italic',
              lineHeight: 1,
            }}
          >
            Gallery
          </span>
        </div>

        {/* Subtitle */}
        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '22px', fontWeight: 400 }}>
          Academics · Creations · Moments
        </div>
      </div>
    ),
    { ...size }
  )
}