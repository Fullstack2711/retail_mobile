import { NativeModules, Platform, TurboModuleRegistry } from 'react-native'
import { devLog } from '../../utils/devLog'

type MessagingDefault = typeof import('@react-native-firebase/messaging').default

let messagingModule: MessagingDefault | null | undefined
let loadAttempted = false

const rebuildHint =
  Platform.OS === 'ios'
    ? 'npm run ios (Simulator uchun to‘liq rebuild)'
    : 'npm run android (to‘liq rebuild)'

function detectRnfbAppModule(): boolean {
  if (NativeModules.RNFBAppModule) return true
  try {
    return TurboModuleRegistry.get('RNFBAppModule') != null
  } catch {
    return false
  }
}

export function isFirebaseNativeReady(): boolean {
  if (messagingModule) return true
  return detectRnfbAppModule()
}

export function getMessagingModule(): MessagingDefault | null {
  if (messagingModule !== undefined) {
    return messagingModule
  }
  if (loadAttempted) {
    return null
  }
  loadAttempted = true

  if (!detectRnfbAppModule()) {
    devLog(`[Firebase] RNFBAppModule yo‘q (${rebuildHint})`)
    messagingModule = null
    return null
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const loaded = require('@react-native-firebase/messaging').default as
      | MessagingDefault
      | undefined
    messagingModule = loaded ?? null
    return messagingModule
  } catch (err) {
    devLog(`[Firebase] messaging yuklanmadi (${rebuildHint}):`, err)
    messagingModule = null
    return null
  }
}
