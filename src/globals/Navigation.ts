import type { GlobalConfig } from 'payload'
import { revalidateGlobal } from '@/hooks/revalidateOnChange'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Navigation',
  admin: {
    group: 'Layout',
    description: 'Configure header menu and mega menu structure',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobal],
  },
  fields: [
    {
      name: 'mainMenu',
      label: 'Main Menu',
      type: 'array',
      labels: { singular: 'Menu Item', plural: 'Menu Items' },
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              localized: true,
              admin: { width: '60%' },
            },
            {
              name: 'type',
              type: 'select',
              defaultValue: 'link',
              options: [
                { label: 'Simple Link', value: 'link' },
                { label: 'Mega Menu', value: 'mega' },
              ],
              admin: { width: '40%' },
            },
          ],
        },
        {
          name: 'url',
          label: 'Link URL',
          type: 'text',
          admin: {
            condition: (_data, siblingData) => siblingData?.type === 'link',
            description: 'Path like /products or full URL',
          },
        },
        {
          name: 'megaMenuColumns',
          label: 'Mega Menu Columns',
          type: 'array',
          labels: { singular: 'Column', plural: 'Columns' },
          maxRows: 4,
          admin: {
            condition: (_data, siblingData) => siblingData?.type === 'mega',
            initCollapsed: true,
          },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'columnTitle',
                  label: 'Column Title',
                  type: 'text',
                  localized: true,
                  admin: { width: '60%' },
                },
                {
                  name: 'columnType',
                  label: 'Column Type',
                  type: 'select',
                  defaultValue: 'links',
                  options: [
                    { label: 'Links List', value: 'links' },
                    { label: 'Featured Products', value: 'featuredProducts' },
                    { label: 'Image Card', value: 'imageCard' },
                  ],
                  admin: { width: '40%' },
                },
              ],
            },
            {
              name: 'links',
              type: 'array',
              labels: { singular: 'Link', plural: 'Links' },
              admin: {
                condition: (_data, siblingData) => siblingData?.columnType === 'links',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'label', type: 'text', localized: true, required: true, admin: { width: '50%' } },
                    { name: 'url', type: 'text', required: true, admin: { width: '50%' } },
                  ],
                },
                {
                  name: 'description',
                  type: 'text',
                  localized: true,
                  admin: { description: 'Short description shown in homepage cards and mega menu' },
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'icon',
                      type: 'select',
                      options: [
                        { label: 'Moulds', value: 'moulds' },
                        { label: 'Machinery', value: 'machinery' },
                        { label: 'Testing', value: 'testing' },
                      ],
                      admin: { width: '50%', description: 'Icon shown in homepage card and mega menu' },
                    },
                    {
                      name: 'image',
                      type: 'upload',
                      relationTo: 'media',
                      admin: { width: '50%', description: 'Optional image for homepage card background' },
                    },
                  ],
                },
              ],
            },
            {
              name: 'featuredProducts',
              label: 'Featured Products',
              type: 'relationship',
              relationTo: 'product-categories',
              hasMany: true,
              admin: {
                condition: (_data, siblingData) => siblingData?.columnType === 'featuredProducts',
              },
            },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              admin: {
                condition: (_data, siblingData) => siblingData?.columnType === 'imageCard',
              },
            },
            {
              name: 'imageCaption',
              label: 'Image Caption',
              type: 'text',
              localized: true,
              admin: {
                condition: (_data, siblingData) => siblingData?.columnType === 'imageCard',
              },
            },
            {
              name: 'imageLink',
              label: 'Image Link',
              type: 'text',
              admin: {
                condition: (_data, siblingData) => siblingData?.columnType === 'imageCard',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'megaMenuCTA',
      label: 'Mega Menu CTA Box',
      type: 'group',
      admin: { description: 'The "Get in Touch" call-to-action shown in mega menu overlays' },
      fields: [
        { name: 'title', type: 'text', localized: true, admin: { description: '"Get in Touch" / "Bize Ulaşın"' } },
        { name: 'description', type: 'text', localized: true, admin: { description: 'CTA description text' } },
        { name: 'button', type: 'text', localized: true, admin: { description: '"Contact Us" / "İletişim"' } },
      ],
    },
  ],
}
