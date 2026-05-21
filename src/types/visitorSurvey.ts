/** API status qiymatlari */
export type SurveyApiStatus = 'purchased' | 'not_purchased' | 'pending'

export interface VisitorSurveyRaw {
  id?: number
  survey_id?: number
  visitor_id?: number
  status?: SurveyApiStatus | string
  comment?: string | null
  created_at?: string
  updated_at?: string
  detected_at?: string
  visitor_detected_at?: string
  last_seen_at?: string
  visitor_image?: string | null
  [key: string]: unknown
}

export interface PaginatedSurveysResponse {
  items?: VisitorSurveyRaw[]
  data?: VisitorSurveyRaw[]
  results?: VisitorSurveyRaw[]
  total?: number
  page?: number
  size?: number
}

export interface FeedListItem {
  visitorId: number
  surveyId?: number
  time: string
  date: string
  dateTime: string
  /** Yuz surati URL */
  visitorImage: string | null
  /** Bo‘sh bo‘lsa UI da ko‘rinmaydi */
  comment: string | null
  /** API qiymati: pending | purchased | not_purchased */
  status: string
}

export interface SaleListItem {
  id: string
  visitorId: number
  surveyId?: number
  dateTime: string
  status: 'bought' | 'not_bought' | 'pending'
  comment: string
  visitorImage: string | null
}

export interface ListSurveysParams {
  status_filter?: SurveyApiStatus
  page?: number
  size?: number
}

export interface ListVisitorSurveysPageResult {
  items: FeedListItem[]
  total: number
  page: number
  size: number
}

export interface SavedSurveysPageResult {
  items: SaleListItem[]
  total: number
  page: number
  size: number
}
