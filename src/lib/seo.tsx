import type { Metadata } from 'next'
import { getStaticLabels } from '@/data/static-labels'
import localesConfig from '@/lib/locales.json'
import { cmsPlainSnippet, lexicalLikeToPlainText } from '@/lib/cms-plain-text'
import { getNormalizedSiteUrl } from '@/lib/site-url'

const SITE_URL = getNormalizedSiteUrl()

/** Fallback Open Graph / article image when CMS image is missing (file lives in public/brand_assets/). */
const DEFAULT_SHARE_IMAGE = `${SITE_URL}/brand_assets/logo.png`

const allLocaleCodes = localesConfig.locales.map((l) => l.code)
const defaultLocale = localesConfig.defaultLocale || 'en'

export async function getSiteDefaultDescription(locale: string): Promise<string> {
  const labels = getStaticLabels(locale)
  try {
    const { getDictionary } = await import('@/lib/getDictionary')
    const dictionary = await getDictionary(locale)
    const siteSettings = dictionary['site-settings']
    const fromCms = lexicalLikeToPlainText(siteSettings?.defaultSeoDescription)
    return fromCms || labels.seo.defaultDescription
  } catch {
    return labels.seo.defaultDescription
  }
}

const ogLocaleMap: Record<string, string> = {
  en: 'en_US',
  tr: 'tr_TR',
  de: 'de_DE',
  ar: 'ar_SA',
  ru: 'ru_RU',
}

type SEOArgs = {
  title: unknown
  description: unknown
  locale: string
  path: string
  image?: string
  type?: 'website' | 'article'
  noIndex?: boolean
}

export function alternateLanguages(path: string) {
  const languages: Record<string, string> = {}
  for (const code of allLocaleCodes) {
    languages[code] = `${SITE_URL}/${code}${path}`
  }
  languages['x-default'] = `${SITE_URL}/${defaultLocale}${path}`
  return languages
}

export function generateSEO({ title, description, locale, path, image, type = 'website', noIndex }: SEOArgs): Metadata {
  const labels = getStaticLabels(locale)
  const safeTitle = cmsPlainSnippet(title, 200)
  const safeDesc = cmsPlainSnippet(description, 320)
  const fullTitle = `${safeTitle}${labels.seo.titleSuffix}`
  const url = `${SITE_URL}/${locale}${path}`
  const ogImage = image || DEFAULT_SHARE_IMAGE

  return {
    title: fullTitle,
    description: safeDesc,
    alternates: {
      canonical: url,
      languages: alternateLanguages(path),
    },
    openGraph: {
      title: fullTitle,
      description: safeDesc,
      url,
      siteName: labels.seo.siteName,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      locale: ogLocaleMap[locale] || 'en_US',
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: safeDesc,
      images: [ogImage],
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
  }
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export function organizationJsonLd(locale: string) {
  const labels = getStaticLabels(locale)
  const { company, seo } = labels

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: seo.siteName,
    url: SITE_URL,
    logo: `${SITE_URL}/brand_assets/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: company.phones[0],
      contactType: seo.contactType,
      email: company.email,
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'İkitelli OSB Eskoop San. Sit. D Blok No: 34',
      addressLocality: 'Başakşehir',
      addressRegion: 'İstanbul',
      postalCode: '34306',
      addressCountry: 'TR',
    },
    sameAs: company.socialLinks.map((link) => link.url),
  }
}

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Polinar',
    url: SITE_URL,
  }
}

export function newsArticleJsonLd(article: {
  title: string
  description?: unknown
  image?: string
  datePublished: string
  dateModified?: string
  author?: string
}) {
  const desc = cmsPlainSnippet(article.description ?? article.title, 500)
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: desc,
    image: article.image || DEFAULT_SHARE_IMAGE,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      '@type': 'Organization',
      name: article.author || 'Polinar',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Polinar',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/brand_assets/logo.png` },
    },
  }
}

export function localBusinessJsonLd(
  locale: string,
  siteSettings?: {
    contact?: { address?: string; phone?: string; email?: string; fax?: string }
    socialMedia?: { youtube?: string; linkedin?: string; facebook?: string; instagram?: string; twitter?: string }
    openingHours?: Array<{ dayOfWeek: string; opens: string; closes: string }>
    priceRange?: string
  }
) {
  const labels = getStaticLabels(locale)
  const { company, seo } = labels

  const address = siteSettings?.contact?.address
  const phones = siteSettings?.contact?.phone ? [siteSettings.contact.phone] : company.phones
  const emails = siteSettings?.contact?.email ? [siteSettings.contact.email] : [company.email]

  const socials = siteSettings?.socialMedia
    ? [
        siteSettings.socialMedia.youtube,
        siteSettings.socialMedia.linkedin,
        siteSettings.socialMedia.facebook,
        siteSettings.socialMedia.instagram,
        siteSettings.socialMedia.twitter,
      ].filter(Boolean)
    : company.socialLinks.map((link) => link.url)

  const addressParts = (address || 'İkitelli OSB Eskoop San. Sit. D Blok No: 34 Başakşehir, İstanbul, TURKEY').split('\n')

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: seo.siteName,
    url: SITE_URL,
    logo: `${SITE_URL}/brand_assets/logo.png`,
    telephone: phones[0],
    email: emails[0],
    address: {
      '@type': 'PostalAddress',
      streetAddress: addressParts[0] || '',
      addressLocality: addressParts[1] || 'Başakşehir',
      addressRegion: addressParts[2] || 'İstanbul',
      postalCode: addressParts[3] || '34306',
      addressCountry: 'TR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 41.0865,
      longitude: 28.7817,
    },
    ...(siteSettings?.openingHours?.length
      ? {
          openingHoursSpecification: siteSettings.openingHours.map((h) => ({
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: h.dayOfWeek,
            opens: h.opens,
            closes: h.closes,
          })),
        }
      : {}),
    ...(siteSettings?.priceRange ? { priceRange: siteSettings.priceRange } : {}),
    sameAs: socials,
  }
}

export function videoObjectJsonLd(locale: string) {
  const labels = getStaticLabels(locale)

  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: 'Polinar Corporate Video',
    description: 'Polinar manufacturing facility and capabilities overview.',
    uploadDate: '2024-01-01',
    embedUrl: 'https://www.youtube.com/embed/wFziyAssgqk',
    thumbnailUrl: DEFAULT_SHARE_IMAGE,
    publisher: {
      '@type': 'Organization',
      name: labels.seo.siteName,
    },
  }
}

export function faqPageJsonLd(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

export function productJsonLd(
  locale: string,
  product: { name: string; description?: string; image?: string; slug: string; price?: string; availability?: string }
) {
  const labels = getStaticLabels(locale)

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || '',
    image: product.image || `${SITE_URL}/brand_assets/logo.png`,
    manufacturer: {
      '@type': 'Organization',
      name: labels.seo.siteName,
    },
    ...(product.price
      ? {
          offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'USD',
            availability: product.availability || 'https://schema.org/InStock',
          },
        }
      : {}),
  }
}

export { SITE_URL }
