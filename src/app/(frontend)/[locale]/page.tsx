import type { Metadata } from 'next'
import { getPayloadClient } from '@/lib/payload'
import { getStaticLabels } from '@/data/static-labels'
import { generateSEO, getSiteDefaultDescription, websiteJsonLd, JsonLd } from '@/lib/seo'
import { HeroSlider } from '@/components/HeroSlider'
import Image from 'next/image'
import Link from 'next/link'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/ScrollReveal'
import { NewsSlider } from '@/components/NewsSlider'
import { CoreValuesSection } from '@/components/CoreValuesSection'
import { WhatsAppCTABar } from '@/components/layout/WhatsAppCTABar'
import { getBestMediaUrl, withMediaCacheVersion } from '@/lib/media-url'
import { toClientProps } from '@/lib/to-client-props'
import { lexicalLikeToPlainText } from '@/lib/cms-plain-text'

const ABOUT_PREVIEW_FALLBACK_IMAGE =
  'https://res.cloudinary.com/dtdogh9wg/image/upload/v1775050251/polinar/static/polinar-factory.jpg'
const ABOUT_PREVIEW_DEFAULT_WATERMARK =
  'https://res.cloudinary.com/dtdogh9wg/image/upload/v1775050253/polinar/static/polinar-robot.jpg'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  let homepageData: any = null
  let dictionary: any = {}
  try {
    const { getDictionary } = await import('@/lib/getDictionary')
    dictionary = await getDictionary(locale)
    homepageData = dictionary['homepage-settings'] || null
  } catch {}

  const labels = dictionary['static-content']?.['static-labels'] || getStaticLabels(locale)

  const seo = homepageData?.seo || {}
  const defaultDesc = await getSiteDefaultDescription(locale)
  return generateSEO({
    title: seo.title || labels.seo.defaultTitle,
    description: seo.description || homepageData?.coreValues?.description || defaultDesc,
    locale,
    path: '',
    image: seo.image?.url,
  })
}

function BusinessIcon({ name }: { name: string }) {
  const cls = 'w-8 h-8'
  switch (name) {
    case 'moulds':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
        </svg>
      )
    case 'machinery':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      )
    case 'testing':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M5 14.5l-.94 2.06a2.25 2.25 0 0 0 2.036 3.19h11.808a2.25 2.25 0 0 0 2.036-3.19L19 14.5m-14 0h14" />
        </svg>
      )
    default:
      return null
  }
}

const categoryColors: Record<string, { bg: string; text: string; hoverBg: string; hoverBorder: string; shadow: string }> = {
  moulds: {
    bg: 'bg-moulds-gold/10',
    text: 'text-moulds-gold',
    hoverBg: 'group-hover:bg-moulds-gold',
    hoverBorder: 'hover:border-moulds-gold/20',
    shadow: 'group-hover:shadow-card-hover-gold',
  },
  machinery: {
    bg: 'bg-machinery-steel/10',
    text: 'text-machinery-steel',
    hoverBg: 'group-hover:bg-machinery-steel',
    hoverBorder: 'hover:border-machinery-steel/20',
    shadow: 'group-hover:shadow-card-hover-steel',
  },
  testing: {
    bg: 'bg-pte-cyan/10',
    text: 'text-pte-cyan',
    hoverBg: 'group-hover:bg-pte-cyan',
    hoverBorder: 'hover:border-pte-cyan/20',
    shadow: 'group-hover:shadow-card-hover-cyan',
  },
}

const defaultCategoryColor = categoryColors.machinery

const categoryHeroImages: Record<string, string> = {
  moulds: 'https://res.cloudinary.com/dtdogh9wg/image/upload/v1776265680/polinar/static/moulds-hero-v4.jpg',
  machinery: 'https://res.cloudinary.com/dtdogh9wg/image/upload/v1776265681/polinar/static/machinery-hero-v4.jpg',
  testing: 'https://res.cloudinary.com/dtdogh9wg/image/upload/v1776265682/polinar/static/testing-hero-v6.jpg',
}

type Props = {
  params: Promise<{ locale: string }>
}

export const revalidate = 300

export default async function HomePage({ params }: Props) {
  const { locale } = await params

  let homepageData: any = null
  let navData: any = null
  let uiLabels: any = null
  let news = null
  let siteSettings: any = null
  let dictionary: any = {}

  try {
    const payload = await getPayloadClient()
    const { getDictionary } = await import('@/lib/getDictionary')
    dictionary = await getDictionary(locale)

    homepageData = dictionary['homepage-settings'] || null
    navData = dictionary['navigation'] || null
    uiLabels = dictionary['ui-labels'] || null
    siteSettings = dictionary['site-settings'] || null

    news = await payload.find({
      collection: 'news',
      locale: locale as any,
      where: { status: { equals: 'published' } },
      sort: '-date',
      limit: 6,
    })
  } catch {}

  const labels = dictionary['static-content']?.['static-labels'] || getStaticLabels(locale)

  const megaMenuItem = navData?.mainMenu?.find((item: any) => item.type === 'mega')
  const businessCards: Array<{
    icon: string
    title: string
    description: string
    href: string
    image: { url?: string; alt?: string } | null
  }> = []

  if (megaMenuItem) {
    for (const col of megaMenuItem.megaMenuColumns || []) {
      if (col.columnType === 'links') {
        for (const link of col.links || []) {
          businessCards.push({
            icon: link.icon || '',
            title: link.label,
            description: link.description || '',
            href: link.url.startsWith('http') ? link.url : `/${locale}${link.url}`,
            image: link.image ?? null,
          })
        }
      }
    }
  }

  const aboutPreview = homepageData?.aboutPreviewLabels || {}
  /** Prefer labels-tab image, then legacy About Preview Section image; normalize /api/media → Cloudinary. */
  const aboutPreviewImageMedia = (() => {
    const labelsImg = aboutPreview.image
    const legacyImg = homepageData?.aboutPreview?.image
    if (getBestMediaUrl(labelsImg)) return labelsImg
    if (getBestMediaUrl(legacyImg)) return legacyImg
    return null
  })()
  const aboutPreviewImageUrl = getBestMediaUrl(aboutPreviewImageMedia) ?? ABOUT_PREVIEW_FALLBACK_IMAGE
  const aboutPreviewImageUrlVersioned = withMediaCacheVersion(
    aboutPreviewImageUrl,
    aboutPreviewImageMedia,
  )
  const aboutPreviewImageKey =
    typeof aboutPreviewImageMedia === 'object' &&
    aboutPreviewImageMedia &&
    'id' in aboutPreviewImageMedia &&
    (aboutPreviewImageMedia as { id?: unknown }).id != null
      ? String((aboutPreviewImageMedia as { id: unknown }).id)
      : aboutPreviewImageUrlVersioned
  const aboutPreviewImageAlt =
    (typeof aboutPreviewImageMedia === 'object' &&
      aboutPreviewImageMedia &&
      typeof (aboutPreviewImageMedia as { alt?: string }).alt === 'string' &&
      (aboutPreviewImageMedia as { alt: string }).alt) ||
    'Polinar'
  const aboutPreviewWatermarkUrl =
    getBestMediaUrl(homepageData?.aboutPreviewDecor?.leftWatermark) ?? ABOUT_PREVIEW_DEFAULT_WATERMARK
  const aboutPreviewWatermarkMedia = homepageData?.aboutPreviewDecor?.leftWatermark
  const aboutPreviewWatermarkUrlVersioned = withMediaCacheVersion(
    aboutPreviewWatermarkUrl,
    aboutPreviewWatermarkMedia,
  )
  const aboutPreviewWatermarkKey =
    typeof aboutPreviewWatermarkMedia === 'object' &&
    aboutPreviewWatermarkMedia &&
    'id' in aboutPreviewWatermarkMedia &&
    (aboutPreviewWatermarkMedia as { id?: unknown }).id != null
      ? String((aboutPreviewWatermarkMedia as { id: unknown }).id)
      : aboutPreviewWatermarkUrlVersioned
  const businessSection = homepageData?.businessSection || {}
  const newsSection = homepageData?.newsSection || {}

  const fallbackHeroSlides = [
    {
      title: 'DURABLE MOULDS AND CUSTOMIZED PRODUCTS',
      subtitle: 'High quality plastic injection moulds for the global market',
    },
  ]
  const heroSlidesRaw = homepageData?.heroSlides?.length
    ? homepageData.heroSlides.map((s: any) => ({
        title: s.title,
        subtitle: s.subtitle,
        backgroundImage: s.backgroundImage,
        ctaLabel: s.ctaLabel,
        ctaLink: s.ctaLink,
        overlayOpacity: s.overlayOpacity,
        textAlignment: s.textAlignment,
        textPosition: s.textPosition,
        titleSize: s.titleSize,
        animateText: s.animateText,
        textAnimation: s.textAnimation,
      }))
    : fallbackHeroSlides
  const heroSlidesForClient = toClientProps(heroSlidesRaw) ?? fallbackHeroSlides
  const sliderSettingsForClient = homepageData?.sliderSettings
    ? toClientProps(homepageData.sliderSettings) ?? undefined
    : undefined

  const newsItemsRaw = (news?.docs || []).map((item: any) => ({
    id: String(item.id),
    slug: item.slug,
    title: item.title,
    excerpt: item.excerpt || '',
    year: item.year || '',
    date: item.date,
    featuredImage: item.featuredImage,
  }))
  const newsItemsForClient = toClientProps(newsItemsRaw) ?? []

  return (
    <>
      <JsonLd data={websiteJsonLd()} />
      <HeroSlider slides={heroSlidesForClient} settings={sliderSettingsForClient} locale={locale} />

      {/* Core Values */}
      <CoreValuesSection
        title={homepageData?.coreValues?.title || ''}
        description={lexicalLikeToPlainText(homepageData?.coreValues?.description)}
        locale={locale}
        subtitleSlides={businessCards
          .filter(c => c.description)
          .map(c => ({ title: c.title, description: c.description }))}
      />

      {/* Our Business */}
      <section className="py-24 lg:py-32 bg-gray-light">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-16">
            <p className="text-sm font-display font-semibold text-polinar-mustard uppercase tracking-wider mb-2">
              {businessSection.sectionLabel || ''}
            </p>
            <h2 className="font-display font-extrabold text-heading text-2xl sm:text-3xl lg:text-4xl tracking-tight-heading">
              {businessSection.sectionTitle || ''}
            </h2>
            <div className="divider-asymmetric justify-center">
              <span className="div-mustard"></span>
              <span className="div-gray"></span>
            </div>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {businessCards.map((card) => {
              const colors = categoryColors[card.icon] || defaultCategoryColor
              return (
                <StaggerItem key={card.href}>
                  <Link
                    href={card.href}
                    className={`group rounded-card-lg p-1.5 bg-gray-light/80 ring-1 ring-black/5 block ${colors.shadow} transition-all duration-500 ease-smooth-out hover:-translate-y-1`}
                  >
                    <div className="bg-white rounded-card overflow-hidden">
                      <div className="relative h-[220px] bg-gray-light overflow-hidden">
                        {(categoryHeroImages[card.icon] || card.image?.url) ? (
                          <Image
                            src={(categoryHeroImages[card.icon] || card.image?.url) as string}
                            alt={card.image?.alt || card.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700 ease-smooth-out"
                          />
                        ) : null}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                          <div className={`w-16 h-16 rounded-2xl ${colors.bg} ${colors.text} flex items-center justify-center ${colors.hoverBg} group-hover:text-white transition-colors duration-300 shadow-diffused`}>
                            <BusinessIcon name={card.icon} />
                          </div>
                        </div>
                      </div>

                      <div className="p-6 lg:p-8">
                        <h3 className="font-display font-bold text-heading text-lg mb-2">
                          {card.title}
                        </h3>
                        <p className="text-sm text-body-secondary font-body leading-relaxed mb-5">
                          {card.description}
                        </p>
                        <span className={`${colors.text} font-display font-semibold text-sm inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all duration-300`}>
                          {uiLabels?.learnMore || ''}
                          <span className="w-6 h-6 rounded-full bg-current/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform duration-300">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                            </svg>
                          </span>
                        </span>
                      </div>
                    </div>
                  </Link>
                </StaggerItem>
              )
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* About Preview */}
      <section className="relative py-24 lg:py-32 bg-white overflow-hidden">
        <div className="hidden lg:block absolute inset-y-0 left-0 w-[45%] pointer-events-none select-none" aria-hidden="true">
          <Image
            key={aboutPreviewWatermarkKey}
            src={aboutPreviewWatermarkUrlVersioned}
            alt=""
            fill
            sizes="45vw"
            className="object-contain object-center opacity-[0.18]"
          />
        </div>
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <ScrollReveal direction="left">
              <div>
                  <p className="text-sm font-display font-semibold text-polinar-mustard uppercase tracking-wider mb-2">
                    {aboutPreview.label || ''}
                  </p>
                  <h2 className="font-display font-extrabold text-heading text-2xl sm:text-3xl lg:text-4xl tracking-tight-heading">
                    {aboutPreview.title || ''}
                  </h2>
                  <div className="divider-asymmetric">
                    <span className="div-mustard"></span>
                    <span className="div-gray"></span>
                  </div>
                  <p className="text-body-muted font-body text-base leading-relaxed-body mb-6 max-w-prose">
                    {aboutPreview.description || ''}
                  </p>
              <Link href={`/${locale}/about`} className="btn-outline">
                {uiLabels?.readMore || ''}
              </Link>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right">
              <div className="relative aspect-[4/3] rounded-card-lg overflow-hidden shadow-card-hover">
                <Image
                  key={aboutPreviewImageKey}
                  src={aboutPreviewImageUrlVersioned}
                  alt={aboutPreviewImageAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="relative py-24 lg:py-32 bg-gray-light overflow-hidden">
        <div className="hidden lg:block absolute -top-12 bottom-0 right-0 w-[36%] pointer-events-none select-none" aria-hidden="true">
          <Image
            src="https://res.cloudinary.com/dtdogh9wg/image/upload/v1775050252/polinar/static/polinar-robot-globe.png"
            alt=""
            fill
            sizes="36vw"
            className="object-contain object-right-bottom"
          />
        </div>
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <NewsSlider
            items={newsItemsForClient}
            locale={locale}
            sectionLabel={newsSection.label || ''}
            sectionTitle={newsSection.title || ''}
            emptyText={newsSection.empty || ''}
          />
        </div>
      </section>

      <WhatsAppCTABar message={siteSettings?.whatsappCTA?.text} locale={locale} />
    </>
  )
}
