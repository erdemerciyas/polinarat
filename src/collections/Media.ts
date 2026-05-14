import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Media', plural: 'Media Library' },
  admin: {
    group: 'Content',
    description: 'Images, documents and files',
  },
  upload: {
    staticDir: 'public/media',
    mimeTypes: ['image/*', 'application/pdf'],
    imageSizes: [
      { name: 'thumbnail', width: 320, height: 240, position: 'centre' },
      { name: 'card', width: 600, height: 400, position: 'centre' },
      { name: 'hero', width: 1920, height: 800, position: 'centre' },
    ],
    adminThumbnail: ({ doc }: any) => doc?.sizes?.thumbnail?.url || doc?.thumbnailURL || doc?.url,
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'alt', type: 'text', localized: true, admin: { description: 'Alt text for accessibility & SEO' } },
    { name: 'caption', type: 'text', localized: true },
  ],
}
