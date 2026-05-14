const LEGACY_MEDIA_PREFIX = '/api/media/file/'

function getCloudinaryCloudName(): string | undefined {
  return process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
}

/**
 * Canonical HTTPS URL on Cloudinary — must stay in sync with `payload.config.ts`
 * `cloudinaryStorage({ …, folder: 'polinar/media', generateFileURL })`.
 */
export function buildPayloadCloudinaryUrlFromFilename(filename: string): string | null {
  const cloud = getCloudinaryCloudName()
  if (!cloud || !filename) return null
  const clean = filename.split('?')[0].trim()
  const base = clean.includes('/') ? (clean.split('/').pop() as string) : clean
  if (!base) return null
  const lastDot = base.lastIndexOf('.')
  const ext = lastDot >= 0 ? base.slice(lastDot + 1) : 'jpg'
  const name = lastDot >= 0 ? base.slice(0, lastDot) : base
  if (!name) return null
  const isPdf = ext.toLowerCase() === 'pdf'
  const type = isPdf ? 'raw' : 'image'
  return `https://res.cloudinary.com/${cloud}/${type}/upload/polinar/media/${name}.${ext}`
}

/**
 * Turn legacy/local paths into working URLs. When Cloudinary is configured, prefer
 * `polinar/media/...` HTTPS URLs — DB often still has `/api/media/file/...` or `/media/...`
 * for thumbnails while assets actually live on Cloudinary.
 */
export function normalizePayloadUploadUrl(url: string | null | undefined): string | null | undefined {
  if (url == null || typeof url !== 'string') return url
  if (/^https?:\/\//i.test(url)) return url

  const cloud = getCloudinaryCloudName()

  if (url.startsWith(LEGACY_MEDIA_PREFIX)) {
    const file = url.slice(LEGACY_MEDIA_PREFIX.length)
    if (cloud) {
      const abs = buildPayloadCloudinaryUrlFromFilename(file)
      if (abs) return abs
    }
    return `/media/${file}`
  }

  if (url.startsWith('/media/')) {
    const file = url.slice('/media/'.length)
    if (cloud) {
      const abs = buildPayloadCloudinaryUrlFromFilename(file)
      if (abs) return abs
    }
    return url
  }

  return url
}

/** Prefer main `url`, then responsive `sizes` (Next/image and <img> friendly). */
/** Bust Next/Image and CDN caches when the underlying Media row changes (same path, new bytes). */
export function withMediaCacheVersion(url: string, media: unknown): string {
  if (!url || !media || typeof media !== 'object') return url
  const v = (media as { updatedAt?: string }).updatedAt
  if (!v) return url
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${encodeURIComponent(v)}`
}

export function getBestMediaUrl(media: unknown): string | null {
  if (!media || typeof media !== 'object') return null
  const m = media as Record<string, unknown>
  const pick = (u: unknown): string | null =>
    typeof u === 'string' && u.length > 0 ? (normalizePayloadUploadUrl(u) as string) : null
  const direct = pick(m.url)
  if (direct) return direct
  const sizes = m.sizes as Record<string, { url?: string | null }> | undefined
  if (sizes) {
    for (const k of ['hero', 'card', 'thumbnail'] as const) {
      const u = pick(sizes[k]?.url)
      if (u) return u
    }
  }
  const thumb = pick(m.thumbnailURL)
  if (thumb) return thumb

  if (typeof m.filename === 'string' && m.filename.length > 0) {
    const cloud = getCloudinaryCloudName()
    if (cloud) {
      const fromName = buildPayloadCloudinaryUrlFromFilename(m.filename)
      if (fromName) return fromName
    }
  }
  return null
}

/** Fix legacy Payload local URLs anywhere in CMS-fetched JSON (globals, nested media). */
export function deepNormalizeUploadUrls<T>(value: T): T {
  if (value === null || value === undefined) return value
  if (value instanceof Date) return value
  if (typeof value === 'string') {
    return (normalizePayloadUploadUrl(value) ?? value) as T
  }
  if (Array.isArray(value)) {
    return value.map((item) => deepNormalizeUploadUrls(item)) as T
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>
    const out: Record<string, unknown> = {}
    for (const key of Object.keys(obj)) {
      out[key] = deepNormalizeUploadUrls(obj[key])
    }
    return out as T
  }
  return value
}
