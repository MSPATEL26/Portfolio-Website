/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],

  // Remove X-Powered-By header for security
  poweredByHeader: false,

  // Allow remote images from CDN used in skills page
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.simpleicons.org',
      },
    ],
  },

  // Production security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },

  webpack: (config, { dev }) => {
    if (dev) {
      // Disable persistent disk caching in dev to prevent Array buffer allocation crashes (EPERM/RangeError)
      config.cache = false;
    }
    return config;
  },
}
module.exports = nextConfig
