import type { GlobalConfig } from 'payload'
import { revalidateGlobal } from '@/hooks/revalidateOnChange'
import { seoFields } from '@/fields/seoFields'

export const NewsPageSettings: GlobalConfig = {
  slug: 'news-page-settings',
  label: 'News Page',
  admin: {
    group: 'Pages',
    description: 'News listing hero, breadcrumb labels, and empty-state text',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobal],
  },
  fields: [
    seoFields,
    {
      name: 'hero',
      label: 'Hero Section',
      type: 'group',
      fields: [
        { name: 'label', type: 'text', localized: true, admin: { description: 'Small label — e.g. "Latest Updates"' } },
        { name: 'title', type: 'text', localized: true, admin: { description: 'Main title — e.g. "NEWS & EXHIBITIONS"' } },
        { name: 'image', type: 'upload', relationTo: 'media' },
      ],
    },
    {
      name: 'labels',
      label: 'Labels & Messages',
      type: 'group',
      fields: [
        { name: 'empty', type: 'text', localized: true, admin: { description: 'Shown when no news articles exist' } },
        { name: 'breadcrumb', type: 'text', localized: true, admin: { description: 'Breadcrumb text — e.g. "News"' } },
        { name: 'allNews', type: 'text', localized: true, admin: { description: 'Back button — e.g. "All News"' } },
        { name: 'cmsPlaceholder', type: 'text', localized: true, admin: { description: 'Placeholder when article has no CMS content yet' } },
      ],
    },
  ],
}
