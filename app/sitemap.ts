import { MetadataRoute } from 'next'

const BASE_URL = 'https://saqibpatel.me'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/projects',
    '/skills',
    '/about',
    '/credentials',
    '/gallery',
    '/kiro',
    '/spectrum',
  ]

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.8,
  }))
}
