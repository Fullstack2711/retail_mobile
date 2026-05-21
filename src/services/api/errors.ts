export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export type ApiErrorContext = 'login' | 'api'

export async function parseApiError(
  response: Response,
  context: ApiErrorContext = 'api',
): Promise<string> {
  try {
    const data = await response.json()
    if (typeof data?.detail === 'string') return data.detail
    if (Array.isArray(data?.detail)) {
      return data.detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join(', ')
    }
    if (data?.message) return String(data.message)
  } catch {
    // ignore JSON parse errors
  }
  if (response.status === 401) {
    return context === 'login'
      ? 'Login yoki parol noto‘g‘ri'
      : 'Sessiya tugadi. Qayta kiring.'
  }
  if (response.status === 404 && context === 'login') {
    return 'Login yoki parol noto‘g‘ri'
  }
  return `Server xatosi (${response.status})`
}
