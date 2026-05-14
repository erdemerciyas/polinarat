import type { MetadataRoute } from 'next'
import { getNormalizedSiteUrl } from '@/lib/site-url'

const SITE_URL = getNormalizedSiteUrl()

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/*', '/api', '/api/*'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
