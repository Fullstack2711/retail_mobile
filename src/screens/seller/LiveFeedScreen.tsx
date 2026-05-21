import React, { useCallback, useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Platform,
} from 'react-native'
import { devLog } from '../../utils/devLog'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Ionicons } from '../../components/icons'
import { useTheme } from '../../context/ThemeContext'
import { useLanguage } from '../../context/LanguageContext'
import {
  getCachedFeedListState,
  invalidateFeedCache,
  listVisitorSurveysPage,
  setCachedFeedListState,
} from '../../services/visitorSurvey'
import {
  getCachedVisitorSurveysCount,
  getVisitorSurveysCount,
} from '../../services/storeOwner'
import { FeedListItem } from '../../types/visitorSurvey'
import type { SellerFeedStackParamList } from '../../navigation/sellerTypes'

const PAGE_SIZE = 20

function statusLabel(
  t: { statusPending: string; statusPurchased: string; statusNotPurchased: string },
  status: string,
): string {
  if (status === 'purchased') return t.statusPurchased
  if (status === 'not_purchased') return t.statusNotPurchased
  return t.statusPending
}

function mergeByVisitorId(existing: FeedListItem[], incoming: FeedListItem[]): FeedListItem[] {
  const seen = new Set(existing.map((x) => x.visitorId))
  const merged = [...existing]
  for (const item of incoming) {
    if (!seen.has(item.visitorId)) {
      seen.add(item.visitorId)
      merged.push(item)
    }
  }
  return merged
}

export default function LiveFeedScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<SellerFeedStackParamList>>()
  const { colors } = useTheme()
  const { t } = useLanguage()
  const tabBarHeight = useBottomTabBarHeight()

  const [items, setItems] = useState<FeedListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [totalVisitors, setTotalVisitors] = useState(0)
  const [lastLoadedPage, setLastLoadedPage] = useState(0)

  const loadingMoreRef = useRef(false)

  const applyListState = useCallback(
    (state: {
      items: FeedListItem[]
      total: number
      totalVisitors: number
      lastLoadedPage: number
      hasMore: boolean
    }) => {
      setItems(state.items)
      setTotal(state.total)
      setTotalVisitors(state.totalVisitors)
      setLastLoadedPage(state.lastLoadedPage)
      setHasMore(state.hasMore)
      setCachedFeedListState(state)
    },
    [],
  )

  const reload = useCallback(
    async (force = false) => {
      setError(null)
      setLoadingMore(false)
      loadingMoreRef.current = false
      if (force) invalidateFeedCache()
      try {
        const [result, countData] = await Promise.all([
          listVisitorSurveysPage(
            { status_filter: 'pending', page: 1, size: PAGE_SIZE },
            { force },
          ),
          getVisitorSurveysCount('daily', { force, useCache: !force }),
        ])
        const visitorsTotal = countData.period_summary?.total_visitors ?? 0
        const state = {
          items: result.items,
          total: result.total,
          totalVisitors: visitorsTotal,
          lastLoadedPage: 1,
          hasMore: result.items.length < result.total && result.items.length > 0,
        }
        applyListState(state)
        devLog(
          '[VisitorSurvey] Feed (refresh):',
          result.items.length,
          'pending',
          result.total,
          'jami visitor',
          visitorsTotal,
        )
      } catch (e) {
        const msg = e instanceof Error ? e.message : t.seller.loadError
        setError(msg)
        devLog('[VisitorSurvey] Feed xato:', e)
      }
    },
    [applyListState, t.seller.loadError],
  )

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)
      setError(null)
      try {
        await reload(true)
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [reload],
  )

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || loading || !hasMore || error) return
    loadingMoreRef.current = true
    setLoadingMore(true)
    const nextPage = lastLoadedPage + 1

    try {
      const result = await listVisitorSurveysPage(
        {
          status_filter: 'pending',
          page: nextPage,
          size: PAGE_SIZE,
        },
        { useCache: true },
      )

      let merged: FeedListItem[] = []
      setItems((prev) => {
        merged = mergeByVisitorId(prev, result.items)
        return merged
      })

      const hasMoreNext =
        merged.length < result.total && result.items.length > 0
      setTotal(result.total)
      setLastLoadedPage(nextPage)
      setHasMore(hasMoreNext)
      setCachedFeedListState({
        items: merged,
        total: result.total,
        totalVisitors,
        lastLoadedPage: nextPage,
        hasMore: hasMoreNext,
      })

      devLog('[VisitorSurvey] Feed loadMore:', nextPage, merged.length, '/', result.total)
    } catch (e) {
      devLog('[VisitorSurvey] loadMore xato:', e)
    } finally {
      setLoadingMore(false)
      loadingMoreRef.current = false
    }
  }, [loading, hasMore, error, lastLoadedPage, totalVisitors])

  useFocusEffect(
    useCallback(() => {
      const cached = getCachedFeedListState()
      if (cached) {
        setError(null)
        const countCached = getCachedVisitorSurveysCount('daily')
        const visitorsTotal =
          cached.totalVisitors > 0
            ? cached.totalVisitors
            : (countCached?.period_summary?.total_visitors ?? 0)
        applyListState({
          ...cached,
          totalVisitors: visitorsTotal,
        })
        setLoading(false)
        devLog('[VisitorSurvey] Feed cache (focus):', cached.items.length)
        return
      }

      let cancelled = false
      ;(async () => {
        setLoading(true)
        try {
          if (cancelled) return
          await reload(false)
        } finally {
          if (!cancelled) setLoading(false)
        }
      })()
      return () => {
        cancelled = true
      }
    }, [applyListState, reload]),
  )

  const keyExtractor = useCallback((item: FeedListItem) => String(item.visitorId), [])

  const renderItem = useCallback(
    ({ item }: { item: FeedListItem }) => {
      return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.white }]}
      activeOpacity={0.7}
      onPress={() =>
        navigation.navigate('RecordActivity', {
          visitorId: item.visitorId,
          surveyId: item.surveyId,
          dateTime: item.dateTime,
          displayId: `rec${item.visitorId}`,
          visitorImage: item.visitorImage,
          comment: item.comment,
        })
      }
    >
      {item.visitorImage ? (
        <Image source={{ uri: item.visitorImage }} style={styles.thumb} resizeMode="cover" />
      ) : (
        <View style={[styles.thumbPlaceholder, { backgroundColor: colors.border }]}>
          <Ionicons name="person" size={26} color={colors.textSecondary} />
        </View>
      )}
      <View style={styles.cardMiddle}>
        <View style={styles.cardTop}>
          <Text style={[styles.visitorId, { color: colors.textPrimary }]}>
            {t.seller.idLabel}: {item.visitorId}
          </Text>
          <View
            style={[
              styles.statusPill,
              item.status === 'purchased' && { backgroundColor: '#E8F8ED' },
              item.status === 'not_purchased' && { backgroundColor: colors.redLight },
              item.status === 'pending' && { backgroundColor: colors.primaryLight },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    item.status === 'purchased'
                      ? colors.green
                      : item.status === 'not_purchased'
                        ? colors.red
                        : colors.primary,
                },
              ]}
              numberOfLines={1}
            >
              {statusLabel(t.seller, item.status)}
            </Text>
          </View>
        </View>
        <Text style={[styles.time, { color: colors.textPrimary }]}>{item.time}</Text>
        <Text style={[styles.date, { color: colors.textSecondary }]}>{item.date}</Text>
        {item.comment ? (
          <Text
            style={[styles.comment, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {item.comment}
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
      )
    },
    [colors, navigation, t.seller],
  )

  const listFooter =
    loadingMore && items.length > 0 ? (
      <View style={styles.footer}>
        <ActivityIndicator color={colors.primary} />
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          {t.seller.loadingMore}
        </Text>
      </View>
    ) : null

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{t.seller.feedTitle}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t.seller.feedSubtitle}
            {totalVisitors > 0
              ? ` · ${items.length}/${totalVisitors}`
              : total > 0
                ? ` · ${items.length}/${total}`
                : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, { backgroundColor: colors.white }]}
          onPress={() => load(true)}
        >
          <Ionicons name="filter" size={18} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator style={styles.center} color={colors.primary} />
      ) : error ? (
        <View style={styles.center}>
          <Text style={[styles.errorText, { color: colors.red }]}>{error}</Text>
          <TouchableOpacity onPress={() => load()}>
            <Text style={{ color: colors.primary, marginTop: 8 }}>{t.seller.retry}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          initialNumToRender={10}
          maxToRenderPerBatch={8}
          windowSize={7}
          removeClippedSubviews={Platform.OS === 'android'}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: tabBarHeight + 24 },
            items.length === 0 && styles.listEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.35}
          ListFooterComponent={listFooter}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: colors.textSecondary }]}>
              {t.seller.feedEmpty}
            </Text>
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: { fontSize: 26, fontWeight: '700' },
  subtitle: { fontSize: 14, marginTop: 2 },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  list: { paddingHorizontal: 16 },
  listEmpty: { flexGrow: 1, justifyContent: 'center' },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 8,
  },
  footerText: { fontSize: 13 },
  card: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  thumbPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardMiddle: { flex: 1, minWidth: 0 },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  visitorId: { fontSize: 13, fontWeight: '600' },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    maxWidth: '50%',
  },
  statusText: { fontSize: 11, fontWeight: '600' },
  time: { fontSize: 17, fontWeight: '700' },
  date: { fontSize: 13, marginTop: 2 },
  comment: { fontSize: 13, marginTop: 6, lineHeight: 18 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  empty: { textAlign: 'center', fontSize: 15 },
  errorText: { textAlign: 'center', fontSize: 15 },
})
