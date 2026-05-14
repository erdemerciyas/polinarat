import fs from 'fs/promises'
import path from 'path'
import { deepNormalizeUploadUrls, getBestMediaUrl } from '@/lib/media-url'

// Cache dictionary in memory for the lifetime of the server
const dictionaryCache: Record<string, any> = {}
const DICTIONARY_CACHE_KEY_VER = 'v5'

// Globals we need to fetch from Payload as fallback
const GLOBAL_SLUGS = [
  'navigation',
  'ui-labels',
  'footer',
  'site-settings',
  'homepage-settings',
  'about-page-settings',
  'contact-page-settings',
  'news-page-settings',
  'our-business-page-settings',
]

async function loadJsonFile(locale: string): Promise<Record<string, any> | null> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'locales', `${locale}.json`)
    const file = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(file)
  } catch {
    return null
  }
}

/** Raw overlay JSON from `public/locales/{locale}.json` (merged with EN fallback). */
export async function loadPublicLocalesJson(locale: string): Promise<Record<string, any>> {
  let jsonData = await loadJsonFile(locale)
  if (!jsonData && locale !== 'en') {
    jsonData = await loadJsonFile('en')
  }
  return jsonData || {}
}

/**
 * Deep-merge: overlay text values from `overlay` onto `base`.
 * - Media-like objects (upload / Cloudinary) in base are preserved when merging.
 * - Strings/numbers/booleans from overlay replace base values.
 * - Arrays are merged index-by-index (overlay can fill in translations into matching items).
 */
function isMediaLike(v: any): boolean {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return false
  if ('filename' in v && 'mimeType' in v) return true
  // Populated upload / Cloudinary may omit filesize on the root doc
  if ('url' in v || 'sizes' in v || 'thumbnailURL' in v) return true
  return false
}

async function populateMediaRef(payload: { findByID: (args: any) => Promise<unknown> }, ref: unknown) {
  if (ref == null) return ref
  if (typeof ref === 'object') return ref
  if (typeof ref === 'number' && Number.isFinite(ref)) {
    try {
      return await payload.findByID({ collection: 'media', id: ref, depth: 0 })
    } catch {
      return ref
    }
  }
  return ref
}

export function overlayTranslations(base: any, overlay: any): any {
  if (overlay === null || overlay === undefined) return base
  if (isMediaLike(base)) return base
  if (Array.isArray(overlay)) {
    if (!Array.isArray(base)) return overlay
    return base.map((item, i) =>
      i < overlay.length ? overlayTranslations(item, overlay[i]) : item,
    )
  }
  if (typeof overlay === 'object') {
    if (typeof base !== 'object' || base === null || Array.isArray(base)) {
      return overlay
    }
    const result: Record<string, any> = { ...base }
    for (const key of Object.keys(overlay)) {
      result[key] = overlayTranslations(base[key], overlay[key])
    }
    return result
  }
  if (overlay === '') return base
  return overlay
}

/**
 * Returns the merged dictionary for a locale.
 *
 * Strategy:
 *  - Fetch full data from Payload (this includes media URLs and full structure)
 *  - Overlay translation text from the locale's JSON file in public/locales
 *  - Static-content (src/data/*) is read from JSON as-is
 */
export async function getDictionary(locale: string): Promise<Record<string, any>> {
  const cacheKey = `${locale}__${DICTIONARY_CACHE_KEY_VER}`
  if (dictionaryCache[cacheKey]) {
    return dictionaryCache[cacheKey]
  }

  let jsonData = await loadJsonFile(locale)
  if (!jsonData && locale !== 'en') {
    jsonData = await loadJsonFile('en')
  }
  jsonData = jsonData || {}

  const result: Record<string, any> = {}

  try {
    const { getPayloadClient } = await import('@/lib/payload')
    const payload = await getPayloadClient()

    await Promise.all(
      GLOBAL_SLUGS.map(async (slug) => {
        try {
          if (slug === 'about-page-settings') {
            const { getAboutPageSettings } = await import('@/lib/about-page-data')
            const merged = await getAboutPageSettings(locale)
            result[slug] = merged ?? jsonData[slug] ?? null
            return
          }
          const base = await payload.findGlobal({
            slug: slug as any,
            locale: locale as any,
            depth: 2,
          })
          const overlay = jsonData[slug]
          let merged = overlay ? overlayTranslations(base, overlay) : base
          // Exported locale JSON often contains stale copies of these; DB is authoritative.
          if (slug === 'site-settings' && base && typeof base === 'object') {
            const b = base as Record<string, unknown>
            const m = merged as Record<string, unknown>
            m.contact = b.contact
            m.socialMedia = b.socialMedia
          }
          // Locale JSON historically duplicated about-preview copy; Payload is localized already.
          if (slug === 'homepage-settings' && base && typeof base === 'object') {
            const b = base as Record<string, unknown>
            const m = merged as Record<string, unknown>
            if (b.aboutPreviewLabels && typeof b.aboutPreviewLabels === 'object') {
              m.aboutPreviewLabels = b.aboutPreviewLabels
            }
            if (b.aboutPreview && typeof b.aboutPreview === 'object') {
              m.aboutPreview = b.aboutPreview
            }
            if (b.aboutPreviewDecor && typeof b.aboutPreviewDecor === 'object') {
              m.aboutPreviewDecor = b.aboutPreviewDecor
            }
            const mHm = merged as Record<string, unknown>
            const fillAboutUploads = async () => {
              const labels = mHm.aboutPreviewLabels as Record<string, unknown> | undefined
              if (labels?.image != null) labels.image = await populateMediaRef(payload, labels.image)
              const legacy = mHm.aboutPreview as Record<string, unknown> | undefined
              if (legacy?.image != null) legacy.image = await populateMediaRef(payload, legacy.image)
              const decor = mHm.aboutPreviewDecor as Record<string, unknown> | undefined
              if (decor?.leftWatermark != null) {
                decor.leftWatermark = await populateMediaRef(payload, decor.leftWatermark)
              }
            }
            await fillAboutUploads()
            if (locale !== 'en') {
              try {
                const baseEn = await payload.findGlobal({
                  slug: 'homepage-settings',
                  locale: 'en',
                  depth: 2,
                })
                const en = baseEn as unknown as Record<string, unknown>
                const pickUpload = (cur: unknown, fallback: unknown) =>
                  getBestMediaUrl(cur) ? cur : fallback
                const mLabels = mHm.aboutPreviewLabels as Record<string, unknown> | undefined
                const eLabels = en.aboutPreviewLabels as Record<string, unknown> | undefined
                if (mLabels && eLabels) {
                  mHm.aboutPreviewLabels = {
                    ...mLabels,
                    image: pickUpload(mLabels.image, eLabels.image),
                  }
                  const mergedLabels = mHm.aboutPreviewLabels as Record<string, unknown>
                  if (mergedLabels.image != null) {
                    mergedLabels.image = await populateMediaRef(payload, mergedLabels.image)
                  }
                }
                const mPrev = mHm.aboutPreview as Record<string, unknown> | undefined
                const ePrev = en.aboutPreview as Record<string, unknown> | undefined
                if (mPrev && ePrev) {
                  mHm.aboutPreview = {
                    ...mPrev,
                    image: pickUpload(mPrev.image, ePrev.image),
                  }
                  const mergedPrev = mHm.aboutPreview as Record<string, unknown>
                  if (mergedPrev.image != null) {
                    mergedPrev.image = await populateMediaRef(payload, mergedPrev.image)
                  }
                }
                const mDecor = mHm.aboutPreviewDecor as Record<string, unknown> | undefined
                const eDecor = en.aboutPreviewDecor as Record<string, unknown> | undefined
                if (mDecor && eDecor) {
                  mHm.aboutPreviewDecor = {
                    ...mDecor,
                    leftWatermark: pickUpload(mDecor.leftWatermark, eDecor.leftWatermark),
                  }
                  const mergedDecor = mHm.aboutPreviewDecor as Record<string, unknown>
                  if (mergedDecor.leftWatermark != null) {
                    mergedDecor.leftWatermark = await populateMediaRef(payload, mergedDecor.leftWatermark)
                  }
                }
              } catch {
                // non-fatal
              }
            }
          }
          result[slug] = deepNormalizeUploadUrls(merged)
        } catch {
          if (jsonData[slug]) result[slug] = jsonData[slug]
        }
      }),
    )
  } catch {
    Object.assign(result, jsonData)
  }

  if (jsonData['static-content']) {
    result['static-content'] = jsonData['static-content']
  }

  dictionaryCache[cacheKey] = result
  return result
}

/** Clear the in-memory cache (useful after export) */
export function clearDictionaryCache(locale?: string) {
  if (locale) {
    delete dictionaryCache[`${locale}__${DICTIONARY_CACHE_KEY_VER}`]
    delete dictionaryCache[locale]
  } else {
    Object.keys(dictionaryCache).forEach((k) => delete dictionaryCache[k])
  }
}

