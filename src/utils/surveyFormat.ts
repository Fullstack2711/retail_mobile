import { SurveyApiStatus } from '../types/visitorSurvey'

export function apiStatusToUi(status?: string | null): 'bought' | 'not_bought' | 'pending' {
  if (status === 'purchased') return 'bought'
  if (status === 'pending') return 'pending'
  return 'not_bought'
}

export function uiStatusToApi(status: 'bought' | 'not_bought'): SurveyApiStatus {
  return status === 'bought' ? 'purchased' : 'not_purchased'
}

export function formatSurveyDateTime(isoOrDate?: string | null): {
  time: string
  date: string
  dateTime: string
} {
  if (!isoOrDate) {
    const now = new Date()
    return formatFromDate(now)
  }

  const parsed = new Date(isoOrDate)
  if (Number.isNaN(parsed.getTime())) {
    if (isoOrDate.includes(' ')) {
      const [datePart, timePart] = isoOrDate.split(' ')
      return {
        date: datePart,
        time: timePart?.slice(0, 5) ?? '',
        dateTime: isoOrDate,
      }
    }
    return { date: isoOrDate, time: '', dateTime: isoOrDate }
  }

  return formatFromDate(parsed)
}

function formatFromDate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  const date = `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`
  return { date, time, dateTime: `${date} ${time}` }
}

export function extractSurveyList(payload: unknown): import('../types/visitorSurvey').VisitorSurveyRaw[] {
  if (Array.isArray(payload)) return payload
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>
    if (Array.isArray(obj.items)) return obj.items
    if (Array.isArray(obj.data)) return obj.data
    if (Array.isArray(obj.results)) return obj.results
  }
  return []
}

export function extractPagination(payload: unknown): { total: number; page: number; size: number } {
  let total = 0
  let page = 1
  let size = 20
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    const o = payload as Record<string, unknown>
    if (typeof o.total === 'number') total = o.total
    if (typeof o.page === 'number') page = o.page
    if (typeof o.size === 'number') size = o.size
  }
  return { total, page, size }
}
