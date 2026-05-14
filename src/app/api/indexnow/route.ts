import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { getNormalizedSiteUrl } from '@/lib/site-url'

const INDEXNOW_URL = 'https://api.indexnow.org/Submit'

async function getIndexNowSettings() {
  try {
    const payload = await getPayloadClient()
    const siteSettings = await payload.findGlobal({ slug: 'site-settings' })
    const gi = (siteSettings as any)?.googleIntegration?.indexNow
    return {
      apiKey: gi?.apiKey || process.env.INDEXNOW_API_KEY || '',
      enabled: gi?.enabled !== false,
    }
  } catch {
    return {
      apiKey: process.env.INDEXNOW_API_KEY || '',
      enabled: true,
    }
  }
}

export async function POST(request: Request) {
  const { urls, url } = await request.json()
  const toSubmit = urls || (url ? [url] : [])

  if (!toSubmit.length) {
    return NextResponse.json({ ok: false })
  }

  const { apiKey, enabled } = await getIndexNowSettings()

  if (!enabled || !apiKey) {
    return NextResponse.json({ ok: false, reason: 'IndexNow disabled or no API key' })
  }

  if (!process.env.NEXT_PUBLIC_SITE_URL?.trim()) {
    return NextResponse.json({ ok: false, error: 'NEXT_PUBLIC_SITE_URL not configured' })
  }

  const origin = getNormalizedSiteUrl()
  let hostname: string
  try {
    hostname = new URL(origin).hostname
  } catch {
    return NextResponse.json({ ok: false, error: 'NEXT_PUBLIC_SITE_URL invalid' })
  }

  const payload = {
    host: hostname,
    key: apiKey,
    keyLocation: `${origin}/${apiKey}.txt`,
    urlList: toSubmit,
  }

  try {
    await fetch(INDEXNOW_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    // IndexNow submission failed — non-critical
  }

  return NextResponse.json({ ok: true, submitted: toSubmit.length })
}