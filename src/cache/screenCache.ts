import { Staff } from '../components/StaffItem'
import { StatsPeriod } from '../types/statsPeriod'
import { HotMapRow, VisitorSurveysCountResponse } from '../types/storeOwner'

const SCREEN_CACHE_TTL_MS = 24 * 60 * 60 * 1000

type CacheEntry<T> = { data: T; at: number }

export interface StatsScreenCacheData {
  period: StatsPeriod
  stats: VisitorSurveysCountResponse
  salesCount: number
  amountGrowth: string
  hotMapRows: HotMapRow[]
}

export interface TeamScreenCacheData {
  staff: Staff[]
}

const statsScreenCaches = new Map<StatsPeriod, CacheEntry<StatsScreenCacheData>>()
let teamScreenCache: CacheEntry<TeamScreenCacheData> | null = null

function isFresh<T>(entry: CacheEntry<T> | null | undefined): entry is CacheEntry<T> {
  if (!entry) return false
  return Date.now() - entry.at < SCREEN_CACHE_TTL_MS
}

export function getStatsScreenCache(period: StatsPeriod): StatsScreenCacheData | null {
  const hit = statsScreenCaches.get(period)
  return isFresh(hit) ? hit.data : null
}

export function setStatsScreenCache(period: StatsPeriod, data: StatsScreenCacheData): void {
  statsScreenCaches.set(period, { data, at: Date.now() })
}

export function invalidateStatsScreenCache(): void {
  statsScreenCaches.clear()
}

export function getTeamScreenCache(): TeamScreenCacheData | null {
  return isFresh(teamScreenCache) ? teamScreenCache.data : null
}

export function setTeamScreenCache(data: TeamScreenCacheData): void {
  teamScreenCache = { data, at: Date.now() }
}

export function invalidateTeamScreenCache(): void {
  teamScreenCache = null
}

/** Logout yoki to‘liq yangilash */
export function invalidateMainScreenCaches(): void {
  statsScreenCaches.clear()
  teamScreenCache = null
}
