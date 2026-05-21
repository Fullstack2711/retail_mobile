export interface VisitorSurveySlot {
  time: string
  visitors: number
  buyers: number
}

export interface VisitorSurveysCountResponse {
  period_summary: {
    total_visitors: number
    growth: string
  }
  today: {
    visitors_count: number
    visitors_growth: string
    buyers_count: number
    buyers_growth: string
    slots: VisitorSurveySlot[]
  }
}

export interface SalesListRaw {
  id?: number
  seller_id?: number
  user_id?: number
  username?: string
  name?: string
  full_name?: string
  seller_name?: string
  employee_name?: string
  image?: string | null
  building_id?: number | null
  branch_id?: number | null
  branch_name?: string
  total_surveys?: number
  purchased_surveys?: number
  sales_count?: number
  sales?: number
  amount?: number
  total_amount?: number
  total_sales?: number
  [key: string]: unknown
}

export interface SalesListApiResponse {
  sales_list?: SalesListRaw[]
  items?: SalesListRaw[]
  data?: SalesListRaw[]
}

export interface SalesListSummary {
  totalAmount: number
  totalSalesCount: number
  growth: string
  items: SalesListRaw[]
}

export interface HotMapChannelRaw {
  name?: string
  channel?: string
  label?: string
  building_name?: string
  percent?: number | string
  percentage?: number | string
  total?: number | string
  count?: number
  visitors?: number
  [key: string]: unknown
}

export interface HotMapApiResponse {
  total?: number
  buildings?: HotMapChannelRaw[]
  channels?: HotMapChannelRaw[]
  items?: HotMapChannelRaw[]
  data?: HotMapChannelRaw[]
  results?: HotMapChannelRaw[]
}

export interface HotMapRow {
  id: string
  label: string
  color: string
  percent: string
  total: string
  flex: number
}
