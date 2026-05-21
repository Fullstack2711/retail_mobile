import { apiRequest } from '../api/client'
import { devLog } from '../../utils/devLog'
import {
  FeedListItem,
  ListSurveysParams,
  ListVisitorSurveysPageResult,
  PaginatedSurveysResponse,
  SaleListItem,
  SavedSurveysPageResult,
  SurveyApiStatus,
  VisitorSurveyRaw,
} from '../../types/visitorSurvey'

export type { ListSurveysParams, ListVisitorSurveysPageResult, SavedSurveysPageResult }
import {
  apiStatusToUi,
  extractPagination,
  extractSurveyList,
  formatSurveyDateTime,
} from '../../utils/surveyFormat'
import {
  feedPageCacheKey,
  getCachedFeedPage,
  getCachedHistory,
  getCachedHistoryPage,
  invalidateHistoryCache,
  removeVisitorFromFeedCache,
  setCachedFeedPage,
  setCachedHistory,
  setCachedHistoryPage,
} from './visitorSurveyCache'

function getVisitorId(item: VisitorSurveyRaw): number | null {
  const id = item.visitor_id ?? item.id
  return typeof id === 'number' ? id : null
}

function getSurveyId(item: VisitorSurveyRaw): number | undefined {
  const id = item.survey_id ?? item.id
  return typeof id === 'number' ? id : undefined
}

function getDateSource(item: VisitorSurveyRaw): string | undefined {
  return (
    item.last_seen_at ??
    item.detected_at ??
    item.visitor_detected_at ??
    item.created_at ??
    item.updated_at
  ) as string | undefined
}

function mapToFeedItem(item: VisitorSurveyRaw): FeedListItem | null {
  const visitorId = getVisitorId(item)
  if (visitorId == null) return null
  const { time, date, dateTime } = formatSurveyDateTime(getDateSource(item))
  const rawComment =
    typeof item.comment === 'string' ? item.comment.trim() : ''
  const img =
    typeof item.visitor_image === 'string' && item.visitor_image.length > 0
      ? item.visitor_image
      : null

  return {
    visitorId,
    surveyId: getSurveyId(item),
    time,
    date,
    dateTime,
    visitorImage: img,
    comment: rawComment.length > 0 ? rawComment : null,
    status: typeof item.status === 'string' ? item.status : 'pending',
  }
}

function mapToSaleItem(item: VisitorSurveyRaw): SaleListItem | null {
  const visitorId = getVisitorId(item)
  if (visitorId == null) return null
  const { dateTime } = formatSurveyDateTime(getDateSource(item))
  const img =
    typeof item.visitor_image === 'string' && item.visitor_image.length > 0
      ? item.visitor_image
      : null
  return {
    id: String(visitorId),
    visitorId,
    surveyId: getSurveyId(item),
    dateTime,
    status: apiStatusToUi(item.status),
    comment: item.comment?.trim() || '',
    visitorImage: img,
  }
}

export async function listVisitorSurveysPage(
  params: ListSurveysParams = {},
  options?: { force?: boolean; useCache?: boolean },
): Promise<ListVisitorSurveysPageResult> {
  if (!options?.force && options?.useCache) {
    const cached = getCachedFeedPage(params)
    if (cached) {
      devLog('[VisitorSurvey] Cache hit:', feedPageCacheKey(params))
      return cached
    }
  }

  const query = new URLSearchParams()
  if (params.status_filter) query.append('status_filter', params.status_filter)
  const pageNum = params.page ?? 1
  const pageSize = params.size ?? 20
  query.append('page', String(pageNum))
  query.append('size', String(pageSize))

  const path = `/mobile/user/visitor-surveys/?${query.toString()}`
  const data = await apiRequest<PaginatedSurveysResponse | VisitorSurveyRaw[]>(path)
  const items = extractSurveyList(data)
    .map(mapToFeedItem)
    .filter((x): x is FeedListItem => x != null)
  const meta = extractPagination(data)
  const result = {
    items,
    total: meta.total > 0 ? meta.total : items.length,
    page: meta.page > 0 ? meta.page : pageNum,
    size: meta.size > 0 ? meta.size : pageSize,
  }
  setCachedFeedPage(params, result)
  return result
}

/** Bir sahifa uchun (-pagination) */
export async function listVisitorSurveys(
  params: ListSurveysParams = {},
): Promise<FeedListItem[]> {
  const { items } = await listVisitorSurveysPage(params)
  return items
}

export async function listSavedSurveysPage(
  params: ListSurveysParams = {},
  options?: { force?: boolean; useCache?: boolean },
): Promise<SavedSurveysPageResult> {
  if (!options?.force && options?.useCache) {
    const cached = getCachedHistoryPage(params)
    if (cached) {
      devLog('[VisitorSurvey] History page cache hit:', params.page ?? 1)
      return cached
    }
  }

  const query = new URLSearchParams()
  const pageNum = params.page ?? 1
  const pageSize = params.size ?? 20
  query.append('page', String(pageNum))
  query.append('size', String(pageSize))

  const path = `/mobile/user/visitor-saved-survey/?${query.toString()}`
  const data = await apiRequest<PaginatedSurveysResponse | VisitorSurveyRaw[]>(path)
  const items = extractSurveyList(data)
    .map(mapToSaleItem)
    .filter((x): x is SaleListItem => x != null)
  const meta = extractPagination(data)
  const result: SavedSurveysPageResult = {
    items,
    total: meta.total > 0 ? meta.total : items.length,
    page: meta.page > 0 ? meta.page : pageNum,
    size: meta.size > 0 ? meta.size : pageSize,
  }
  setCachedHistoryPage(params, result)
  return result
}

/** Birinchi sahifa (paginationsiz chaqiruvlar uchun) */
export async function getMySavedSurveys(options?: { force?: boolean }): Promise<SaleListItem[]> {
  const { items } = await listSavedSurveysPage({ page: 1, size: 20 }, options)
  setCachedHistory(items)
  return items
}

export async function submitVisitorAnswer(
  visitorId: number,
  status: SurveyApiStatus,
  comment: string,
): Promise<void> {
  await apiRequest(`/mobile/user/visitor-surveys/${visitorId}/answer/`, {
    method: 'POST',
    body: {
      status,
      comment: comment.trim() || undefined,
    },
  })
  removeVisitorFromFeedCache(visitorId)
  invalidateHistoryCache()
}

export async function updateVisitorSurvey(
  surveyId: number,
  status: SurveyApiStatus,
  comment: string,
): Promise<void> {
  await apiRequest(`/mobile/user/visitor-surveys/${surveyId}`, {
    method: 'PATCH',
    body: {
      status,
      comment: comment.trim() || undefined,
    },
  })
}

export async function updateSavedVisitorSurvey(
  visitorId: number,
  status: SurveyApiStatus,
  comment: string,
): Promise<void> {
  await apiRequest(`/mobile/user/visitor-saved-survey/${visitorId}`, {
    method: 'PATCH',
    body: {
      status,
      comment: comment.trim() || undefined,
    },
  })
  invalidateHistoryCache()
}
