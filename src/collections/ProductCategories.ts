import type { CollectionConfig } from 'payload'
import { revalidateCollection } from '@/hooks/revalidateOnChange'

export const ProductCategories: CollectionConfig = {
  slug: 'product-categories',
  labels: { singular: 'Product', plural: 'Products' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'sortOrder'],
    group: 'Content',
    description: 'Mould product categories',
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
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: 'Product name (e.g. PPR-C Sanitary Fittings Moulds)' },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { position: 'sidebar', description: 'URL-friendly identifier' },
    },
    {
      name: 'featuredImage',
      label: 'Featured Image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'materials',
      type: 'text',
      localized: true,
      admin: { description: 'Raw material type (e.g. PPR-C, HDPE)' },
    },
    {
      name: 'technologies',
      type: 'array',
      localized: true,
      labels: { singular: 'Technology', plural: 'Technologies' },
      admin: { description: 'Key features and technologies' },
      fields: [
        { name: 'item', type: 'text', required: true },
      ],
    },
    {
      name: 'description',
      type: 'richText',
      localized: true,
    },
    {
      name: 'gallery',
      type: 'array',
      labels: { singular: 'Image', plural: 'Gallery Images' },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
      ],
    },
    {
      name: 'brochure',
      label: 'Brochure (PDF)',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Display order (lower = first)' },
    },
  ],
}
