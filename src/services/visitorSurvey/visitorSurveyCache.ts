import {
  FeedListItem,
  ListSurveysParams,
  ListVisitorSurveysPageResult,
  SaleListItem,
  SavedSurveysPageResult,
} from '../../types/visitorSurvey'

const FEED_PAGE_TTL_MS = 2 * 60 * 1000 // 2 daqiqa
const FEED_LIST_TTL_MS = 2 * 60 * 1000
const HISTORY_PAGE_TTL_MS = 2 * 60 * 1000
const HISTORY_LIST_TTL_MS = 2 * 60 * 1000

type CacheEntry<T> = { data: T; at: number }

export interface FeedListCacheState {
  items: FeedListItem[]
  /** Pending ro‘yxat pagination totali (hasMore uchun) */
  total: number
  /** visitor-surveys-count → period_summary.total_visitors */
  totalVisitors: number
  lastLoadedPage: number
  hasMore: boolean
}

export interface HistoryListCacheState {
  items: SaleListItem[]
  total: number
  lastLoadedPage: number
  hasMore: boolean
}

const feedPageCache = new Map<string, CacheEntry<ListVisitorSurveysPageResult>>()
const historyPageCache = new Map<string, CacheEntry<SavedSurveysPageResult>>()
let feedListCache: CacheEntry<FeedListCacheState> | null = null
let historyListCache: CacheEntry<HistoryListCacheState> | null = null

function isFresh<T>(entry: CacheEntry<T> | null | undefined, ttlMs: number): entry is CacheEntry<T> {
  if (!entry) return false
  return Date.now() - entry.at < ttlMs
}

export function feedPageCacheKey(params: ListSurveysParams): string {
  return `${params.status_filter ?? 'all'}:${params.page ?? 1}:${params.size ?? 20}`
}

export function historyPageCacheKey(params: ListSurveysParams): string {
  return `history:${params.page ?? 1}:${params.size ?? 20}`
}

export function getCachedFeedPage(
  params: ListSurveysParams,
): ListVisitorSurveysPageResult | null {
  const hit = feedPageCache.get(feedPageCacheKey(params))
  return isFresh(hit, FEED_PAGE_TTL_MS) ? hit.data : null
}

export function setCachedFeedPage(
  params: ListSurveysParams,
  data: ListVisitorSurveysPageResult,
): void {
  feedPageCache.set(feedPageCacheKey(params), { data, at: Date.now() })
}

export function getCachedHistoryPage(
  params: ListSurveysParams,
): SavedSurveysPageResult | null {
  const hit = historyPageCache.get(historyPageCacheKey(params))
  return isFresh(hit, HISTORY_PAGE_TTL_MS) ? hit.data : null
}

export function setCachedHistoryPage(
  params: ListSurveysParams,
  data: SavedSurveysPageResult,
): void {
  historyPageCache.set(historyPageCacheKey(params), { data, at: Date.now() })
}

export function getCachedFeedListState(): FeedListCacheState | null {
  return isFresh(feedListCache, FEED_LIST_TTL_MS) ? feedListCache.data : null
}

export function setCachedFeedListState(state: FeedListCacheState): void {
  feedListCache = { data: state, at: Date.now() }
}

export function getCachedHistoryListState(): HistoryListCacheState | null {
  return isFresh(historyListCache, HISTORY_LIST_TTL_MS) ? historyListCache.data : null
}

export function setCachedHistoryListState(state: HistoryListCacheState): void {
  historyListCache = { data: state, at: Date.now() }
}

/** @deprecated Use getCachedHistoryListState */
export function getCachedHistory(): SaleListItem[] | null {
  const state = getCachedHistoryListState()
  return state?.items ?? null
}

/** @deprecated Use setCachedHistoryListState */
export function setCachedHistory(items: SaleListItem[]): void {
  setCachedHistoryListState({
    items,
    total: items.length,
    lastLoadedPage: 1,
    hasMore: false,
  })
}

/** Javob yuborilganda yoki logout da */
export function invalidateVisitorSurveyCache(): void {
  feedPageCache.clear()
  historyPageCache.clear()
  feedListCache = null
  historyListCache = null
}

export function invalidateFeedCache(): void {
  feedPageCache.clear()
  feedListCache = null
}

export function invalidateHistoryCache(): void {
  historyPageCache.clear()
  historyListCache = null
}

/** Feed dan bitta visitor olib tashlash (saqlangandan keyin) */
export function removeVisitorFromFeedCache(visitorId: number): void {
  if (feedListCache?.data) {
    feedListCache = {
      at: Date.now(),
      data: {
        ...feedListCache.data,
        items: feedListCache.data.items.filter((x) => x.visitorId !== visitorId),
        total: Math.max(0, feedListCache.data.total - 1),
      },
    }
  }
  for (const [key, entry] of feedPageCache.entries()) {
    feedPageCache.set(key, {
      at: entry.at,
      data: {
        ...entry.data,
        items: entry.data.items.filter((x) => x.visitorId !== visitorId),
      },
    })
  }
}
