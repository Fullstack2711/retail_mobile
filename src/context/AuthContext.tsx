import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  ReactNode,
} from 'react'
import { isAllowedRole } from '../constants/roles'
import { AuthSession } from '../types/auth'
import {
  loginWithCredentials,
  applySession,
  clearSession,
  mergeSessionProfile,
} from '../services/auth'
import {
  getSellerProfile,
  patchSellerProfile,
  splitDisplayName,
  buildDisplayNameFromInfo,
} from '../services/profile'
import { resolveMediaUrl, shouldRefreshMediaUrl } from '../utils/resolveMediaUrl'
import { UserInfo } from '../types/auth'
import { ApiError } from '../services/api/errors'
import { setOnUnauthorized } from '../services/api/client'
import { invalidateMainScreenCaches } from '../cache/screenCache'
import { invalidateVisitorSurveyCache } from '../services/visitorSurvey'
import { invalidateStoreOwnerCache } from '../services/storeOwner/storeOwnerCache'
import {
  syncFirebaseTokenWithBackend,
  subscribeFirebaseTokenRefresh,
  registerFirebaseTokenOnServer,
} from '../services/push'
import { devLog } from '../utils/devLog'
import {
  saveAuthSession,
  loadAuthSession,
  clearAuthSession,
} from '../storage/authStorage'

export class UnsupportedRoleError extends Error {
  roleName: string

  constructor(roleName: string) {
    super(`Role not supported: ${roleName}`)
    this.name = 'UnsupportedRoleError'
    this.roleName = roleName
  }
}

interface AuthContextType {
  isLoggedIn: boolean
  isBootstrapping: boolean
  isLoading: boolean
  session: AuthSession | null
  user: AuthSession['user'] | null
  roleName: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (updates: { name?: string; phone?: string }) => Promise<void>
  refreshUserProfile: () => Promise<void>
}

function sessionFromUserInfo(session: AuthSession, info: UserInfo): AuthSession {
  return mergeSessionProfile(session, {
    name: buildDisplayNameFromInfo({
      first_name: info.first_name,
      last_name: info.last_name,
      username: info.username ?? session.username,
    }),
    phone: info.phone ?? session.user.phone ?? '',
    image: resolveMediaUrl(info.image),
  })
}

async function fetchFreshUserInfo(session: AuthSession): Promise<UserInfo> {
  if (session.companyId == null) {
    throw new ApiError('Kompaniya ID topilmadi', 400)
  }
  const { first_name, last_name } = splitDisplayName(session.user.name)
  const currentBody = {
    first_name,
    last_name,
    phone: session.user.phone,
  }
  const fromGet = await getSellerProfile(session.userId, session.companyId)
  if (fromGet) return fromGet
  return patchSellerProfile(session.userId, session.companyId, currentBody)
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const logoutRef = useRef<() => Promise<void>>(async () => {})

  useEffect(() => {
    let mounted = true

    ;(async () => {
      const BOOTSTRAP_TIMEOUT_MS = 8_000
      try {
        const stored = await Promise.race([
          loadAuthSession(),
          new Promise<null>((resolve) => {
            setTimeout(() => resolve(null), BOOTSTRAP_TIMEOUT_MS)
          }),
        ])
        if (!stored || !isAllowedRole(stored.roleName)) {
          if (stored) await clearAuthSession()
          return
        }
        const normalized: AuthSession = {
          ...stored,
          companyId: stored.companyId ?? null,
          branchId: stored.branchId ?? null,
        }
        applySession(normalized)
        if (mounted) {
          setSession(normalized)
          setIsLoggedIn(true)
          void syncFirebaseTokenWithBackend()
          if (shouldRefreshMediaUrl(normalized.user.image)) {
            fetchFreshUserInfo(normalized)
              .then((info) => {
                if (!mounted) return
                const refreshed = sessionFromUserInfo(normalized, info)
                setSession(refreshed)
                void saveAuthSession(refreshed)
              })
              .catch((err) => devLog('[Auth] Rasm URL yangilash:', err))
          }
        }
      } catch (err) {
        devLog('[Auth] Bootstrap xatosi:', err)
      } finally {
        if (mounted) setIsBootstrapping(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  const logout = useCallback(async () => {
    clearSession()
    invalidateMainScreenCaches()
    invalidateVisitorSurveyCache()
    invalidateStoreOwnerCache()
    try {
      await clearAuthSession()
    } catch {
      // ignore
    }
    setSession(null)
    setIsLoggedIn(false)
  }, [])

  logoutRef.current = logout

  useEffect(() => {
    setOnUnauthorized(() => {
      void logoutRef.current()
    })
    return () => setOnUnauthorized(null)
  }, [])

  useEffect(() => {
    if (!isLoggedIn) return
    return subscribeFirebaseTokenRefresh((token) =>
      registerFirebaseTokenOnServer(token).catch((err) =>
        devLog('[Firebase] Token yangilash:', err),
      ),
    )
  }, [isLoggedIn])

  const updateProfile = useCallback(
    async (updates: { name?: string; phone?: string }) => {
      if (!session) throw new ApiError('Sessiya topilmadi', 401)
      if (session.companyId == null) {
        throw new ApiError('Kompaniya ID topilmadi', 400)
      }
      if (updates.name !== undefined && !updates.name.trim()) {
        throw new ApiError('Ism bo‘sh bo‘lmasligi kerak', 400)
      }
      if (updates.phone !== undefined && !updates.phone.trim()) {
        throw new ApiError('Telefon bo‘sh bo‘lmasligi kerak', 400)
      }

      const currentName = session.user.name
      const currentPhone = session.user.phone
      const nextName = updates.name?.trim() ?? currentName
      const nextPhone = updates.phone?.trim() ?? currentPhone

      const { first_name, last_name } = splitDisplayName(nextName)
      const response = await patchSellerProfile(session.userId, session.companyId, {
        first_name,
        last_name,
        phone: nextPhone,
      })

      const nameFromApi = response
        ? buildDisplayNameFromInfo({
            first_name: response.first_name ?? first_name,
            last_name: response.last_name ?? last_name,
            username: response.username ?? session.username,
          })
        : nextName
      const phoneFromApi = response?.phone ?? nextPhone

      const nextSession = mergeSessionProfile(session, {
        name: nameFromApi,
        phone: phoneFromApi ?? '',
        image: resolveMediaUrl(response?.image) ?? session.user.image,
      })

      setSession(nextSession)
      try {
        await saveAuthSession(nextSession)
      } catch (storageErr) {
        devLog('[Auth] Profil saqlash (storage):', storageErr)
      }
    },
    [session],
  )

  const refreshUserProfile = useCallback(async () => {
    if (!session?.companyId) return
    if (!shouldRefreshMediaUrl(session.user.image)) return

    try {
      const info = await fetchFreshUserInfo(session)
      const next = sessionFromUserInfo(session, info)
      setSession(next)
      await saveAuthSession(next)
    } catch (err) {
      devLog('[Auth] Profil yangilash:', err)
    }
  }, [session])

  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true)
    try {
      const nextSession = await loginWithCredentials(username, password)

      if (!isAllowedRole(nextSession.roleName)) {
        clearSession()
        devLog('[Auth] Ruxsat etilmagan rol:', nextSession.roleName)
        throw new UnsupportedRoleError(nextSession.roleName)
      }

      try {
        await saveAuthSession(nextSession)
      } catch (storageErr) {
        devLog('[Auth] Storage xatosi (login davom etadi):', storageErr)
      }
      setSession(nextSession)
      setIsLoggedIn(true)
      void syncFirebaseTokenWithBackend()
    } finally {
      setIsLoading(false)
    }
  }, [])

  const value = useMemo(
    () => ({
      isLoggedIn,
      isBootstrapping,
      isLoading,
      session,
      user: session?.user ?? null,
      roleName: session?.roleName ?? null,
      login,
      logout,
      updateProfile,
      refreshUserProfile,
    }),
    [
      isLoggedIn,
      isBootstrapping,
      isLoading,
      session,
      login,
      logout,
      updateProfile,
      refreshUserProfile,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth faqat AuthProvider ichida ishlatiladi')
  }
  return context
}
