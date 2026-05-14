// Static fallback values (used by middleware and as defaults)
export const fallbackLocales = ['en', 'tr', 'de', 'ar', 'ru'] as const
export type Locale = string
export const defaultLocale = 'en'

// Legacy exports for backward compatibility
export const supportedLocales = fallbackLocales
export const localeLabels: Record<string, string> = {
  en: 'EN',
  tr: 'TR',
  de: 'DE',
  ar: 'AR',
  ru: 'RU',
}

export function isValidLocale(locale: string): boolean {
  // Accept any 2-5 char lowercase alpha string as potentially valid
  return /^[a-z]{2,5}$/.test(locale)
}

export function getLocaleFromPathname(pathname: string): string | null {
  const segment = pathname.split('/')[1]
  return isValidLocale(segment) ? segment : null
}

// Language type matching the Languages collection
export type Language = {
  id: string
  code: string
  label: string
  nativeLabel: string
  shortLabel: string
  isDefault: boolean
  isActive: boolean
  isRTL: boolean
  flagEmoji?: string
  sortOrder: number
}

// Server-side: fetch active languages directly from Payload
export async function getActiveLanguages(): Promise<Language[]> {
  try {
    const { getPayload } = await import('payload')
    const config = await import('@/../payload.config')
    const payload = await getPayload({ config: config.default })

    const result = await payload.find({
      collection: 'languages',
      where: { isActive: { equals: true } },
      sort: 'sortOrder',
      limit: 50,
    })

    if (result.docs.length === 0) {
      // Return fallback if no languages configured yet
      return [
        { id: '1', code: 'en', label: 'English', nativeLabel: 'English', shortLabel: 'EN', isDefault: true, isActive: true, isRTL: false, sortOrder: 0 },
        { id: '2', code: 'tr', label: 'Türkçe', nativeLabel: 'Türkçe', shortLabel: 'TR', isDefault: false, isActive: true, isRTL: false, sortOrder: 1 },
        { id: '3', code: 'de', label: 'Deutsch', nativeLabel: 'Deutsch', shortLabel: 'DE', isDefault: false, isActive: true, isRTL: false, sortOrder: 2 },
        { id: '4', code: 'ar', label: 'Arabic', nativeLabel: 'العربية', shortLabel: 'AR', isDefault: false, isActive: true, isRTL: true, sortOrder: 3 },
        { id: '5', code: 'ru', label: 'Russian', nativeLabel: 'Русский', shortLabel: 'RU', isDefault: false, isActive: true, isRTL: false, sortOrder: 4 },
      ]
    }

    return result.docs.map((doc: any) => ({
      id: String(doc.id),
      code: doc.code,
      label: doc.label,
      nativeLabel: doc.nativeLabel,
      shortLabel: doc.shortLabel,
      isDefault: doc.isDefault ?? false,
      isActive: doc.isActive ?? true,
      isRTL: doc.isRTL ?? false,
      flagEmoji: doc.flagEmoji || undefined,
      sortOrder: doc.sortOrder ?? 0,
    }))
  } catch (e) {
    console.error("GET ACTIVE LANGUAGES ERROR:", e)
    // Fallback for build time or errors
    return [
      { id: '1', code: 'en', label: 'English', nativeLabel: 'English', shortLabel: 'EN', isDefault: true, isActive: true, isRTL: false, sortOrder: 0 },
      { id: '2', code: 'tr', label: 'Türkçe', nativeLabel: 'Türkçe', shortLabel: 'TR', isDefault: false, isActive: true, isRTL: false, sortOrder: 1 },
      { id: '3', code: 'de', label: 'Deutsch', nativeLabel: 'Deutsch', shortLabel: 'DE', isDefault: false, isActive: true, isRTL: false, sortOrder: 2 },
      { id: '4', code: 'ar', label: 'Arabic', nativeLabel: 'العربية', shortLabel: 'AR', isDefault: false, isActive: true, isRTL: true, sortOrder: 3 },
      { id: '5', code: 'ru', label: 'Russian', nativeLabel: 'Русский', shortLabel: 'RU', isDefault: false, isActive: true, isRTL: false, sortOrder: 4 },
    ]
  }
}

// Server-side: get the default language code
export async function getDefaultLanguageCode(): Promise<string> {
  const languages = await getActiveLanguages()
  const defaultLang = languages.find(l => l.isDefault)
  return defaultLang?.code || languages[0]?.code || 'en'
}

// Server-side: get active locale codes as string array
export async function getActiveLocaleCodes(): Promise<string[]> {
  const languages = await getActiveLanguages()
  return languages.map(l => l.code)
}

// Server-side: check if a locale code is active
export async function isActiveLocale(code: string): Promise<boolean> {
  const codes = await getActiveLocaleCodes()
  return codes.includes(code)
}
