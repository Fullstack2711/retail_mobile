import { BASE_URL } from '../../config/env'
import { getAuthToken } from '../api/client'
import { ApiError, parseApiError } from '../api/errors'
import { fetchWithTimeout } from '../api/http'
import { devLog } from '../../utils/devLog'

/**
 * POST /mobile/user/firebase_token/?firebase_token=... (Firebase.com emas, o‘z backend)
 *
 * Swagger curl bilan to‘liq mos kelish uchun bevosita `fetchWithTimeout` ishlatamiz:
 *  - `firebase_token` qo‘lda encode qilinadi (RN ning `URLSearchParams` ba'zi qurilmalarda
 *    `+` va `:` ni boshqacha kodlaydi va backend uni rad etadi)
 *  - `Content-Type: application/x-www-form-urlencoded` va bo‘sh body yuboriladi
 *    (curl `-d ''` aynan shuni qiladi). Aks holda RN POST so‘rovi `Content-Length`
 *    siz ketadi va ba'zi backendlar (FastAPI/uvicorn) uni qabul qilmaydi.
 */
export async function registerFirebaseTokenOnServer(
  firebaseToken: string,
): Promise<void> {
  const trimmed = firebaseToken.trim()
  if (!trimmed) {
    throw new ApiError('Firebase token bo‘sh', 0)
  }

  const url = `${BASE_URL}/mobile/user/firebase_token/?firebase_token=${encodeURIComponent(trimmed)}`
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded',
  }

  const authToken = getAuthToken()
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`
  }

  devLog(
    '[Firebase] Backend POST:',
    `${BASE_URL}/mobile/user/firebase_token/?firebase_token=…(${trimmed.length} belgi)`,
    authToken ? 'auth: bor' : 'auth: yo‘q',
  )

  let response: Response
  try {
    response = await fetchWithTimeout(url, {
      method: 'POST',
      headers,
      body: '',
    })
  } catch (err) {
    if (err instanceof ApiError) throw err
    devLog('[Firebase] Tarmoq xatosi:', err)
    throw new ApiError('Serverga ulanib bo‘lmadi', 0)
  }

  if (!response.ok) {
    const message = await parseApiError(response, 'api')
    devLog('[Firebase] Server javobi:', response.status, message)
    throw new ApiError(message, response.status)
  }
}
