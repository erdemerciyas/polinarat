import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import { v2 as cloudinary } from 'cloudinary'

dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const MEDIA_DIR = path.resolve('public/media')
const CLOUD_FOLDER = 'polinar/media'
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME

const SIZE_SUFFIXES = ['-320x240', '-600x400', '-1920x800']

function isOriginal(filename: string): boolean {
  return !SIZE_SUFFIXES.some((s) => filename.includes(s))
}

function getMediaFiles(): string[] {
  if (!fs.existsSync(MEDIA_DIR)) return []
  return fs.readdirSync(MEDIA_DIR).filter((f) => {
    const stat = fs.statSync(path.join(MEDIA_DIR, f))
    return stat.isFile() && isOriginal(f)
  })
}

function buildCloudinaryUrl(publicId: string, ext: string, transform?: string): string {
  const base = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`
  const t = transform ? `/${transform}` : ''
  return `${base}${t}/v1/${publicId}.${ext}`
}

async function main() {
  if (!CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('Missing Cloudinary credentials in env')
    process.exit(1)
  }
  const DB_URL = process.env.DATABASE_URL
  if (!DB_URL) {
    console.error('DATABASE_URL not found.')
    process.exit(1)
  }

  const originals = getMediaFiles()
  console.log(`Found ${originals.length} original media files to upload.\n`)

  const uploaded: Map<string, { publicId: string; ext: string }> = new Map()

  for (const filename of originals) {
    const absPath = path.join(MEDIA_DIR, filename)
    const ext = path.extname(filename).slice(1).toLowerCase()
    const nameWithoutExt = filename.replace(/\.[^.]+$/, '')
    const publicId = `${CLOUD_FOLDER}/${nameWithoutExt}`

    const isPdf = ext === 'pdf'
    try {
      process.stdout.write(`  Uploading ${filename}...`)
      await cloudinary.uploader.upload(absPath, {
        public_id: publicId,
        resource_type: isPdf ? 'raw' : 'image',
        overwrite: true,
        invalidate: true,
        use_filename: false,
        unique_filename: false,
      })
      uploaded.set(filename, { publicId, ext: ext === 'jpeg' ? 'jpg' : ext })
      console.log(' OK')
    } catch (err) {
      console.log(` FAILED: ${err instanceof Error ? err.message : err}`)
    }
  }

  console.log(`\nUploaded ${uploaded.size}/${originals.length} files.`)
  console.log('\nUpdating database URLs...\n')

  const { default: pg } = await import('pg')
  const client = new pg.Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } })
  await client.connect()

  const cols = await client.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'media' ORDER BY ordinal_position`,
  )
  const colNames = cols.rows.map((r: any) => r.column_name as string)
  console.log('Media table columns:', colNames.join(', '))

  const urlCol = colNames.find((c) => c === 'url')
  const thumbUrlCol = colNames.find((c) => c === 'thumbnail_u_r_l')
  const sizesThumbnailCol = colNames.find((c) => c === 'sizes_thumbnail_url')
  const sizesCardCol = colNames.find((c) => c === 'sizes_card_url')
  const sizesHeroCol = colNames.find((c) => c === 'sizes_hero_url')

  const rows = await client.query('SELECT id, filename, url FROM media')
  let updatedCount = 0

  for (const row of rows.rows) {
    const filename = row.filename as string
    const info = uploaded.get(filename)
    if (!info) continue

    const mainUrl = buildCloudinaryUrl(info.publicId, info.ext)
    const thumbUrl = buildCloudinaryUrl(info.publicId, info.ext, 'c_fill,w_320,h_240,q_auto,f_auto')
    const cardUrl = buildCloudinaryUrl(info.publicId, info.ext, 'c_fill,w_600,h_400,q_auto,f_auto')
    const heroUrl = buildCloudinaryUrl(info.publicId, info.ext, 'c_fill,w_1920,h_800,q_auto,f_auto')

    const sets: string[] = []
    const vals: string[] = []
    let paramIdx = 1

    if (urlCol) {
      sets.push(`"${urlCol}" = $${paramIdx++}`)
      vals.push(mainUrl)
    }
    if (thumbUrlCol) {
      sets.push(`"${thumbUrlCol}" = $${paramIdx++}`)
      vals.push(thumbUrl)
    }
    if (sizesThumbnailCol) {
      sets.push(`"${sizesThumbnailCol}" = $${paramIdx++}`)
      vals.push(thumbUrl)
    }
    if (sizesCardCol) {
      sets.push(`"${sizesCardCol}" = $${paramIdx++}`)
      vals.push(cardUrl)
    }
    if (sizesHeroCol) {
      sets.push(`"${sizesHeroCol}" = $${paramIdx++}`)
      vals.push(heroUrl)
    }

    if (sets.length > 0) {
      vals.push(String(row.id))
      await client.query(`UPDATE media SET ${sets.join(', ')} WHERE id = $${paramIdx}`, vals)
      updatedCount++
      console.log(`  Updated id=${row.id} filename=${filename}`)
    }
  }

  console.log(`\nUpdated ${updatedCount} rows in database.`)

  const sample = await client.query('SELECT id, filename, url FROM media LIMIT 3')
  console.log('\nSample after update:')
  for (const row of sample.rows) {
    console.log(`  id=${row.id} filename=${row.filename} url=${row.url}`)
  }

  await client.end()
  console.log('\nDone!')
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
