import type { GlobalConfig } from 'payload'
import { revalidateGlobal } from '@/hooks/revalidateOnChange'

export const UiLabels: GlobalConfig = {
  slug: 'ui-labels',
  label: 'Common Labels',
  admin: {
    group: 'Settings',
    description: 'Shared micro-copy used across multiple pages (e.g. "Learn More", "Read More")',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobal],
  },
  fields: [
    { name: 'learnMore', type: 'text', localized: true, admin: { description: '"Learn More" / "Detaylar"' } },
    { name: 'readMore', type: 'text', localized: true, admin: { description: '"Read More" / "Devamını Oku"' } },
    { name: 'contentComingSoon', type: 'text', localized: true, admin: { description: '"Content coming soon." / "İçerik yakında eklenecektir."' } },
  ],
}
