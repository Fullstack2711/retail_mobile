import { BASE_URL } from '../../config/env'
import { AuthSession, TokenResponse } from '../../types/auth'
import { resolveMediaUrl } from '../../utils/resolveMediaUrl'
import { ApiError, parseApiError } from '../api/errors'
import { fetchWithTimeout } from '../api/http'
import { setAuthToken } from '../api/client'

function buildDisplayName(info: TokenResponse['user_info']) {
  const parts = [info.first_name, info.last_name].filter(Boolean)
  if (parts.length > 0) return parts.join(' ')
  return info.username
}

export function mapTokenToSession(data: TokenResponse): AuthSession {
  const roleName = data.user_info?.role?.name ?? ''
  return {
    accessToken: data.access_token,
    tokenType: data.token_type,
    userId: data.user_id,
    username: data.username,
    roleName,
    companyId: data.user_info.company_id ?? data.user_info.company?.id ?? null,
    branchId: data.user_info.branch_id ?? null,
    user: {
      id: data.user_info.id,
      name: buildDisplayName(data.user_info),
      phone: data.user_info.phone ?? '',
      email: data.user_info.email,
      username: data.user_info.username,
      image: resolveMediaUrl(data.user_info.image),
      companyName: data.user_info.company?.name ?? null,
      roleName,
    },
  }
}

/** RN da URLSearchParams ba'zan muammo beradi — qo‘lda encode */
function buildFormBody(username: string, password: string): string {
  return `username=${encodeURIComponent(username.trim())}&password=${encodeURIComponent(password.trim())}`
}

export async function loginWithCredentials(
  username: string,
  password: string,
): Promise<AuthSession> {
  const url = `${BASE_URL}/token`
  const formBody = buildFormBody(username, password)

  let response: Response
  try {
    response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: formBody,
    })
  } catch (err) {
    if (err instanceof ApiError) throw err
    throw new ApiError(
      'Serverga ulanib bo‘lmadi. Internet va server manzilini tekshiring.',
      0,
    )
  }

  if (!response.ok) {
    const message = await parseApiError(response, 'login')
    throw new ApiError(message, response.status)
  }

  const data = (await response.json()) as TokenResponse
  const session = mapTokenToSession(data)
  setAuthToken(session.accessToken)
  return session
}

export function applySession(session: AuthSession) {
  setAuthToken(session.accessToken)
}

export function clearSession() {
  setAuthToken(null)
}

export function mergeSessionProfile(
  session: AuthSession,
  updates: { name: string; phone: string; image?: string | null },
): AuthSession {
  return {
    ...session,
    user: {
      ...session.user,
      name: updates.name,
      phone: updates.phone,
      ...(updates.image !== undefined ? { image: updates.image } : {}),
    },
  }
}
