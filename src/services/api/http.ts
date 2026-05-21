import { ApiError } from './errors'

export const REQUEST_TIMEOUT_MS = 30_000

export async function fetchWithTimeout(
  url: string,
  init?: RequestInit,
  timeoutMs = REQUEST_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ApiError('So‘rov vaqti tugadi. Qayta urinib ko‘ring.', 0)
    }
    throw err
  } finally {
    clearTimeout(timeoutId)
  }
}
