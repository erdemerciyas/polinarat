import 'dotenv/config'
import fs from 'fs'
import path from 'path'

function parseDb(url: string) {
  try {
    const u = new URL(url)
    return {
      host: u.hostname,
      database: u.pathname.replace(/^\//, '') || '(default)',
    }
  } catch {
    return { host: '(invalid)', database: '(invalid)' }
  }
}

const envPath = path.resolve('.env')
const raw = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : ''

const urls: { label: string; url: string }[] = []

if (process.env.DATABASE_URL) {
  urls.push({ label: 'DATABASE_URL (active)', url: process.env.DATABASE_URL })
}

for (const line of raw.split('\n')) {
  const match = line.match(/^#\s*DATABASE_URL=(.+)$/)
  if (match) {
    urls.push({ label: 'DATABASE_URL (commented in .env)', url: match[1].trim() })
  }
}

console.log('PolinarAt — database endpoints in this workspace:\n')
for (const { label, url } of urls) {
  const { host, database } = parseDb(url)
  console.log(`  ${label}`)
  console.log(`    host:     ${host}`)
  console.log(`    database: ${database}\n`)
}

console.log('Compare these with polinar.com.tr Vercel env (project: polinar).')
console.log('If host + database match → both sites share one CMS database.')
