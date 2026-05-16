// Static fallback values (used by middleware and as defaults)
export const fallbackLocales = ['en', 'de'] as const
export type Locale = string
export const defaultLocale = 'en'

// Legacy exports for backward compatibility
export const supportedLocales = fallbackLocales
export const localeLabels: Record<string, string> = {
  en: 'EN',
  de: 'DE',
}

export function isValidLocale(locale: string): boolean {
  // Accept only supported locales (en, de)
  return ['en', 'de'].includes(locale)
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
  // HARD-CODED: Only EN and DE are supported — never return other languages from DB
  return [
    { id: '1', code: 'en', label: 'English', nativeLabel: 'English', shortLabel: 'EN', isDefault: true, isActive: true, isRTL: false, sortOrder: 0 },
    { id: '2', code: 'de', label: 'Deutsch', nativeLabel: 'Deutsch', shortLabel: 'DE', isDefault: false, isActive: true, isRTL: false, sortOrder: 1 },
  ]
}

// Server-side: get the default language code
export async function getDefaultLanguageCode(): Promise<string> {
  return 'en'
}

// Server-side: get active locale codes as string array
export async function getActiveLocaleCodes(): Promise<string[]> {
  return ['en', 'de']
}

// Server-side: check if a locale code is active
export async function isActiveLocale(code: string): Promise<boolean> {
  return ['en', 'de'].includes(code)
}
