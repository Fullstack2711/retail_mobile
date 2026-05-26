import { BASE_URL } from '../config/env'

/** API dan kelgan rasm manzilini to‘liq URL ga aylantiradi */
export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (url == null) return null
  const trimmed = url.trim()
  if (!trimmed) return null
  if (/^https?:\/\//i.test(trimmed)) return trimmed

  const base = BASE_URL.replace(/\/$/, '')
  if (trimmed.startsWith('/')) return `${base}${trimmed}`
  return `${base}/media/${trimmed}`
}

/** MinIO presigned URL muddati tugaganini tekshiradi (X-Amz-Expires) */
export function isPresignedUrlExpired(url: string): boolean {
  try {
    const params = new URL(url).searchParams
    const dateRaw = params.get('X-Amz-Date')
    const expiresRaw = params.get('X-Amz-Expires')
    if (!dateRaw || !expiresRaw) return false

    const match = dateRaw.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/)
    if (!match) return false

    const [, y, mo, d, h, mi, s] = match
    const started = Date.UTC(
      Number(y),
      Number(mo) - 1,
      Number(d),
      Number(h),
      Number(mi),
      Number(s),
    )
    const ttlMs = Number(expiresRaw) * 1000
    if (!Number.isFinite(ttlMs)) return false

    return Date.now() >= started + ttlMs - 60_000
  } catch {
    return false
  }
}

export function shouldRefreshMediaUrl(url: string | null | undefined): boolean {
  if (!url) return true
  if (!/^https?:\/\//i.test(url)) return true
  return isPresignedUrlExpired(url)
}
