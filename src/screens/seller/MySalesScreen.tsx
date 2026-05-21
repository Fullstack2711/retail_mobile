import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useIsFocused, useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Ionicons } from '../../components/icons'
import SaleStatusBadge from '../../components/SaleStatusBadge'
import { useTheme } from '../../context/ThemeContext'
import { useLanguage } from '../../context/LanguageContext'
import {
  getCachedHistoryListState,
  invalidateHistoryCache,
  listSavedSurveysPage,
  setCachedHistoryListState,
} from '../../services/visitorSurvey'
import { SaleListItem } from '../../types/visitorSurvey'
import { devLog } from '../../utils/devLog'
import type { SellerHistoryStackParamList } from '../../navigation/sellerTypes'

type Nav = NativeStackNavigationProp<SellerHistoryStackParamList, 'MySales'>

const PAGE_SIZE = 20
/** floatingTabBar.ts dagi tabBar.height (65) + margin */
const TAB_BAR_CONTENT_HEIGHT = 65

function mergeByVisitorId(existing: SaleListItem[], incoming: SaleListItem[]): SaleListItem[] {
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

export default function MySalesScreen() {
  const { colors } = useTheme()
  const { t } = useLanguage()
  const insets = useSafeAreaInsets()
  const listBottomPad = TAB_BAR_CONTENT_HEIGHT + insets.bottom + 36
  const navigation = useNavigation<Nav>()
  const isFocused = useIsFocused()

  const [items, setItems] = useState<SaleListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [lastLoadedPage, setLastLoadedPage] = useState(0)

  const loadingMoreRef = useRef(false)
  const loadErrorLabel = t.seller.loadError

  const applyListState = useCallback(
    (state: {
      items: SaleListItem[]
      total: number
      lastLoadedPage: number
      hasMore: boolean
    }) => {
      setItems(state.items)
      setTotal(state.total)
      setLastLoadedPage(state.lastLoadedPage)
      setHasMore(state.hasMore)
      setCachedHistoryListState(state)
    },
    [],
  )

  const reload = useCallback(
    async (force = false) => {
      setError(null)
      setLoadingMore(false)
      loadingMoreRef.current = false
      if (force) invalidateHistoryCache()
      try {
        const result = await listSavedSurveysPage({ page: 1, size: PAGE_SIZE }, { force })
        applyListState({
          items: result.items,
          total: result.total,
          lastLoadedPage: 1,
          hasMore: result.items.length < result.total && result.items.length > 0,
        })
        devLog('[VisitorSurvey] History (refresh):', result.items.length, 'jami', result.total)
      } catch (e) {
        const msg = e instanceof Error ? e.message : loadErrorLabel
        setError(msg)
        devLog('[VisitorSurvey] History xato:', e)
      }
    },
    [applyListState, loadErrorLabel],
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
      const result = await listSavedSurveysPage(
        { page: nextPage, size: PAGE_SIZE },
        { useCache: true },
      )

      let merged: SaleListItem[] = []
      setItems((prev) => {
        merged = mergeByVisitorId(prev, result.items)
        return merged
      })

      const hasMoreNext =
        merged.length < result.total && result.items.length > 0
      setTotal(result.total)
      setLastLoadedPage(nextPage)
      setHasMore(hasMoreNext)
      setCachedHistoryListState({
        items: merged,
        total: result.total,
        lastLoadedPage: nextPage,
        hasMore: hasMoreNext,
      })

      devLog('[VisitorSurvey] History loadMore:', nextPage, merged.length, '/', result.total)
    } catch (e) {
      devLog('[VisitorSurvey] History loadMore xato:', e)
    } finally {
      setLoadingMore(false)
      loadingMoreRef.current = false
    }
  }, [loading, hasMore, error, lastLoadedPage])

  useEffect(() => {
    if (!isFocused) return

    const cached = getCachedHistoryListState()
    if (cached) {
      setError(null)
      setLoading(false)
      applyListState(cached)
      devLog('[VisitorSurvey] History cache (focus):', cached.items.length)
      return
    }

    let cancelled = false
    setLoading(true)
    reload(false).finally(() => {
      if (!cancelled) setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [isFocused, applyListState, reload])

  const openEdit = useCallback(
    (item: SaleListItem) => {
      navigation.navigate('EditSavedSurvey', {
        visitorId: item.visitorId,
        dateTime: item.dateTime,
        visitorImage: item.visitorImage,
        status: item.status,
        comment: item.comment,
      })
    },
    [navigation],
  )

  const noCommentLabel = t.seller.noComment

  const renderItem = useCallback(
    ({ item }: { item: SaleListItem }) => (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.white }]}
        activeOpacity={0.7}
        onPress={() => openEdit(item)}
      >
        <View style={styles.cardRow}>
          {item.visitorImage ? (
            <Image source={{ uri: item.visitorImage }} style={styles.thumb} resizeMode="cover" />
          ) : (
            <View style={[styles.thumbPlaceholder, { backgroundColor: colors.border }]}>
              <Ionicons name="person" size={26} color={colors.textSecondary} />
            </View>
          )}
          <View style={styles.cardBody}>
            <View style={styles.cardHeader}>
              <Text style={[styles.dateTime, { color: colors.textPrimary }]}>{item.dateTime}</Text>
              <SaleStatusBadge status={item.status} />
            </View>
            <View style={[styles.commentBox, { backgroundColor: colors.bgMain }]}>
              <Text style={[styles.comment, { color: colors.textSecondary }]} numberOfLines={2}>
                {item.comment || noCommentLabel}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </View>
      </TouchableOpacity>
    ),
    [colors, openEdit, noCommentLabel],
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
          <Text style={[styles.title, { color: colors.textPrimary }]}>{t.seller.salesTitle}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t.seller.salesSubtitle}
            {total > 0 ? ` · ${items.length}/${total}` : ''}
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
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          initialNumToRender={10}
          maxToRenderPerBatch={8}
          windowSize={7}
          removeClippedSubviews={Platform.OS === 'android'}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: listBottomPad },
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
              {t.seller.historyEmpty}
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
    padding: 12,
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  thumbPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: { flex: 1, gap: 8 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  dateTime: { fontSize: 14, fontWeight: '600', flex: 1 },
  commentBox: { borderRadius: 10, padding: 10 },
  comment: { fontSize: 13, lineHeight: 18 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  empty: { textAlign: 'center', fontSize: 15 },
  errorText: { textAlign: 'center', fontSize: 15 },
})
