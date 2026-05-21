export type PurchaseStatus = 'bought' | 'not_bought'

export interface FeedRecord {
  id: string
  time: string
  date: string
  dateTime: string
}

export interface SaleRecord {
  id: string
  dateTime: string
  status: PurchaseStatus
  comment: string
}

export const FEED_RECORDS: FeedRecord[] = [
  { id: 'rec1', time: '14:45', date: '24.10.2023', dateTime: '24.10.2023 14:45' },
  { id: 'rec2', time: '14:32', date: '24.10.2023', dateTime: '24.10.2023 14:32' },
  { id: 'rec3', time: '14:18', date: '24.10.2023', dateTime: '24.10.2023 14:18' },
  { id: 'rec4', time: '13:55', date: '24.10.2023', dateTime: '24.10.2023 13:55' },
  { id: 'rec5', time: '13:40', date: '24.10.2023', dateTime: '24.10.2023 13:40' },
]

export const SALES_HISTORY: SaleRecord[] = [
  {
    id: 'sale1',
    dateTime: '24.10.2023 15:25',
    status: 'bought',
    comment: 'Купила премиум-пакет на год для команды',
  },
  {
    id: 'sale2',
    dateTime: '24.10.2023 14:10',
    status: 'not_bought',
    comment: 'без коментария',
  },
]
