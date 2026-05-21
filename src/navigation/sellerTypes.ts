import type { SaleListItem } from '../types/visitorSurvey'

export type SellerHistoryStackParamList = {
  MySales: undefined
  EditSavedSurvey: {
    visitorId: number
    dateTime: string
    visitorImage?: string | null
    status: SaleListItem['status']
    comment?: string
  }
}

export type SellerFeedStackParamList = {
  LiveFeed: undefined
  RecordActivity: {
    visitorId: number
    surveyId?: number
    dateTime: string
    displayId: string
    visitorImage?: string | null
    comment?: string | null
  }
}
