# Polinar Google SEO Entegrasyonu — Geliştirme Notları

**Tarih:** 11 Mayıs 2026
**Proje:** Polinar Next.js + Payload CMS

---

## Yapılan İşlemler

### 1. SEO Core İyileştirmeler

#### `src/lib/seo.tsx` — JSON-LD ve SEO Yardımcıları
- `ogLocaleMap`'e `ru: 'ru_RU'` eklendi (locales.json'da ru locale vardı)
- `videoObjectJsonLd(locale)` — VideoObject schema eklendi
- `faqPageJsonLd(faqs)` — FAQPage schema eklendi
- `newsArticleJsonLd()` — `author` alanı eklendi, gereksiz `locale` parametresi kaldırıldı
- `productJsonLd()` — `price` ve `availability` ile `offers` schema eklendi
- `localBusinessJsonLd()` — SiteSettings'den dinamik veri çekecek şekilde güncellendi (openingHours, priceRange, sosyal medya linkleri)

#### `src/app/robots.ts`
- `NEXT_PUBLIC_SITE_URL` olmadığında `http://localhost:3000` fallback kaldırıldı → artık hata fırlatır

#### `src/app/sitemap.ts`
- Statik sayfalar için bireysel `changeFrequency` ve `priority` ayarlandı:
  - `/` → `daily`, `1.0`
  - `/about` → `monthly`, `0.8`
  - `/news` → `weekly`, `0.9`
  - `/contact` → `monthly`, `0.7`
  - `/our-business` → `weekly`, `0.9`

---

### 2. Google Search Console Entegrasyonu

#### `src/app/layout.tsx`
- GSC meta verification tag artık **admin panelden** yönetiliyor
- `getGscToken()` fonksiyonu Payload CMS'den `site-settings.googleIntegration.gscVerificationToken` okur
- `.env`'de `NEXT_PUBLIC_GSC_VERIFICATION_TOKEN` varsa fallback olarak çalışır

---

### 3. IndexNow Entegrasyonu

#### `src/app/api/indexnow/route.ts` (YENİ DOSYA)
- POST endpoint — CMS'de içerik değiştiğinde Google/Bing'e anlık indeksleme sinyali gönderir
- API key ve enabled durumu **admin panelden** okunur (SiteSettings → googleIntegration.indexNow)
- `.env`'de `INDEXNOW_API_KEY` varsa fallback olarak kullanılır

#### `src/hooks/revalidateOnChange.ts`
- `revalidateCollection` hook'u güncellendi → her CMS kayıt değişikliğinde otomatik olarak IndexNow POST tetiklenir

---

### 4. Admin Panel Yapısı — Yeni Alanlar

#### `src/globals/AboutPageSettings.ts`
- **FAQ Section** — `faq.items[]` (question + answer, localized)
- **Video uploadDate** — VideoObject schema için tarih alanı

#### `src/globals/SiteSettings.ts`
- **Contact → Opening Hours** — `openingHours[]` (dayOfWeek, opens, closes) — LocalBusiness JSON-LD
- **Contact → Price Range** — `$`, `$$`, `$$$`, `$$$$` — LocalBusiness JSON-LD
- **FAQ Section** — `faq.items[]` — site geneli FAQ verisi
- **Google Integration** (YENİ GRUPLAR):
  - `googleIntegration.gscVerificationToken` — GSC HTML meta tag token
  - `googleIntegration.indexNow.apiKey` — IndexNow API key
  - `googleIntegration.indexNow.enabled` — toggle (varsayılan açık)

---

### 5. Sayfa Entegrasyonları

#### `src/app/(frontend)/[locale]/about/page.tsx`
- `videoObjectJsonLd(locale)` — video varsa VideoObject JSON-LD eklenir
- `faqPageJsonLd()` — AboutPageSettings'deki `faq.items`'den FAQPage schema eklenir

#### `src/app/(frontend)/[locale]/contact/page.tsx`
- `localBusinessJsonLd(locale, siteSettings)` — SiteSettings'den dinamik verilerle zenginleştirildi

#### `src/app/(frontend)/[locale]/news/[slug]/page.tsx`
- `newsArticleJsonLd()` — `locale` parametresi kaldırıldı (type error düzeltildi)

---

### 6. Web Vitals İzleme

#### `src/app/(frontend)/[locale]/layout.tsx`
- `@vercel/analytics` eklendi (`inject()` çağrıldı)
- Google Search Console'da Core Web Vitals verilerini izlemek için gerçek kullanıcı verisi (RUM) toplar

---

## Admin Paneli Kullanımı

### Google Search Console Doğrulaması
1. GSC'de "HTML meta tag" yöntemini seç
2. Karşınıza çıkan token'ı kopyala
3. **Settings → Site Settings → Google Integration → GSC Verification Token** yapıştır
4. Kaydet → GSC'de "Doğrula" tıkla

### IndexNow Kurulumu
1. https://www.indexnow.org adresinden API key al
2. **Settings → Site Settings → Google Integration → IndexNow → API Key** yapıştır
3. Token'ı public köke yükle: `/public/{apiKey}.txt` (IndexNow kurallarına göre)
4. **Enable IndexNow** açık kalsın

---

## Ortam Değişkenleri (.env)

Hâlâ desteklenen fallback değişkenleri:

```env
NEXT_PUBLIC_SITE_URL=https://www.polinar.at
NEXT_PUBLIC_GSC_VERIFICATION_TOKEN=...  # Admin panelde yoksa kullanılır
INDEXNOW_API_KEY=...                    # Admin panelde yoksa kullanılır
```

---

## Önemli Notlar

- `src/lib/seo.tsx` **.tsx** uzantılı (JSX içerir — .ts olarak çalışmaz)
- Payload CMS'de `revalidatePath` hatası alırsanız normal — sadece cache invalidation atlanır, veri yazılır
- Admin panelden FAQ ve video eklemek için ilgili global'in içindeki bölümü bul
- TypeScript check: `npx tsc --noEmit` (temiz olmalı)