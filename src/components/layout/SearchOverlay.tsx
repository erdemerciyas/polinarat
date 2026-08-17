'use client'

import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'

type SearchResult = {
  type: 'page' | 'news' | 'product' | 'equipment' | 'machine' | 'mould'
  title: string
  excerpt?: string
  href: string
}

const TYPE_LABELS: Record<string, Record<string, string>> = {
  page: { en: 'Page', de: 'Seite' },
  news: { en: 'News', de: 'Nachrichten' },
  product: { en: 'Product', de: 'Produkt' },
  mould: { en: 'Mould', de: 'Form' },
  machine: { en: 'Machine', de: 'Maschine' },
  equipment: { en: 'Equipment', de: 'Ausrüstung' },
}

const pageIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
)
const newsIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5" />
  </svg>
)
const productIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
  </svg>
)
const toolIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
  </svg>
)

const TYPE_ICONS: Record<string, ReactNode> = {
  page: pageIcon,
  news: newsIcon,
  product: productIcon,
  mould: productIcon,
  machine: toolIcon,
  equipment: toolIcon,
}

const PLACEHOLDERS: Record<string, string> = {
  en: 'Search pages, news, products…',
  de: 'Seiten, Nachrichten, Produkte suchen…',
}

const EMPTY: Record<string, string> = {
  en: 'No results found',
  de: 'Keine Ergebnisse gefunden',
}

const HINT: Record<string, string> = {
  en: 'Type at least 2 characters',
  de: 'Mindestens 2 Zeichen eingeben',
}

export function SearchOverlay({ open, onClose, locale }: { open: boolean; onClose: () => void; locale: string }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (open) {
      setQuery('')
      setResults([])
      setActiveIdx(-1)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const search = useCallback(
    (q: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (q.trim().length < 2) {
        setResults([])
        setLoading(false)
        return
      }
      setLoading(true)
      debounceRef.current = setTimeout(async () => {
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&locale=${locale}`)
          const data = await res.json()
          setResults(data.results || [])
        } catch {
          setResults([])
        }
        setLoading(false)
      }, 250)
    },
    [locale],
  )

  function handleInputChange(val: string) {
    setQuery(val)
    setActiveIdx(-1)
    search(val)
  }

  function navigate(href: string) {
    onClose()
    router.push(href)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((prev) => (prev < results.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((prev) => (prev > 0 ? prev - 1 : results.length - 1))
    } else if (e.key === 'Enter' && activeIdx >= 0 && results[activeIdx]) {
      e.preventDefault()
      navigate(results[activeIdx].href)
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!open) return null

  const lang = locale === 'de' ? 'de' : 'en'

  return (
    <div className="search-overlay-backdrop" onClick={onClose}>
      <div
        className="search-overlay-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Search"
      >
        {/* Search input */}
        <div className="search-overlay-input-wrap">
          <svg className="w-5 h-5 text-body-tertiary flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={PLACEHOLDERS[lang]}
            className="search-overlay-input"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="search-overlay-kbd">ESC</kbd>
        </div>

        {/* Results */}
        <div className="search-overlay-results">
          {loading && (
            <div className="search-overlay-status">
              <span className="inline-block w-4 h-4 border-2 border-polinar-mustard/30 border-t-polinar-mustard rounded-full animate-spin" />
            </div>
          )}

          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="search-overlay-status">
              <p className="text-body-tertiary text-sm font-body">{EMPTY[lang]}</p>
            </div>
          )}

          {!loading && query.length < 2 && (
            <div className="search-overlay-status">
              <p className="text-body-tertiary text-sm font-body">{HINT[lang]}</p>
            </div>
          )}

          {results.map((r, idx) => (
            <button
              key={`${r.type}-${r.href}`}
              className={`search-overlay-item ${idx === activeIdx ? 'search-overlay-item--active' : ''}`}
              onClick={() => navigate(r.href)}
              onMouseEnter={() => setActiveIdx(idx)}
            >
              <span className="search-overlay-item-icon">
                {TYPE_ICONS[r.type]}
              </span>
              <span className="flex-1 min-w-0">
                <span className="search-overlay-item-title">{r.title}</span>
                {r.excerpt && (
                  <span className="search-overlay-item-excerpt">{r.excerpt}</span>
                )}
              </span>
              <span className="search-overlay-item-badge">{TYPE_LABELS[r.type]?.[lang] || r.type}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
