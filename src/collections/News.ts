import type { CollectionConfig } from 'payload'
import { revalidateCollection } from '@/hooks/revalidateOnChange'

export const News: CollectionConfig = {
  slug: 'news',
  labels: { singular: 'Article', plural: 'News & Events' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'status', '_status'],
    group: 'Content',
    description: 'News articles and exhibition events',
  },
  versions: {
    drafts: true,
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateCollection],
  },
  cacheConfig: {
    ttl: 60,
    disableCacheOnUpdate: false,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'excerpt',
      type: 'textarea',
      localized: true,
      admin: { description: 'Short summary shown in listing cards' },
    },
    {
      name: 'content',
      type: 'richText',
      localized: true,
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly', displayFormat: 'dd/MM/yyyy' } },
    },
    {
      name: 'year',
      type: 'text',
      admin: { position: 'sidebar', description: 'Year badge shown on card' },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
}
