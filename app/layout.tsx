import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Comfortaa } from 'next/font/google'
const comfortaa = Comfortaa({ subsets: ['latin'], weight: ['400', '700'] })
import { ThemeProvider } from '@/components/ThemeProvider'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SolarSystemBgClient from '@/components/SolarSystemBgClient'
import LenisProvider from '@/components/LenisProvider'
import PageTransition from '@/components/PageTransition'
import { Analytics } from '@vercel/analytics/react'
import GlassCursor from '@/components/GlassCursor'
import Script from 'next/script'

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://saqibpatel.me'),
  title: {
    default: 'Mohammed Saqib Patel — Full Stack Developer & DevOps Engineer',
    template: '%s | Saqib Patel',
  },
  description:
    'Full Stack Developer, DevOps Engineer & Software Engineer based in Pune, India. Building full-stack products and deploying infrastructure that doesn\'t sleep.',
  keywords: [
    'Mohammed Saqib Patel',
    'Full Stack Developer',
    'DevOps Engineer',
    'Software Engineer',
    'React',
    'Next.js',
    'TypeScript',
    'AWS Certified',
    'Portfolio',
    'Pune',
    'India',
  ],
  authors: [{ name: 'Mohammed Saqib Patel', url: 'https://github.com/Saqib-Patel' }],
  creator: 'Mohammed Saqib Patel',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Saqib Patel — Portfolio',
    title: 'Mohammed Saqib Patel — Full Stack Developer & DevOps Engineer',
    description:
      'Full Stack Developer, DevOps Engineer & Software Engineer based in Pune, India. Building full-stack products and deploying infrastructure that doesn\'t sleep.',
    images: [
      {
        url: '/apple-icon.png',
        width: 512,
        height: 512,
        alt: 'Saqib Patel Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mohammed Saqib Patel — Full Stack Developer & DevOps Engineer',
    description:
      'Full Stack Developer & DevOps Engineer based in Pune, India. AWS Certified. Building production-grade web applications.',
    images: ['/apple-icon.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-3XW3HB8BHF"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-3XW3HB8BHF');
          `}
        </Script>
      </head>
      <body className={comfortaa.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <SolarSystemBgClient />
          <GlassCursor />
          <LenisProvider>
            <Navbar />
            <PageTransition>
              <main className="min-h-screen">
                {children}
              </main>
            </PageTransition>
            <Footer />
          </LenisProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}