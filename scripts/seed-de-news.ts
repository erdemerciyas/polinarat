import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'

async function main() {
  const payload = await getPayload({ config })
  const news = await payload.find({ collection: 'news', locale: 'en', limit: 100, depth: 0 })
  for (const doc of news.docs) {
    const title = (doc as any).title as string
    if (!title) continue
    await payload.update({
      collection: 'news',
      id: doc.id,
      locale: 'de',
      data: {
        title,
        excerpt: (doc as any).excerpt,
        meta: {
          title: `${title} — Polinar`,
          description: `Lesen Sie über ${title} von Polinar.`,
        },
      } as any,
    })
    console.log(`✓ news [de] id=${doc.id}`)
  }
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
