import type { CollectionConfig } from 'payload'

export const Languages: CollectionConfig = {
  slug: 'languages',
  labels: {
    singular: 'Language',
    plural: 'Languages',
  },
  admin: {
    group: 'Settings',
    useAsTitle: 'label',
    defaultColumns: ['label', 'code', 'nativeLabel', 'isActive', 'isDefault', 'sortOrder'],
    description:
      'Manage the languages available on the website. After adding or removing a language, restart the server to apply changes to the content editor.',
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
            description:
              'ISO 639-1 language code (e.g. en, de). Only EN and DE are supported.',
          },
          label: 'Language Code',
        },
        {
          name: 'label',
          type: 'text',
          required: true,
          admin: {
            width: '25%',
          },
          label: 'Label',
        },
        {
          name: 'nativeLabel',
          type: 'text',
          required: true,
          admin: {
            width: '25%',
            description: 'Language name in its own language (e.g. Deutsch)',
          },
          label: 'Native Label',
        },
        {
          name: 'shortLabel',
          type: 'text',
          required: true,
          admin: {
            width: '25%',
            description: 'Short label for language selector (e.g. EN, DE)',
          },
          label: 'Short Label',
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
            description: 'Set as the default language. Only one language can be default.',
          },
          label: 'Default Language',
        },
        {
          name: 'isActive',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            width: '33%',
            description: 'Only active languages are shown on the website.',
          },
          label: 'Active',
        },
        {
          name: 'isRTL',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            width: '33%',
            description: 'Enable for right-to-left languages (e.g. Arabic, Hebrew).',
          },
          label: 'Right-to-Left (RTL)',
        },
      ],
    },
    {
      name: 'flagEmoji',
      type: 'text',
      admin: {
        description: 'Flag emoji for the language (e.g. 🇬🇧, 🇩🇪). Optional.',
      },
      label: 'Flag Emoji',
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Lower numbers appear first.',
      },
      label: 'Sort Order',
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation, originalDoc }) => {
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

        if (data?.code) {
          data.code = data.code.toLowerCase().trim()
        }

        return data
      },
    ],
    afterChange: [
      async ({ req }) => {
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