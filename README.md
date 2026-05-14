# Polinar

Corporate website for **Polinar** — a plastic injection mould and pipe fittings manufacturer. Built with **Next.js 15**, **Payload CMS 3**, **PostgreSQL**, and **Cloudinary** media storage.

| | |
|--|--|
| **Repository** | [github.com/erdemerciyas/polinarat](https://github.com/erdemerciyas/polinarat) |
| **Maintainer** | [@erdemerciyas](https://github.com/erdemerciyas) |
| **Production** | [www.polinar.com.tr](https://www.polinar.com.tr) |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| UI | React 19, Tailwind CSS 3, Framer Motion |
| CMS | Payload CMS 3 (admin at `/admin`) |
| Database | PostgreSQL (Neon) via `@payloadcms/db-postgres` |
| Media Storage | Cloudinary (`payloadcms-storage-cloudinary`, `@payloadcms/plugin-cloud-storage`) |
| Rich Text | Lexical Editor (`@payloadcms/richtext-lexical`) |
| SEO | `@payloadcms/plugin-seo`, JSON-LD, dynamic sitemap |
| AI Chatbot | Google Vertex AI (Gemini) |
| PDF Catalogs | pdf-lib |
| Image Processing | Sharp |
| Language | TypeScript 5 |
| Analytics | `@vercel/analytics` (production on Vercel) |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- **Node.js** 20.9 or newer (see `engines` in `package.json`)
- **PostgreSQL** database (e.g. [Neon](https://neon.tech))
- **Cloudinary** account for media storage
- **npm** (or compatible package manager)

### Installation

```bash
git clone https://github.com/erdemerciyas/polinarat.git
cd polinarat
npm install
```

`payloadcms-storage-cloudinary` pins an older nested `payload` in its own metadata; this repo uses **npm `overrides`** so all Payload packages resolve to a single version. Use **npm** (not necessarily `pnpm`/`yarn`) unless you replicate the same override behaviour.

### Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `PAYLOAD_SECRET` | Secret key for Payload auth/encryption |
| `GOOGLE_VERTEX_API_KEY` | Google Vertex AI API key (for chatbot) |
| `GOOGLE_VERTEX_MODEL` | Gemini model name (default: `gemini-2.5-flash`) |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (e.g. `https://www.polinar.com.tr`) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `PAYLOAD_REQUIRE_DEV_PUSH_MIGRATION_CONFIRM` | Optional: set to `true` to restore Payload’s interactive “dev push / data loss” migration prompt (defaults off so `next build` never hangs on Vercel). |

### Payload migrations on Vercel

`next build` runs **`prodMigrations`** against `DATABASE_URL`. If `payload-migrations` contains a dev-schema marker (**batch `-1`**), upstream Payload reads stdin for confirmation and **non‑TTY builds hang forever**.

This repo patches `@payloadcms/drizzle` so confirmation **defaults to automatic**. Use **`PAYLOAD_REQUIRE_DEV_PUSH_MIGRATION_CONFIRM=true`** only when you intentionally want the prompt (manual CLI against prod).

### Development

```bash
npm run dev
```

The app starts at [http://localhost:3000](http://localhost:3000) and the admin panel is available at [http://localhost:3000/admin](http://localhost:3000/admin).

### Seed Data

Populate the database with initial content and a default admin user:

```bash
npm run seed
```

> **Warning:** The seed script creates a default admin account. Change credentials before deploying to production.

### Build & Production

```bash
npm run build
npm run start
```

## Project Structure

```
src/
├── app/
│   ├── (frontend)/[locale]/   # Public pages with locale prefix
│   ├── (payload)/admin/       # Payload CMS admin panel
│   └── api/                   # API routes (contact, chatbot, newsletter, search, merge-catalogs)
├── blocks/                    # CMS block components (Hero, RichText, Gallery, …)
├── collections/               # Payload collections (Users, Media, News, Pages, …)
├── globals/                   # Payload globals (navigation, footer, site settings, …)
├── components/                # Shared UI components
│   ├── layout/                # Header, Footer, MegaMenu, MobileMenu, SearchOverlay
│   ├── catalog/               # Digital catalog viewer (PDF rendering, merge, download)
│   ├── ui/                    # ScrollReveal and other primitives
│   └── chatbot/               # AI ChatWidget
├── data/                      # Static locale-aware content modules
│   ├── static-labels/         # Shared translatable strings
│   ├── injection-moulds/      # Product page data
│   ├── machinery/             # Product page data
│   ├── plastic-test-equipment/# Product page data
│   └── locale-loader.ts       # createLocaleLoader utility
├── fields/                    # Reusable Payload field definitions
├── hooks/                     # Payload hooks (revalidation, etc.)
├── lib/                       # Utilities (payload client, SEO, chatbot, locales)
├── migrations/                # Database migrations
└── middleware.ts              # Locale detection & route prefixing

scripts/                       # i18n tooling, media migration, page scaffolding
seed/                          # Database seeding
payload.config.ts              # Payload CMS configuration
next.config.ts                 # Next.js configuration
tailwind.config.ts             # Tailwind CSS configuration
```

## Internationalization (i18n)

Polinar supports **English (en)**, **Turkish (tr)**, **German (de)**, **Arabic (ar)**, and **Russian (ru)** — configured in `src/lib/locales.json`. Locales are dynamic: editing the `Languages` collection in the admin panel rewrites `locales.json` and Payload's locale config on the next server boot.

Content is managed through two systems:

### CMS Content

Translated fields on Payload collections and globals. Managed via the admin panel at `/admin`.

### Static Content

Locale-aware data modules under `src/data/{page-slug}/`:

```
src/data/{page-slug}/
  types.ts    — TypeScript type definition
  en.ts       — English content (source of truth)
  tr.ts       — Turkish translation
  de.ts       — German translation
  ar.ts       — Arabic translation
  ru.ts       — Russian translation
  index.ts    — Loader with EN fallback
```

Static content is delivered through `src/lib/getDictionary.ts`, which loads `public/locales/{locale}.json` overlays and deep-merges them onto Payload globals at request time, preserving CMS-managed media references.

Scaffold a new static page:

```bash
npm run i18n:create-page {slug}
```

### i18n Scripts

| Script | Description |
|--------|-------------|
| `npm run i18n:import` | Import translations into CMS |
| `npm run i18n:export` | Export CMS translations |
| `npm run i18n:validate` | Validate translation completeness |
| `npm run i18n:scaffold` | Scaffold CMS translation keys |
| `npm run i18n:scaffold-static` | Scaffold static translation files |
| `npm run i18n:create-page` | Generate a new static page module |

## Key Features

- **Dynamic CMS Pages** — block-based page builder (hero slider, rich text, gallery, product grid, video, contact form)
- **Product Pages** — injection moulds, machinery, plastic test equipment with locale-aware static data and per-category color themes (gold, steel, cyan)
- **Digital Catalog Viewer** — in-browser PDF catalog reader with zoom, print, download, and multi-catalog merge via `pdf-lib`
- **Site Search** — full-text search overlay across CMS pages, news, and static product data (`/api/search`)
- **News & Articles** — CMS-managed with SEO metadata and drag-enabled news slider
- **About Page** — Cloudinary-hosted gallery, video player, scroll-triggered counter animations with corner accents and glow effects
- **Contact Page** — floating-label form posts to `/api/contact`; submissions are saved to Payload (**Contact Messages** / `contact-submissions`) and reviewed in `/admin` — no outbound SMTP is wired by default
- **Newsletter** — subscription management
- **AI Chatbot** — Google Vertex AI (Gemini)-powered support widget
- **Cloudinary Media** — all media assets stored and served via Cloudinary CDN
- **SEO** — per-page meta, Open Graph, JSON-LD structured data, auto-generated sitemap & robots.txt
- **RTL Support** — automatic `dir="rtl"` for Arabic locale
- **Mega Menu** — CMS-driven navigation with category-themed cards, responsive robot CTA panel, and mobile menu
- **Scroll Animations** — Framer Motion powered reveal effects with staggered entry, blur-to-sharp transitions
- **Core Values Section** — clean card grid with auto-rotating subtitle carousel that cycles through business areas (moulds, machinery, testing) using existing localized CMS data, animated nested octagon SVG background, and hover-triggered icon/title transitions
- **Design System** — extended Tailwind config with custom color tokens (moulds-gold, machinery-steel, pte-cyan), asymmetric dividers, and reusable CSS utility classes
- **25th Anniversary Branding** — adaptive "25 YEARS" badge in the header that dynamically changes color based on scroll state (transparent → white, scrolled gold bar → semi-transparent black, white surface → black)
- **Patterned Mustard Background** — the Polinar mustard accent color (`polinar-mustard`) is enhanced with a subtle triangular brand pattern applied through `/images/mustard-bg.png`, automatically inherited by every `bg-polinar-mustard` surface (primary buttons, active tabs, search icons, contact CTA)

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Create production build |
| `npm run start` | Start production server on port 3000 |
| `npm run lint` | Run ESLint |
| `npm run generate:types` | Generate Payload TypeScript types |
| `npm run seed` | Seed database with initial data |
| `npm run seed:about-images` | Upload about page images to Cloudinary |

## Deployment

This project is deployed on **Vercel**. Environment variables must be configured in the Vercel dashboard:

1. Import or connect this repo: [erdemerciyas/polinarat](https://github.com/erdemerciyas/polinarat)
2. Go to your Vercel project settings → Environment Variables
3. Add all variables from `.env.example`
4. Set `NEXT_PUBLIC_SITE_URL` to your production domain
5. Pushes to `main` trigger automatic deployments (when Git integration is enabled)

Ensure `npm install` runs on Vercel (default) so **`patch-package`** applies [`patches/@payloadcms+drizzle+3.84.1.patch`](patches/@payloadcms+drizzle+3.84.1.patch). After upgrading `@payloadcms/drizzle`, regenerate or remove that patch if install fails.

## License

All rights reserved.
