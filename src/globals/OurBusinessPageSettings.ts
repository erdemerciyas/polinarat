import type { GlobalConfig } from 'payload'
import { revalidateGlobal } from '@/hooks/revalidateOnChange'
import { seoFields } from '@/fields/seoFields'

export const OurBusinessPageSettings: GlobalConfig = {
  slug: 'our-business-page-settings',
  label: 'Our Business Page',
  admin: {
    group: 'Pages',
    description: 'Our Business landing page SEO settings',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobal],
  },
  fields: [
    seoFields,
  ],
}
