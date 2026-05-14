/**
 * Normalize Payload/CMS fields that may be a plain string, Lexical JSON, or bad overlay types.
 * Prevents TypeError from `.slice` on objects and React "invalid child" errors when rendering.
 */
export function lexicalLikeToPlainText(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (typeof value !== 'object') return ''

  const parts: string[] = []
  const walk = (node: unknown): void => {
    if (node == null) return
    if (typeof node === 'string') {
      parts.push(node)
      return
    }
    if (typeof node === 'number' || typeof node === 'boolean') {
      parts.push(String(node))
      return
    }
    if (typeof node !== 'object') return
    const n = node as Record<string, unknown>
    if (typeof n.text === 'string') parts.push(n.text)
    const children = n.children
    if (Array.isArray(children)) {
      for (const c of children) walk(c)
    }
  }

  const obj = value as Record<string, unknown>
  if (obj.root != null && typeof obj.root === 'object') walk(obj.root)
  else walk(obj)

  return parts.join(' ').replace(/\s+/g, ' ').trim()
}

export function cmsPlainSnippet(value: unknown, maxLen: number): string {
  const s = lexicalLikeToPlainText(value)
  if (!s) return ''
  return s.length <= maxLen ? s : s.slice(0, maxLen)
}
