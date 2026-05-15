import { NextRequest, NextResponse } from 'next/server'
import localesConfig from '@/lib/locales.json'

const PUBLIC_PATHS = ['/admin', '/api', '/_next', '/media', '/brand_assets', '/favicon']

// Known locale codes from synced config
const knownLocales = new Set(localesConfig.locales.map((l: { code: string }) => l.code))
const defaultLocaleCode = localesConfig.defaultLocale || 'en'

// Matches a valid locale segment (2-5 lowercase letters)
function looksLikeLocale(segment: string): boolean {
  return /^[a-z]{2,5}$/.test(segment)
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip public paths
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Skip static files
  if (pathname.includes('.')) {
    return NextResponse.next()
  }

  // Check if pathname already has a known locale segment
  const firstSegment = pathname.split('/')[1]
  const hasLocale = firstSegment && knownLocales.has(firstSegment)

  // If it looks like a locale but isn't in our known list, redirect to default locale
  if (firstSegment && looksLikeLocale(firstSegment) && !knownLocales.has(firstSegment)) {
    const url = request.nextUrl.clone()
    url.pathname = `/${defaultLocaleCode}${pathname}`
    return NextResponse.redirect(url)
  }

  if (firstSegment && hasLocale) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-next-locale', firstSegment)
    const response = NextResponse.next({
      request: { headers: requestHeaders },
    })
    response.cookies.set('NEXT_LOCALE', firstSegment, { path: '/', maxAge: 31536000 })
    return response
  }

  // No locale in path — detect preferred and redirect
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
  const acceptLanguage = request.headers.get('Accept-Language') || ''

  let preferred = defaultLocaleCode

  if (cookieLocale && knownLocales.has(cookieLocale)) {
    preferred = cookieLocale
  } else {
    // Parse Accept-Language header
    const browserLangs = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0].trim().split('-')[0])

    for (const lang of browserLangs) {
      if (knownLocales.has(lang)) {
        preferred = lang
        break
      }
    }
  }

  const url = request.nextUrl.clone()
  url.pathname = `/${preferred}${pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
}
