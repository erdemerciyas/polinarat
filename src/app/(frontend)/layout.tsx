import type { Metadata } from 'next'
import { cookies, headers } from 'next/headers'
import { getPayloadClient } from '@/lib/payload'
import { fontClasses } from '@/lib/fonts'
import { getActiveLanguages, isValidLocale } from '@/lib/i18n'
import localesConfig from '@/lib/locales.json'
import { getNormalizedSiteUrl } from '@/lib/site-url'
import { VercelWebAnalytics } from '@/components/analytics/VercelWebAnalytics'

import '../globals.css'

const SITE_NAME = 'Polinar'
const SITE_URL = getNormalizedSiteUrl()
const defaultLocaleCode = localesConfig.defaultLocale || 'en'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: 'Plastic injection moulds for pipe & fittings',
}

const GSC_VERIFICATION_TOKEN_FALLBACK = 'MlaIcOdliTsE2R6Lr70WUpiPMfc0km8sxe6hSNDXVVQ'

async function getGscToken(): Promise<string | null> {
  try {
    const payload = await getPayloadClient()
    const siteSettings = await payload.findGlobal({ slug: 'site-settings' })
    return (siteSettings as any)?.googleIntegration?.gscVerificationToken || GSC_VERIFICATION_TOKEN_FALLBACK
  } catch {
    return GSC_VERIFICATION_TOKEN_FALLBACK
  }
}

async function getHtmlLangAndDir(): Promise<{ lang: string; dir: 'rtl' | 'ltr' }> {
  const h = await headers()
  const headerLocale = h.get('x-next-locale')
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value

  const locale =
    headerLocale && isValidLocale(headerLocale)
      ? headerLocale
      : cookieLocale && isValidLocale(cookieLocale)
        ? cookieLocale
        : defaultLocaleCode

  const languages = await getActiveLanguages()
  const current = languages.find((l) => l.code === locale)
  const dir = current?.isRTL ? 'rtl' : 'ltr'
  return { lang: locale, dir }
}

export default async function FrontendDocumentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const gscToken = await getGscToken()
  const { lang, dir } = await getHtmlLangAndDir()

  return (
    <html lang={lang} dir={dir} className={fontClasses} suppressHydrationWarning>
      <head>
        {gscToken ? <meta name="google-site-verification" content={gscToken} /> : null}
      </head>
      <body>
        {children}
        <VercelWebAnalytics />
      </body>
    </html>
  )
}
