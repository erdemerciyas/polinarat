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
    { name: { en: 'PPR-C Sanitary Fittings Moulds', tr: 'PPR-C Sıhhi Tesisat Kalıpları' }, slug: 'pprc-sanitary-fittings', materials: { en: 'PPR-C (Polypropylene Random Copolymer)', tr: 'PPR-C (Polipropilen Random Kopolimer)' }, sortOrder: 1 },
    { name: { en: 'PPR-C Industrial Moulds', tr: 'PPR-C Endüstriyel Kalıplar' }, slug: 'pprc-industrial', materials: { en: 'PPR-C Industrial Grade', tr: 'PPR-C Endüstriyel Kalite' }, sortOrder: 2 },
    { name: { en: 'HDPE Butt Fusion Moulds', tr: 'HDPE Alın Kaynak Kalıpları' }, slug: 'hdpe-butt-fusion', materials: { en: 'HDPE (High Density Polyethylene)', tr: 'HDPE (Yüksek Yoğunluklu Polietilen)' }, sortOrder: 3 },
    { name: { en: 'HDPE Electrofusion Moulds', tr: 'HDPE Elektrofüzyon Kalıpları' }, slug: 'hdpe-electrofusion', materials: { en: 'HDPE Electrofusion Grade', tr: 'HDPE Elektrofüzyon Kalite' }, sortOrder: 4 },
    { name: { en: 'PVC Moulds', tr: 'PVC Kalıplar' }, slug: 'pvc', materials: { en: 'PVC (Polyvinyl Chloride)', tr: 'PVC (Polivinil Klorür)' }, sortOrder: 5 },
    { name: { en: 'PP Silent Waste Water Moulds', tr: 'PP Sessiz Atık Su Kalıpları' }, slug: 'pp-silent-waste', materials: { en: 'PP (Polypropylene)', tr: 'PP (Polipropilen)' }, sortOrder: 6 },
    { name: { en: 'Irrigation Moulds', tr: 'Sulama Kalıpları' }, slug: 'irrigation', materials: { en: 'Various polymers', tr: 'Çeşitli polimerler' }, sortOrder: 7 },
    { name: { en: 'Injection Services', tr: 'Enjeksiyon Hizmetleri' }, slug: 'injection-services', materials: { en: 'Multi-material', tr: 'Çoklu malzeme' }, sortOrder: 8 },
    { name: { en: 'Custom Moulds', tr: 'Özel Kalıplar' }, slug: 'custom', materials: { en: 'Custom specifications', tr: 'Özel spesifikasyonlar' }, sortOrder: 9 },
  ]

  for (const product of products) {
    try {
      const existing = await payload.find({
        collection: 'product-categories',
        where: { slug: { equals: product.slug } },
        limit: 1,
      })
      if (existing.docs.length === 0) {
        // Create with EN first
        const doc = await payload.create({
          collection: 'product-categories',
          locale: 'en',
          data: {
            name: product.name.en,
            slug: product.slug,
            materials: product.materials.en,
            sortOrder: product.sortOrder,
          },
        })
        // Update TR locale
        await payload.update({
          collection: 'product-categories',
          id: doc.id,
          locale: 'tr',
          data: {
            name: product.name.tr,
            materials: product.materials.tr,
          },
        })
        console.log(`✅ Product: ${product.name.en}`)
      } else {
        console.log(`⏭️  Product exists: ${product.name.en}`)
      }
    } catch (e) {
      console.log(`❌ Product error (${product.slug}):`, (e as Error).message)
    }
  }

  // 3. Seed News
  const newsItems = [
    { title: { en: 'Plastpol 2019 - Kielce, Poland', tr: 'Plastpol 2019 - Kielce, Polonya' }, slug: 'plastpol-2019', excerpt: { en: 'Polinar participated in Plastpol 2019 international plastics fair in Kielce, Poland.', tr: 'Polinar, Polonya Kielce\'de düzenlenen Plastpol 2019 uluslararası plastik fuarına katıldı.' }, date: '2019-05-28', year: '2019' },
    { title: { en: 'Plast Eurasia 2018 - Istanbul', tr: 'Plast Eurasia 2018 - İstanbul' }, slug: 'plast-eurasia-2018', excerpt: { en: 'Polinar showcased latest products at Plast Eurasia Istanbul 2018.', tr: 'Polinar, Plast Eurasia İstanbul 2018 fuarında son ürünlerini sergiledi.' }, date: '2018-12-05', year: '2018' },
    { title: { en: 'Arabplast 2017 - Dubai, UAE', tr: 'Arabplast 2017 - Dubai, BAE' }, slug: 'arabplast-2017', excerpt: { en: 'Polinar exhibited at Arabplast 2017 in Dubai.', tr: 'Polinar, Dubai\'de Arabplast 2017 fuarına katıldı.' }, date: '2017-01-08', year: '2017' },
  ]

  for (const item of newsItems) {
    try {
      const existing = await payload.find({
        collection: 'news',
        where: { slug: { equals: item.slug } },
        limit: 1,
      })
      if (existing.docs.length === 0) {
        const doc = await payload.create({
          collection: 'news',
          locale: 'en',
          data: {
            title: item.title.en,
            slug: item.slug,
            excerpt: item.excerpt.en,
            date: item.date,
            year: item.year,
            status: 'published',
            _status: 'published',
          },
        })
        await payload.update({
          collection: 'news',
          id: doc.id,
          locale: 'tr',
          data: { title: item.title.tr, excerpt: item.excerpt.tr },
        })
        console.log(`✅ News: ${item.title.en}`)
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
      locale: 'en',
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
    await payload.updateGlobal({
      slug: 'homepage-settings',
      locale: 'tr',
      data: {
        heroSlides: [
          {
            title: 'DAYANIKLI KALIPLAR VE ÖZEL ÜRÜNLER',
            subtitle: '2000 yılından bu yana global pazara yüksek kaliteli plastik enjeksiyon kalıpları',
            ...(slider1MediaId ? { backgroundImage: slider1MediaId } : {}),
          },
          {
            title: 'MÜHENDİSLİK MÜKEMMELİYETİ',
            subtitle: 'Son teknoloji CNC makineleri ve deneyimli mühendislik ekibi',
          },
        ],
        coreValues: {
          title: 'Kalite / Sağlam / Dayanıklı / Güvenilir',
          description: 'POLINAR, plastik boru ve ekleme parçaları için plastik enjeksiyon kalıpları üretimi alanında dinamik ve öncü firmalardan biridir.',
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
