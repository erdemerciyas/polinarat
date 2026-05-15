import type { Metadata } from 'next'
import { getStaticLabels } from '@/data/static-labels'
import { resolveSiteContact } from '@/lib/resolve-site-contact'
import { generateSEO, localBusinessJsonLd, JsonLd } from '@/lib/seo'
import { ContactForm } from '@/components/ContactForm'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/ScrollReveal'

type Props = { params: Promise<{ locale: string }> }

export const revalidate = 300

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  let contactSettings: any = null
  let dictionary: any = {}
  try {
    const { getDictionary } = await import('@/lib/getDictionary')
    dictionary = await getDictionary(locale)
    contactSettings = dictionary['contact-page-settings'] || null
  } catch {}

  const seo = contactSettings?.seo || {}
  const title = seo.title || contactSettings?.hero?.title || 'Contact'

  return generateSEO({
    title,
    description: seo.description || contactSettings?.hero?.subtitle || title,
    locale,
    path: '/contact',
    image: seo.image?.url,
  })
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params
  let contactSettings: any = null
  let dictionary: any = {}
  try {
    const { getDictionary } = await import('@/lib/getDictionary')
    dictionary = await getDictionary(locale)
    contactSettings = dictionary['contact-page-settings'] || null
  } catch {}

  const staticLabels = dictionary['static-content']?.['static-labels'] || getStaticLabels(locale)
  const siteSettings = dictionary['site-settings'] || undefined

  const hero = contactSettings?.hero || {}
  const form = contactSettings?.form || {}
  const messages = contactSettings?.messages || {}
  const info = contactSettings?.info || {}
  const resolved = resolveSiteContact(siteSettings?.contact, staticLabels.company, {
    addressPageFallback: info.addressText,
  })
  const addressBody = resolved.address

  return (
    <>
      <JsonLd data={localBusinessJsonLd(locale, siteSettings)} />

      {/* Hero — full-width dramatic banner */}
      <section className="contact-hero grain-overlay">
        <div className="contact-hero-grid" aria-hidden="true" />
        <div className="contact-hero-glow" aria-hidden="true" />
        <div className="relative z-10 max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up" delay={0}>
            <div className="contact-hero-eyebrow">
              <span className="contact-hero-eyebrow-line" />
              <span className="font-display font-semibold text-xs sm:text-sm uppercase tracking-[0.2em] text-polinar-mustard">
                {hero.subtitle || ''}
              </span>
            </div>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.1}>
            <h1 className="font-display font-extrabold text-white text-4xl sm:text-5xl lg:text-6xl xl:text-7xl tracking-tight-heading leading-[1.05]">
              {hero.title || ''}
            </h1>
          </ScrollReveal>
        </div>
      </section>

      {/* Main content — asymmetric 2-column layout */}
      <section className="contact-content-section">
        {/* Subtle background texture */}
        <div className="absolute inset-0 opacity-[0.015]" aria-hidden="true"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #0A1128 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative z-10 max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

            {/* Left column — info cards with visual hierarchy */}
            <div className="lg:col-span-4 lg:pt-4">
              <StaggerContainer className="space-y-5">

                {/* Address */}
                <StaggerItem>
                  <div className="contact-info-card group">
                    <div className="contact-info-icon">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="contact-info-title">{info.addressLabel || ''}</h3>
                      <p className="contact-info-text whitespace-pre-line">{addressBody}</p>
                    </div>
                  </div>
                </StaggerItem>

                {/* Phone */}
                <StaggerItem>
                  <div className="contact-info-card group">
                    <div className="contact-info-icon">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="contact-info-title">{info.phoneLabel || ''}</h3>
                      <div className="space-y-1">
                        {resolved.phones.map((phone: string) => (
                          <a key={phone} href={`tel:${phone.replace(/\s/g, '')}`} className="contact-info-link block">
                            {phone}
                          </a>
                        ))}
                        {resolved.fax ? (
                          <p className="contact-info-text">{resolved.fax}</p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </StaggerItem>

                {/* Email */}
                <StaggerItem>
                  <div className="contact-info-card group">
                    <div className="contact-info-icon">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="contact-info-title">{info.emailLabel || ''}</h3>
                      <a href={`mailto:${resolved.email}`} className="contact-info-link">
                        {resolved.email}
                      </a>
                    </div>
                  </div>
                </StaggerItem>
              </StaggerContainer>

              {/* Decorative element below cards */}
              <ScrollReveal delay={0.4}>
                <div className="hidden lg:block mt-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-[2px] bg-polinar-mustard rounded-full" />
                    <div className="w-6 h-[2px] bg-polinar-mustard/30 rounded-full" />
                    <div className="w-3 h-[2px] bg-polinar-mustard/15 rounded-full" />
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Right column — form with premium card */}
            <div className="lg:col-span-8">
              <ScrollReveal direction="right" delay={0.15}>
                <div className="contact-form-card">
                  <div className="contact-form-card-accent" />
                  <ContactForm formLabels={form} messages={messages} />
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Map section with overlay blending */}
      <section className="contact-map-section">
        <div className="contact-map-fade-top" />
        <iframe
          src={resolved.mapUrl}
          className="w-full h-full border-0 grayscale-[0.3] contrast-[1.05]"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Polinar Location"
        />
        <div className="contact-map-fade-bottom" />
      </section>
    </>
  )
}
