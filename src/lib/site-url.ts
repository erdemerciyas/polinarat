/** Canonical production URL when env is missing or invalid */
const FALLBACK_SITE_ORIGIN = 'https://www.polinar.at'

function parseSiteOrigin(raw: string): URL | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  try {
    const href = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
    const url = new URL(href)
    return url
  } catch {
    return null
  }
}

/** Absolute origin (`https://host`) for metadata, sitemap, canonical URLs. Handles env without `https://`. */
export function getNormalizedSiteUrl(): string {
  const parsed = process.env.NEXT_PUBLIC_SITE_URL
    ? parseSiteOrigin(process.env.NEXT_PUBLIC_SITE_URL)
    : null
  return parsed?.origin ?? FALLBACK_SITE_ORIGIN
}

/** Hostname only (for Next.js image config, IndexNow `host`, etc.). */
export function getSiteHostnameFromEnv(): string | undefined {
  const parsed = process.env.NEXT_PUBLIC_SITE_URL
    ? parseSiteOrigin(process.env.NEXT_PUBLIC_SITE_URL)
    : null
  return parsed?.hostname
}
