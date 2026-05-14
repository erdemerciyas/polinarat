import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const SITE_HOSTNAME = process.env.NEXT_PUBLIC_SITE_URL
  ? new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname
  : undefined

const nextConfig: NextConfig = {
  // Core `lexical` only — externalizing `@payloadcms/richtext-lexical` breaks the admin
  // build (Node tries to load bundled.css as ESM). Avoids missing vendor-chunks/@lexical.js in dev.
  serverExternalPackages: ['lexical'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'www.polinar.com.tr' },
      ...(SITE_HOSTNAME && SITE_HOSTNAME !== 'www.polinar.com.tr'
        ? [{ protocol: 'https' as const, hostname: SITE_HOSTNAME }]
        : []),
    ],
  },
}

export default withPayload(nextConfig)
