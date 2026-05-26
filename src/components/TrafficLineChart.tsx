import React, { memo, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { LineChart } from 'react-native-gifted-charts'
import { COLORS } from '../constants/colors'
import {
  computeChartLayout,
  type ChartSlotData,
} from '../utils/storeOwnerChart'

interface TrafficLineChartProps {
  chartWidth: number
  chartData: ChartSlotData
  labelColor: string
  borderColor: string
}

function TrafficLineChart({
  chartWidth,
  chartData,
  labelColor,
  borderColor,
}: TrafficLineChartProps) {
  const hasWideLabels = useMemo(
    () =>
      !chartData.isHourly &&
      chartData.visitorsData.some((p) => {
        const label = p.label?.toLowerCase() ?? ''
        return label.startsWith('week') || label.startsWith('hafta')
      }),
    [chartData.isHourly, chartData.visitorsData],
  )

  const layout = useMemo(
    () =>
      computeChartLayout(
        chartData.pointCount,
        chartWidth,
        chartData.isHourly,
        hasWideLabels,
        chartData.maxValue,
      ),
    [chartData.pointCount, chartData.isHourly, chartData.maxValue, chartWidth, hasWideLabels],
  )

  if (chartWidth <= 0 || chartData.visitorsData.length === 0) {
    return null
  }

  const hasBuyers = chartData.buyersData.some((p) => p.value > 0)

  return (
    <View style={[styles.wrap, { minHeight: layout.containerMinHeight }]}>
      <LineChart
        data={chartData.visitorsData}
        data2={hasBuyers ? undefined : chartData.buyersData}
        secondaryData={hasBuyers ? chartData.buyersData : undefined}
        parentWidth={chartWidth}
        width={layout.plotWidth}
        disableScroll={!layout.useScroll}
        nestedScrollEnabled
        height={layout.chartHeight}
        overflowBottom={layout.overflowBottom}
        overflowTop={6}
        curved={chartData.useCurved}
        isAnimated={false}
        animateOnDataChange={false}
        thickness={2.5}
        color1={COLORS.chartPurple}
        color2={COLORS.chartOrange}
        secondaryLineConfig={
          hasBuyers
            ? {
                color: COLORS.chartOrange,
                thickness: 2.5,
                curved: chartData.useCurved,
                hideDataPoints: true,
                isSecondary: true,
              }
            : undefined
        }
        secondaryYAxis={
          hasBuyers
            ? {
                maxValue: chartData.buyersMaxValue,
                noOfSections: 4,
                hideYAxisText: true,
              }
            : undefined
        }
        dataPointsColor1={COLORS.chartPurple}
        dataPointsRadius={chartData.pointCount > 16 ? 0 : 3}
        hideDataPoints1={chartData.pointCount > 16}
        hideDataPoints2
        maxValue={chartData.maxValue}
        noOfSections={4}
        yAxisLabelWidth={layout.yAxisWidth}
        formatYLabel={(v) => String(Math.round(Number(v)))}
        yAxisColor="transparent"
        yAxisTextStyle={{ color: labelColor, fontSize: 10 }}
        xAxisColor={borderColor}
        xAxisThickness={1}
        xAxisLabelTextStyle={{
          color: labelColor,
          fontSize: 10,
          width: layout.xLabelWidth,
          textAlign: 'center',
        }}
        xAxisLabelsHeight={layout.xLabelHeight}
        labelsExtraHeight={layout.labelsExtraHeight}
        xAxisLabelsVerticalShift={layout.xLabelVerticalShift}
        xAxisLabelsAtBottom
        xAxisTextNumberOfLines={1}
        showVerticalLines={false}
        rulesColor={borderColor}
        rulesThickness={1}
        rulesType="solid"
        initialSpacing={layout.initialSpacing}
        endSpacing={layout.endSpacing}
        spacing={layout.spacing}
        focusEnabled={false}
        showStripOnFocus={false}
      />
    </View>
  )
}

export default memo(TrafficLineChart)

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    paddingBottom: 6,
    overflow: 'hidden',
  },
})
