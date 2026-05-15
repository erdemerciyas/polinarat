import type { GlobalConfig } from 'payload'
import { revalidateGlobal } from '@/hooks/revalidateOnChange'

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Footer',
  admin: {
    group: 'Layout',
    description: 'Footer content and newsletter settings',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobal],
  },
  fields: [
    {
      name: 'labels',
      label: 'Footer Labels',
      type: 'group',
      fields: [
        { name: 'addressLabel', type: 'text', localized: true, admin: { description: '"Address" / "Adres"' } },
        { name: 'phoneFaxLabel', type: 'text', localized: true, admin: { description: '"Phone / Fax" / "Telefon / Faks"' } },
        { name: 'emailLabel', type: 'text', localized: true, admin: { description: '"E-mail"' } },
        { name: 'newsletterLabel', type: 'text', localized: true, admin: { description: '"Newsletter" / "Bülten"' } },
        { name: 'subscribeButton', type: 'text', localized: true, admin: { description: '"Subscribe" / "Abone Ol"' } },
        { name: 'namePlaceholder', type: 'text', localized: true, admin: { description: '"Your Name" / "Adınız"' } },
        { name: 'emailPlaceholder', type: 'text', localized: true, admin: { description: '"Your Email" / "E-postanız"' } },
      ],
    },
    {
      name: 'copyrightText',
      label: 'Copyright Text',
      type: 'text',
      localized: true,
      admin: { description: 'e.g. Copyright © 2024 All Rights Reserved by Polinar' },
    },
    {
      name: 'columns',
      label: 'Custom Footer Columns',
      type: 'array',
      maxRows: 4,
      labels: { singular: 'Column', plural: 'Columns' },
      fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'content', type: 'richText', localized: true },
      ],
    },
    {
      name: 'showNewsletter',
      label: 'Show Newsletter Form',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
