/**
 * Converts CMS / Payload trees into JSON-safe structures for Server → Client props.
 * Avoids RSC serialization failures (Date, BigInt, nested class instances, etc.).
 */
export function toClientProps<T>(value: T | null | undefined): T | null {
  if (value == null) return null
  try {
    return JSON.parse(
      JSON.stringify(value, (_key, v) => (typeof v === 'bigint' ? String(v) : v)),
    ) as T
  } catch {
    return null
  }
}
