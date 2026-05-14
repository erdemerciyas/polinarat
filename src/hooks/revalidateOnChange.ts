import type { CollectionAfterChangeHook, GlobalAfterChangeHook } from 'payload'

const INDEXNOW_API = '/api/indexnow'

async function notifyIndexNow(urls: string[]) {
  try {
    await fetch(INDEXNOW_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls }),
    })
  } catch {
    // IndexNow notification failed — non-critical
  }
}

export const revalidateCollection: CollectionAfterChangeHook = async ({ doc, collection }) => {
  if (typeof window !== 'undefined') return doc

  try {
    const { revalidatePath } = await import('next/cache')

    const slugMap: Record<string, string> = {
      'product-categories': '/[locale]/products',
      services: '/[locale]/services',
      news: '/[locale]/news',
      pages: '/[locale]',
    }

    const basePath = slugMap[collection.slug]
    const toRevalidate: string[] = []

    if (basePath) {
      revalidatePath(basePath, 'page')
      toRevalidate.push(basePath)
      if (doc?.slug) {
        const detailPath = `${basePath}/${doc.slug}`
        revalidatePath(detailPath, 'page')
        toRevalidate.push(detailPath)
      }
    }

    revalidatePath('/[locale]', 'page')
    toRevalidate.push('/[locale]')

    if (toRevalidate.length > 0) {
      notifyIndexNow(toRevalidate)
    }
  } catch (error) {
    console.error('Revalidation error:', error)
  }

  return doc
}

export const revalidateGlobal: GlobalAfterChangeHook = async ({ doc, global }) => {
  if (typeof window !== 'undefined') return doc // Sadece sunucu tarafında çalışmasını sağla

  try {
    const { revalidatePath, revalidateTag } = await import('next/cache')
    const { clearDictionaryCache } = await import('@/lib/getDictionary')
    clearDictionaryCache()

    // Revalidate homepage for most globals
    revalidatePath('/[locale]', 'page')

    // Navigation changes affect all pages
    if (global.slug === 'navigation' || global.slug === 'footer' || global.slug === 'site-settings') {
      revalidatePath('/', 'layout')
    }

    // unstable_cache ile önbelleğe aldığımız tag'leri tetiklemek için:
    revalidateTag(`global_${global.slug}`)
  } catch (error) {
    console.error('Revalidation error:', error)
  }

  return doc
}
