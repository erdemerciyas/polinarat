import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { readLocaleFile } from './lib/i18n-shared'

const LOCALE = 'de' as const

function mergeArrayByIndex<T extends Record<string, unknown>>(
  enItems: T[],
  deItems: Partial<T>[] | undefined,
  textKeys: string[],
): T[] {
  return enItems.map((enItem, i) => {
    const deItem = (deItems?.[i] ?? {}) as Partial<T>
    const merged = { ...enItem } as T
    for (const key of textKeys) {
      const deValue = deItem[key as keyof T]
      if (deValue !== undefined && deValue !== null && deValue !== '') {
        ;(merged as Record<string, unknown>)[key] = deValue
      }
    }
    if (Array.isArray((enItem as any).links) && Array.isArray((deItem as any).links)) {
      ;(merged as any).links = mergeArrayByIndex(
        (enItem as any).links,
        (deItem as any).links,
        ['label', 'description'],
      )
    }
    if (Array.isArray((enItem as any).megaMenuColumns) && Array.isArray((deItem as any).megaMenuColumns)) {
      ;(merged as any).megaMenuColumns = mergeArrayByIndex(
        (enItem as any).megaMenuColumns,
        (deItem as any).megaMenuColumns,
        ['label', 'description', 'title'],
      )
    }
    return merged
  })
}

async function main() {
  const payload = await getPayload({ config })
  const deJson = readLocaleFile('de')!

  // ── About page (text only — preserve images from EN) ──
  const aboutEn = await payload.findGlobal({ slug: 'about-page-settings', locale: 'en', depth: 2 })
  const aboutDe = deJson['about-page-settings']
  const aboutData: Record<string, unknown> = {
    hero: aboutDe.hero,
    story: aboutDe.story,
    seo: aboutDe.seo,
    video: aboutDe.video,
    cta: aboutDe.cta,
    gallery: {
      title: aboutDe.gallery?.title,
      description: aboutDe.gallery?.description,
      images: (aboutEn.gallery as any)?.images?.map((img: any, i: number) => ({
        id: img.id,
        image: img.image,
        size: img.size,
        caption: aboutDe.gallery?.images?.[i]?.caption ?? img.caption,
      })),
    },
    statistics: {
      cards: mergeArrayByIndex(
        (aboutEn.statistics as any)?.cards ?? [],
        aboutDe.statistics?.cards,
        ['label'],
      ),
    },
    certificates: {
      title: aboutDe.certificates?.title,
      description: aboutDe.certificates?.description,
      items: mergeArrayByIndex(
        (aboutEn.certificates as any)?.items ?? [],
        aboutDe.certificates?.items,
        ['name', 'description'],
      ),
    },
  }

  await payload.updateGlobal({
    slug: 'about-page-settings',
    locale: LOCALE,
    data: aboutData as any,
    context: { disableRevalidate: true },
  })
  console.log('✓ homepage-settings [de]')

  // ── Collections: news SEO in DE (keep EN title/excerpt, add DE meta) ──
  const news = await payload.find({ collection: 'news', locale: 'en', limit: 100, depth: 0 })
  for (const doc of news.docs) {
    const title = (doc as any).title as string
    if (!title) continue
    await payload.update({
      collection: 'news',
      id: doc.id,
      locale: LOCALE,
      data: {
        title,
        excerpt: (doc as any).excerpt,
        meta: {
          title: `${title} — Polinar`,
          description: `Lesen Sie über ${title} von Polinar.`,
        },
      } as any,
    })
  }
  console.log(`✓ news collection [de] (${news.docs.length} items)`)

  // Verify
  const nav = await payload.findGlobal({ slug: 'navigation', locale: 'de', depth: 0 })
  console.log('\nNavigation DE labels:', (nav.mainMenu as any[])?.map((m) => m.label))

  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
