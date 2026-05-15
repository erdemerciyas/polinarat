import type { Metadata } from 'next'
import { getPayloadClient } from '@/lib/payload'
import { generateSEO, getSiteDefaultDescription } from '@/lib/seo'
import Image from 'next/image'
import Link from 'next/link'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/ScrollReveal'

type Props = { params: Promise<{ locale: string }> }

export const revalidate = 300

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  let newsSettings: any = null
  try {
    const { getDictionary } = await import('@/lib/getDictionary')
    const dictionary = await getDictionary(locale)
    newsSettings = dictionary['news-page-settings'] || null
  } catch {}

  const seo = newsSettings?.seo || {}
  const defaultDesc = await getSiteDefaultDescription(locale)
  const title = seo.title || newsSettings?.hero?.title || 'News'
  return generateSEO({
    title,
    description: seo.description || defaultDesc,
    locale,
    path: '/news',
    image: seo.image?.url,
  })
}

export default async function NewsPage({ params }: Props) {
  const { locale } = await params

  let news: any[] = []
  let newsSettings: any = null
  try {
    const payload = await getPayloadClient()
    const { getDictionary } = await import('@/lib/getDictionary')
    const dictionary = await getDictionary(locale)
    newsSettings = dictionary['news-page-settings'] || null
    
    const result = await payload.find({
      collection: 'news',
      locale: locale as any,
      where: { status: { equals: 'published' } },
      sort: '-date',
      limit: 50,
    })
    news = result.docs
  } catch {}

  const hero = newsSettings?.hero || {}
  const labels = newsSettings?.labels || {}

  return (
    <>
      {/* Hero Banner */}
      <section className="relative bg-navy grain-overlay pt-[168px] pb-24 lg:pt-[184px] lg:pb-28">
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy/70"></div>
        <div className="relative z-10 max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-display font-semibold text-polinar-mustard uppercase tracking-wider mb-2">
            {hero.label || ''}
          </p>
          <h1 className="font-display font-extrabold text-white text-3xl sm:text-4xl lg:text-5xl tracking-tight-heading">
            {hero.title || ''}
          </h1>
        </div>
      </section>

      {/* News Grid */}
      <section className="py-24 lg:py-32 bg-gray-light">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.length > 0 ? (
              news.map((item: any) => (
                <StaggerItem key={item.id}>
                  <Link
                    href={`/${locale}/news/${item.slug}`}
                    className="group bg-white rounded-card overflow-hidden shadow-card hover:shadow-card-hover block transition-all duration-500 ease-smooth-out hover:-translate-y-1"
                  >
                    <div className="relative h-[220px] overflow-hidden">
                      <Image
                        src={item.featuredImage?.url || `https://placehold.co/400x220/E8E8E8/999?text=News`}
                        alt={item.featuredImage?.alt || item.title || ''}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-smooth-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                    </div>
                    <div className="p-6 lg:p-8">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="inline-block bg-polinar-mustard text-navy-deep text-xs font-display font-bold px-3 py-1 rounded-full">
                          {item.year || (item.date ? new Date(item.date).getFullYear() : '')}
                        </span>
                        {item.date && (
                          <span className="text-xs text-body-tertiary font-body">
                            {new Date(item.date).toLocaleDateString(locale, { month: 'long', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                      <h3 className="font-display font-bold text-heading text-base mb-2">{item.title}</h3>
                      {item.excerpt && (
                        <p className="text-sm text-body-secondary font-body leading-body line-clamp-3">{item.excerpt}</p>
                      )}
                    </div>
                  </Link>
                </StaggerItem>
              ))
            ) : (
              <p className="col-span-full text-center text-body-tertiary font-body py-8">
                {labels.empty || ''}
              </p>
            )}
          </StaggerContainer>
        </div>
      </section>
    </>
  )
}
