import { notFound } from 'next/navigation'
import { getActiveLanguages } from '@/lib/i18n'
import { organizationJsonLd, JsonLd } from '@/lib/seo'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ChatWidget } from '@/components/chatbot/ChatWidget'
import { toClientProps } from '@/lib/to-client-props'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  const languages = await getActiveLanguages()
  const currentLang = languages.find(l => l.code === locale)

  if (!currentLang) {
    notFound()
  }

  let navData: any = null
  let uiLabels: any = null
  let footerData: any = null
  let siteSettings: any = null
  try {
    const { getDictionary } = await import('@/lib/getDictionary')
    const dictionary = await getDictionary(locale)
    
    navData = dictionary['navigation'] || null
    uiLabels = dictionary['ui-labels'] || null
    footerData = dictionary['footer'] || null
    siteSettings = dictionary['site-settings'] || null
  } catch (e) {
    console.error('Failed to load dictionary:', e)
  }

  return (
    <div className="font-body text-heading bg-white antialiased">
      <JsonLd data={organizationJsonLd(locale)} />
      <Header
        locale={locale}
        languages={languages}
        navData={toClientProps(navData)}
        commonLabels={toClientProps(uiLabels)}
      />
      <main>
        {children}
      </main>
      <Footer
        data={toClientProps(footerData)}
        locale={locale}
        siteContact={toClientProps(siteSettings?.contact)}
        socialMedia={toClientProps(siteSettings?.socialMedia)}
      />
      <ChatWidget labels={toClientProps(siteSettings?.chatbot?.labels) ?? undefined} />
    </div>
  )
}
