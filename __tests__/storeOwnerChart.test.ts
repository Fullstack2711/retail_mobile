import {
  computeChartLayout,
  computeChartMaxValue,
  EMPTY_CHART_DATA,
  mapSlotsToChart,
  yAxisWidthForMax,
} from '../src/utils/storeOwnerChart'

describe('yAxisWidthForMax', () => {
  it('widens for larger peak values', () => {
    expect(yAxisWidthForMax(60)).toBe(32)
    expect(yAxisWidthForMax(225)).toBe(40)
    expect(yAxisWidthForMax(1500)).toBe(48)
  })
})

describe('computeChartMaxValue', () => {
  it('pads peak and rounds to sensible step', () => {
    expect(computeChartMaxValue(40)).toBe(60)
    expect(computeChartMaxValue(0)).toBe(100)
  })
})

describe('computeChartLayout', () => {
  it('keeps plotWidth within parent for scroll mode', () => {
    const layout = computeChartLayout(7, 360, false, false, 450)
    expect(layout.plotWidth).toBe(360 - layout.yAxisWidth)
    expect(layout.yAxisWidth).toBe(40)
    expect(layout.useScroll).toBe(true)
  })

  it('uses wider y-axis for three-digit peaks', () => {
    const layout = computeChartLayout(4, 400, false, true, 450)
    expect(layout.yAxisWidth).toBe(40)
    expect(layout.plotWidth).toBe(400 - 40)
  })

  it('reserves label gap below x-axis', () => {
    const layout = computeChartLayout(4, 320, false, true, 450)
    expect(layout.labelsExtraHeight + layout.xLabelVerticalShift).toBeGreaterThanOrEqual(24)
  })
})

describe('mapSlotsToChart', () => {
  it('maps visitor survey slots', () => {
    const data = mapSlotsToChart([
      { time: 'Mon', visitors: 10, buyers: 1 },
      { time: 'Tue', visitors: 20, buyers: 0 },
    ])
    expect(data.pointCount).toBe(2)
    expect(data.visitorsData[0].label).toBe('Mon')
    expect(data.maxValue).toBeGreaterThan(0)
  })
})

describe('EMPTY_CHART_DATA', () => {
  it('has no points for production empty state', () => {
    expect(EMPTY_CHART_DATA.visitorsData).toHaveLength(0)
    expect(EMPTY_CHART_DATA.pointCount).toBe(0)
  })
})
