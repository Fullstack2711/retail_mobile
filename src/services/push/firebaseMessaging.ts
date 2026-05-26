import { Platform, PermissionsAndroid } from 'react-native'
import { devLog } from '../../utils/devLog'
import { getMessagingModule } from './firebaseNative'

export async function ensureNotificationPermission(): Promise<boolean> {
  const messaging = getMessagingModule()
  if (!messaging) return false

  try {
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission()
      return (
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
      )
    }

    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      )
      return result === PermissionsAndroid.RESULTS.GRANTED
    }

    return true
  } catch (err) {
    devLog('[Firebase] Bildirishnoma ruxsati:', err)
    return false
  }
}

export async function fetchFirebaseDeviceToken(): Promise<string | null> {
  const messaging = getMessagingModule()
  if (!messaging) return null

  try {
    const permitted = await ensureNotificationPermission()
    if (!permitted) {
      devLog('[Firebase] Bildirishnoma ruxsati berilmadi')
      return null
    }
    const token = await messaging().getToken()
    return token || null
  } catch (err) {
    devLog('[Firebase] Token olish:', err)
    return null
  }
}
