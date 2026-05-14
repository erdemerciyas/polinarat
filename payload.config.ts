import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { cloudinaryStorage } from 'payloadcms-storage-cloudinary'
import sharp from 'sharp'

import { Users } from '@/collections/Users'
import { Media } from '@/collections/Media'
import { ProductCategories } from '@/collections/ProductCategories'
import { News } from '@/collections/News'
import { Pages } from '@/collections/Pages'
import { ContactSubmissions } from '@/collections/ContactSubmissions'
import { NewsletterSubscribers } from '@/collections/NewsletterSubscribers'
import { Languages } from '@/collections/Languages'

import { SiteSettings } from '@/globals/SiteSettings'
import { Navigation } from '@/globals/Navigation'
import { Footer } from '@/globals/Footer'
import { HomepageSettings } from '@/globals/HomepageSettings'
import { UiLabels } from '@/globals/UiLabels'
import { AboutPageSettings } from '@/globals/AboutPageSettings'
import { ContactPageSettings } from '@/globals/ContactPageSettings'
import { NewsPageSettings } from '@/globals/NewsPageSettings'
import { OurBusinessPageSettings } from '@/globals/OurBusinessPageSettings'

import localesJson from '@/lib/locales.json'
import { migrations } from '@/migrations/index'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const localesConfig: { locales: { label: string; code: string }[]; defaultLocale: string } =
  localesJson.locales?.length > 0
    ? localesJson
    : {
      locales: [
        { label: 'English', code: 'en' },
        { label: 'Türkçe', code: 'tr' },
      ],
      defaultLocale: 'en',
    }

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '— Polinar CMS',
      description: 'Polinar İçerik Yönetim Sistemi',
      icons: [{ url: '/brand_assets/logo.png' }],
    },
    avatar: 'default',
    dateFormat: 'dd/MM/yyyy',
    components: {
      graphics: {
        Logo: '/src/components/admin/Logo',
        Icon: '/src/components/admin/Icon',
      },
      views: {
        i18nGenerate: {
          Component: '/src/components/admin/I18nGenerateView',
          path: '/i18n-generate',
          exact: true,
          meta: {
            title: 'i18n Management — Polinar CMS',
            description: 'Export, import, and sync translations per language',
          },
        },
      },
      afterNavLinks: ['/src/components/admin/I18nNavLink'],
    },
  },

  collections: [
    Users,
    Media,
    ProductCategories,
    News,
    Pages,
    ContactSubmissions,
    NewsletterSubscribers,
    Languages,
  ],

  globals: [
    SiteSettings,
    Navigation,
    Footer,
    HomepageSettings,
    AboutPageSettings,
    ContactPageSettings,
    NewsPageSettings,
    OurBusinessPageSettings,
    UiLabels,
  ],

  editor: lexicalEditor(),

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    prodMigrations: migrations,
  }),

  localization: {
    locales: localesConfig.locales,
    defaultLocale: localesConfig.defaultLocale,
    fallback: true,
  },

  onInit: async (payload) => {
    const fs = await import('fs')

    // Ensure default languages exist (idempotent — checks each individually)
    const defaults = [
      { code: 'en', label: 'English', nativeLabel: 'English', shortLabel: 'EN', isDefault: true, isActive: true, isRTL: false, sortOrder: 0 },
      { code: 'tr', label: 'Türkçe', nativeLabel: 'Türkçe', shortLabel: 'TR', isDefault: false, isActive: true, isRTL: false, sortOrder: 1 },
      { code: 'de', label: 'Deutsch', nativeLabel: 'Deutsch', shortLabel: 'DE', isDefault: false, isActive: true, isRTL: false, sortOrder: 2 },
      { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', shortLabel: 'AR', isDefault: false, isActive: true, isRTL: true, sortOrder: 3 },
      { code: 'ru', label: 'Russian', nativeLabel: 'Русский', shortLabel: 'RU', isDefault: false, isActive: true, isRTL: false, sortOrder: 4 },
    ]

    let created = false
    for (const lang of defaults) {
      const exists = await payload.find({
        collection: 'languages',
        where: { code: { equals: lang.code } },
        limit: 1,
      })

      if (exists.totalDocs === 0) {
        try {
          await payload.create({ collection: 'languages', data: lang })
          created = true
          payload.logger.info(`✓ Default language "${lang.code}" seeded into Languages collection`)
        } catch (err: unknown) {
          const payloadErr = err as { data?: { errors?: { message?: string; path?: string }[] } }
          const dup = payloadErr?.data?.errors?.some(
            (e) => e.path === 'code' && e.message === 'Value must be unique',
          )
          if (!dup) throw err
        }
      }
    }

    // Sync locales.json after seeding (skipped silently on read-only filesystems like Vercel)
    if (created) {
      const allLangs = await payload.find({
        collection: 'languages',
        sort: 'sortOrder',
        limit: 100,
      })
      const defaultLang = allLangs.docs.find((d: any) => d.isDefault) || allLangs.docs[0]
      const localesData = {
        locales: allLangs.docs.map((doc: any) => ({ label: doc.label, code: doc.code })),
        defaultLocale: defaultLang?.code || 'en',
      }
      try {
        const locPath = path.resolve(dirname, 'src/lib/locales.json')
        fs.writeFileSync(locPath, JSON.stringify(localesData, null, 2) + '\n', 'utf-8')
        payload.logger.info(`✓ locales.json synced: ${localesConfig.locales.map((l: any) => l.code).join(', ')}`)
      } catch {
        payload.logger.info('locales.json write skipped (read-only filesystem)')
      }
    }

    // Seed Navigation global if mainMenu is empty or first item has no label
    const nav = await payload.findGlobal({ slug: 'navigation' })
    const firstMenuLabel = (nav.mainMenu as any)?.[0]?.label
    if (!nav.mainMenu || nav.mainMenu.length === 0 || !firstMenuLabel) {
      await payload.updateGlobal({
        slug: 'navigation',
        locale: 'en',
        context: { skipAutoTranslate: true },
        data: {
          mainMenu: [
            { label: 'HOME', type: 'link', url: '/' },
            { label: 'ABOUT US', type: 'link', url: '/about' },
            {
              label: 'OUR BUSINESS',
              type: 'mega',
              megaMenuColumns: [
                {
                  columnType: 'links',
                  links: [
                    { label: 'Injection Moulds', url: '/our-business/injection-moulds', description: 'High-quality injection moulds for PPR-C, HDPE, PVC and other pipe systems.', icon: 'moulds' },
                    { label: 'Machinery', url: '/our-business/machinery', description: 'Precision manufacturing capacity with modern CNC and EDM machines.', icon: 'machinery' },
                    { label: 'Plastic Testing Equipment', url: '/our-business/plastic-testing-equipment', description: 'Quality control and material testing services.', icon: 'testing' },
                  ],
                },
              ],
            },
            { label: 'NEWS', type: 'link', url: '/news' },
            { label: 'CONTACT', type: 'link', url: '/contact' },
          ],
          megaMenuCTA: {
            title: 'Get in Touch',
            description: 'We offer custom solutions for your projects. Contact us today.',
            button: 'Contact Us',
          },
        },
      })
      // Read back to get auto-generated IDs for array items
      const seededNav = await payload.findGlobal({ slug: 'navigation', locale: 'en' }) as any
      const items = seededNav.mainMenu as any[]
      const megaCol = items[2]?.megaMenuColumns?.[0]
      const linkIds = megaCol?.links?.map((l: any) => l.id) || []

      await payload.updateGlobal({
        slug: 'navigation',
        locale: 'tr',
        context: { skipAutoTranslate: true },
        data: {
          mainMenu: [
            { id: items[0].id, label: 'ANA SAYFA' },
            { id: items[1].id, label: 'HAKKIMIZDA' },
            {
              id: items[2].id,
              label: 'FAALİYETLERİMİZ',
              megaMenuColumns: [
                {
                  id: megaCol.id,
                  links: [
                    { id: linkIds[0], label: 'Enjeksiyon Kalıpları', description: 'PPR-C, HDPE, PVC ve diğer boru sistemleri için yüksek kaliteli enjeksiyon kalıpları.' },
                    { id: linkIds[1], label: 'Makine Parkuru', description: 'Modern CNC ve EDM makineleri ile hassas üretim kapasitesi.' },
                    { id: linkIds[2], label: 'Plastik Test Ekipmanları', description: 'Kalite kontrol ve malzeme test hizmetleri.' },
                  ],
                },
              ],
            },
            { id: items[3].id, label: 'HABERLER' },
            { id: items[4].id, label: 'İLETİŞİM' },
          ],
          megaMenuCTA: {
            title: 'Bize Ulaşın',
            description: 'Projeleriniz için özel çözümler sunuyoruz. Bizimle iletişime geçin.',
            button: 'İletişim',
          },
        },
      })
      payload.logger.info('✓ Navigation global seeded (en + tr)')
    }

    // Seed HomepageSettings — heroSlides and labels are seeded independently
    const homepage = await payload.findGlobal({ slug: 'homepage-settings' })

    // Seed heroSlides ONLY when the array is empty/missing (never overwrite admin content)
    if (!homepage.heroSlides?.length) {
      let slider1Id: number | null = null
      try {
        const existingSlider = await payload.find({
          collection: 'media',
          where: { filename: { equals: 'slider1.jpg' } },
          limit: 1,
        })
        if (existingSlider.docs.length > 0) {
          slider1Id = existingSlider.docs[0].id as number
        } else {
          const slider1Path = path.resolve(dirname, 'brand_assets', 'slider1.jpg')
          if (fs.existsSync(slider1Path)) {
            const fileBuffer = fs.readFileSync(slider1Path)
            const mediaDoc = await payload.create({
              collection: 'media',
              data: { alt: 'Polinar - Durable Moulds and Customized Products' },
              file: {
                data: fileBuffer,
                name: 'slider1.jpg',
                mimetype: 'image/jpeg',
                size: fileBuffer.length,
              },
            })
            slider1Id = mediaDoc.id as number
            payload.logger.info('✓ slider1.jpg uploaded to Media library')
          }
        }
      } catch (e) {
        payload.logger.error(`slider1 media upload failed: ${(e as Error).message}`)
      }

      await payload.updateGlobal({
        slug: 'homepage-settings',
        data: {
          heroSlides: [
            {
              title: 'DURABLE MOULDS AND CUSTOMIZED PRODUCTS',
              subtitle: 'High quality plastic injection moulds for the global market since 2000',
              ...(slider1Id ? { backgroundImage: slider1Id } : {}),
            },
            {
              title: 'ENGINEERING EXCELLENCE',
              subtitle: 'State-of-the-art CNC technology and experienced engineering team',
            },
          ],
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
              ...(slider1Id ? { backgroundImage: slider1Id } : {}),
            },
            {
              title: 'MÜHENDİSLİK MÜKEMMELİYETİ',
              subtitle: 'Son teknoloji CNC makineleri ve deneyimli mühendislik ekibi',
            },
          ],
        },
      })
      payload.logger.info('✓ HomepageSettings heroSlides seeded (en + tr)')
    } else {
      // If slides exist but first slide lacks a background image, patch only the image
      const firstSlide = (homepage.heroSlides as any)?.[0]
      if (firstSlide && !firstSlide.backgroundImage) {
        try {
          const existingSlider = await payload.find({
            collection: 'media',
            where: { filename: { equals: 'slider1.jpg' } },
            limit: 1,
          })
          let slider1Id: number | null = existingSlider.docs.length > 0
            ? existingSlider.docs[0].id as number
            : null

          if (!slider1Id) {
            const slider1Path = path.resolve(dirname, 'brand_assets', 'slider1.jpg')
            if (fs.existsSync(slider1Path)) {
              const fileBuffer = fs.readFileSync(slider1Path)
              const mediaDoc = await payload.create({
                collection: 'media',
                data: { alt: 'Polinar - Durable Moulds and Customized Products' },
                file: {
                  data: fileBuffer,
                  name: 'slider1.jpg',
                  mimetype: 'image/jpeg',
                  size: fileBuffer.length,
                },
              })
              slider1Id = mediaDoc.id as number
              payload.logger.info('✓ slider1.jpg uploaded to Media library')
            }
          }

          if (slider1Id) {
            const updatedSlides = [...(homepage.heroSlides as any[])]
            updatedSlides[0] = { ...updatedSlides[0], backgroundImage: slider1Id }
            await payload.updateGlobal({
              slug: 'homepage-settings',
              data: { heroSlides: updatedSlides },
            })
            payload.logger.info('✓ slider1 background image linked to first hero slide')
          }
        } catch (e) {
          payload.logger.error(`Slider1 patch failed: ${(e as Error).message}`)
        }
      }
    }

    // Seed homepage labels independently (does NOT touch heroSlides)
    if (!homepage.businessSection?.sectionLabel) {
      await payload.updateGlobal({
        slug: 'homepage-settings',
        data: {
          aboutPreviewLabels: { label: 'About', title: 'US', description: 'POLINAR is one of the dynamic and leading companies in the field of manufacture of plastic injection moulds for plastic pipe and fittings.' },
          businessSection: { sectionLabel: 'Our Business', sectionTitle: 'What We Do' },
          newsSection: { label: 'Latest News', title: 'Fair Agenda', empty: 'News coming soon' },
        },
      })
      await payload.updateGlobal({
        slug: 'homepage-settings',
        locale: 'tr',
        data: {
          aboutPreviewLabels: { label: 'Hakkımızda', title: '', description: 'POLINAR, plastik boru ve ekleme parçaları için plastik enjeksiyon kalıpları üretimi alanında dinamik ve öncü firmalardan biridir.' },
          businessSection: { sectionLabel: 'Faaliyetlerimiz', sectionTitle: 'Ne Yapıyoruz?' },
          newsSection: { label: 'Son Haberler', title: 'Fuar Gündemi', empty: 'Haberler yakında eklenecek' },
        },
      })
      payload.logger.info('✓ HomepageSettings labels seeded (en + tr)')
    }

    // Seed About Page Settings if empty
    const aboutPage = await payload.findGlobal({ slug: 'about-page-settings' })
    if (!aboutPage.hero?.label) {
      await payload.updateGlobal({
        slug: 'about-page-settings',
        data: {
          hero: {
            label: 'About',
            title: 'ABOUT US',
            subtitle: 'Leading manufacturer of plastic injection moulds since 2000',
          },
          story: {
            title: 'About Polinar',
            foundedYear: '2000',
            paragraph1: 'POLINAR is one of the dynamic and leading companies in the field of manufacture of plastic injection moulds for production of plastic pipe fittings at the highest technical level, and in the field of project development for individual customer orders.',
            paragraph2: 'POLINAR promotes innovation, high technologies, and consistency. The company has been developing its experience in this field since 2000, and continues to emerge as a leading organization in design and manufacture of injection moulds.',
            paragraph3: 'Intensive experience of POLINAR in design and manufacturing of moulds is improving in every project. We are spending further efforts to improve the processes and development of innovative solutions. Thus, we will be able to strengthen competitive advantage of our customers in the medium and long term.',
            ctaText: 'Contact Us',
            ctaLink: '/contact',
          },
          statistics: {
            cards: [
              { number: 2000, suffix: '', label: 'Founded Year', icon: '📅' },
              { number: 40, suffix: '+', label: 'Export Countries', icon: '🌍' },
              { number: 500, suffix: '+', label: 'Completed Projects', icon: '🏭' },
              { number: 25, suffix: '+', label: 'Years of Experience', icon: '⚙️' },
            ],
          },
          gallery: {
            title: 'Photos from Production Area',
            description: 'A glimpse into our state-of-the-art manufacturing facility equipped with modern CNC and EDM machines.',
          },
          video: {
            title: 'Promotion Video',
            description: 'Watch our corporate video to learn more about Polinar and our manufacturing capabilities.',
            videoUrl: 'https://www.youtube.com/watch?v=wFziyAssgqk',
          },
          certificates: {
            title: 'Our Certificates',
            description: 'First priority of Polinar is to protect all customers profit and to provide qualified services. In all of inputs and outputs of our production process, the analysis of all semi-products and finished products are done very carefully.',
            items: [
              { name: 'ISO 9001', description: 'Quality Management System' },
              { name: 'ISO 14001', description: 'Environmental Management System' },
              { name: 'ISO 45001', description: 'Occupational Health & Safety' },
              { name: 'Integrated Policy', description: 'Environment & Quality Policy' },
              { name: 'Design Registration', description: 'Industrial Design Registration Certificate' },
              { name: 'Trademark Renewal', description: 'Polinar Trademark Renewal Certificate' },
              { name: 'Trademark Registration', description: 'PTE Trademark Registration Certificate' },
            ],
          },
          cta: {
            title: 'Need Detailed Information?',
            description: 'Contact our customer support team for any questions about our products and services.',
            buttonText: 'Contact via WhatsApp',
            buttonLink: 'https://wa.me/902125498820',
          },
        },
      })
      await payload.updateGlobal({
        slug: 'about-page-settings',
        locale: 'tr',
        data: {
          hero: {
            label: 'Hakkımızda',
            title: 'HAKKIMIZDA',
            subtitle: '2000 yılından bu yana plastik enjeksiyon kalıpları alanında lider üretici',
          },
          story: {
            title: 'Polinar Hakkında',
            foundedYear: '2000',
            paragraph1: 'POLINAR, en yüksek teknik düzeyde plastik boru ek parçaları üretimi için plastik enjeksiyon kalıpları üretimi ve bireysel müşteri siparişleri için proje geliştirme alanında dinamik ve öncü firmalardan biridir.',
            paragraph2: 'POLINAR yenilikçiliği, yüksek teknolojiyi ve tutarlılığı teşvik eder. Şirket 2000 yılından bu yana bu alandaki deneyimini geliştirmekte ve enjeksiyon kalıpları tasarım ve üretiminde lider bir kuruluş olarak öne çıkmaya devam etmektedir.',
            paragraph3: 'POLINAR\'ın kalıp tasarım ve üretimindeki yoğun deneyimi her projede gelişmektedir. Süreçleri iyileştirmek ve yenilikçi çözümler geliştirmek için daha fazla çaba harcıyoruz. Böylece müşterilerimizin orta ve uzun vadede rekabet avantajını güçlendirebileceğiz.',
            ctaText: 'İletişim',
            ctaLink: '/contact',
          },
          statistics: {
            cards: [
              { number: 2000, suffix: '', label: 'Kuruluş Yılı', icon: '📅' },
              { number: 40, suffix: '+', label: 'İhracat Ülkesi', icon: '🌍' },
              { number: 500, suffix: '+', label: 'Tamamlanan Proje', icon: '🏭' },
              { number: 25, suffix: '+', label: 'Yıllık Deneyim', icon: '⚙️' },
            ],
          },
          gallery: {
            title: 'Üretim Alanından Fotoğraflar',
            description: 'Modern CNC ve EDM makineleri ile donatılmış son teknoloji üretim tesisimizden görüntüler.',
          },
          video: {
            title: 'Tanıtım Videosu',
            description: 'Polinar ve üretim kapasitemiz hakkında daha fazla bilgi edinmek için kurumsal videomuzu izleyin.',
            videoUrl: 'https://www.youtube.com/watch?v=wFziyAssgqk',
          },
          certificates: {
            title: 'Sertifikalarımız',
            description: 'Polinar\'ın önceliği tüm müşterilerinin çıkarlarını korumak ve kaliteli hizmet sunmaktır. Üretim sürecimizin tüm girdi ve çıktılarında, tüm yarı mamul ve mamul ürünlerin analizleri çok dikkatli bir şekilde yapılmaktadır.',
            items: [
              { name: 'ISO 9001', description: 'Kalite Yönetim Sistemi' },
              { name: 'ISO 14001', description: 'Çevre Yönetim Sistemi' },
              { name: 'ISO 45001', description: 'İş Sağlığı ve Güvenliği' },
              { name: 'Entegre Politika', description: 'Çevre ve Kalite Politikası' },
              { name: 'Tasarım Tescil Belgesi', description: 'Endüstriyel Tasarım Tescil Belgesi' },
              { name: 'Marka Yenileme Belgesi', description: 'Polinar Marka Yenileme Belgesi' },
              { name: 'Marka Tescil Belgesi', description: 'PTE Marka Tescil Belgesi' },
            ],
          },
          cta: {
            title: 'Detaylı Bilgi mi Gerekiyor?',
            description: 'Ürünlerimiz ve hizmetlerimiz hakkında her türlü sorunuz için müşteri destek ekibimizle iletişime geçin.',
            buttonText: 'WhatsApp ile İletişim',
            buttonLink: 'https://wa.me/902125498820',
          },
        },
      })
      payload.logger.info('✓ About Page Settings seeded (en + tr)')
    }

    // Seed Contact Page Settings if empty
    const contactPage = await payload.findGlobal({ slug: 'contact-page-settings' })
    if (!contactPage.hero?.title) {
      await payload.updateGlobal({
        slug: 'contact-page-settings',
        data: {
          hero: { title: 'CONTACT US', subtitle: 'Get in Touch' },
          form: { nameLabel: 'Your Name', emailLabel: 'Your Email', subjectLabel: 'Subject', messageLabel: 'Your Message', sendButton: 'SEND MESSAGE', sendingButton: 'SENDING...' },
          messages: { success: 'Message sent successfully!', error: 'Failed to send message. Please try again.' },
          info: { addressLabel: 'Address', addressText: 'İkitelli OSB Eskoop San. Sit.\nD Blok No: 34\nBaşakşehir / İSTANBUL, TURKEY', phoneLabel: 'Phone / Fax', emailLabel: 'Email' },
        },
      })
      await payload.updateGlobal({
        slug: 'contact-page-settings',
        locale: 'tr',
        data: {
          hero: { title: 'İLETİŞİM', subtitle: 'Bize Ulaşın' },
          form: { nameLabel: 'Adınız', emailLabel: 'E-posta Adresiniz', subjectLabel: 'Konu', messageLabel: 'Mesajınız', sendButton: 'MESAJ GÖNDER', sendingButton: 'GÖNDERİLİYOR...' },
          messages: { success: 'Mesajınız başarıyla gönderildi!', error: 'Mesaj gönderilemedi. Lütfen tekrar deneyin.' },
          info: { addressLabel: 'Adres', addressText: 'İkitelli OSB Eskoop San. Sit.\nD Blok No: 34\nBaşakşehir / İSTANBUL, TÜRKİYE', phoneLabel: 'Telefon / Faks', emailLabel: 'E-posta' },
        },
      })
      payload.logger.info('✓ Contact Page Settings seeded (en + tr)')
    }

    // Seed News Page Settings if empty
    const newsPage = await payload.findGlobal({ slug: 'news-page-settings' })
    if (!newsPage.hero?.label) {
      await payload.updateGlobal({
        slug: 'news-page-settings',
        data: {
          hero: { label: 'Latest Updates', title: 'NEWS & EXHIBITIONS' },
          labels: { empty: 'News coming soon', breadcrumb: 'News', allNews: 'All News', cmsPlaceholder: 'Article content will be managed via CMS.' },
        },
      })
      await payload.updateGlobal({
        slug: 'news-page-settings',
        locale: 'tr',
        data: {
          hero: { label: 'Son Gelişmeler', title: 'HABERLER & FUARLAR' },
          labels: { empty: 'Haberler yakında eklenecek', breadcrumb: 'Haberler', allNews: 'Tüm Haberler', cmsPlaceholder: 'Haber içeriği CMS üzerinden yönetilecektir.' },
        },
      })
      payload.logger.info('✓ News Page Settings seeded (en + tr)')
    }

    // Seed Our Business Page Settings if empty
    const ourBusinessPage = await payload.findGlobal({ slug: 'our-business-page-settings' })
    if (!ourBusinessPage.seo?.title) {
      await payload.updateGlobal({
        slug: 'our-business-page-settings',
        data: {
          seo: { title: 'Our Business', description: 'Explore Polinar\'s core business areas: injection moulds, precision machinery, and plastic testing equipment.' },
        },
      })
      await payload.updateGlobal({
        slug: 'our-business-page-settings',
        locale: 'tr',
        data: {
          seo: { title: 'Faaliyetlerimiz', description: 'Polinar\'ın temel faaliyet alanlarını keşfedin: enjeksiyon kalıpları, hassas makineler ve plastik test ekipmanları.' },
        },
      })
      payload.logger.info('✓ Our Business Page Settings seeded (en + tr)')
    }

    // Seed Footer labels if empty
    const footerData = await payload.findGlobal({ slug: 'footer' })
    if (!footerData.labels?.addressLabel) {
      await payload.updateGlobal({
        slug: 'footer',
        data: {
          labels: { addressLabel: 'Address', phoneFaxLabel: 'Phone / Fax', emailLabel: 'Email', newsletterLabel: 'Newsletter', subscribeButton: 'SUBSCRIBE', namePlaceholder: 'Name', emailPlaceholder: 'E-mail' },
          copyrightText: footerData.copyrightText || 'Copyright © 2026 All Rights Reserved by Polinar',
        },
      })
      await payload.updateGlobal({
        slug: 'footer',
        locale: 'tr',
        data: {
          labels: { addressLabel: 'Adres', phoneFaxLabel: 'Telefon / Faks', emailLabel: 'E-posta', newsletterLabel: 'Bülten', subscribeButton: 'ABONE OL', namePlaceholder: 'İsim', emailPlaceholder: 'E-posta' },
          copyrightText: 'Telif Hakkı © 2026 Tüm Hakları Saklıdır — Polinar',
        },
      })
      payload.logger.info('✓ Footer labels seeded (en + tr)')
    }

    // Seed SiteSettings chatbot labels + whatsapp text if empty
    const siteSettings = await payload.findGlobal({ slug: 'site-settings' })
    if (!siteSettings.chatbot?.labels?.title) {
      await payload.updateGlobal({
        slug: 'site-settings',
        data: {
          chatbot: {
            ...siteSettings.chatbot as any,
            labels: {
              title: 'Polinar Support',
              welcome: 'Hello! How can I help you today?',
              placeholder: 'Type your message...',
              whatsappLabel: 'Continue on WhatsApp',
              closeLabel: 'Close',
              errorMessage: 'Sorry, an error occurred.',
              connectionError: 'Connection error. Please try again.',
            },
          },
          whatsappCTA: {
            ...siteSettings.whatsappCTA as any,
            text: siteSettings.whatsappCTA?.text || 'Need detailed information, contact our customer support via whatsapp',
          },
        },
      })
      await payload.updateGlobal({
        slug: 'site-settings',
        locale: 'tr',
        data: {
          chatbot: {
            labels: {
              title: 'Polinar Destek',
              welcome: 'Merhaba! Size nasıl yardımcı olabilirim?',
              placeholder: 'Mesajınızı yazın...',
              whatsappLabel: "WhatsApp'ta devam et",
              closeLabel: 'Kapat',
              errorMessage: 'Üzgünüz, bir hata oluştu.',
              connectionError: 'Bağlantı hatası. Lütfen tekrar deneyin.',
            },
          },
          whatsappCTA: {
            text: 'Detaylı bilgi için whatsapp üzerinden müşteri desteğimizle iletişime geçin',
          },
        },
      })
      payload.logger.info('✓ SiteSettings chatbot/whatsapp labels seeded (en + tr)')
    }

    // Seed UiLabels (common only) if empty
    const uiLabels = await payload.findGlobal({ slug: 'ui-labels' })
    if (!uiLabels.learnMore) {
      await payload.updateGlobal({
        slug: 'ui-labels',
        data: { learnMore: 'Learn More', readMore: 'Read More', contentComingSoon: 'Content coming soon.' },
      })
      await payload.updateGlobal({
        slug: 'ui-labels',
        locale: 'tr',
        data: { learnMore: 'Detaylar', readMore: 'Devamını Oku', contentComingSoon: 'İçerik yakında eklenecektir.' },
      })
      payload.logger.info('✓ UiLabels seeded (en + tr)')
    }
  },

  secret: process.env.PAYLOAD_SECRET || 'default-secret-change-me',

  typescript: {
    outputFile: path.resolve(dirname, 'src/payload-types.ts'),
  },

  sharp,

  plugins: [
    seoPlugin({
      collections: ['pages', 'product-categories', 'news'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }: any) => `${doc?.title || doc?.name} — Polinar`,
      generateDescription: ({ doc }: any) => doc?.excerpt || doc?.description || '',
    }),
    ...(process.env.CLOUDINARY_CLOUD_NAME
      ? [
        cloudinaryStorage({
          collections: {
            media: {
              disablePayloadAccessControl: true,
              generateFileURL: ({ filename, size }: { filename?: string; size?: { filename?: string } }) => {
                const targetFilename = size?.filename || filename
                if (!targetFilename) return null

                const ext = targetFilename.split('.').pop() || 'jpg'
                const name = targetFilename.replace(/\.[^.]+$/, '')
                const isPdf = ext === 'pdf'
                const type = isPdf ? 'raw' : 'image'
                return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/${type}/upload/polinar/media/${name}.${ext}`
              },
            },
          },
          cloudinaryConfig: {
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
            api_key: process.env.CLOUDINARY_API_KEY!,
            api_secret: process.env.CLOUDINARY_API_SECRET!,
          },
          folder: 'polinar/media',
        }),
      ]
      : []),
  ],
})
