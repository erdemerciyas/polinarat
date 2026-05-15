import type { GlobalConfig } from 'payload'
import { revalidateGlobal } from '@/hooks/revalidateOnChange'
import { seoFields } from '@/fields/seoFields'

export const HomepageSettings: GlobalConfig = {
  slug: 'homepage-settings',
  label: 'Homepage',
  admin: {
    group: 'Layout',
    description: 'Homepage hero, values, featured content',
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
      name: 'sliderSettings',
      label: 'Slider Settings',
      type: 'group',
      admin: {
        description: 'Global slider behavior and appearance settings',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'autoPlay',
              label: 'Auto Play',
              type: 'checkbox',
              defaultValue: true,
              admin: { width: '25%' },
            },
            {
              name: 'pauseOnHover',
              label: 'Pause on Hover',
              type: 'checkbox',
              defaultValue: true,
              admin: { width: '25%' },
            },
            {
              name: 'showArrows',
              label: 'Show Arrows',
              type: 'checkbox',
              defaultValue: true,
              admin: { width: '25%' },
            },
            {
              name: 'showDots',
              label: 'Show Dots',
              type: 'checkbox',
              defaultValue: true,
              admin: { width: '25%' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'interval',
              label: 'Slide Interval (ms)',
              type: 'number',
              defaultValue: 5000,
              min: 1000,
              max: 15000,
              admin: { width: '33%', description: 'Time between slides (1000-15000ms)' },
            },
            {
              name: 'transitionDuration',
              label: 'Transition Duration (ms)',
              type: 'number',
              defaultValue: 800,
              min: 200,
              max: 3000,
              admin: { width: '33%', description: 'Animation duration (200-3000ms)' },
            },
            {
              name: 'transitionType',
              label: 'Transition Type',
              type: 'select',
              defaultValue: 'fade',
              options: [
                { label: 'Fade', value: 'fade' },
                { label: 'Slide', value: 'slide' },
                { label: 'Zoom', value: 'zoom' },
                { label: 'Slide Up', value: 'slideUp' },
              ],
              admin: { width: '33%' },
            },
          ],
        },
      ],
    },
    {
      name: 'heroSlides',
      label: 'Hero Slides',
      type: 'array',
      labels: { singular: 'Slide', plural: 'Slides' },
      maxRows: 6,
      admin: { initCollapsed: true },
      fields: [
        { name: 'title', type: 'text', localized: true, required: true },
        { name: 'subtitle', type: 'text', localized: true },
        { name: 'backgroundImage', label: 'Background Image', type: 'upload', relationTo: 'media' },
        {
          type: 'row',
          fields: [
            { name: 'ctaLabel', label: 'CTA Button Text', type: 'text', localized: true, admin: { width: '50%' } },
            { name: 'ctaLink', label: 'CTA Button Link', type: 'text', admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'overlayOpacity',
              label: 'Overlay Opacity (%)',
              type: 'number',
              defaultValue: 60,
              min: 0,
              max: 100,
              admin: { width: '25%', description: '0 = transparent, 100 = fully dark' },
            },
            {
              name: 'textAlignment',
              label: 'Text Alignment',
              type: 'select',
              defaultValue: 'left',
              options: [
                { label: 'Left', value: 'left' },
                { label: 'Center', value: 'center' },
                { label: 'Right', value: 'right' },
              ],
              admin: { width: '25%' },
            },
            {
              name: 'textPosition',
              label: 'Text Position',
              type: 'select',
              defaultValue: 'center',
              options: [
                { label: 'Top', value: 'top' },
                { label: 'Center', value: 'center' },
                { label: 'Bottom', value: 'bottom' },
              ],
              admin: { width: '25%' },
            },
            {
              name: 'titleSize',
              label: 'Title Size',
              type: 'select',
              defaultValue: 'large',
              options: [
                { label: 'Small', value: 'small' },
                { label: 'Medium', value: 'medium' },
                { label: 'Large', value: 'large' },
              ],
              admin: { width: '25%' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'animateText',
              label: 'Animate Text',
              type: 'checkbox',
              defaultValue: true,
              admin: { width: '50%' },
            },
            {
              name: 'textAnimation',
              label: 'Text Animation',
              type: 'select',
              defaultValue: 'fadeUp',
              options: [
                { label: 'Fade Up', value: 'fadeUp' },
                { label: 'Fade In', value: 'fadeIn' },
                { label: 'Slide from Left', value: 'slideLeft' },
                { label: 'Slide from Right', value: 'slideRight' },
              ],
              admin: { width: '50%', condition: (_: any, siblingData: any) => siblingData?.animateText },
            },
          ],
        },
      ],
    },
    {
      name: 'coreValues',
      label: 'Core Values Section',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', localized: true, admin: { description: 'e.g. Quality / Robust / Durable / Reliable' } },
        { name: 'description', type: 'textarea', localized: true },
      ],
    },
    {
      name: 'aboutPreview',
      label: 'About Preview Section',
      type: 'group',
      fields: [
        { name: 'text', type: 'richText', localized: true },
        { name: 'image', type: 'upload', relationTo: 'media' },
      ],
    },
    {
      name: 'featuredProducts',
      label: 'Featured Products',
      type: 'relationship',
      relationTo: 'product-categories',
      hasMany: true,
      admin: { description: 'Select products to feature on homepage' },
    },
    {
      name: 'promotionVideo',
      label: 'Promotion Video',
      type: 'group',
      fields: [
        { name: 'videoUrl', label: 'Video URL', type: 'text', admin: { description: 'YouTube or Vimeo URL' } },
        { name: 'thumbnailImage', label: 'Thumbnail', type: 'upload', relationTo: 'media' },
        {
          name: 'sideImages',
          type: 'array',
          maxRows: 2,
          labels: { singular: 'Side Image', plural: 'Side Images' },
          fields: [
            { name: 'image', type: 'upload', relationTo: 'media' },
          ],
        },
      ],
    },
    {
      name: 'aboutPreviewLabels',
      label: 'About Preview Labels',
      type: 'group',
      fields: [
        { name: 'label', type: 'text', localized: true, admin: { description: '"About" / "Hakkımızda"' } },
        { name: 'title', type: 'text', localized: true, admin: { description: '"US" / ""' } },
        { name: 'description', type: 'textarea', localized: true, admin: { description: 'Short about preview paragraph' } },
        {
          name: 'image',
          label: 'About Image',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description:
              'Large image in the right column of the homepage About block (not the faint watermark — use About Preview Decoration for that).',
          },
        },
      ],
    },
    {
      name: 'aboutPreviewDecor',
      label: 'About Preview Decoration',
      type: 'group',
      admin: {
        description: 'Background artwork for the About Preview block (optional).',
      },
      fields: [
        {
          name: 'leftWatermark',
          label: 'Left watermark image',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Large faint image behind the text column on desktop. Uses a default if empty.',
          },
        },
      ],
    },
    {
      name: 'businessSection',
      label: 'Business Section',
      type: 'group',
      fields: [
        {
          name: 'sectionLabel',
          type: 'text',
          localized: true,
          admin: { description: 'e.g. Faaliyetlerimiz / Our Business' },
        },
        {
          name: 'sectionTitle',
          type: 'text',
          localized: true,
          admin: { description: 'e.g. Ne Yapıyoruz? / What We Do' },
        },
      ],
    },
    {
      name: 'newsSection',
      label: 'News Section Labels',
      type: 'group',
      fields: [
        { name: 'label', type: 'text', localized: true, admin: { description: '"Latest News" / "Son Haberler"' } },
        { name: 'title', type: 'text', localized: true, admin: { description: '"Fair Agenda" / "Fuar Gündemi"' } },
        { name: 'empty', type: 'text', localized: true, admin: { description: '"News coming soon" / "Haberler yakında eklenecek"' } },
      ],
    },
    {
      name: 'featuredNews',
      label: 'Featured News',
      type: 'relationship',
      relationTo: 'news',
      hasMany: true,
      maxRows: 3,
      admin: { description: 'Select up to 3 news items for homepage' },
    },
  ],
}
