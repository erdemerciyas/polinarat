import type { ReactNode } from 'react'

/**
 * Shell only: each route group supplies its own document.
 * - `(frontend)/layout` → site <html> / <body> (fonts, GSC, globals)
 * - `(payload)/layout` → Payload RootLayout (admin <html> / <body>)
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children
}
