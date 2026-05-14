import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import { getSiteHostnameFromEnv } from './src/lib/site-url'

const SITE_HOSTNAME = getSiteHostnameFromEnv()

const nextConfig: NextConfig = {
  // Core `lexical` only — externalizing `@payloadcms/richtext-lexical` breaks the admin
  // build (Node tries to load bundled.css as ESM). Avoids missing vendor-chunks/@lexical.js in dev.
  // `sharp` must stay external: bundling breaks native bindings on Vercel (linux-x64 / bytecode).
  serverExternalPackages: ['lexical', 'sharp'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'www.polinar.at' },
      ...(SITE_HOSTNAME && SITE_HOSTNAME !== 'www.polinar.at'
        ? [{ protocol: 'https' as const, hostname: SITE_HOSTNAME }]
        : []),
    ],
  },
}

export default withPayload(nextConfig)
