import { apiRequest } from '../api/client'
import { StatsPeriod } from '../../types/statsPeriod'
import {
  SalesListApiResponse,
  SalesListRaw,
  SalesListSummary,
  VisitorSurveysCountResponse,
} from '../../types/storeOwner'
import {
  getCachedHotMap,
  getCachedSalesList,
  getCachedVisitorSurveysCount,
  setCachedHotMap,
  setCachedSalesList,
  setCachedVisitorSurveysCount,
} from './storeOwnerCache'

export interface GetSalesListParams {
  company_id: number
  branch_id?: number
}

export async function getVisitorSurveysCount(
  period: StatsPeriod = 'daily',
  options?: {
    force?: boolean
    useCache?: boolean
  },
): Promise<VisitorSurveysCountResponse> {
  if (!options?.force && options?.useCache) {
    const cached = getCachedVisitorSurveysCount(period)
    if (cached) return cached
  }

  const query = new URLSearchParams({ period })
  const data = await apiRequest<VisitorSurveysCountResponse>(
    `/mobile/user/visitor-surveys-count/?${query.toString()}`,
  )
  setCachedVisitorSurveysCount(period, data)
  return data
}

export async function getHotMap(
  period: StatsPeriod = 'daily',
  options?: {
    force?: boolean
    useCache?: boolean
    building_ids?: number[]
  },
): Promise<unknown> {
  if (!options?.force && options?.useCache) {
    const cached = getCachedHotMap(period)
    if (cached != null) return cached
  }

  const query = new URLSearchParams({ period })
  if (options?.building_ids?.length) {
    query.append('building_ids', options.building_ids.join(','))
  }

  const data = await apiRequest<unknown>(`/mobile/user/hot-map?${query.toString()}`)
  setCachedHotMap(period, data)
  return data
}

export async function getSalesList(
  params: GetSalesListParams,
  options?: { force?: boolean; useCache?: boolean },
): Promise<SalesListSummary> {
  if (!options?.force && options?.useCache) {
    const cached = getCachedSalesList(params)
    if (cached) return cached
  }

  const query = new URLSearchParams()
  query.append('company_id', String(params.company_id))
  if (params.branch_id != null) {
    query.append('branch_id', String(params.branch_id))
  }

  const path = `/mobile/user/sales-list?${query.toString()}`
  const data = await apiRequest<SalesListRaw[] | SalesListApiResponse>(path)

  let items: SalesListRaw[] = []
  let totalAmount = 0
  let growth = '0%'

  if (Array.isArray(data)) {
    items = data
  } else if (data && typeof data === 'object') {
    if (Array.isArray(data.sales_list)) items = data.sales_list
    else if (Array.isArray(data.items)) items = data.items
    else if (Array.isArray(data.data)) items = data.data
    const o = data as Record<string, unknown>
    if (typeof o.total_amount === 'number') totalAmount = o.total_amount
    if (typeof o.growth === 'string') growth = o.growth
  }

  if (totalAmount === 0) {
    totalAmount = items.reduce((sum, row) => {
      const amount =
        (typeof row.total_amount === 'number' ? row.total_amount : 0) ||
        (typeof row.amount === 'number' ? row.amount : 0) ||
        (typeof row.total_sales === 'number' ? row.total_sales : 0)
      return sum + amount
    }, 0)
  }

  const totalSalesCount = items.reduce((sum, row) => {
    const count =
      (typeof row.purchased_surveys === 'number' ? row.purchased_surveys : 0) ||
      (typeof row.sales_count === 'number' ? row.sales_count : 0) ||
      (typeof row.sales === 'number' ? row.sales : 0)
    return sum + count
  }, 0)

  const summary: SalesListSummary = {
    totalAmount,
    totalSalesCount,
    growth,
    items,
  }
  setCachedSalesList(params, summary)
  return summary
}
