import type { CollectionConfig } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const LOCALES_PATH = path.resolve(__dirname, '../lib/locales.json')

async function syncLocalesToFile(payload: any) {
  try {
    if (typeof window !== 'undefined') return // Guard against client-side execution
    const fs = await import('fs')

    const allLangs = await payload.find({
      collection: 'languages',
      sort: 'sortOrder',
      limit: 100,
    })

    if (allLangs.docs.length === 0) return

    const defaultLang = allLangs.docs.find((d: any) => d.isDefault) || allLangs.docs[0]

    const localesConfig = {
      locales: allLangs.docs
        .filter((d: any) => d.isActive)
        .map((doc: any) => ({
          label: doc.label,
          code: doc.code,
        })),
      defaultLocale: defaultLang.code,
    }

    try {
      fs.writeFileSync(LOCALES_PATH, JSON.stringify(localesConfig, null, 2) + '\n', 'utf-8')
      payload.logger.info(`✓ locales.json synced: ${localesConfig.locales.map((l: any) => l.code).join(', ')}`)
    } catch {
      payload.logger.info('locales.json write skipped (read-only filesystem)')
    }

    await triggerRedeploy(payload)
  } catch (err) {
    payload.logger.error('Failed to sync locales:', err)
  }
}

async function triggerRedeploy(payload: any) {
  const hookUrl = process.env.VERCEL_DEPLOY_HOOK
  if (!hookUrl) return

  try {
    await fetch(hookUrl, { method: 'POST' })
    payload.logger.info('✓ Vercel redeploy triggered (language change)')
  } catch (err: any) {
    payload.logger.warn(`Vercel redeploy trigger failed: ${err?.message}`)
  }
}

async function addLocaleToPostgresEnum(payload: any, code: string) {
  try {
    const db = (payload as any).db
    const drizzle = db?.drizzle
    if (!drizzle) return

    const check = await drizzle.execute(
      `SELECT 1 FROM pg_enum WHERE enumlabel = '${code}' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = '_locales')`,
    )
    if (check.rows.length === 0) {
      await drizzle.execute(`ALTER TYPE _locales ADD VALUE IF NOT EXISTS '${code}'`)
      payload.logger.info(`✓ Added '${code}' to PostgreSQL _locales enum`)
    }
  } catch (err: any) {
    payload.logger.error(`Failed to add '${code}' to _locales enum: ${err?.message}`)
  }
}

export const Languages: CollectionConfig = {
  slug: 'languages',
  labels: {
    singular: {
      en: 'Language',
      tr: 'Dil',
    },
    plural: {
      en: 'Languages',
      tr: 'Diller',
    },
  },
  admin: {
    group: {
      en: 'Settings',
      tr: 'Ayarlar',
    },
    useAsTitle: 'label',
    defaultColumns: ['label', 'code', 'nativeLabel', 'isActive', 'isDefault', 'sortOrder'],
    description: {
      en: 'Manage the languages available on the website. After adding or removing a language, restart the server to apply changes to the content editor.',
      tr: 'Web sitesinde kullanılabilir dilleri yönetin. Dil ekledikten veya sildikten sonra içerik editöründe değişikliklerin geçerli olması için sunucuyu yeniden başlatın.',
    },
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'code',
          type: 'text',
          required: true,
          unique: true,
          admin: {
            width: '25%',
            description: {
              en: 'ISO 639-1 language code (e.g. en, tr, de, fr, ar)',
              tr: 'ISO 639-1 dil kodu (ör. en, tr, de, fr, ar)',
            },
          },
          label: {
            en: 'Language Code',
            tr: 'Dil Kodu',
          },
        },
        {
          name: 'label',
          type: 'text',
          required: true,
          admin: {
            width: '25%',
          },
          label: {
            en: 'Label',
            tr: 'Etiket',
          },
        },
        {
          name: 'nativeLabel',
          type: 'text',
          required: true,
          admin: {
            width: '25%',
            description: {
              en: 'Language name in its own language (e.g. Türkçe, Deutsch)',
              tr: 'Dilin kendi dilindeki adı (ör. Türkçe, Deutsch)',
            },
          },
          label: {
            en: 'Native Label',
            tr: 'Yerel Etiket',
          },
        },
        {
          name: 'shortLabel',
          type: 'text',
          required: true,
          admin: {
            width: '25%',
            description: {
              en: 'Short label for language selector (e.g. EN, TR)',
              tr: 'Dil seçici için kısa etiket (ör. EN, TR)',
            },
          },
          label: {
            en: 'Short Label',
            tr: 'Kısa Etiket',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'isDefault',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            width: '33%',
            description: {
              en: 'Set as the default language. Only one language can be default.',
              tr: 'Varsayılan dil olarak ayarla. Yalnızca bir dil varsayılan olabilir.',
            },
          },
          label: {
            en: 'Default Language',
            tr: 'Varsayılan Dil',
          },
        },
        {
          name: 'isActive',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            width: '33%',
            description: {
              en: 'Only active languages are shown on the website.',
              tr: 'Yalnızca aktif diller web sitesinde gösterilir.',
            },
          },
          label: {
            en: 'Active',
            tr: 'Aktif',
          },
        },
        {
          name: 'isRTL',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            width: '33%',
            description: {
              en: 'Enable for right-to-left languages (e.g. Arabic, Hebrew).',
              tr: 'Sağdan sola yazılan diller için etkinleştirin (ör. Arapça, İbranice).',
            },
          },
          label: {
            en: 'Right-to-Left (RTL)',
            tr: 'Sağdan Sola (RTL)',
          },
        },
      ],
    },
    {
      name: 'flagEmoji',
      type: 'text',
      admin: {
        description: {
          en: 'Flag emoji for the language (e.g. 🇬🇧, 🇹🇷, 🇩🇪). Optional.',
          tr: 'Dil için bayrak emojisi (ör. 🇬🇧, 🇹🇷, 🇩🇪). İsteğe bağlı.',
        },
      },
      label: {
        en: 'Flag Emoji',
        tr: 'Bayrak Emojisi',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: {
          en: 'Lower numbers appear first.',
          tr: 'Düşük numaralar önce görünür.',
        },
      },
      label: {
        en: 'Sort Order',
        tr: 'Sıralama',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation, originalDoc }) => {
        // If this language is being set as default, unset all others
        if (data?.isDefault) {
          const payload = req.payload
          const existing = await payload.find({
            collection: 'languages',
            where: {
              isDefault: { equals: true },
              ...(operation === 'update' && originalDoc?.id
                ? { id: { not_equals: originalDoc.id } }
                : {}),
            },
            limit: 100,
          })

          for (const lang of existing.docs) {
            await payload.update({
              collection: 'languages',
              id: lang.id,
              data: { isDefault: false },
            })
          }
        }

        // Normalize code to lowercase
        if (data?.code) {
          data.code = data.code.toLowerCase().trim()
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, req, operation }) => {
        const payload = req.payload

        await syncLocalesToFile(payload)

        if (doc.isActive && doc.code) {
          await addLocaleToPostgresEnum(payload, doc.code)
        }

        // Clear dictionary cache so new/removed languages reflect immediately
        try {
          const { clearDictionaryCache } = await import('@/lib/getDictionary')
          clearDictionaryCache()
        } catch {
          // getDictionary may not be available in all contexts
        }
      },
    ],
    afterDelete: [
      async ({ req }) => {
        // Sync locales.json after a language is deleted
        await syncLocalesToFile(req.payload)

        // Clear dictionary cache so removed language disappears immediately
        try {
          const { clearDictionaryCache } = await import('@/lib/getDictionary')
          clearDictionaryCache()
        } catch {
          // getDictionary may not be available in all contexts
        }
      },
    ],
  },
}
