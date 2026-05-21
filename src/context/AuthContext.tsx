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
  patchSellerProfile,
  splitDisplayName,
  buildDisplayNameFromInfo,
} from '../services/profile'
import { ApiError } from '../services/api/errors'
import { setOnUnauthorized } from '../services/api/client'
import { invalidateMainScreenCaches } from '../cache/screenCache'
import { invalidateVisitorSurveyCache } from '../services/visitorSurvey'
import { invalidateStoreOwnerCache } from '../services/storeOwner/storeOwnerCache'
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

  const updateProfile = useCallback(
    async (updates: { name?: string; phone?: string }) => {
      if (!session) throw new ApiError('Sessiya topilmadi', 401)
      if (session.companyId == null) {
        throw new ApiError('Kompaniya ID topilmadi', 400)
      }

      const currentName = session.user.name
      const currentPhone = session.user.phone
      const nextName = updates.name?.trim() ?? currentName
      const nextPhone = updates.phone?.trim() ?? currentPhone

      const { first_name, last_name } = splitDisplayName(nextName)
      const response = await patchSellerProfile(session.userId, session.companyId, {
        first_name,
        last_name,
        phone: nextPhone || null,
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
    }),
    [isLoggedIn, isBootstrapping, isLoading, session, login, logout, updateProfile],
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
