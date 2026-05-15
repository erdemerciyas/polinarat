import type { Metadata } from 'next'
import { getStaticLabels } from '@/data/static-labels'
import { generateSEO, getSiteDefaultDescription, breadcrumbJsonLd, JsonLd, SITE_URL } from '@/lib/seo'
import { getOurBusinessHighlights } from '@/data/our-business'
import Link from 'next/link'

type Props = {
  params: Promise<{ locale: string }>
}

export const revalidate = 300

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  let navData: any = null
  let ourBusinessSettings: any = null
  try {
    const { getDictionary } = await import('@/lib/getDictionary')
    const dictionary = await getDictionary(locale)
    navData = dictionary['navigation'] || null
    ourBusinessSettings = dictionary['our-business-page-settings'] || null
  } catch {}

  const seo = ourBusinessSettings?.seo || {}
  const defaultDesc = await getSiteDefaultDescription(locale)
  const megaItem = navData?.mainMenu?.find((item: any) => item.type === 'mega')
  const title = seo.title || megaItem?.label || (locale === 'tr' ? 'Faaliyetlerimiz' : 'Our Business')

  return generateSEO({
    title,
    description: seo.description || defaultDesc,
    locale,
    path: '/our-business',
    image: seo.image?.url,
  })
}

const categoryThemes: Record<
  string,
  {
    accent: string
    accentBg: string
    accentBorder: string
    accentText: string
    iconBg: string
    iconHoverBg: string
    dividerClass: string
    btnClass: string
    tagBg: string
    tagText: string
    hoverShadow: string
    numberColor: string
  }
> = {
  moulds: {
    accent: '#B8860B',
    accentBg: 'bg-moulds-gold/10',
    accentBorder: 'border-moulds-gold/30',
    accentText: 'text-moulds-gold',
    iconBg: 'bg-moulds-gold/10',
    iconHoverBg: 'group-hover:bg-moulds-gold',
    dividerClass: 'div-gold',
    btnClass: 'btn-primary-gold',
    tagBg: 'bg-moulds-gold/10',
    tagText: 'text-moulds-gold',
    hoverShadow: 'hover:shadow-[0_12px_40px_rgba(184,134,11,0.15),0_4px_12px_rgba(10,17,40,0.08)]',
    numberColor: 'text-moulds-gold/15',
  },
  machinery: {
    accent: '#6B7B8D',
    accentBg: 'bg-machinery-steel/10',
    accentBorder: 'border-machinery-steel/30',
    accentText: 'text-machinery-steel',
    iconBg: 'bg-machinery-steel/10',
    iconHoverBg: 'group-hover:bg-machinery-steel',
    dividerClass: 'div-steel',
    btnClass: 'btn-primary-steel',
    tagBg: 'bg-machinery-steel/10',
    tagText: 'text-machinery-steel',
    hoverShadow: 'hover:shadow-[0_12px_40px_rgba(107,123,141,0.15),0_4px_12px_rgba(10,17,40,0.08)]',
    numberColor: 'text-machinery-steel/15',
  },
  testing: {
    accent: '#00B4D8',
    accentBg: 'bg-pte-cyan/10',
    accentBorder: 'border-pte-cyan/30',
    accentText: 'text-pte-cyan',
    iconBg: 'bg-pte-cyan/10',
    iconHoverBg: 'group-hover:bg-pte-cyan',
    dividerClass: 'div-cyan',
    btnClass: 'btn-primary-cyan',
    tagBg: 'bg-pte-cyan/10',
    tagText: 'text-pte-cyan',
    hoverShadow: 'hover:shadow-[0_12px_40px_rgba(0,180,216,0.15),0_4px_12px_rgba(10,17,40,0.08)]',
    numberColor: 'text-pte-cyan/15',
  },
}

const defaultTheme = categoryThemes.machinery

const categoryHeroImages: Record<string, string> = {
  moulds: 'https://res.cloudinary.com/dtdogh9wg/image/upload/v1776265680/polinar/static/moulds-hero-v4.jpg',
  machinery: 'https://res.cloudinary.com/dtdogh9wg/image/upload/v1776265681/polinar/static/machinery-hero-v4.jpg',
  testing: 'https://res.cloudinary.com/dtdogh9wg/image/upload/v1776265682/polinar/static/testing-hero-v6.jpg',
}


function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const cls = className || 'w-8 h-8'
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

export default async function OurBusinessLandingPage({ params }: Props) {
  const { locale } = await params
  let navData: any = null
  let homepageData: any = null
  let uiLabels: any = null
  let dictionary: any = {}

  try {
    const { getDictionary } = await import('@/lib/getDictionary')
    dictionary = await getDictionary(locale)
    navData = dictionary['navigation'] || null
    homepageData = dictionary['homepage-settings'] || null
    uiLabels = dictionary['ui-labels'] || null
  } catch {}

  const labels = dictionary['static-content']?.['static-labels'] || getStaticLabels(locale)
  const highlights = dictionary['static-content']?.['our-business'] || getOurBusinessHighlights(locale)

  const megaMenuItem = navData?.mainMenu?.find((item: any) => item.type === 'mega')
  const pageTitle = megaMenuItem?.label || (locale === 'tr' ? 'Faaliyetlerimiz' : 'Our Business')
  const businessSection = homepageData?.businessSection || {}
  const ctaLabels = navData?.megaMenuCTA || {}
  const learnMore = uiLabels?.learnMore || (locale === 'tr' ? 'Daha Fazla' : 'Learn More')

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

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([
        { name: labels.breadcrumbs.home, url: `${SITE_URL}/${locale}` },
        { name: pageTitle, url: `${SITE_URL}/${locale}/our-business` },
      ])} />
      {/* Hero Banner */}
      <section className="relative bg-navy grain-overlay pt-[168px] pb-24 lg:pt-[200px] lg:pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy/95 to-navy/80"></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}></div>
        <div className="relative z-10 max-w-container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <nav aria-label={labels.breadcrumbs.breadcrumbAriaLabel} className="mb-6 flex justify-center">
            <ol className="flex items-center gap-2 text-sm font-body text-white/60">
              <li>
                <Link href={`/${locale}`} className="hover:text-white transition-colors">
                  {labels.breadcrumbs.home}
                </Link>
              </li>
              <li>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </li>
              <li className="text-white font-semibold">{pageTitle}</li>
            </ol>
          </nav>
          <p className="text-sm font-display font-semibold text-polinar-mustard uppercase tracking-[0.2em] mb-3">
            {businessSection.sectionLabel || pageTitle}
          </p>
          <h1 className="font-display font-extrabold text-white text-3xl sm:text-4xl lg:text-5xl tracking-tight-heading uppercase">
            {pageTitle}
          </h1>
          <div className="divider-asymmetric justify-center mt-5 mb-0">
            <span className="div-mustard"></span>
            <span className="div-gray"></span>
          </div>
          {businessSection.sectionTitle && (
            <p className="mt-4 text-white/60 font-body text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              {businessSection.sectionTitle}
            </p>
          )}
        </div>
      </section>

      {/* Business Cards */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {businessCards.map((card, index) => {
              const theme = categoryThemes[card.icon] || defaultTheme
              const cardHighlights = highlights[card.icon] || []
              const number = String(index + 1).padStart(2, '0')

              return (
                <Link
                  key={card.href}
                  href={card.href}
                  className={`group relative bg-white rounded-lg border border-gray-100 ${theme.hoverShadow} transition-all duration-500 overflow-hidden flex flex-col spring-hover`}
                >
                  <div className="absolute top-0 left-0 right-0 h-1 transition-all duration-300" style={{ backgroundColor: theme.accent }}></div>

                  {/* Image Area */}
                  <div className="relative h-[220px] sm:h-[240px] bg-gray-light overflow-hidden">
                    {categoryHeroImages[card.icon] || card.image?.url ? (
                      <img
                        src={categoryHeroImages[card.icon] || card.image?.url}
                        alt={card.image?.alt || card.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <CategoryIcon name={card.icon} className="w-20 h-20 text-gray-300/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>

                    <div className={`absolute top-5 left-5 font-display font-extrabold text-6xl ${theme.numberColor} select-none`}>
                      {number}
                    </div>

                    <div className={`absolute bottom-5 right-5 w-12 h-12 rounded-xl ${theme.iconBg} ${theme.accentText} flex items-center justify-center ${theme.iconHoverBg} group-hover:text-navy transition-colors duration-300 backdrop-blur-sm`}>
                      <CategoryIcon name={card.icon} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-7 flex flex-col flex-1">
                    <h2 className="font-display font-extrabold text-heading text-xl tracking-tight-heading mb-2">
                      {card.title}
                    </h2>

                    <div className="divider-asymmetric mt-0 mb-3">
                      <span className={theme.dividerClass}></span>
                      <span className="div-gray"></span>
                    </div>

                    <p className="text-body-muted font-body text-sm leading-relaxed-body mb-5 flex-1">
                      {card.description}
                    </p>

                    {cardHighlights.length > 0 && (
                      <div className="flex flex-col gap-1.5 mb-6">
                        {cardHighlights.map((hl: string) => (
                          <span
                            key={hl}
                            className={`inline-flex items-center gap-2 ${theme.accentText} font-body text-xs font-medium`}
                          >
                            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                            </svg>
                            {hl}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-auto">
                      <span className={`${theme.btnClass} inline-flex items-center gap-2 group-hover:gap-3 transition-all duration-300 text-sm`}>
                        {learnMore}
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative bg-navy grain-overlay py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/95 to-navy/80"></div>
        <div className="relative z-10 max-w-container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display font-extrabold text-white text-2xl sm:text-3xl tracking-tight-heading mb-4">
            {ctaLabels.title || (locale === 'tr' ? 'Bize Ulaşın' : 'Get in Touch')}
          </h2>
          <p className="text-white/60 font-body text-base max-w-xl mx-auto leading-relaxed mb-8">
            {ctaLabels.description || ''}
          </p>
          <Link href={`/${locale}/contact`} className="btn-primary text-base px-10 py-3">
            {ctaLabels.button || (locale === 'tr' ? 'İletişime Geçin' : 'Contact Us')}
          </Link>
        </div>
      </section>
    </>
  )
}
