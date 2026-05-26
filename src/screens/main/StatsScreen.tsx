import React, { useCallback, useMemo, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useFocusEffect } from '@react-navigation/native'
import { Ionicons } from '../../components/icons'
import TrafficLineChart from '../../components/TrafficLineChart'
import { COLORS } from '../../constants/colors'
import { useLanguage } from '../../context/LanguageContext'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import AppPressable from '../../components/AppPressable'
import StatCard from '../../components/StatCard'
import PeriodFilterSheet from '../../components/PeriodFilterSheet'
import { useDeferredMount } from '../../hooks/useDeferredMount'
import {
  getStatsScreenCache,
  invalidateStatsScreenCache,
  setStatsScreenCache,
} from '../../cache/screenCache'
import { getHotMap, getSalesList, getVisitorSurveysCount } from '../../services/storeOwner'
import { StatsPeriod } from '../../types/statsPeriod'
import { HotMapRow, VisitorSurveysCountResponse } from '../../types/storeOwner'
import { parseGrowthPercent } from '../../utils/formatGrowth'
import { mapHotMapToRows } from '../../utils/mapHotMap'
import {
  EMPTY_CHART_DATA,
  mapSlotsToChart,
  type ChartSlotData,
} from '../../utils/storeOwnerChart'

function TrafficRow({
  icon, iconColor, label, count, percent, isPositive,
}: {
  icon: string
  iconColor: string
  label: string
  count: number
  percent: string
  isPositive: boolean
}) {
  const { colors } = useTheme()
  return (
    <View style={styles.trafficRow}>
      <View style={styles.trafficLeft}>
        <Ionicons name={icon as any} size={20} color={iconColor} />
        <Text style={[styles.trafficLabel, { color: colors.textPrimary }]}>{label}</Text>
      </View>
      <Text style={[styles.trafficCount, { color: colors.textPrimary }]}>{count}</Text>
      <View style={styles.trafficPercent}>
        <Ionicons
          name={isPositive ? 'arrow-up' : 'arrow-down'}
          size={12}
          color={isPositive ? colors.green : colors.red}
        />
        <Text style={{ color: isPositive ? colors.green : colors.red, fontSize: 13 }}>
          {percent}
        </Text>
      </View>
    </View>
  )
}

function periodLabel(
  stats: { periodDaily: string; periodWeekly: string; periodMonthly: string },
  period: StatsPeriod,
): string {
  if (period === 'weekly') return stats.periodWeekly
  if (period === 'monthly') return stats.periodMonthly
  return stats.periodDaily
}

export default function StatsScreen() {
  const tabBarHeight = useBottomTabBarHeight()
  const { colors } = useTheme()
  const { t } = useLanguage()
  const { session } = useAuth()
  const [chartWidth, setChartWidth] = useState(0)
  const chartReady = useDeferredMount()

  const [period, setPeriod] = useState<StatsPeriod>('daily')
  const [periodSheetVisible, setPeriodSheetVisible] = useState(false)
  const [stats, setStats] = useState<VisitorSurveysCountResponse | null>(null)
  const [salesCount, setSalesCount] = useState(0)
  const [amountGrowth, setAmountGrowth] = useState('0%')
  const [hotMapRows, setHotMapRows] = useState<HotMapRow[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const applyCache = useCallback((cached: ReturnType<typeof getStatsScreenCache>) => {
    if (!cached) return
    setStats(cached.stats)
    setSalesCount(cached.salesCount)
    setAmountGrowth(cached.amountGrowth)
    setHotMapRows(cached.hotMapRows)
    setError(null)
    setLoading(false)
  }, [])

  const fetchStats = useCallback(
    async (activePeriod: StatsPeriod, force: boolean) => {
      if (force) invalidateStatsScreenCache()

      const countPromise = getVisitorSurveysCount(activePeriod, { force, useCache: !force })
      const hotMapPromise = getHotMap(activePeriod, { force, useCache: !force })
      const salesPromise = session?.companyId
        ? getSalesList(
            {
              company_id: session.companyId,
              branch_id: session.branchId ?? undefined,
            },
            { force, useCache: !force },
          )
        : Promise.resolve({ totalAmount: 0, totalSalesCount: 0, growth: '0%', items: [] })

      const [countData, salesData, hotMapRaw] = await Promise.all([
        countPromise,
        salesPromise,
        hotMapPromise,
      ])
      const rows = mapHotMapToRows(hotMapRaw)
      setStats(countData)
      setSalesCount(salesData.totalSalesCount)
      setAmountGrowth(salesData.growth)
      setHotMapRows(rows)
      setStatsScreenCache(activePeriod, {
        period: activePeriod,
        stats: countData,
        salesCount: salesData.totalSalesCount,
        amountGrowth: salesData.growth,
        hotMapRows: rows,
      })
    },
    [session?.companyId, session?.branchId],
  )

  const load = useCallback(
    async (activePeriod: StatsPeriod, isRefresh = false) => {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)
      setError(null)

      try {
        await fetchStats(activePeriod, isRefresh)
      } catch (e) {
        const msg = e instanceof Error ? e.message : t.seller.loadError
        setError(msg)
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [fetchStats, t.seller.loadError],
  )

  useFocusEffect(
    useCallback(() => {
      const cached = getStatsScreenCache(period)
      if (cached) {
        applyCache(cached)
        void fetchStats(period, false).catch(() => {})
        return
      }

      let cancelled = false
      setLoading(true)
      setError(null)
      fetchStats(period, false)
        .catch((e) => {
          if (!cancelled) {
            const msg = e instanceof Error ? e.message : t.seller.loadError
            setError(msg)
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })

      return () => {
        cancelled = true
      }
    }, [period, fetchStats, applyCache, t.seller.loadError]),
  )

  const handlePeriodSelect = useCallback(
    (next: StatsPeriod) => {
      setPeriodSheetVisible(false)
      setPeriod(next)
      const cached = getStatsScreenCache(next)
      if (cached) {
        applyCache(cached)
        return
      }
      load(next, true)
    },
    [applyCache, load],
  )

  const activePeriodLabel = useMemo(
    () => periodLabel(t.stats, period),
    [t.stats, period],
  )

  const periodGrowth = useMemo(
    () => parseGrowthPercent(stats?.period_summary.growth ?? '0%'),
    [stats?.period_summary.growth],
  )
  const visitorsGrowth = useMemo(
    () => parseGrowthPercent(stats?.today.visitors_growth ?? '0%'),
    [stats?.today.visitors_growth],
  )
  const buyersGrowth = useMemo(
    () => parseGrowthPercent(stats?.today.buyers_growth ?? '0%'),
    [stats?.today.buyers_growth],
  )
  const salesGrowth = useMemo(() => parseGrowthPercent(amountGrowth), [amountGrowth])

  const chartData = useMemo((): ChartSlotData => {
    if (stats?.today.slots?.length) {
      return mapSlotsToChart(stats.today.slots)
    }
    return EMPTY_CHART_DATA
  }, [stats?.today.slots])

  const totalCustomers = stats?.period_summary.total_visitors ?? 0

  if (loading && !stats) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]} edges={['top']}>
        <ActivityIndicator style={styles.center} color={colors.primary} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(period, true)}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t.stats.title}</Text>
            <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
              {t.stats.subtitle} · {activePeriodLabel}
            </Text>
          </View>
          <AppPressable
            style={[styles.filterBtn, { backgroundColor: colors.white }]}
            onPress={() => setPeriodSheetVisible(true)}
          >
            <Ionicons name="filter-outline" size={18} color={colors.textPrimary} />
          </AppPressable>
        </View>

        {error ? (
          <View style={[styles.errorBox, { backgroundColor: colors.white }]}>
            <Text style={[styles.errorText, { color: colors.red }]}>{error}</Text>
            <AppPressable onPress={() => load(period)}>
              <Text style={{ color: colors.primary, fontWeight: '600' }}>{t.seller.retry}</Text>
            </AppPressable>
          </View>
        ) : null}

        <View style={styles.cardsRow}>
          <StatCard
            title={t.stats.totalCustomers}
            value={totalCustomers.toLocaleString()}
            percent={periodGrowth.display}
            isPositive={periodGrowth.isPositive}
            iconName="person-outline"
          />
          <StatCard
            title={t.stats.amountSold}
            value={salesCount.toLocaleString()}
            percent={salesGrowth.display}
            isPositive={salesGrowth.isPositive}
            iconName="cart-outline"
          />
        </View>

        <View style={[styles.card, { backgroundColor: colors.white }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{t.stats.trafficTitle}</Text>

          <TrafficRow
            icon="footsteps-outline"
            iconColor={COLORS.chartPurple}
            label={t.stats.visitors}
            count={stats?.today.visitors_count ?? 0}
            percent={visitorsGrowth.display}
            isPositive={visitorsGrowth.isPositive}
          />
          <TrafficRow
            icon="cart-outline"
            iconColor={COLORS.chartOrange}
            label={t.stats.buyers}
            count={stats?.today.buyers_count ?? 0}
            percent={buyersGrowth.display}
            isPositive={buyersGrowth.isPositive}
          />

          <View style={styles.chartWrap} onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}>
            {chartReady && chartWidth > 0 && chartData.visitorsData.length > 0 ? (
              <TrafficLineChart
                key={period}
                chartWidth={chartWidth}
                chartData={chartData}
                labelColor={colors.textSecondary}
                borderColor={colors.border}
              />
            ) : chartReady && chartWidth > 0 ? (
              <Text style={[styles.chartEmpty, { color: colors.textSecondary }]}>
                {t.stats.chartEmpty}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.white }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{t.stats.hotMap}</Text>

          {hotMapRows.length > 0 ? (
            <>
              <View style={styles.hotBars}>
                {hotMapRows.map((item) => (
                  <View
                    key={item.id}
                    style={[styles.hotBar, { backgroundColor: item.color, flex: item.flex }]}
                  />
                ))}
              </View>

              <View style={styles.hotLegend}>
                {hotMapRows.map((item) => (
                  <View key={item.id} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                    <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                      {item.label}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2, color: colors.textSecondary }]}>
                  {t.stats.channels}
                </Text>
                <Text style={[styles.tableCell, { color: colors.textSecondary }]}>
                  {t.stats.percent}
                </Text>
                <Text style={[styles.tableCell, { color: colors.textSecondary }]}>
                  {t.stats.total}
                </Text>
              </View>

              {hotMapRows.map((item) => (
                <View key={item.id} style={styles.tableRow}>
                  <View style={[styles.tableCellRow, { flex: 2 }]}>
                    <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                    <Text style={[styles.tableCellText, { color: colors.textPrimary }]}>
                      {item.label}
                    </Text>
                  </View>
                  <Text style={[styles.tableCellText, { color: colors.textPrimary }]}>
                    {item.percent}
                  </Text>
                  <Text
                    style={[
                      styles.tableCellText,
                      { color: colors.textPrimary, fontWeight: '600' },
                    ]}
                  >
                    {item.total}
                  </Text>
                </View>
              ))}
            </>
          ) : (
            <Text style={[styles.emptyHotMap, { color: colors.textSecondary }]}>
              {t.stats.hotMapEmpty}
            </Text>
          )}
        </View>

        <View style={{ height: tabBarHeight + 60 }} />
      </ScrollView>

      <PeriodFilterSheet
        visible={periodSheetVisible}
        selected={period}
        onSelect={handlePeriodSelect}
        onClose={() => setPeriodSheetVisible(false)}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bgMain,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 12,
  },
  errorBox: {
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerSub: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: COLORS.textPrimary,
    textTransform: 'uppercase',
  },
  trafficRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  trafficLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trafficLabel: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  trafficCount: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginRight: 16,
  },
  trafficPercent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minWidth: 60,
  },
  chartWrap: {
    marginTop: 2,
    marginBottom: 2,
    width: '100%',
    minHeight: 228,
    justifyContent: 'center',
  },
  chartEmpty: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 48,
  },
  hotBars: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    gap: 4,
  },
  hotBar: {
    height: 8,
    borderRadius: 4,
  },
  hotLegend: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  tableCellRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tableCellText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  emptyHotMap: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 8,
  },
})
