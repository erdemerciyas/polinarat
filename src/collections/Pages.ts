import type { CollectionConfig } from 'payload'
import { HeroSlider } from '../blocks/HeroSlider'
import { RichTextBlock } from '../blocks/RichText'
import { ImageGallery } from '../blocks/ImageGallery'
import { ProductGrid } from '../blocks/ProductGrid'
import { ContactForm } from '../blocks/ContactForm'
import { VideoEmbed } from '../blocks/VideoEmbed'
import { CoreValues } from '../blocks/CoreValues'
import { CertificatesGrid } from '../blocks/CertificatesGrid'
import { CTABar } from '../blocks/CTABar'
import { TwoColumnContent } from '../blocks/TwoColumnContent'
import { revalidateCollection } from '@/hooks/revalidateOnChange'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Page', plural: 'Pages' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status'],
    group: 'Content',
    description: 'Dynamic pages with block-based page builder',
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
      name: 'heroType',
      type: 'select',
      options: [
        { label: 'Banner (Navy)', value: 'banner' },
        { label: 'Full Slider', value: 'slider' },
        { label: 'None', value: 'none' },
      ],
      defaultValue: 'banner',
    },
    {
      name: 'heroTitle',
      type: 'text',
      localized: true,
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      admin: { condition: (_, siblingData) => siblingData?.heroType === 'banner' },
    },
    {
      name: 'layout',
      type: 'blocks',
      localized: true,
      blocks: [
        HeroSlider,
        RichTextBlock,
        ImageGallery,
        ProductGrid,
        ContactForm,
        VideoEmbed,
        CoreValues,
        CertificatesGrid,
        CTABar,
        TwoColumnContent,
      ],
    },
  ],
}
