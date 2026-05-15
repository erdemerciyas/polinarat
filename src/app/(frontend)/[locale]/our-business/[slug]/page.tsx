import type { Metadata } from 'next'
import { getPayloadClient } from '@/lib/payload'
import { generateSEO } from '@/lib/seo'
import { getInjectionMouldsData } from '@/data/injection-moulds'
import { getMachineryData } from '@/data/machinery'
import { getPlasticTestEquipmentData } from '@/data/plastic-test-equipment'
import { RenderBlocks } from '@/components/RenderBlocks'
import { InjectionMouldsPage } from '@/components/InjectionMouldsPage'
import { MachineryPage } from '@/components/MachineryPage'
import { PlasticTestEquipmentPage } from '@/components/PlasticTestEquipmentPage'
import Link from 'next/link'
import Image from 'next/image'

type Props = { params: Promise<{ locale: string; slug: string }> }

export const revalidate = 300

export async function generateStaticParams() {
  const locales = (await import('@/lib/locales.json')).default.locales.map((l: { code: string }) => l.code)
  const staticSlugs = ['injection-moulds', 'machinery', 'plastic-test-equipment']
  const params: Array<{ locale: string; slug: string }> = []
  for (const slug of staticSlugs) {
    for (const locale of locales) {
      params.push({ locale, slug })
    }
  }
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({ collection: 'pages', limit: 100 })
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

  if (slug === 'injection-moulds') {
    const data = getInjectionMouldsData(locale)
    return generateSEO({ title: data.ui.heroTitle, description: data.ui.heroSubtitle, locale, path: `/our-business/${slug}` })
  }
  if (slug === 'machinery') {
    const data = getMachineryData(locale)
    return generateSEO({ title: data.ui.heroTitle, description: data.ui.heroSubtitle, locale, path: `/our-business/${slug}` })
  }
  if (slug === 'plastic-test-equipment' || slug === 'plastic-testing-equipment') {
    const data = getPlasticTestEquipmentData(locale)
    return generateSEO({ title: data.ui.heroTitle, description: data.ui.heroSubtitle, locale, path: `/our-business/${slug}` })
  }

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
    path: `/our-business/${slug}`,
    image: meta.image?.url || page.heroImage?.url,
  })
}

export default async function OurBusinessPage({ params }: Props) {
  const { locale, slug } = await params

  let page: any = null
  let breadcrumbLabel = ''
  let contentComingSoon = ''

  try {
    const payload = await getPayloadClient()
    const { getDictionary } = await import('@/lib/getDictionary')
    const dictionary = await getDictionary(locale)

    const navData = dictionary['navigation'] || null
    const uiLabels = dictionary['ui-labels'] || null

    const pageResult = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      locale: locale as any,
      limit: 1,
    })

    page = pageResult.docs[0]
    contentComingSoon = uiLabels?.contentComingSoon || ''

    const megaItem = navData?.mainMenu?.find((item: any) => item.type === 'mega')
    if (megaItem?.label) {
      breadcrumbLabel = megaItem.label
    }
  } catch {}

  if (slug === 'injection-moulds') {
    return <InjectionMouldsPage locale={locale} breadcrumbLabel={breadcrumbLabel} />
  }

  if (slug === 'machinery') {
    return <MachineryPage locale={locale} breadcrumbLabel={breadcrumbLabel} />
  }

  if (slug === 'plastic-test-equipment' || slug === 'plastic-testing-equipment') {
    return <PlasticTestEquipmentPage locale={locale} breadcrumbLabel={breadcrumbLabel} />
  }

  if (!page) {
    return (
      <>
        <section className="relative bg-navy grain-overlay pt-[168px] pb-24 lg:pt-[200px] lg:pb-32">
          <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy/70"></div>
          <div className="relative z-10 max-w-container mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-display font-semibold text-polinar-mustard uppercase tracking-wider mb-2">
              <Link href={`/${locale}/our-business`} className="hover:text-white transition-colors">
                {breadcrumbLabel}
              </Link>
            </p>
            <h1 className="font-display font-extrabold text-white text-3xl sm:text-4xl lg:text-5xl tracking-tight-heading uppercase">
              {slug.replace(/-/g, ' ')}
            </h1>
          </div>
        </section>
        <section className="py-24 lg:py-32 bg-white">
          <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-body-muted font-body">{contentComingSoon}</p>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      {page.heroType !== 'none' && (
        <section className="relative bg-navy grain-overlay pt-[168px] pb-24 lg:pt-[200px] lg:pb-32">
          <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy/70"></div>
          {page.heroImage?.url && (
            <Image src={page.heroImage.url} alt={page.heroTitle || page.title || ''} fill sizes="100vw" className="object-cover opacity-30" />
          )}
          <div className="relative z-10 max-w-container mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-display font-semibold text-polinar-mustard uppercase tracking-wider mb-2">
              <Link href={`/${locale}/our-business`} className="hover:text-white transition-colors">
                {breadcrumbLabel}
              </Link>
            </p>
            <h1 className="font-display font-extrabold text-white text-3xl sm:text-4xl lg:text-5xl tracking-tight-heading">
              {page.heroTitle || page.title}
            </h1>
          </div>
        </section>
      )}

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
