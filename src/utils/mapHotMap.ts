import { COLORS } from '../constants/colors'
import { HotMapApiResponse, HotMapChannelRaw, HotMapRow } from '../types/storeOwner'

const HOT_COLORS = [COLORS.hotYellow, COLORS.hotBlue, COLORS.hotPurple, '#FF6B35', '#5AC8FA']

function extractHotMapList(payload: unknown): HotMapChannelRaw[] {
  if (Array.isArray(payload)) return payload as HotMapChannelRaw[]
  if (payload && typeof payload === 'object') {
    const o = payload as HotMapApiResponse
    if (Array.isArray(o.buildings)) return o.buildings
    if (Array.isArray(o.channels)) return o.channels
    if (Array.isArray(o.items)) return o.items
    if (Array.isArray(o.data)) return o.data
    if (Array.isArray(o.results)) return o.results
  }
  return []
}

function parsePercent(value: unknown): number {
  if (typeof value === 'number' && !Number.isNaN(value)) return value
  if (typeof value === 'string') {
    const n = parseFloat(value.replace('%', '').trim())
    return Number.isNaN(n) ? 0 : n
  }
  return 0
}

function formatTotal(value: unknown): string {
  if (typeof value === 'number') return value.toLocaleString()
  if (typeof value === 'string' && value.length > 0) return value
  return '0'
}

function channelLabel(item: HotMapChannelRaw, index: number): string {
  const raw =
    item.name ??
    item.channel ??
    item.label ??
    item.building_name ??
    (typeof item.building_id === 'number' ? `Bino #${item.building_id}` : null)
  return raw ? String(raw) : `#${index + 1}`
}

export function mapHotMapToRows(payload: unknown): HotMapRow[] {
  const list = extractHotMapList(payload)
  if (list.length === 0) return []

  return list.map((item, index) => {
    const pct = parsePercent(item.percent ?? item.percentage)
    const totalRaw = item.total ?? item.count ?? item.visitors ?? 0
    const buildingId =
      typeof item.building_id === 'number' ? String(item.building_id) : null
    return {
      id: buildingId ?? `${channelLabel(item, index)}-${index}`,
      label: channelLabel(item, index),
      color: HOT_COLORS[index % HOT_COLORS.length],
      percent: `${Math.round(pct)}%`,
      total: formatTotal(totalRaw),
      flex: Math.max(pct, 1),
    }
  })
}
