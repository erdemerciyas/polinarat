import type { Metadata } from 'next'
import { getPayloadClient } from '@/lib/payload'
import { generateSEO } from '@/lib/seo'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { RenderBlocks } from '@/components/RenderBlocks'

type Props = { params: Promise<{ locale: string; slug: string }> }

export const revalidate = 300

export async function generateStaticParams() {
  const params: Array<{ locale: string; slug: string }> = []
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({ collection: 'pages', limit: 100 })
    const locales = (await import('@/lib/locales.json')).default.locales.map((l: { code: string }) => l.code)
    for (const doc of result.docs) {
      for (const locale of locales) {
        params.push({ locale, slug: (doc as any).slug })
      }
    }
  } catch {}
  return params
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  if (['about', 'our-business', 'news', 'contact'].includes(slug)) return {}

  let page: any = null
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({ collection: 'pages', where: { slug: { equals: slug } }, locale: locale as any, limit: 1 })
    page = result.docs[0]
  } catch {}

  if (!page) return {}

  const meta = page.meta || {}
  return generateSEO({
    title: meta.title || page.heroTitle || page.title,
    description: meta.description || page.excerpt || page.title,
    locale,
    path: `/${slug}`,
    image: meta.image?.url || page.heroImage?.url,
  })
}

export default async function DynamicPage({ params }: Props) {
  const { locale, slug } = await params

  // Skip known routes
  if (['about', 'our-business', 'news', 'contact'].includes(slug)) {
    return notFound()
  }

  let page: any = null
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      locale: locale as any,
      limit: 1,
    })
    page = result.docs[0]
  } catch {}

  if (!page) return notFound()

  return (
    <>
      {/* Hero Banner */}
      {page.heroType !== 'none' && (
        <section className="relative bg-navy grain-overlay pt-[168px] pb-24 lg:pt-[184px] lg:pb-28">
          <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy/70"></div>
          {page.heroImage?.url && (
            <Image src={page.heroImage.url} alt={page.heroTitle || page.title || ''} fill sizes="100vw" className="object-cover opacity-30" />
          )}
          <div className="relative z-10 max-w-container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-display font-extrabold text-white text-3xl sm:text-4xl lg:text-5xl tracking-tight-heading">
              {page.heroTitle || page.title}
            </h1>
          </div>
        </section>
      )}

      {/* Block Layout */}
      {page.layout && page.layout.length > 0 ? (
        <div className={page.heroType === 'none' ? 'pt-[72px]' : ''}>
          <RenderBlocks blocks={page.layout} locale={locale} />
        </div>
      ) : (
        <section className={`py-24 lg:py-32 bg-white ${page.heroType === 'none' ? 'pt-[168px]' : ''}`}>
          <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-display font-extrabold text-heading text-3xl mb-6">{page.title}</h1>
          </div>
        </section>
      )}
    </>
  )
}
