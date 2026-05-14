import type { MetadataRoute } from 'next'
import { getPayloadClient } from '@/lib/payload'
import localesConfig from '@/lib/locales.json'
import { getNormalizedSiteUrl } from '@/lib/site-url'

const SITE_URL = getNormalizedSiteUrl()
const locales = localesConfig.locales.map((l) => l.code)
const defaultLocale = localesConfig.defaultLocale || 'en'

function buildAlternates(path: string) {
  const languages: Record<string, string> = {}
  for (const locale of locales) {
    languages[locale] = `${SITE_URL}/${locale}${path}`
  }
  languages['x-default'] = `${SITE_URL}/${defaultLocale}${path}`
  return { languages }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  const staticPageConfigs = [
    { path: '', changeFrequency: 'daily' as const, priority: 1.0 },
    { path: '/about', changeFrequency: 'monthly' as const, priority: 0.8 },
    { path: '/news', changeFrequency: 'weekly' as const, priority: 0.9 },
    { path: '/contact', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/our-business', changeFrequency: 'weekly' as const, priority: 0.9 },
  ]

  for (const { path, changeFrequency, priority } of staticPageConfigs) {
    for (const locale of locales) {
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency,
        priority,
        alternates: buildAlternates(path),
      })
    }
  }

  const businessSlugs = ['injection-moulds', 'machinery', 'plastic-test-equipment']
  for (const slug of businessSlugs) {
    for (const locale of locales) {
      entries.push({
        url: `${SITE_URL}/${locale}/our-business/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
        alternates: buildAlternates(`/our-business/${slug}`),
      })
    }
  }

  try {
    const payload = await getPayloadClient()

    const news = await payload.find({
      collection: 'news',
      where: { status: { equals: 'published' } },
      limit: 100,
    })
    for (const article of news.docs) {
      const slug = (article as any).slug
      for (const locale of locales) {
        entries.push({
          url: `${SITE_URL}/${locale}/news/${slug}`,
          lastModified: new Date((article as any).updatedAt || Date.now()),
          changeFrequency: 'yearly',
          priority: 0.6,
          alternates: buildAlternates(`/news/${slug}`),
        })
      }
    }

    const pages = await payload.find({ collection: 'pages', limit: 100 })
    for (const page of pages.docs) {
      const slug = (page as any).slug
      for (const locale of locales) {
        entries.push({
          url: `${SITE_URL}/${locale}/${slug}`,
          lastModified: new Date((page as any).updatedAt || Date.now()),
          changeFrequency: 'weekly',
          priority: 0.6,
          alternates: buildAlternates(`/${slug}`),
        })
      }
    }
  } catch {
    // CMS not available — return static pages only
  }

  return entries
}
