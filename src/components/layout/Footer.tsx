'use client'

import Image from 'next/image'
import { getStaticLabels } from '@/data/static-labels'
import type { SiteContactInput, SiteSocialInput } from '@/lib/resolve-site-contact'
import { resolveSiteContact, resolveSocialLinks } from '@/lib/resolve-site-contact'

type FooterData = {
  labels?: {
    addressLabel?: string
    phoneFaxLabel?: string
    emailLabel?: string
    newsletterLabel?: string
    subscribeButton?: string
    namePlaceholder?: string
    emailPlaceholder?: string
  }
  copyrightText?: string
}

function SocialIcon({ name }: { name: string }) {
  const cls = 'w-4 h-4'
  switch (name.toLowerCase()) {
    case 'linkedin':
      return (
        <svg className={cls} fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      )
    case 'instagram':
      return (
        <svg className={cls} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      )
    case 'facebook':
      return (
        <svg className={cls} fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      )
    case 'youtube':
      return (
        <svg className={cls} fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      )
    default:
      return <span className="text-xs font-display font-bold">{name[0]}</span>
  }
}

export function Footer({
  data,
  locale,
  siteContact,
  socialMedia,
}: {
  data?: FooterData | null
  locale: string
  siteContact?: SiteContactInput
  socialMedia?: SiteSocialInput
}) {
  const cmsLabels = data?.labels || {}
  const staticLabels = getStaticLabels(locale)
  const resolved = resolveSiteContact(siteContact, staticLabels.company)
  const addressLines = resolved.address.split('\n')
  const socialLinks = resolveSocialLinks(socialMedia, staticLabels.company.socialLinks)

  return (
    <footer className="relative bg-navy-deep text-white grain-overlay overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>

      <div className="relative z-10 max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="mb-12">
          <Image
            src="/brand_assets/logo.png"
            alt="Polinar"
            width={200}
            height={60}
            className="h-[60px] w-auto brightness-0 invert"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <h4 className="font-display font-bold text-sm uppercase tracking-wider mb-5 text-white/90">{cmsLabels.addressLabel || ''}</h4>
            <p className="text-white/60 font-body text-sm leading-body">
              {addressLines.map((line, i, arr) => (
                <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
              ))}
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold text-sm uppercase tracking-wider mb-5 text-white/90">{cmsLabels.phoneFaxLabel || ''}</h4>
            <div className="space-y-2 text-white/60 font-body text-sm">
              {resolved.phones.map((phone) => (
                <p key={phone}>{phone}</p>
              ))}
              {resolved.fax ? <p>{resolved.fax}</p> : null}
            </div>
          </div>

          <div>
            <h4 className="font-display font-bold text-sm uppercase tracking-wider mb-5 text-white/90">{cmsLabels.emailLabel || ''}</h4>
            <a href={`mailto:${resolved.email}`} className="text-white/60 font-body text-sm hover:text-polinar-mustard transition-colors">
              {resolved.email}
            </a>
          </div>

          <div>
            <h4 className="font-display font-bold text-sm uppercase tracking-wider mb-5 text-white/90">{cmsLabels.newsletterLabel || ''}</h4>
            <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
              <input
                type="text"
                placeholder={cmsLabels.namePlaceholder || ''}
                className="bg-white/10 border border-white/20 rounded-card-sm px-4 py-2.5 text-white text-sm font-body placeholder-white/40 focus:outline-none focus:border-polinar-mustard focus:ring-1 focus:ring-polinar-mustard/30 transition-all"
              />
              <input
                type="email"
                placeholder={cmsLabels.emailPlaceholder || ''}
                className="bg-white/10 border border-white/20 rounded-card-sm px-4 py-2.5 text-white text-sm font-body placeholder-white/40 focus:outline-none focus:border-polinar-mustard focus:ring-1 focus:ring-polinar-mustard/30 transition-all"
              />
              <button type="submit" className="btn-primary text-center">{cmsLabels.subscribeButton || ''}</button>
            </form>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 font-body text-xs">{data?.copyrightText || ''}</p>
          <div className="flex items-center gap-3">
            {socialLinks.map(({ name, url }) => (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:bg-white/20 hover:text-cyan transition-all duration-300"
                aria-label={name}
              >
                <SocialIcon name={name} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
