import { fetchFirebaseDeviceToken } from './firebaseMessaging'
import { getMessagingModule } from './firebaseNative'
import { registerFirebaseTokenOnServer } from './firebaseTokenApi'
import { getAuthToken } from '../api/client'
import { ApiError } from '../api/errors'
import { devLog } from '../../utils/devLog'

export async function syncFirebaseTokenWithBackend(): Promise<void> {
  devLog('[Firebase] Token sinxronizatsiyasi boshlandi')

  if (!getMessagingModule()) {
    devLog('[Firebase] So‘rov yo‘q: native modul ulanmagan')
    return
  }

  if (!getAuthToken()) {
    devLog('[Firebase] So‘rov yo‘q: auth token o‘rnatilmagan')
    return
  }

  let token: string | null
  try {
    token = await fetchFirebaseDeviceToken()
  } catch (err) {
    devLog('[Firebase] Token olishda kutilmagan xato:', err)
    return
  }

  if (!token) {
    devLog('[Firebase] So‘rov yo‘q: FCM token olinmadi (ruxsat yoki Firebase config)')
    return
  }

  devLog('[Firebase] FCM token olindi, uzunligi:', token.length)

  try {
    await registerFirebaseTokenOnServer(token)
    devLog('[Firebase] POST /mobile/user/firebase_token/ — muvaffaqiyat')
  } catch (err) {
    if (err instanceof ApiError) {
      devLog('[Firebase] Serverga yuborish xatosi:', err.status, err.message)
    } else {
      devLog('[Firebase] Serverga yuborish xatosi:', err)
    }
  }
}

export function subscribeFirebaseTokenRefresh(
  onToken: (token: string) => void | Promise<void>,
): () => void {
  const messaging = getMessagingModule()
  if (!messaging) return () => {}

  try {
    return messaging().onTokenRefresh((token) => {
      devLog('[Firebase] Token yangilandi, qayta yuborish')
      void onToken(token)
    })
  } catch (err) {
    devLog('[Firebase] Token refresh obunasi xatosi:', err)
    return () => {}
  }
}
