import React, { useCallback, useState, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useFocusEffect } from '@react-navigation/native'
import { Ionicons } from '../../components/icons'
import { COLORS } from '../../constants/colors'
import { useTheme } from '../../context/ThemeContext'
import StaffItem, { Staff } from '../../components/StaffItem'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { branchLabel } from '../../i18n/translations'
import {
  getTeamScreenCache,
  invalidateTeamScreenCache,
  setTeamScreenCache,
} from '../../cache/screenCache'
import { getSalesList } from '../../services/storeOwner'
import { mapSalesListToStaff } from '../../utils/mapSalesListToStaff'

const STAFF_ROW_HEIGHT = 88

export default function TeamScreen() {
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { lang, t } = useLanguage()
  const { session } = useAuth()
  const tabBarHeight = useBottomTabBarHeight()
  const { colors } = useTheme()

  const fetchTeam = useCallback(
    async (force: boolean) => {
      if (!session?.companyId) {
        setStaff([])
        setTeamScreenCache({ staff: [] })
        return
      }

      if (force) invalidateTeamScreenCache()

      const sales = await getSalesList(
        {
          company_id: session.companyId,
          branch_id: session.branchId ?? undefined,
        },
        { force, useCache: !force },
      )
      const mapped = mapSalesListToStaff(sales.items)
      setStaff(mapped)
      setTeamScreenCache({ staff: mapped })
    },
    [session?.companyId, session?.branchId],
  )

  const load = useCallback(
    async (force = false) => {
      if (!session?.companyId) {
        setStaff([])
        setError(null)
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      try {
        await fetchTeam(force)
      } catch (e) {
        const msg = e instanceof Error ? e.message : t.seller.loadError
        setError(msg)
      } finally {
        setLoading(false)
      }
    },
    [session?.companyId, fetchTeam, t.seller.loadError],
  )

  useFocusEffect(
    useCallback(() => {
      const cached = getTeamScreenCache()
      if (cached) {
        setStaff(cached.staff)
        setError(null)
        setLoading(false)
        return
      }

      let cancelled = false
      if (!session?.companyId) {
        setStaff([])
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      fetchTeam(false)
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
    }, [session?.companyId, fetchTeam, t.seller.loadError]),
  )

  const branchTabs = useMemo(() => {
    const tabs: { key: string; label: string }[] = [
      { key: 'all', label: branchLabel(lang, 'all') },
    ]
    const seen = new Set<string>()
    for (const member of staff) {
      if (seen.has(member.filterKey)) continue
      seen.add(member.filterKey)
      tabs.push({ key: member.filterKey, label: member.branchLabel })
    }
    return tabs
  }, [staff, lang])

  const filteredStaff = useMemo(() => {
    if (activeFilter === 'all') return staff
    return staff.filter((s) => s.filterKey === activeFilter)
  }, [activeFilter, staff])

  const renderStaff = useCallback(
    ({ item }: { item: Staff }) => (
      <StaffItem item={item} onPress={() => {}} />
    ),
    [],
  )

  const keyExtractor = useCallback((item: Staff) => item.id, [])

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: STAFF_ROW_HEIGHT,
      offset: STAFF_ROW_HEIGHT * index,
      index,
    }),
    [],
  )

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]} edges={['top']}>

      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t.team.title}</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>{t.team.subtitle}</Text>
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, { backgroundColor: colors.white }]}
          onPress={() => load(true)}
        >
          <Ionicons name="refresh" size={18} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorWrap}>
          <Text style={{ color: colors.red, fontSize: 14 }}>{error}</Text>
          <TouchableOpacity onPress={() => load(true)}>
            <Text style={{ color: colors.primary, fontWeight: '600' }}>{t.seller.retry}</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContent}
        style={styles.tabs}
      >
        {branchTabs.map(({ key, label }) => {
          const isActive = activeFilter === key
          return (
            <TouchableOpacity
              key={key}
              style={[styles.tab, isActive && { backgroundColor: colors.primaryLight }]}
              onPress={() => setActiveFilter(key)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.tabText,
                { color: isActive ? colors.primary : colors.textSecondary },
                isActive && { fontWeight: '600' },
              ]}>
                {label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      {loading ? (
        <ActivityIndicator style={styles.center} color={colors.primary} />
      ) : (
        <FlatList
          data={filteredStaff}
          keyExtractor={keyExtractor}
          renderItem={renderStaff}
          getItemLayout={getItemLayout}
          initialNumToRender={10}
          maxToRenderPerBatch={8}
          windowSize={7}
          removeClippedSubviews={Platform.OS === 'android'}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="people-outline" size={48} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t.team.empty}</Text>
            </View>
          }
          ListFooterComponent={<View style={{ height: tabBarHeight + 20 }} />}
        />
      )}
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
  errorWrap: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
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
  tabs: {
    maxHeight: 50,
    marginBottom: 12,
  },
  tabsContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 50,
  },
  tabText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
})
