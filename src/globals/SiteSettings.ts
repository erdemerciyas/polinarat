import type { GlobalConfig } from 'payload'
import { revalidateGlobal } from '@/hooks/revalidateOnChange'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  admin: {
    group: 'Settings',
    description: 'General site configuration, contact info, and integrations',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobal],
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      defaultValue: 'Polinar',
    },
    {
      type: 'row',
      fields: [
        { name: 'logo', label: 'Logo (Dark)', type: 'upload', relationTo: 'media', admin: { width: '50%' } },
        { name: 'logoWhite', label: 'Logo (Light)', type: 'upload', relationTo: 'media', admin: { width: '50%' } },
      ],
    },
    {
      name: 'defaultSeoDescription',
      label: 'Default SEO Description',
      type: 'textarea',
      localized: true,
    },
    // Contact
    {
      name: 'contact',
      label: 'Contact Information',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'email', type: 'email', admin: { width: '50%' } },
            { name: 'phone', type: 'text', admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'fax', type: 'text', admin: { width: '50%' } },
            { name: 'whatsapp', label: 'WhatsApp Number', type: 'text', admin: { width: '50%' } },
          ],
        },
        { name: 'address', type: 'textarea', localized: true },
        { name: 'googleMapsEmbed', label: 'Google Maps Embed URL', type: 'textarea', admin: { description: 'Paste the Google Maps iframe src URL' } },
        {
          name: 'openingHours',
          label: 'Opening Hours',
          type: 'array',
          admin: { description: 'Used in LocalBusiness JSON-LD schema. Add one entry per day range.', initCollapsed: true },
          fields: [
            { name: 'dayOfWeek', type: 'select', required: true, options: [
              { label: 'Monday', value: 'Monday' },
              { label: 'Tuesday', value: 'Tuesday' },
              { label: 'Wednesday', value: 'Wednesday' },
              { label: 'Thursday', value: 'Thursday' },
              { label: 'Friday', value: 'Friday' },
              { label: 'Saturday', value: 'Saturday' },
              { label: 'Sunday', value: 'Sunday' },
            ]},
            { name: 'opens', type: 'text', admin: { description: 'e.g. "09:00"' } },
            { name: 'closes', type: 'text', admin: { description: 'e.g. "18:00"' } },
          ],
        },
        {
          name: 'priceRange',
          label: 'Price Range',
          type: 'select',
          admin: { description: 'Displayed in LocalBusiness schema — e.g. "$" means budget, "$$$" means premium' },
          options: [
            { label: '$', value: '$' },
            { label: '$$', value: '$$' },
            { label: '$$$', value: '$$$' },
            { label: '$$$$', value: '$$$$' },
          ],
        },
        {
          name: 'notificationEmail',
          label: 'Form Notification Email',
          type: 'email',
          admin: {
            description:
              'Contact + newsletter submissions are emailed here. If empty, the Contact email above is used.',
          },
        },
      ],
    },
    // Social
    {
      name: 'socialMedia',
      label: 'Social Media',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'facebook', type: 'text', admin: { width: '50%' } },
            { name: 'instagram', type: 'text', admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'youtube', type: 'text', admin: { width: '50%' } },
            { name: 'linkedin', type: 'text', admin: { width: '50%' } },
          ],
        },
        { name: 'twitter', type: 'text' },
      ],
    },
    // Chatbot
    {
      name: 'chatbot',
      label: 'AI Chatbot',
      type: 'group',
      fields: [
        { name: 'enabled', label: 'Enable Chatbot', type: 'checkbox', defaultValue: false },
        { name: 'systemPrompt', label: 'Custom System Prompt', type: 'textarea', admin: { description: 'Override the default chatbot behavior (optional)' } },
        {
          name: 'labels',
          label: 'Chat Widget Labels',
          type: 'group',
          fields: [
            { name: 'title', type: 'text', localized: true, admin: { description: '"Polinar AI" or chat title' } },
            { name: 'welcome', type: 'text', localized: true, admin: { description: 'Welcome message' } },
            { name: 'placeholder', type: 'text', localized: true, admin: { description: 'Input placeholder' } },
            { name: 'whatsappLabel', type: 'text', localized: true, admin: { description: '"Chat on WhatsApp"' } },
            { name: 'closeLabel', type: 'text', localized: true, admin: { description: '"Close" aria-label' } },
            { name: 'errorMessage', type: 'text', localized: true, admin: { description: 'Generic error' } },
            { name: 'connectionError', type: 'text', localized: true, admin: { description: 'Connection error' } },
          ],
        },
      ],
    },
    // WhatsApp CTA
    {
      name: 'whatsappCTA',
      label: 'WhatsApp CTA Bar',
      type: 'group',
      fields: [
        { name: 'enabled', label: 'Show WhatsApp Bar', type: 'checkbox', defaultValue: true },
        { name: 'text', label: 'CTA Text', type: 'text', localized: true },
      ],
    },
    // FAQ Section
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
            { name: 'question', type: 'text', required: true, localized: true, admin: { description: 'The question' } },
            { name: 'answer', type: 'textarea', required: true, localized: true, admin: { description: 'The answer text' } },
          ],
        },
      ],
    },
    // Google Integration
    {
      name: 'googleIntegration',
      label: 'Google Integration',
      type: 'group',
      admin: { description: 'Google Search Console, IndexNow, and search engine settings' },
      fields: [
        {
          name: 'gscVerificationToken',
          label: 'Google Search Console Verification Token',
          type: 'text',
          admin: {
            description: 'HTML meta tag content from Google Search Console. Found in GSC → Settings → Verification method → HTML meta tag.',
          },
        },
        {
          name: 'indexNow',
          label: 'IndexNow Settings',
          type: 'group',
          fields: [
            { name: 'apiKey', type: 'text', admin: { description: 'Get your key from https://www.indexnow.org — leave empty to disable IndexNow' } },
            {
              name: 'enabled',
              label: 'Enable IndexNow',
              type: 'checkbox',
              defaultValue: true,
              admin: { description: 'When enabled, page changes are submitted to Bing and Google via IndexNow protocol' },
            },
          ],
        },
      ],
    },
  ],
}
