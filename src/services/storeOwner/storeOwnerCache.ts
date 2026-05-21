import { StatsPeriod } from '../../types/statsPeriod'
import { SalesListSummary, VisitorSurveysCountResponse } from '../../types/storeOwner'
import { GetSalesListParams } from './storeOwnerService'

const TTL_MS = 2 * 60 * 1000

type CacheEntry<T> = { data: T; at: number }

const surveysCountCacheByPeriod = new Map<StatsPeriod, CacheEntry<VisitorSurveysCountResponse>>()
const hotMapCacheByPeriod = new Map<StatsPeriod, CacheEntry<unknown>>()
const salesListCache = new Map<string, CacheEntry<SalesListSummary>>()

function isFresh<T>(entry: CacheEntry<T> | null | undefined): entry is CacheEntry<T> {
  if (!entry) return false
  return Date.now() - entry.at < TTL_MS
}

function salesListKey(params: GetSalesListParams): string {
  return `${params.company_id}:${params.branch_id ?? 'all'}`
}

export function getCachedVisitorSurveysCount(
  period: StatsPeriod,
): VisitorSurveysCountResponse | null {
  const hit = surveysCountCacheByPeriod.get(period)
  return isFresh(hit) ? hit.data : null
}

export function setCachedVisitorSurveysCount(
  period: StatsPeriod,
  data: VisitorSurveysCountResponse,
): void {
  surveysCountCacheByPeriod.set(period, { data, at: Date.now() })
}

export function getCachedHotMap(period: StatsPeriod): unknown | null {
  const hit = hotMapCacheByPeriod.get(period)
  return isFresh(hit) ? hit.data : null
}

export function setCachedHotMap(period: StatsPeriod, data: unknown): void {
  hotMapCacheByPeriod.set(period, { data, at: Date.now() })
}

export function getCachedSalesList(
  params: GetSalesListParams,
): SalesListSummary | null {
  const hit = salesListCache.get(salesListKey(params))
  return isFresh(hit) ? hit.data : null
}

export function setCachedSalesList(
  params: GetSalesListParams,
  data: SalesListSummary,
): void {
  salesListCache.set(salesListKey(params), { data, at: Date.now() })
}

export function invalidateStoreOwnerCache(): void {
  surveysCountCacheByPeriod.clear()
  hotMapCacheByPeriod.clear()
  salesListCache.clear()
}
