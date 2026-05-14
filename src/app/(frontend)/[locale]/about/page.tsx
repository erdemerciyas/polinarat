import type { Metadata } from 'next'
import Link from 'next/link'
import { getStaticLabels } from '@/data/static-labels'
import Image from 'next/image'
import { getBestMediaUrl } from '@/lib/media-url'
import { generateSEO, getSiteDefaultDescription, breadcrumbJsonLd, JsonLd, SITE_URL, videoObjectJsonLd, faqPageJsonLd } from '@/lib/seo'
import { CounterAnimation } from '@/components/about/CounterAnimation'
import { VideoPlayer } from '@/components/about/VideoPlayer'
import { GalleryLightbox } from '@/components/about/GalleryLightbox'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/ScrollReveal'

type Props = { params: Promise<{ locale: string }> }

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  let aboutSettings: any = null
  let dictionary: any = {}
  try {
    const { getAboutPageSettings } = await import('@/lib/about-page-data')
    aboutSettings = await getAboutPageSettings(locale)
  } catch {}
  try {
    const { getDictionary } = await import('@/lib/getDictionary')
    dictionary = await getDictionary(locale)
  } catch {}

  const labels = dictionary['static-content']?.['static-labels'] || getStaticLabels(locale)

  const seo = aboutSettings?.seo || {}
  const defaultDesc = await getSiteDefaultDescription(locale)
  const title = seo.title || aboutSettings?.hero?.title || 'About Us'
  const description =
    seo.description ||
    aboutSettings?.story?.paragraph1 ||
    defaultDesc

  const og = getBestMediaUrl(seo?.image) || getBestMediaUrl(aboutSettings?.hero?.backgroundImage)
  return generateSEO({
    title,
    description,
    locale,
    path: '/about',
    image: og || undefined,
  })
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params
  let aboutSettings: any = null
  let dictionary: any = {}
  try {
    const { getAboutPageSettings } = await import('@/lib/about-page-data')
    aboutSettings = await getAboutPageSettings(locale)
  } catch {}
  try {
    const { getDictionary } = await import('@/lib/getDictionary')
    dictionary = await getDictionary(locale)
  } catch {}

  const labels = dictionary['static-content']?.['static-labels'] || getStaticLabels(locale)

  const hero = aboutSettings?.hero || {}
  const story = aboutSettings?.story || {}
  const statistics = aboutSettings?.statistics || {}
  const gallery = aboutSettings?.gallery || {}
  const video = aboutSettings?.video || {}
  const certificates = aboutSettings?.certificates || {}
  const cta = aboutSettings?.cta || {}

  const galleryImages = (gallery.images || [])
    .map((img: any) => ({
      image: {
        url: getBestMediaUrl(img.image),
        alt: (img.image && typeof img.image === 'object' && 'alt' in img.image ? img.image.alt : null) || img.caption || '',
      },
      caption: img.caption,
      size: img.size || 'normal',
    }))
    .filter((img: any) => img.image.url)

  const certItems = (certificates.items || []).filter((c: any) => getBestMediaUrl(c.image))

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([
        { name: labels.breadcrumbs.home, url: `${SITE_URL}/${locale}` },
        { name: hero.label || 'About', url: `${SITE_URL}/${locale}/about` },
      ])} />
      {video?.videoUrl && <JsonLd data={videoObjectJsonLd(locale)} />}
      {aboutSettings?.faq?.items?.length > 0 && (
        <JsonLd data={faqPageJsonLd(aboutSettings.faq.items.map((f: any) => ({ question: f.question, answer: f.answer })))} />
      )}
      {/* ===== 1. HERO ===== */}
      <section className="relative min-h-[420px] lg:min-h-[520px] flex items-center overflow-hidden pt-[72px]">
        {getBestMediaUrl(hero.backgroundImage) ? (
          <Image
            src={getBestMediaUrl(hero.backgroundImage)!}
            alt={(hero.backgroundImage && typeof hero.backgroundImage === 'object' && hero.backgroundImage.alt) || hero.title || 'About Polinar'}
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-navy" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/85 to-navy/60" />
        <div className="absolute inset-0 grain-overlay" />

        <div className="relative z-10 max-w-container mx-auto px-4 sm:px-6 lg:px-8 w-full py-24 lg:py-32">
          <nav aria-label={labels.breadcrumbs.breadcrumbAriaLabel} className="mb-6">
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
              <li className="text-white font-semibold">{hero.label}</li>
            </ol>
          </nav>

          {hero.label && (
            <p className="text-sm font-display font-semibold text-polinar-mustard uppercase tracking-wider mb-3">
              {hero.label}
            </p>
          )}
          <h1 className="font-display font-extrabold text-white text-4xl sm:text-5xl lg:text-6xl tracking-tight-heading max-w-3xl">
            {hero.title || ''}
          </h1>
          {hero.subtitle && (
            <p className="mt-4 text-lg lg:text-xl text-white/70 font-body max-w-2xl">
              {hero.subtitle}
            </p>
          )}

          <div className="mt-12 flex items-center gap-2 text-white/40">
            <div className="w-[1px] h-8 bg-white/30 animate-pulse" />
            <span className="text-xs font-body uppercase tracking-widest">
              {labels.about.scrollDown}
            </span>
          </div>
        </div>
      </section>

      {/* ===== 2. COMPANY STORY ===== */}
      <section className="py-24 lg:py-32 bg-white overflow-hidden">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <ScrollReveal direction="left">
              <div className="relative">
                <div className="hidden lg:block absolute -left-6 top-0 bottom-0 w-[3px] bg-gradient-to-b from-polinar-mustard via-polinar-mustard/40 to-transparent rounded-full" />

                {story.foundedYear && (
                  <div className="inline-flex items-center gap-2 bg-polinar-mustard/10 text-polinar-mustard px-4 py-1.5 rounded-full font-display font-bold text-sm mb-6">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                    </svg>
                    {labels.about.sinceTemplate.replace('{year}', story.foundedYear)}
                  </div>
                )}

                <h2 className="font-display font-extrabold text-heading text-2xl sm:text-3xl lg:text-4xl tracking-tight-heading mb-4">
                  {story.title || ''}
                </h2>
                <div className="divider-asymmetric mb-6">
                  <span className="div-mustard"></span>
                  <span className="div-gray"></span>
                </div>
                <div className="space-y-4 text-body-muted font-body text-base leading-relaxed-body max-w-prose">
                  {story.paragraph1 && <p>{story.paragraph1}</p>}
                  {story.paragraph2 && <p>{story.paragraph2}</p>}
                  {story.paragraph3 && <p>{story.paragraph3}</p>}
                </div>

                {story.ctaText && (
                  <Link
                    href={story.ctaLink?.startsWith('/') ? `/${locale}${story.ctaLink}` : (story.ctaLink || `/${locale}/contact`)}
                    className="btn-primary inline-block mt-8"
                  >
                    {story.ctaText}
                  </Link>
                )}
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right">
              <div className="relative">
                {getBestMediaUrl(story.mainImage) && (
                  <div className="relative z-[1] aspect-[4/3]">
                    <Image
                      src={getBestMediaUrl(story.mainImage)!}
                      alt={story.mainImage.alt || labels.about.factoryAlt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover rounded-card shadow-xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/10 to-transparent mix-blend-multiply rounded-card" />
                  </div>
                )}

                {getBestMediaUrl(story.accentImage) && (
                  <div className="absolute -bottom-6 -left-6 lg:-bottom-8 lg:-left-10 w-[45%] z-[2] shadow-2xl rounded-card overflow-hidden border-4 border-white">
                    <Image
                      src={getBestMediaUrl(story.accentImage)!}
                      alt={story.accentImage.alt || labels.about.productionAlt}
                      width={300}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="absolute -top-4 -right-4 w-24 h-24 opacity-10 z-0"
                  style={{
                    backgroundImage: 'radial-gradient(circle, #EDBA13 1.5px, transparent 1.5px)',
                    backgroundSize: '12px 12px',
                  }}
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ===== 3. STATISTICS ===== */}
      {statistics.cards && statistics.cards.length > 0 && (
        <section className="relative py-24 lg:py-32 bg-navy overflow-hidden">
          <div className="absolute inset-0 grain-overlay" />
          <ScrollReveal className="relative z-10 max-w-container mx-auto px-4 sm:px-6 lg:px-8">
            <CounterAnimation
              cards={statistics.cards.map((c: any) => ({
                number: c.number || 0,
                suffix: c.suffix,
                label: c.label || '',
                icon: c.icon,
              }))}
            />
          </ScrollReveal>
        </section>
      )}

      {/* ===== 4. PRODUCTION GALLERY ===== */}
      {galleryImages.length > 0 && (
        <section className="py-24 lg:py-32 bg-gray-light">
          <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal className="text-center mb-14">
              {gallery.title && (
                <h2 className="font-display font-extrabold text-heading text-2xl sm:text-3xl lg:text-4xl tracking-tight-heading">
                  {gallery.title}
                </h2>
              )}
              <div className="divider-asymmetric justify-center mt-3">
                <span className="div-mustard"></span>
                <span className="div-gray"></span>
              </div>
              {gallery.description && (
                <p className="max-w-prose mx-auto text-body-muted font-body text-base leading-relaxed-body">
                  {gallery.description}
                </p>
              )}
            </ScrollReveal>
            <GalleryLightbox images={galleryImages} locale={locale} />
          </div>
        </section>
      )}

      {/* ===== 5. VIDEO ===== */}
      {video.videoUrl && (
        <section className="relative py-24 lg:py-32 bg-navy overflow-hidden">
          <div className="absolute inset-0 grain-overlay" />
          <div className="relative z-10 max-w-container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal className="text-center mb-12">
              {video.title && (
                <>
                  <p className="text-sm font-display font-semibold text-polinar-mustard uppercase tracking-wider mb-2">
                    {labels.about.videoEyebrow}
                  </p>
                  <h2 className="font-display font-extrabold text-white text-2xl sm:text-3xl lg:text-4xl tracking-tight-heading">
                    {video.title}
                  </h2>
                </>
              )}
              <div className="divider-asymmetric justify-center mt-3 mb-0">
                <span className="div-mustard"></span>
                <span className="div-gray" style={{ background: 'rgba(255,255,255,0.2)' }}></span>
              </div>
              {video.description && (
                <p className="max-w-prose mx-auto text-white/60 font-body text-base leading-relaxed-body mt-4">
                  {video.description}
                </p>
              )}
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <VideoPlayer
                videoUrl={video.videoUrl}
                thumbnailUrl={getBestMediaUrl(video.thumbnailImage)}
                title={video.title}
                locale={locale}
              />
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ===== 6. CERTIFICATES ===== */}
      {certItems.length > 0 && (
        <section className="py-24 lg:py-32 bg-white">
          <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal className="text-center mb-14">
              {certificates.title && (
                <h2 className="font-display font-extrabold text-heading text-2xl sm:text-3xl lg:text-4xl tracking-tight-heading">
                  {certificates.title}
                </h2>
              )}
              <div className="divider-asymmetric justify-center mt-3">
                <span className="div-mustard"></span>
                <span className="div-gray"></span>
              </div>
              {certificates.description && (
                <p className="max-w-prose mx-auto text-body-muted font-body text-base leading-relaxed-body">
                  {certificates.description}
                </p>
              )}
            </ScrollReveal>
            <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-6">
              {certItems.map((cert: any, idx: number) => (
                <StaggerItem key={cert.id || idx}>
                  <figure
                    className="group bg-gray-light rounded-card p-4 lg:p-6 text-center transition-all duration-500 ease-smooth-out hover:shadow-card-hover hover:-translate-y-1"
                  >
                    <div className="relative overflow-hidden rounded-card-sm mb-3 bg-white p-3 aspect-[3/4] flex items-center justify-center">
                      <Image
                        src={getBestMediaUrl(cert.image)!}
                        alt={cert.image.alt || cert.name || labels.about.certificateAlt}
                        width={200}
                        height={267}
                        className="max-w-full max-h-full object-contain transition-transform duration-500 ease-smooth-out group-hover:scale-105"
                      />
                    </div>
                    <figcaption>
                      <h3 className="font-display font-bold text-heading text-xs lg:text-sm">{cert.name}</h3>
                      {cert.description && (
                        <p className="text-[11px] lg:text-xs text-body-secondary font-body mt-1">{cert.description}</p>
                      )}
                    </figcaption>
                  </figure>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      )}

      {/* ===== 7. CTA BAR ===== */}
      {cta.title && (
        <section className="bg-polinar-mustard py-16 lg:py-20">
          <ScrollReveal className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-display font-extrabold text-navy text-2xl sm:text-3xl lg:text-4xl tracking-tight-heading mb-4">
              {cta.title}
            </h2>
            {cta.description && (
              <p className="text-navy/80 font-body text-base lg:text-lg max-w-2xl mx-auto mb-8">
                {cta.description}
              </p>
            )}
            {cta.buttonText && (
              <a
                href={cta.buttonLink || '#'}
                target={cta.buttonLink?.startsWith('http') ? '_blank' : undefined}
                rel={cta.buttonLink?.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="inline-flex items-center gap-3 bg-white text-polinar-mustard font-display font-bold text-sm lg:text-base px-8 py-3.5 rounded-card-sm hover:bg-gray-light active:scale-[0.98] transition-all duration-300 shadow-lg"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {cta.buttonText}
              </a>
            )}
          </ScrollReveal>
        </section>
      )}
    </>
  )
}
