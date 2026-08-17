import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { readLocaleFile } from './lib/i18n-shared'

function cleanCtaLabel(val: unknown): string | undefined {
  if (val === null || val === undefined || val === '') return undefined
  if (typeof val === 'string' && val.startsWith('{')) return undefined
  return String(val)
}

async function patchHomepage(locale: 'en' | 'de') {
  const payload = await getPayload({ config })
  const json = readLocaleFile(locale)!['homepage-settings']
  const current = await payload.findGlobal({ slug: 'homepage-settings', locale, depth: 2 })

  const heroSlides = (current.heroSlides as any[])?.map((slide, i) => {
    const fromJson = json.heroSlides?.[i] ?? {}
    return {
      id: slide.id,
      backgroundImage: slide.backgroundImage?.id ?? slide.backgroundImage,
      ctaLink: slide.ctaLink,
      overlayOpacity: slide.overlayOpacity ?? fromJson.overlayOpacity,
      textAlignment: slide.textAlignment ?? fromJson.textAlignment,
      textPosition: slide.textPosition ?? fromJson.textPosition,
      titleSize: slide.titleSize ?? fromJson.titleSize,
      animateText: slide.animateText ?? fromJson.animateText,
      textAnimation: slide.textAnimation ?? fromJson.textAnimation,
      title: fromJson.title ?? slide.title,
      subtitle: fromJson.subtitle ?? slide.subtitle,
      ctaLabel: cleanCtaLabel(fromJson.ctaLabel) ?? cleanCtaLabel(slide.ctaLabel),
    }
  })

  await payload.updateGlobal({
    slug: 'homepage-settings',
    locale,
    data: {
      heroSlides,
      aboutPreviewLabels: json.aboutPreviewLabels,
      businessSection: json.businessSection,
      coreValues: json.coreValues,
      newsSection: json.newsSection,
      seo: json.seo,
      sliderSettings: current.sliderSettings ?? json.sliderSettings,
      featuredProducts: current.featuredProducts,
      featuredNews: current.featuredNews,
      promotionVideo: current.promotionVideo,
      aboutPreview: current.aboutPreview,
      aboutPreviewDecor: current.aboutPreviewDecor,
    } as any,
  })

  console.log(`✓ homepage-settings [${locale}] hero slides restored`)
}

async function main() {
  await patchHomepage('en')
  await patchHomepage('de')
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
