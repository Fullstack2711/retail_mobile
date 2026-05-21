import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { Ionicons } from './icons'
import { useTheme } from '../context/ThemeContext'
import { useLanguage } from '../context/LanguageContext'
import { branchLabel, BranchKey } from '../i18n/translations'

export interface Staff {
  id: string
  name: string
  branch: BranchKey
  /** API dan kelgan filial / bino nomi */
  branchLabel: string
  filterKey: string
  /** Sotib olganlar (purchased_surveys) */
  sales: number
  totalSurveys?: number
  imageUrl: string | null
}

interface StaffItemProps {
  item: Staff
  onPress?: (item: Staff) => void
}

const AVATAR_COLORS = [
  '#7B61FF', '#FF6B35', '#34C759', '#FF9500',
  '#AF52DE', '#FF2D55', '#5AC8FA', '#FF3B30',
]

function getAvatarColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function getInitials(name: string) {
  const parts = name.trim().split(' ')
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return parts[0].slice(0, 2).toUpperCase()
}

function StaffItem({ item, onPress }: StaffItemProps) {
  const { colors } = useTheme()
  const { lang, t } = useLanguage()
  const avatarColor = getAvatarColor(item.name)
  const initials = getInitials(item.name)
  const branchText = item.branchLabel || branchLabel(lang, item.branch)

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.white }]}
      onPress={() => onPress?.(item)}
      activeOpacity={0.7}
    >
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.avatarImage} resizeMode="cover" />
      ) : (
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      )}

      <View style={styles.left}>
        <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.branchRow}>
          <Ionicons name="location-outline" size={13} color={colors.textSecondary} />
          <Text style={[styles.branch, { color: colors.textSecondary }]} numberOfLines={1}>
            {branchText}
          </Text>
        </View>
      </View>

      <View style={styles.statsCol}>
        <View style={styles.ratioRow}>
          <Text style={[styles.ratioValue, { color: colors.green }]}>{item.sales}</Text>
          {item.totalSurveys != null ? (
            <>
              <Text style={[styles.ratioSlash, { color: colors.textPrimary }]}>/</Text>
              <Text style={[styles.ratioValue, { color: colors.textPrimary }]}>
                {item.totalSurveys}
              </Text>
            </>
          ) : null}
        </View>
        {item.totalSurveys != null ? (
          <Text style={[styles.statHint, { color: colors.textSecondary }]}>
            {t.team.sold} / {t.team.visitors}
          </Text>
        ) : (
          <Text style={[styles.statHint, { color: colors.textSecondary }]}>{t.team.sold}</Text>
        )}
      </View>
    </TouchableOpacity>
  )
}

export default React.memo(StaffItem)

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  left: { flex: 1, gap: 4, minWidth: 0 },
  name: { fontSize: 16, fontWeight: '600' },
  branchRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  branch: { fontSize: 13, flex: 1 },
  statsCol: { alignItems: 'flex-end', gap: 4 },
  ratioRow: { flexDirection: 'row', alignItems: 'baseline' },
  ratioValue: { fontSize: 22, fontWeight: '700' },
  ratioSlash: { fontSize: 20, fontWeight: '600', marginHorizontal: 1 },
  statHint: { fontSize: 11, fontWeight: '500' },
})
