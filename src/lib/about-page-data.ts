import localesConfig from '@/lib/locales.json'
import { getPayloadClient } from '@/lib/payload'
import { deepNormalizeUploadUrls } from '@/lib/media-url'
import { loadPublicLocalesJson, overlayTranslations } from '@/lib/getDictionary'

const DEFAULT_LOCALE = localesConfig.defaultLocale || 'en'

/** Upload fields used on the About global and nested blocks. */
const MEDIA_RELATION_KEYS = new Set([
  'backgroundImage',
  'mainImage',
  'accentImage',
  'thumbnailImage',
  'image',
])

function collectNumericMediaIds(node: unknown, into: Set<number>): void {
  if (node === null || node === undefined) return
  if (Array.isArray(node)) {
    for (const item of node) collectNumericMediaIds(item, into)
    return
  }
  if (typeof node !== 'object') return
  const o = node as Record<string, unknown>
  for (const [k, v] of Object.entries(o)) {
    if (MEDIA_RELATION_KEYS.has(k) && typeof v === 'number') {
      into.add(v)
    } else {
      collectNumericMediaIds(v, into)
    }
  }
}

function attachHydratedMedia(node: unknown, map: Map<number, unknown>): unknown {
  if (node === null || node === undefined) return node
  if (Array.isArray(node)) {
    return node.map((item) => attachHydratedMedia(item, map))
  }
  if (typeof node !== 'object') return node
  const o = node as Record<string, unknown>
  const out: Record<string, unknown> = { ...o }
  for (const key of Object.keys(out)) {
    const val = out[key]
    if (MEDIA_RELATION_KEYS.has(key) && typeof val === 'number') {
      out[key] = map.get(val) ?? val
    } else {
      out[key] = attachHydratedMedia(val, map)
    }
  }
  return out
}

async function hydrateMediaIds(data: unknown): Promise<unknown> {
  const ids = new Set<number>()
  collectNumericMediaIds(data, ids)
  if (ids.size === 0) return data

  const payload = await getPayloadClient()
  const map = new Map<number, unknown>()
  await Promise.all(
    [...ids].map(async (id) => {
      try {
        const doc = await payload.findByID({
          collection: 'media',
          id,
          depth: 1,
        })
        map.set(id, doc)
      } catch {
        /* keep numeric id */
      }
    }),
  )
  return attachHydratedMedia(data, map)
}

function mergeCmsLocaleOntoDefault(
  defaultDoc: Record<string, unknown>,
  localeDoc: Record<string, unknown>,
): Record<string, unknown> {
  if (!localeDoc || typeof localeDoc !== 'object') return defaultDoc
  return overlayTranslations(defaultDoc, localeDoc) as Record<string, unknown>
}

/**
 * About page: always load full `defaultLocale` global, then merge requested locale row.
 * JSON overlay adds `public/locales/*.json` strings. No React `cache()` — avoids stale / cross-locale bleed.
 */
export async function getAboutPageSettings(locale: string): Promise<Record<string, unknown> | null> {
  const jsonData = await loadPublicLocalesJson(locale)
  const jsonOverlay = jsonData['about-page-settings']

  try {
    const payload = await getPayloadClient()

    const cmsDefault = (await payload.findGlobal({
      slug: 'about-page-settings',
      locale: DEFAULT_LOCALE as any,
      depth: 3,
    })) as unknown as Record<string, unknown>

    let cmsMerged = cmsDefault

    if (locale !== DEFAULT_LOCALE) {
      try {
        const cmsLocale = (await payload.findGlobal({
          slug: 'about-page-settings',
          locale: locale as any,
          depth: 3,
        })) as unknown as Record<string, unknown>
        cmsMerged = mergeCmsLocaleOntoDefault(cmsDefault, cmsLocale)
      } catch (err) {
        /* Locale missing from Payload config / DB — keep default-locale document; JSON still localizes text */
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[getAboutPageSettings] No CMS row for locale "${locale}", using ${DEFAULT_LOCALE} only:`, err)
        }
      }
    }

    let merged: unknown = jsonOverlay ? overlayTranslations(cmsMerged, jsonOverlay) : cmsMerged
    merged = await hydrateMediaIds(merged)
    merged = deepNormalizeUploadUrls(merged)

    return merged as Record<string, unknown>
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[getAboutPageSettings] CMS fetch failed:', e)
    }
    return (jsonOverlay as Record<string, unknown>) || null
  }
}
