import { BASE_URL } from '../../config/env'
import { UserInfo } from '../../types/auth'
import { apiRequest, getAuthToken } from '../api/client'
import { ApiError, parseApiError } from '../api/errors'
import { fetchWithTimeout } from '../api/http'

export interface PatchSellerProfileBody {
  first_name: string
  last_name?: string | null
  phone?: string | null
}

export function splitDisplayName(fullName: string): {
  first_name: string
  last_name: string | null
} {
  const trimmed = fullName.trim()
  const space = trimmed.indexOf(' ')
  if (space === -1) {
    return { first_name: trimmed, last_name: null }
  }
  return {
    first_name: trimmed.slice(0, space),
    last_name: trimmed.slice(space + 1).trim() || null,
  }
}

export function buildDisplayNameFromInfo(info: Pick<UserInfo, 'first_name' | 'last_name' | 'username'>): string {
  const parts = [info.first_name, info.last_name].filter(Boolean) as string[]
  if (parts.length > 0) return parts.join(' ')
  return info.username
}

/** PATCH body — Swagger: application/x-www-form-urlencoded */
function buildSellerPatchFormBody(body: PatchSellerProfileBody): string {
  const parts = [
    `first_name=${encodeURIComponent(body.first_name)}`,
    `last_name=${encodeURIComponent(body.last_name ?? '')}`,
  ]
  if (body.phone != null && body.phone !== '') {
    parts.push(`phone=${encodeURIComponent(body.phone)}`)
  } else {
    parts.push('phone=')
  }
  return parts.join('&')
}

/** Profil (rasm URL yangilash) — GET mavjud bo‘lsa */
export async function getSellerProfile(
  userId: number,
  companyId: number,
): Promise<UserInfo | null> {
  const query = new URLSearchParams({ company_id: String(companyId) })
  try {
    return await apiRequest<UserInfo>(`/mobile/user/sellers/${userId}?${query.toString()}`)
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 405)) {
      return null
    }
    throw err
  }
}

export async function patchSellerProfile(
  userId: number,
  companyId: number,
  body: PatchSellerProfileBody,
): Promise<UserInfo> {
  const query = new URLSearchParams({ company_id: String(companyId) })
  const url = `${BASE_URL}/mobile/user/sellers/${userId}?${query.toString()}`
  const token = getAuthToken()

  let response: Response
  try {
    response = await fetchWithTimeout(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: buildSellerPatchFormBody(body),
    })
  } catch (err) {
    if (err instanceof ApiError) throw err
    throw new ApiError('Serverga ulanib bo‘lmadi', 0)
  }

  if (!response.ok) {
    const message = await parseApiError(response, 'api')
    throw new ApiError(message, response.status)
  }

  if (response.status === 204) {
    throw new ApiError('Server javob qaytarmadi', 502)
  }

  return response.json() as Promise<UserInfo>
}
