import { AuthSession } from '../types/auth'

const SESSION_KEY = '@retail/auth_session'

type AsyncStorageLike = {
  getItem: (key: string) => Promise<string | null>
  setItem: (key: string, value: string) => Promise<void>
  removeItem: (key: string) => Promise<void>
}

let memorySession: AuthSession | null = null
let storageChecked = false
let nativeStorageAvailable = false
let asyncStorageModule: AsyncStorageLike | null = null

async function getAsyncStorage(): Promise<AsyncStorageLike | null> {
  if (asyncStorageModule) return asyncStorageModule
  try {
    const mod = await import('@react-native-async-storage/async-storage')
    asyncStorageModule = mod.default
    return asyncStorageModule
  } catch {
    return null
  }
}

async function ensureStorageReady(): Promise<boolean> {
  if (storageChecked) return nativeStorageAvailable

  storageChecked = true
  const AsyncStorage = await getAsyncStorage()
  nativeStorageAvailable = AsyncStorage != null
  return nativeStorageAvailable
}

export async function saveAuthSession(session: AuthSession): Promise<void> {
  memorySession = session
  if (!(await ensureStorageReady())) return

  const AsyncStorage = await getAsyncStorage()
  if (!AsyncStorage) return

  try {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    // Native modul ulanmagan — faqat xotirada saqlanadi
  }
}

export async function loadAuthSession(): Promise<AuthSession | null> {
  if (memorySession) return memorySession

  if (!(await ensureStorageReady())) return null

  const AsyncStorage = await getAsyncStorage()
  if (!AsyncStorage) return null

  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AuthSession
    memorySession = parsed
    return parsed
  } catch {
    try {
      await AsyncStorage.removeItem(SESSION_KEY)
    } catch {
      // ignore
    }
    return null
  }
}

export async function clearAuthSession(): Promise<void> {
  memorySession = null

  if (!(await ensureStorageReady())) return

  const AsyncStorage = await getAsyncStorage()
  if (!AsyncStorage) return

  try {
    await AsyncStorage.removeItem(SESSION_KEY)
  } catch {
    // ignore
  }
}
