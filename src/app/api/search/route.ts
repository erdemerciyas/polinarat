import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { getDictionary } from '@/lib/getDictionary'
import { getStaticLabels } from '@/data/static-labels'
import { getInjectionMouldsData } from '@/data/injection-moulds'
import { getMachineryData } from '@/data/machinery'
import { getPlasticTestEquipmentData } from '@/data/plastic-test-equipment'

type SearchResult = {
  type: 'page' | 'news' | 'product' | 'equipment' | 'machine' | 'mould'
  title: string
  excerpt?: string
  href: string
}

function matchesQuery(text: string | undefined | null, q: string): boolean {
  if (!text) return false
  return text.toLowerCase().includes(q)
}

function matchesAny(texts: (string | undefined | null)[], q: string): boolean {
  return texts.some((t) => matchesQuery(t, q))
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q = (searchParams.get('q') || '').trim().toLowerCase()
  const locale = searchParams.get('locale') || 'en'

  if (q.length < 2) {
    return NextResponse.json({ results: [] })
  }

  const payload = await getPayloadClient()
  const searchLocales = locale === 'en' ? ['en'] : [locale, 'en']
  const results: SearchResult[] = []

  // --- 1. CMS Collections (pages, news, product-categories) ---
  async function searchCmsCollection(
    opts: Omit<Parameters<typeof payload.find>[0], 'locale'>,
  ) {
    const seen = new Set<number>()
    const docs: any[] = []
    for (const loc of searchLocales) {
      const res = await payload.find({ ...opts, locale: loc as any })
      for (const doc of res.docs as any[]) {
        if (!seen.has(doc.id)) {
          seen.add(doc.id)
          docs.push(doc)
        }
      }
    }
    return docs
  }

  const [pageDocs, newsDocs, productDocs] = await Promise.all([
    searchCmsCollection({
      collection: 'pages',
      where: {
        or: [
          { title: { like: q } },
          { slug: { like: q } },
          { heroTitle: { like: q } },
        ],
      },
      limit: 5,
      depth: 0,
    }),
    searchCmsCollection({
      collection: 'news',
      where: {
        and: [
          { status: { equals: 'published' } },
          {
            or: [
              { title: { like: q } },
              { excerpt: { like: q } },
            ],
          },
        ],
      },
      sort: '-date',
      limit: 5,
      depth: 0,
    }),
    searchCmsCollection({
      collection: 'product-categories',
      where: {
        or: [
          { name: { like: q } },
          { materials: { like: q } },
        ],
      },
      limit: 5,
      depth: 0,
    }),
  ])

  for (const doc of pageDocs) {
    results.push({
      type: 'page',
      title: doc.title || doc.slug,
      href: `/${locale}/${doc.slug}`,
    })
  }

  for (const doc of newsDocs) {
    results.push({
      type: 'news',
      title: doc.title,
      excerpt: doc.excerpt || undefined,
      href: `/${locale}/news/${doc.slug}`,
    })
  }

  for (const doc of productDocs) {
    results.push({
      type: 'product',
      title: doc.name,
      excerpt: doc.materials || undefined,
      href: `/${locale}/our-business/injection-moulds`,
    })
  }

  const labels = getStaticLabels(locale)
  const pageTitles = {
    home: labels.breadcrumbs.home,
    about: locale === 'de' ? 'Über uns' : 'About Us',
    contact: locale === 'de' ? 'Kontakt' : 'Contact',
    news: locale === 'de' ? 'Nachrichten' : 'News',
  }

  // --- 2. CMS Globals (page-level content) ---
  const globalsToSearch: {
    slug: string
    fields: string[]
    nested?: { group: string; fields: string[] }[]
    title: string
    href: string
    type: SearchResult['type']
  }[] = [
    {
      slug: 'homepage-settings',
      fields: [],
      nested: [
        { group: 'aboutPreviewLabels', fields: ['title', 'description'] },
        { group: 'businessSection', fields: ['sectionTitle'] },
        { group: 'newsSection', fields: ['title'] },
      ],
      title: pageTitles.home,
      href: `/${locale}`,
      type: 'page',
    },
    {
      slug: 'about-page-settings',
      fields: [],
      nested: [
        { group: 'hero', fields: ['title', 'subtitle'] },
        { group: 'story', fields: ['title'] },
        { group: 'video', fields: ['title', 'description'] },
        { group: 'certificates', fields: ['title', 'description'] },
        { group: 'cta', fields: ['title', 'description'] },
      ],
      title: pageTitles.about,
      href: `/${locale}/about`,
      type: 'page',
    },
    {
      slug: 'contact-page-settings',
      fields: [],
      nested: [
        { group: 'hero', fields: ['title', 'subtitle'] },
      ],
      title: pageTitles.contact,
      href: `/${locale}/contact`,
      type: 'page',
    },
    {
      slug: 'news-page-settings',
      fields: [],
      nested: [
        { group: 'hero', fields: ['title'] },
      ],
      title: pageTitles.news,
      href: `/${locale}/news`,
      type: 'page',
    },
  ]

  const dictionary = await getDictionary(locale)

  const globalSearchPromise = Promise.resolve().then(() => {
    for (const g of globalsToSearch) {
      try {
        const data = dictionary[g.slug]
        if (!data) continue

        const textsToCheck: string[] = []
        for (const field of g.fields) {
          const val = data[field]
          if (typeof val === 'string') textsToCheck.push(val)
        }
        for (const n of g.nested || []) {
          const group = data[n.group]
          if (!group) continue
          for (const f of n.fields) {
            const val = group[f]
            if (typeof val === 'string') textsToCheck.push(val)
          }
        }
        if (textsToCheck.some((t) => t.toLowerCase().includes(q))) {
          results.push({ type: g.type, title: g.title, href: g.href })
        }
      } catch { /* ignore */ }
    }
  })

  // --- 3. Static Data Modules ---
  const staticSearchPromise = Promise.resolve().then(() => {
    const injectionMoulds = getInjectionMouldsData(locale)
    for (const cat of injectionMoulds.categories) {
      if (
        matchesAny(
          [cat.name, cat.materials, ...(cat.technologies || [])],
          q,
        )
      ) {
        results.push({
          type: 'mould',
          title: cat.name,
          excerpt: cat.materials,
          href: `/${locale}/our-business/injection-moulds`,
        })
      }
    }
    if (
      matchesAny(
        [
          injectionMoulds.ui.heroTitle,
          injectionMoulds.ui.introTitle,
          injectionMoulds.ui.introText,
        ],
        q,
      ) &&
      !results.some((r) => r.type === 'mould')
    ) {
      results.push({
        type: 'mould',
        title: injectionMoulds.ui.heroTitle,
        excerpt: injectionMoulds.ui.introTitle,
        href: `/${locale}/our-business/injection-moulds`,
      })
    }

    const machinery = getMachineryData(locale)
    for (const cat of machinery.categories) {
      if (
        matchesAny(
          [cat.name, cat.shortDescription, cat.description, ...(cat.features || [])],
          q,
        )
      ) {
        results.push({
          type: 'machine',
          title: cat.name,
          excerpt: cat.shortDescription,
          href: `/${locale}/our-business/machinery`,
        })
      }
    }
    if (
      matchesAny(
        [
          machinery.ui.heroTitle,
          machinery.ui.introTitle,
          machinery.ui.introText,
        ],
        q,
      ) &&
      !results.some((r) => r.type === 'machine')
    ) {
      results.push({
        type: 'machine',
        title: machinery.ui.heroTitle,
        excerpt: machinery.ui.introTitle,
        href: `/${locale}/our-business/machinery`,
      })
    }

    const testEquipment = getPlasticTestEquipmentData(locale)
    for (const cat of testEquipment.categories) {
      if (
        matchesAny(
          [
            cat.name,
            cat.shortDescription,
            cat.description,
            ...(cat.features || []),
            ...(cat.standards || []),
          ],
          q,
        )
      ) {
        results.push({
          type: 'equipment',
          title: cat.name,
          excerpt: cat.shortDescription,
          href: `/${locale}/our-business/plastic-test-equipment`,
        })
      }
    }
    if (
      matchesAny(
        [
          testEquipment.ui.heroTitle,
          testEquipment.ui.introTitle,
          testEquipment.ui.introDescription,
        ],
        q,
      ) &&
      !results.some((r) => r.type === 'equipment')
    ) {
      results.push({
        type: 'equipment',
        title: testEquipment.ui.heroTitle,
        excerpt: testEquipment.ui.introTitle,
        href: `/${locale}/our-business/plastic-test-equipment`,
      })
    }
  })

  const navSearchPromise = Promise.resolve().then(() => {
    try {
      const nav = dictionary['navigation']
      const mainMenu = nav?.mainMenu
      if (!Array.isArray(mainMenu)) return

      for (const item of mainMenu) {
        if (item.type === 'mega' && Array.isArray(item.megaMenuColumns)) {
          for (const col of item.megaMenuColumns) {
            if (col.columnType === 'links' && Array.isArray(col.links)) {
              for (const link of col.links) {
                if (matchesAny([link.label, link.description], q)) {
                  const href = link.url?.startsWith('http')
                    ? link.url
                    : `/${locale}${link.url}`
                  if (!results.some((r) => r.href === href)) {
                    results.push({
                      type: 'page',
                      title: link.label,
                      excerpt: link.description || undefined,
                      href,
                    })
                  }
                }
              }
            }
          }
        }
      }
    } catch { /* ignore */ }
  })

  await Promise.all([globalSearchPromise, staticSearchPromise, navSearchPromise])

  // Deduplicate by href
  const seen = new Set<string>()
  const deduped = results.filter((r) => {
    if (seen.has(r.href)) return false
    seen.add(r.href)
    return true
  })

  return NextResponse.json({ results: deduped.slice(0, 15) })
}
