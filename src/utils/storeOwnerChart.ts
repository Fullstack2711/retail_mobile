import { VisitorSurveySlot } from '../types/storeOwner'

/** Chartda ko‘rsatiladigan soat oralig‘i (08:00 — 23:00) */
export const CHART_START_HOUR = 8
export const CHART_END_HOUR = 23

function slotHour(time: string): number {
  const hour = parseInt(time.split(':')[0] ?? '', 10)
  return Number.isFinite(hour) ? hour : -1
}

/** Kunlik grafik: "08:00", "9:30" kabi vaqt */
export function isHourlySlotTime(time: string): boolean {
  const t = time.trim()
  return /^\d{1,2}:\d{2}/.test(t) || /^\d{1,2}$/.test(t)
}

export function filterChartSlots(slots: VisitorSurveySlot[]): VisitorSurveySlot[] {
  return slots.filter((slot) => {
    const hour = slotHour(slot.time)
    return hour >= CHART_START_HOUR && hour <= CHART_END_HOUR
  })
}

export interface ChartPoint {
  value: number
  label?: string
}

export interface ChartSlotData {
  visitorsData: ChartPoint[]
  buyersData: ChartPoint[]
  maxValue: number
  pointCount: number
  showXLabels: boolean
  useCurved: boolean
  isHourly: boolean
}

/** "08:00" → "8" — tor x o‘qida ikki qatorga bo‘linmasin */
export function formatChartLabel(time: string, hourly: boolean): string {
  if (!hourly) return time.trim()
  const hour = slotHour(time)
  return hour >= 0 ? String(hour) : time.trim()
}

/** Keskin 0 ga tushishda egri chiziq "hunik" bo‘lib qoladi */
export function shouldUseCurvedLine(values: number[]): boolean {
  if (values.length < 3 || values.length > 7) return false
  const zeroCount = values.filter((v) => v === 0).length
  return zeroCount < 2
}

const MAX_X_LABELS = 6

export function computeChartMaxValue(peak: number): number {
  if (peak <= 0) return 100
  const padded = peak * 1.15
  if (padded <= 40) return Math.ceil(padded / 10) * 10
  if (padded <= 120) return Math.ceil(padded / 20) * 20
  if (padded <= 300) return Math.ceil(padded / 25) * 25
  if (padded <= 1000) return Math.ceil(padded / 50) * 50
  return Math.ceil(padded / 100) * 100
}

/** Ko‘p nuqtada faqat bir nechta x o‘qi yorlig‘i — ustma-ust binmaydi */
export function sparseChartLabels<T extends { label?: string }>(
  items: T[],
  maxLabels = MAX_X_LABELS,
): T[] {
  const n = items.length
  if (n <= maxLabels) return items
  const step = Math.max(1, Math.floor((n - 1) / (maxLabels - 1)))
  return items.map((item, i) => ({
    ...item,
    label: i % step === 0 || i === n - 1 ? item.label : '',
  }))
}

export interface ChartLayoutConfig {
  spacing: number
  plotWidth: number
  scrollContentWidth: number
  useScroll: boolean
  chartHeight: number
  xLabelHeight: number
  xLabelWidth: number
  yAxisWidth: number
  initialSpacing: number
  endSpacing: number
}

export function computeChartLayout(
  pointCount: number,
  containerWidth: number,
  isHourly = false,
): ChartLayoutConfig {
  const yAxisWidth = 44
  const chartHeight = 168
  const xLabelHeight = pointCount > 0 ? 20 : 0
  const xLabelWidth = isHourly ? 28 : pointCount <= 7 ? 44 : 36
  const initialSpacing = Math.max(16, Math.ceil(xLabelWidth / 2) + 4)
  const endSpacing = initialSpacing

  const plotAreaWidth = Math.max(0, containerWidth - yAxisWidth)

  if (pointCount <= 1 || containerWidth <= 0) {
    return {
      spacing: 40,
      plotWidth: plotAreaWidth,
      scrollContentWidth: containerWidth,
      useScroll: false,
      chartHeight,
      xLabelHeight,
      xLabelWidth,
      yAxisWidth,
      initialSpacing,
      endSpacing,
    }
  }

  const innerWidth = Math.max(0, plotAreaWidth - initialSpacing - endSpacing)
  const segmentCount = Math.max(pointCount - 1, 1)
  const minSpacingPerPoint = isHourly ? 32 : 56
  const maxSpacingPerPoint = isHourly ? 48 : 96
  const fitSpacing = Math.floor(innerWidth / segmentCount)
  const useScroll = fitSpacing < minSpacingPerPoint
  const spacing = useScroll
    ? minSpacingPerPoint
    : Math.min(fitSpacing, maxSpacingPerPoint)
  const plotWidth = plotAreaWidth
  const scrollContentWidth = containerWidth

  return {
    spacing,
    plotWidth,
    scrollContentWidth,
    useScroll,
    chartHeight,
    xLabelHeight,
    xLabelWidth,
    yAxisWidth,
    initialSpacing,
    endSpacing,
  }
}

export function mapSlotsToChart(slots: VisitorSurveySlot[]): ChartSlotData {
  const hourly =
    slots.length > 0 && slots.every((slot) => isHourlySlotTime(slot.time))
  const filtered = hourly ? filterChartSlots(slots) : slots

  const rawVisitors = filtered.map((slot) => ({
    value: slot.visitors,
    label: formatChartLabel(slot.time, hourly),
  }))
  const buyersData = filtered.map((slot) => ({ value: slot.buyers }))
  const visitorValues = filtered.map((slot) => slot.visitors)
  const peak = filtered.reduce(
    (max, slot) => Math.max(max, slot.visitors, slot.buyers),
    0,
  )
  const maxValue = computeChartMaxValue(peak)
  const labelCap = hourly
    ? MAX_X_LABELS
    : filtered.length > 10
      ? 8
      : filtered.length
  const visitorsWithLabels =
    !hourly && filtered.length <= 7
      ? rawVisitors
      : sparseChartLabels(rawVisitors, labelCap)

  return {
    visitorsData: visitorsWithLabels,
    buyersData,
    maxValue,
    pointCount: filtered.length,
    showXLabels: filtered.length > 0,
    useCurved: shouldUseCurvedLine(visitorValues),
    isHourly: hourly,
  }
}
