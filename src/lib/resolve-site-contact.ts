/** Merge Site Settings → Contact with static-labels fallbacks (single source: CMS when set). */

export type SiteContactInput = {
  email?: string | null
  phone?: string | null
  fax?: string | null
  address?: string | null
  googleMapsEmbed?: string | null
} | null | undefined

export type StaticCompanyFallback = {
  phones: string[]
  fax: string
  email: string
  address: string
  mapUrl: string
}

export function phonesFromCmsField(phone: string | null | undefined): string[] {
  if (!phone?.trim()) return []
  return phone
    .split(/\n/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function cmsHasContactGroup(contact: SiteContactInput): boolean {
  return contact != null && typeof contact === 'object'
}

export function resolveSiteContact(
  contact: SiteContactInput,
  fallback: StaticCompanyFallback,
  options?: { addressPageFallback?: string | null },
): {
  phones: string[]
  fax: string
  email: string
  address: string
  mapUrl: string
} {
  const cmsPhones = phonesFromCmsField(contact?.phone)
  const phones = cmsPhones.length > 0 ? cmsPhones : fallback.phones
  const fax = cmsHasContactGroup(contact) ? (contact!.fax ?? '').trim() : fallback.fax
  const email = contact?.email?.trim() || fallback.email
  const address =
    contact?.address?.trim() ||
    options?.addressPageFallback?.trim() ||
    fallback.address
  const mapUrl =
    contact?.googleMapsEmbed?.trim() ||
    (address ? `https://www.google.com/maps/embed?pb=!4m2!1m0!1m0!2m1!1a${encodeURIComponent(address)}!2m2!1m1!1s0x0%3A0x0!3m1!1m2!4m2!3m1!1m2!2m1!1b1!4m2!3m1!1m2!2m1!1b1` : '') ||
    fallback.mapUrl

  return { phones, fax, email, address, mapUrl }
}

export type SiteSocialInput = {
  facebook?: string | null
  instagram?: string | null
  youtube?: string | null
  linkedin?: string | null
  twitter?: string | null
} | null | undefined

/** Prefer CMS URLs; order matches common footer icon layout. */
export function resolveSocialLinks(
  social: SiteSocialInput,
  fallback: { name: string; url: string }[],
): { name: string; url: string }[] {
  if (!social || typeof social !== 'object') return fallback
  const out: { name: string; url: string }[] = []
  const pairs: [string, keyof NonNullable<Exclude<SiteSocialInput, null | undefined>>][] = [
    ['Facebook', 'facebook'],
    ['Instagram', 'instagram'],
    ['YouTube', 'youtube'],
    ['LinkedIn', 'linkedin'],
    ['Twitter', 'twitter'],
  ]
  for (const [name, key] of pairs) {
    const raw = social[key]
    const u = typeof raw === 'string' ? raw.trim() : ''
    if (u) out.push({ name, url: u })
  }
  return out.length > 0 ? out : fallback
}
