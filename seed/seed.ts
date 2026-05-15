import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import config from '../payload.config'

async function seed() {
  console.log('🌱 Starting seed...')

  const payload = await getPayload({ config })

  // 1. Create admin user
  try {
    const existingUsers = await payload.find({ collection: 'users', limit: 1 })
    if (existingUsers.docs.length === 0) {
      await payload.create({
        collection: 'users',
        data: {
          email: 'admin@polinar.at',
          password: 'polinar2024',
          firstName: 'Admin',
          lastName: 'Polinar',
          role: 'admin',
        },
      })
      console.log('✅ Admin user created: admin@polinar.at / polinar2024')
    } else {
      console.log('⏭️  Admin user already exists')
    }
  } catch (e) {
    console.log('⏭️  Admin user exists or error:', (e as Error).message)
  }

  // 2. Seed Product Categories
  const products = [
    { name: 'PPR-C Sanitary Fittings Moulds', slug: 'pprc-sanitary-fittings', materials: 'PPR-C (Polypropylene Random Copolymer)', sortOrder: 1 },
    { name: 'PPR-C Industrial Moulds', slug: 'pprc-industrial', materials: 'PPR-C Industrial Grade', sortOrder: 2 },
    { name: 'HDPE Butt Fusion Moulds', slug: 'hdpe-butt-fusion', materials: 'HDPE (High Density Polyethylene)', sortOrder: 3 },
    { name: 'HDPE Electrofusion Moulds', slug: 'hdpe-electrofusion', materials: 'HDPE Electrofusion Grade', sortOrder: 4 },
    { name: 'PVC Moulds', slug: 'pvc', materials: 'PVC (Polyvinyl Chloride)', sortOrder: 5 },
    { name: 'PP Silent Waste Water Moulds', slug: 'pp-silent-waste', materials: 'PP (Polypropylene)', sortOrder: 6 },
    { name: 'Irrigation Moulds', slug: 'irrigation', materials: 'Various polymers', sortOrder: 7 },
    { name: 'Injection Services', slug: 'injection-services', materials: 'Multi-material', sortOrder: 8 },
    { name: 'Custom Moulds', slug: 'custom', materials: 'Custom specifications', sortOrder: 9 },
  ]

  for (const product of products) {
    try {
      const existing = await payload.find({
        collection: 'product-categories',
        where: { slug: { equals: product.slug } },
        limit: 1,
      })
      if (existing.docs.length === 0) {
        // Create product
        const doc = await payload.create({
          collection: 'product-categories',
          data: {
            name: product.name,
            slug: product.slug,
            materials: product.materials,
            sortOrder: product.sortOrder,
          },
        })
        console.log(`✅ Product: ${product.name}`)
      } else {
        console.log(`⏭️  Product exists: ${product.name}`)
      }
    } catch (e) {
      console.log(`❌ Product error (${product.slug}):`, (e as Error).message)
    }
  }

  // 3. Seed News
  const newsItems = [
    { title: 'Plastpol 2019 - Kielce, Poland', slug: 'plastpol-2019', excerpt: 'Polinar participated in Plastpol 2019 international plastics fair in Kielce, Poland.', date: '2019-05-28', year: '2019' },
    { title: 'Plast Eurasia 2018 - Istanbul', slug: 'plast-eurasia-2018', excerpt: 'Polinar showcased latest products at Plast Eurasia Istanbul 2018.', date: '2018-12-05', year: '2018' },
    { title: 'Arabplast 2017 - Dubai, UAE', slug: 'arabplast-2017', excerpt: 'Polinar exhibited at Arabplast 2017 in Dubai.', date: '2017-01-08', year: '2017' },
  ]

  for (const item of newsItems) {
    try {
      const existing = await payload.find({
        collection: 'news',
        where: { slug: { equals: item.slug } },
        limit: 1,
      })
      if (existing.docs.length === 0) {
        await payload.create({
          collection: 'news',
          data: {
            title: item.title,
            slug: item.slug,
            excerpt: item.excerpt,
            date: item.date,
            year: item.year,
            status: 'published',
            _status: 'published',
          },
        })
        console.log(`✅ News: ${item.title}`)
      }
    } catch (e) {
      console.log(`❌ News error:`, (e as Error).message)
    }
  }

  // 4. Upload slider1.jpg to Media collection
  let slider1MediaId: number | null = null
  try {
    const existingMedia = await payload.find({
      collection: 'media',
      where: { filename: { equals: 'slider1.jpg' } },
      limit: 1,
    })
    if (existingMedia.docs.length > 0) {
      slider1MediaId = existingMedia.docs[0].id as number
      console.log('⏭️  slider1.jpg already in Media library')
    } else {
      const slider1Path = path.resolve(__dirname, '..', 'brand_assets', 'slider1.jpg')
      const fileBuffer = fs.readFileSync(slider1Path)
      const mediaDoc = await payload.create({
        collection: 'media',
        data: {
          alt: 'Polinar - Durable Moulds and Customized Products',
        },
        file: {
          data: fileBuffer,
          name: 'slider1.jpg',
          mimetype: 'image/jpeg',
          size: fileBuffer.length,
        },
      })
      slider1MediaId = mediaDoc.id as number
      console.log('✅ slider1.jpg uploaded to Media library')
    }
  } catch (e) {
    console.log('❌ Media upload error:', (e as Error).message)
  }

  // 5. Seed Homepage Settings
  try {
    await payload.updateGlobal({
      slug: 'homepage-settings',
      data: {
        heroSlides: [
          {
            title: 'DURABLE MOULDS AND CUSTOMIZED PRODUCTS',
            subtitle: 'High quality plastic injection moulds for the global market since 2000',
            ...(slider1MediaId ? { backgroundImage: slider1MediaId } : {}),
          },
          {
            title: 'ENGINEERING EXCELLENCE',
            subtitle: 'State-of-the-art CNC technology and experienced engineering team',
          },
        ],
        coreValues: {
          title: 'Quality / Robust / Durable / Reliable',
          description: 'POLINAR is one of the dynamic and leading companies in the field of manufacture of plastic injection moulds for plastic pipe and fittings.',
        },
      },
    })
    console.log('✅ Homepage settings seeded (with slider1 background image)')
  } catch (e) {
    console.log('❌ Homepage settings error:', (e as Error).message)
  }

  // 6. Seed Site Settings
  try {
    await payload.updateGlobal({
      slug: 'site-settings',
      data: {
        siteName: 'Polinar',
        contact: {
          email: 'info@polinar.at',
          phone: '+90 212 549 88 20-21',
          fax: '+90 212 549 88 19',
          whatsapp: '+90 533 648 61 34',
        },
        socialMedia: {
          facebook: 'https://facebook.com/polinar',
          instagram: 'https://instagram.com/polinar',
          youtube: 'https://youtube.com/polinar',
          linkedin: 'https://linkedin.com/company/polinar',
        },
        chatbot: { enabled: true },
        whatsappCTA: { enabled: true },
      },
    })
    console.log('✅ Site settings seeded')
  } catch (e) {
    console.log('❌ Site settings error:', (e as Error).message)
  }

  console.log('\n🎉 Seed complete!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
