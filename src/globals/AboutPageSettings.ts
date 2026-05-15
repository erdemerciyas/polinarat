import type { GlobalConfig } from 'payload'
import { revalidateGlobal } from '@/hooks/revalidateOnChange'
import { seoFields } from '@/fields/seoFields'

export const AboutPageSettings: GlobalConfig = {
  slug: 'about-page-settings',
  label: 'About Page',
  admin: {
    group: 'Pages',
    description: 'Full About page content: hero, company story, statistics, gallery, video, certificates, CTA',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobal],
  },
  fields: [
    seoFields,
    // 1. Hero Section
    {
      name: 'hero',
      label: 'Hero Section',
      type: 'group',
      fields: [
        { name: 'label', type: 'text', localized: true, admin: { description: 'Small label above title — e.g. "About"' } },
        { name: 'title', type: 'text', localized: true, admin: { description: 'Main hero H1 — e.g. "ABOUT US"' } },
        { name: 'subtitle', type: 'text', localized: true, admin: { description: 'Subtitle below main title' } },
        { name: 'backgroundImage', type: 'upload', relationTo: 'media', admin: { description: 'Full-width hero background image' } },
      ],
    },

    // 2. Company Story
    {
      name: 'story',
      label: 'Company Story',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', localized: true, admin: { description: 'e.g. "About Polinar"' } },
        { name: 'foundedYear', type: 'text', admin: { description: 'Year badge — e.g. "2000"' } },
        { name: 'paragraph1', type: 'textarea', localized: true },
        { name: 'paragraph2', type: 'textarea', localized: true },
        { name: 'paragraph3', type: 'textarea', localized: true },
        { name: 'mainImage', type: 'upload', relationTo: 'media', admin: { description: 'Large primary image' } },
        { name: 'accentImage', type: 'upload', relationTo: 'media', admin: { description: 'Small floating overlay image' } },
        { name: 'ctaText', type: 'text', localized: true, admin: { description: 'Button text — e.g. "Contact Us"' } },
        { name: 'ctaLink', type: 'text', admin: { description: 'Button link — e.g. "/contact"' } },
      ],
    },

    // 3. Statistics
    {
      name: 'statistics',
      label: 'Statistics / Key Figures',
      type: 'group',
      fields: [
        {
          name: 'cards',
          type: 'array',
          labels: { singular: 'Stat Card', plural: 'Stat Cards' },
          maxRows: 6,
          admin: { initCollapsed: true },
          fields: [
            { name: 'number', type: 'number', required: true, admin: { description: 'Numeric value — e.g. 2000' } },
            { name: 'suffix', type: 'text', admin: { description: 'Suffix after number — e.g. "+"' } },
            { name: 'label', type: 'text', localized: true, required: true, admin: { description: 'Description — e.g. "Years of Experience"' } },
            { name: 'icon', type: 'text', admin: { description: 'Emoji or icon — e.g. "🏭"' } },
          ],
        },
      ],
    },

    // 4. Production Gallery
    {
      name: 'gallery',
      label: 'Production Gallery',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', localized: true, admin: { description: 'e.g. "Photos from Production Area"' } },
        { name: 'description', type: 'textarea', localized: true },
        {
          name: 'images',
          type: 'array',
          labels: { singular: 'Gallery Image', plural: 'Gallery Images' },
          maxRows: 12,
          admin: { initCollapsed: true },
          fields: [
            { name: 'image', type: 'upload', relationTo: 'media', required: true },
            { name: 'caption', type: 'text', localized: true },
            {
              name: 'size',
              type: 'select',
              defaultValue: 'normal',
              options: [
                { label: 'Normal', value: 'normal' },
                { label: 'Large (spans 2 columns)', value: 'large' },
              ],
            },
          ],
        },
      ],
    },

    // 5. Promotional Video
    {
      name: 'video',
      label: 'Promotional Video',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', localized: true, admin: { description: 'e.g. "Our Promotion Video"' } },
        { name: 'description', type: 'textarea', localized: true },
        { name: 'videoUrl', type: 'text', required: true, admin: { description: 'YouTube or Vimeo URL' } },
        { name: 'thumbnailImage', type: 'upload', relationTo: 'media', admin: { description: 'Poster/thumbnail image shown before play' } },
        { name: 'uploadDate', type: 'text', admin: { description: 'Video publish date (YYYY-MM-DD) — used in VideoObject schema' } },
      ],
    },

    // 5b. FAQ Section
    {
      name: 'faq',
      label: 'FAQ — Frequently Asked Questions',
      type: 'group',
      admin: { description: 'Adds FAQPage JSON-LD schema for Google rich results. Leave empty to disable.' },
      fields: [
        {
          name: 'items',
          type: 'array',
          labels: { singular: 'FAQ Item', plural: 'FAQ Items' },
          admin: { initCollapsed: true },
          fields: [
            { name: 'question', type: 'text', required: true, localized: true, admin: { description: 'The question — e.g. "What materials do you work with?"' } },
            { name: 'answer', type: 'textarea', required: true, localized: true, admin: { description: 'The answer text' } },
          ],
        },
      ],
    },

    // 6. Certificates
    {
      name: 'certificates',
      label: 'Certificates',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', localized: true, admin: { description: 'e.g. "Our Certificates"' } },
        { name: 'description', type: 'textarea', localized: true, admin: { description: 'Intro paragraph about quality standards' } },
        {
          name: 'items',
          type: 'array',
          labels: { singular: 'Certificate', plural: 'Certificates' },
          maxRows: 12,
          admin: { initCollapsed: true },
          fields: [
            { name: 'name', type: 'text', required: true, admin: { description: 'e.g. "ISO 9001"' } },
            { name: 'image', type: 'upload', relationTo: 'media', required: true },
            { name: 'description', type: 'text', localized: true },
          ],
        },
      ],
    },

    // 7. Call to Action
    {
      name: 'cta',
      label: 'Call to Action',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', localized: true, admin: { description: 'e.g. "Need Detailed Information?"' } },
        { name: 'description', type: 'text', localized: true },
        { name: 'buttonText', type: 'text', localized: true, admin: { description: 'e.g. "Contact via WhatsApp"' } },
        { name: 'buttonLink', type: 'text', admin: { description: 'e.g. WhatsApp URL' } },
      ],
    },
  ],
}
