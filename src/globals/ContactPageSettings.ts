import type { GlobalConfig } from 'payload'
import { revalidateGlobal } from '@/hooks/revalidateOnChange'
import { seoFields } from '@/fields/seoFields'

export const ContactPageSettings: GlobalConfig = {
  slug: 'contact-page-settings',
  label: 'Contact Page',
  admin: {
    group: 'Pages',
    description: 'Contact page hero, form labels, and success/error messages',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobal],
  },
  cacheConfig: {
    ttl: 60,
    disableCacheOnUpdate: false,
  },
  fields: [
    seoFields,
    {
      name: 'hero',
      label: 'Hero Section',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', localized: true, admin: { description: 'e.g. "Contact Us"' } },
        { name: 'subtitle', type: 'text', localized: true, admin: { description: 'e.g. "Get in touch with our team"' } },
      ],
    },
    {
      name: 'form',
      label: 'Form Labels',
      type: 'group',
      fields: [
        { name: 'nameLabel', type: 'text', localized: true },
        { name: 'emailLabel', type: 'text', localized: true },
        { name: 'subjectLabel', type: 'text', localized: true },
        { name: 'messageLabel', type: 'text', localized: true },
        { name: 'sendButton', type: 'text', localized: true },
        { name: 'sendingButton', type: 'text', localized: true },
      ],
    },
    {
      name: 'messages',
      label: 'Response Messages',
      type: 'group',
      fields: [
        { name: 'success', type: 'text', localized: true, admin: { description: 'Shown after successful submit' } },
        { name: 'error', type: 'text', localized: true, admin: { description: 'Shown on submit failure' } },
      ],
    },
    {
      name: 'info',
      label: 'Contact Info Labels',
      type: 'group',
      admin: { description: 'Labels shown next to actual contact details from Site Settings' },
      fields: [
        { name: 'addressLabel', type: 'text', localized: true },
        {
          name: 'addressText',
          type: 'textarea',
          localized: true,
          admin: {
            description:
              'Optional. If Site Settings → Contact → Address is set, that value is shown instead.',
          },
        },
        { name: 'phoneLabel', type: 'text', localized: true },
        { name: 'emailLabel', type: 'text', localized: true },
      ],
    },
    {
      name: 'newsletter',
      label: 'Newsletter Section',
      type: 'group',
      admin: { description: 'Newsletter subscription form labels shown in the footer' },
      fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'description', type: 'text', localized: true },
        { name: 'namePlaceholder', type: 'text', localized: true },
        { name: 'emailPlaceholder', type: 'text', localized: true },
        { name: 'submitButton', type: 'text', localized: true },
        { name: 'successMessage', type: 'text', localized: true },
        { name: 'errorMessage', type: 'text', localized: true },
      ],
    },
  ],
}
