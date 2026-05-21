import { BASE_URL } from '../../config/env'
import { devLog } from '../../utils/devLog'
import { fetchWithTimeout } from './http'
import { ApiError, parseApiError } from './errors'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface RequestOptions {
  method?: HttpMethod
  token?: string | null
  body?: unknown
  headers?: Record<string, string>
}

let authToken: string | null = null
let onUnauthorized: (() => void) | null = null
let unauthorizedFired = false

export function setAuthToken(token: string | null) {
  authToken = token
  if (token) unauthorizedFired = false
}

export function getAuthToken() {
  return authToken
}

/** 401 da sessiyani tozalash (AuthProvider ro‘yxatdan o‘tkazadi) */
export function setOnUnauthorized(handler: (() => void) | null) {
  onUnauthorized = handler
  if (!handler) unauthorizedFired = false
}

function handleUnauthorized() {
  if (!authToken || unauthorizedFired || !onUnauthorized) return
  unauthorizedFired = true
  onUnauthorized()
}

export async function apiRequest<T>(
  path: string,
  { method = 'GET', token, body, headers = {} }: RequestOptions = {},
): Promise<T> {
  const resolvedToken = token ?? authToken
  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  }

  if (resolvedToken) {
    requestHeaders.Authorization = `Bearer ${resolvedToken}`
  }

  let requestBody: string | undefined
  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json'
    requestBody = JSON.stringify(body)
  }

  let response: Response
  try {
    response = await fetchWithTimeout(`${BASE_URL}${path}`, {
      method,
      headers: requestHeaders,
      body: requestBody,
    })
  } catch (err) {
    if (err instanceof ApiError) throw err
    devLog('[API] Tarmoq xatosi:', path, err)
    throw new ApiError('Serverga ulanib bo‘lmadi', 0)
  }

  if (!response.ok) {
    if (response.status === 401) handleUnauthorized()
    const message = await parseApiError(response, 'api')
    throw new ApiError(message, response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}
